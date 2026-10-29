// src/engine/questionSchema.ts — STRICT validation for questions (used by tests AND by the Gemini server function).
// Important: passing this schema proves the SHAPE is right — it does NOT prove the science is right.
import { z } from 'zod'; // schema library
import { SOURCE_BY_ID } from '../data/sources.js'; // known sources

const option = z.object({ id: z.enum(['a', 'b', 'c', 'd']), text: z.string().trim().min(1).max(160) }); // one option

export const questionSchema = z.object({ // shape of one candidate question
  id: z.string().min(1).max(60), // unique ID
  category: z.string().min(1), // category label
  destination: z.string().min(1), // destination ID
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']), // level
  question: z.string().trim().min(10).max(220), // question text
  options: z.array(option).length(4), // exactly four options
  correctOptionId: z.enum(['a', 'b', 'c', 'd']), // the answer
  explanation: z.string().trim().min(10).max(400), // explanation
  sourceId: z.string().min(1), // must be in the registry (checked below)
  supportingEvidence: z.string().trim().min(10).max(400), // the registry statement that supports it
  generatedAt: z.string().min(10), // timestamp
});
export type CandidateQuestion = z.infer<typeof questionSchema>; // TypeScript type from the schema

export interface ValidationReport { accepted: CandidateQuestion[]; rejected: { item: unknown; reasons: string[] }[] } // result

export function validateCandidates(raw: unknown, destination: string, allowedSourceIds: string[], expectedCount: number): ValidationReport { // check a batch
  const report: ValidationReport = { accepted: [], rejected: [] }; // empty report
  const list = Array.isArray(raw) ? raw : (raw as { questions?: unknown[] })?.questions; // accept [..] or {questions:[..]}
  if (!Array.isArray(list)) return { accepted: [], rejected: [{ item: raw, reasons: ['Response is not a list of questions'] }] }; // wrong shape
  const seen = new Set<string>(); // for duplicate detection
  for (const item of list.slice(0, expectedCount * 2)) { // never process more than 2× what we asked for (cost limit)
    const reasons: string[] = []; // problems found
    const parsed = questionSchema.safeParse(item); // shape check
    if (!parsed.success) { report.rejected.push({ item, reasons: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) }); continue; } // reject bad shape
    const q = parsed.data; // valid shape
    const ids = q.options.map((o) => o.id).sort().join(''); if (ids !== 'abcd') reasons.push('Option IDs must be a, b, c, d'); // stable IDs
    const texts = new Set(q.options.map((o) => o.text.toLowerCase())); if (texts.size !== 4) reasons.push('Options must be four distinct choices'); // distinct
    if (q.destination !== destination) reasons.push('Wrong destination'); // relevant category
    if (!allowedSourceIds.includes(q.sourceId) || !SOURCE_BY_ID[q.sourceId]) reasons.push('Unknown or unapproved source'); // recognised source (no invented URLs)
    const src = SOURCE_BY_ID[q.sourceId]; // the source
    if (src && !src.statements.some((s) => normalise(s).includes(normalise(q.supportingEvidence)) || normalise(q.supportingEvidence).includes(normalise(s)))) reasons.push('Supporting evidence is not an approved statement'); // evidence must come from the registry
    if (/all of the above|none of the above|both a and b/i.test(q.options.map((o) => o.text).join(' '))) reasons.push('Ambiguous option wording'); // ambiguity
    const key = normalise(q.question); if (seen.has(key)) reasons.push('Duplicate question'); seen.add(key); // duplicates
    if (reasons.length) report.rejected.push({ item, reasons }); else report.accepted.push(q); // sort into accepted/rejected
  }
  return report; // done
}

function normalise(s: string): string { return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim(); } // compare text loosely
