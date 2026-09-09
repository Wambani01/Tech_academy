#!/usr/bin/env node
/**
 * Regenerates supabase/bundle.sql from supabase/migrations/ + supabase/seed.sql.
 *
 * The bundle is a convenience for provisioning without the Supabase CLI: paste
 * it into the SQL editor and Run once. Because it is a copy, it goes stale the
 * moment a migration or the seed changes — so it is generated, never edited by
 * hand. Run `npm run bundle` after touching either source.
 *
 * Pass --check to verify the committed bundle matches its sources without
 * writing anything; exits 1 if it does not. Useful in CI.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

const root = process.cwd()
const dir = resolve(root, 'supabase')
const target = join(dir, 'bundle.sql')

const HEADER = `-- Tech Lab Academy — full provisioning bundle
-- Generated from supabase/migrations/ + supabase/seed.sql by scripts/build-bundle.mjs.
-- Do not edit by hand — run \`npm run bundle\` instead.
-- Paste the whole file into the Supabase SQL editor and Run, once, on a
-- fresh project. It is NOT idempotent: the enum and table creates fail on
-- a second run. To start over, run: drop schema public cascade;
--                                   create schema public;
`

const rule = '-- ===================================================================='
const banner = (step, name) => `${rule}\n-- step ${step}  —  ${name}\n${rule}`

const migrations = readdirSync(join(dir, 'migrations'))
  .filter((f) => f.endsWith('.sql'))
  .sort()

const parts = migrations.map((name, i) => ({
  step: i + 1,
  name,
  body: readFileSync(join(dir, 'migrations', name), 'utf8'),
}))

parts.push({
  step: migrations.length + 1,
  name: 'seed.sql',
  body: readFileSync(join(dir, 'seed.sql'), 'utf8'),
})

const bundle = [
  HEADER,
  'begin;',
  '',
  ...parts.map((p) => `${banner(p.step, p.name)}\n${p.body.trim()}\n`),
  'commit;',
].join('\n')

if (process.argv.includes('--check')) {
  const current = readFileSync(target, 'utf8')
  if (current === bundle) {
    console.log('bundle.sql is up to date.')
    process.exit(0)
  }
  console.error(
    'bundle.sql is stale — a migration or seed.sql changed since it was generated.\n' +
      'Run `npm run bundle` and commit the result.'
  )
  process.exit(1)
}

writeFileSync(target, bundle)
console.log(
  `Wrote supabase/bundle.sql — ${parts.length} steps ` +
    `(${migrations.length} migration(s) + seed), ${bundle.split('\n').length} lines.`
)
