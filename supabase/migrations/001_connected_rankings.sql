-- supabase/migrations/001_connected_rankings.sql
-- OPTIONAL connected competition for CosmoTrekk (free Supabase project). Run once in Supabase → SQL Editor.
-- Design: the browser can READ the public leaderboard only. Every write goes through Vercel server functions
-- using the service-role key, which calls the SECURITY DEFINER functions below (each runs as one transaction).

-- ============ TABLES ============
create table if not exists public.players (                 -- one row per anonymous player
  user_id uuid primary key references auth.users(id) on delete cascade, -- Supabase auth user
  commander_name text not null check (char_length(commander_name) between 1 and 20), -- display name
  verified_km integer not null default 0,                    -- server-verified Space Walk total
  highest_tier integer not null default 0,                   -- highest cleared tier
  milestones integer not null default 0,                     -- milestones cleared
  correct_total integer not null default 0,                  -- answers correct (for accuracy)
  answered_total integer not null default 0,                 -- answers given
  active_ms bigint not null default 0,                       -- completion time used as tie-breaker
  updated_at timestamptz not null default now()              -- last change
);

create table if not exists public.ranked_questions (        -- SERVER-HELD question pool (answer keys never sent to browsers)
  id text primary key,                                       -- question ID
  destination text not null,                                 -- e.g. 'mars'
  difficulty text not null check (difficulty in ('beginner','intermediate','advanced')), -- level
  question text not null,                                    -- text
  options jsonb not null,                                    -- [{id,text} x4]
  correct_option_id text not null check (correct_option_id in ('a','b','c','d')), -- PRIVATE key
  explanation text not null,                                 -- shown after answering
  source_id text not null                                    -- registry source
);

create table if not exists public.attempts (                -- one fixed attempt (5 questions chosen by the server)
  id uuid primary key default gen_random_uuid(),             -- attempt ID
  user_id uuid not null references public.players(user_id) on delete cascade, -- owner
  completion_id text not null,                               -- milestone, e.g. 'exp-mars:stage1'
  tier integer not null check (tier between 1 and 4),        -- tier
  question_ids text[] not null,                              -- the five questions
  answers jsonb not null default '{}'::jsonb,                -- { questionId: optionId } — first answer is locked
  created_at timestamptz not null default now(),             -- start time
  completed_at timestamptz,                                  -- set once when graded
  correct integer                                            -- graded score
);

create table if not exists public.rewards (                 -- the IDEMPOTENT ledger: primary key = one award per milestone per player
  user_id uuid not null references public.players(user_id) on delete cascade, -- player
  completion_id text not null,                               -- milestone
  km integer not null,                                       -- distance paid
  awarded_at timestamptz not null default now(),             -- when
  primary key (user_id, completion_id)                       -- duplicates are impossible
);

create table if not exists public.question_candidates (     -- Gemini output waiting for HUMAN review (never used automatically)
  id text primary key, destination text, category text, difficulty text, question text, options jsonb, -- question fields
  correct_option_id text, explanation text, source_id text, supporting_evidence text, generated_at text, -- more fields
  status text not null default 'pending_review'              -- pending_review | approved | rejected
);

-- ============ ROW-LEVEL SECURITY ============
alter table public.players enable row level security;            -- lock every table
alter table public.ranked_questions enable row level security;
alter table public.attempts enable row level security;
alter table public.rewards enable row level security;
alter table public.question_candidates enable row level security;
drop policy if exists "leaderboard is public" on public.players;
create policy "leaderboard is public" on public.players for select using (true); -- anyone may READ the leaderboard
-- No insert/update/delete policies exist, so browsers (anon/authenticated roles) cannot write anything.

-- ============ FUNCTIONS (called only by server functions with the service role) ============
create or replace function public.start_attempt(p_user uuid, p_name text, p_completion text, p_tier int, p_destination text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_ids text[]; v_attempt uuid;
begin
  insert into players(user_id, commander_name) values (p_user, left(p_name, 20))      -- create the player if new
    on conflict (user_id) do update set commander_name = left(excluded.commander_name, 20), updated_at = now();
  select array_agg(id) into v_ids from (                                               -- 2 beginner + 2 intermediate + 1 advanced, random
    (select id from ranked_questions where destination = p_destination and difficulty = 'beginner' order by random() limit 2)
    union all (select id from ranked_questions where destination = p_destination and difficulty = 'intermediate' order by random() limit 2)
    union all (select id from ranked_questions where destination = p_destination and difficulty = 'advanced' order by random() limit 1)
  ) q;
  if coalesce(array_length(v_ids, 1), 0) <> 5 then raise exception 'Not enough ranked questions for %', p_destination; end if; -- exactly five
  insert into attempts(user_id, completion_id, tier, question_ids) values (p_user, p_completion, p_tier, v_ids) returning id into v_attempt; -- fixed attempt
  return jsonb_build_object('attempt_id', v_attempt, 'questions', (                    -- questions WITHOUT correct_option_id
    select jsonb_agg(jsonb_build_object('id', r.id, 'question', r.question, 'options', r.options, 'difficulty', r.difficulty) order by array_position(v_ids, r.id))
    from ranked_questions r where r.id = any(v_ids)));
end $$;

create or replace function public.submit_answer(p_user uuid, p_attempt uuid, p_question text, p_option text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare a attempts%rowtype; q ranked_questions%rowtype;
begin
  select * into a from attempts where id = p_attempt and user_id = p_user for update;   -- lock the attempt row
  if not found or a.completed_at is not null then raise exception 'Attempt not open'; end if;
  if not (p_question = any(a.question_ids)) then raise exception 'Question not in attempt'; end if;
  if not (a.answers ? p_question) then                                                 -- first answer only (locked afterwards)
    update attempts set answers = answers || jsonb_build_object(p_question, p_option) where id = p_attempt;
  end if;
  select * into q from ranked_questions where id = p_question;
  return jsonb_build_object('correct', ((select answers->>p_question from attempts where id = p_attempt) = q.correct_option_id),
                            'correct_option_id', q.correct_option_id, 'explanation', q.explanation);
end $$;

create or replace function public.complete_attempt(p_user uuid, p_attempt uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare a attempts%rowtype; v_correct int; v_km int := 0; v_inserted int;
begin
  select * into a from attempts where id = p_attempt and user_id = p_user for update;   -- lock
  if not found then raise exception 'Unknown attempt'; end if;
  if a.completed_at is not null then                                                    -- double submission → same answer, no new reward
    return jsonb_build_object('correct', a.correct, 'passed', a.correct >= 3, 'awarded_km', 0, 'verified_km', (select verified_km from players where user_id = p_user));
  end if;
  if (select count(*) from jsonb_object_keys(a.answers)) <> 5 then raise exception 'All five questions must be answered'; end if;
  select count(*) into v_correct from ranked_questions r where r.id = any(a.question_ids) and a.answers->>r.id = r.correct_option_id; -- deterministic grading
  update attempts set completed_at = now(), correct = v_correct where id = p_attempt;
  update players set correct_total = correct_total + v_correct, answered_total = answered_total + 5,
         active_ms = active_ms + (extract(epoch from (now() - a.created_at)) * 1000)::bigint, updated_at = now() where user_id = p_user;
  if v_correct >= 3 then                                                                -- 60% rule
    v_km := case a.tier when 1 then 100 when 2 then 250 when 3 then 500 else 1000 end;   -- same schedule for every category
    insert into rewards(user_id, completion_id, km) values (p_user, a.completion_id, v_km) on conflict do nothing; -- once per milestone
    get diagnostics v_inserted = row_count;
    if v_inserted = 0 then v_km := 0; else
      update players set verified_km = verified_km + v_km, milestones = milestones + 1, highest_tier = greatest(highest_tier, a.tier) where user_id = p_user;
    end if;
  end if;
  return jsonb_build_object('correct', v_correct, 'passed', v_correct >= 3, 'awarded_km', v_km, 'verified_km', (select verified_km from players where user_id = p_user));
end $$;

revoke all on function public.start_attempt(uuid, text, text, int, text) from public, anon, authenticated;   -- browsers cannot call these
revoke all on function public.submit_answer(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.complete_attempt(uuid, uuid) from public, anon, authenticated;
