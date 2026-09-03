/*
|--------------------------------------------------------------------------
| Test runner entrypoint
|--------------------------------------------------------------------------
|
| Run with `npm test` (or `npm run quick:test` to skip coverage). Specs are plain unit
| tests — the package's helpers are pure, so no AdonisJS application is booted.
|
*/

import { assert } from '@japa/assert'
import { configure, processCLIArgs, run } from '@japa/runner'

processCLIArgs(process.argv.splice(2))
configure({
  files: ['tests/**/*.spec.ts'],
  plugins: [assert()],
})

run()
