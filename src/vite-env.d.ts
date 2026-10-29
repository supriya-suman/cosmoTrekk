// src/vite-env.d.ts — tells TypeScript which PUBLIC environment variables the browser code may read.
/// <reference types="vite/client" />
interface ImportMetaEnv { // only variables starting with VITE_ are exposed to the browser
  readonly VITE_SUPABASE_URL?: string; // public Supabase project URL (optional)
  readonly VITE_SUPABASE_ANON_KEY?: string; // public anon key (optional, protected by row-level security)
}
interface ImportMeta { readonly env: ImportMetaEnv } // attach to import.meta
