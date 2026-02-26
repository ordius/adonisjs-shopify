/*
|--------------------------------------------------------------------------
| Configure hook
|--------------------------------------------------------------------------
|
| The configure hook is called when someone runs "node ace configure <package>"
| command. You are free to perform any operations inside this function to
| configure the package.
|
| To make things easier, you have access to the underlying "ConfigureCommand"
| instance and you can use codemods to modify the source files.
|
*/

import type ConfigureCommand from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.ts'

export async function configure(command: ConfigureCommand) {
  const codemods = await command.createCodemods()
  // const project = await codemods.getTsMorphProject()

  /**
   * Publish config file if it doesn't exist
   */
  await codemods.makeUsingStub(stubsRoot, 'config/shopify.stub', {})

  /**
   * Append to `env.ts` file
   */
  try {
    await codemods.defineEnvValidations({
      leadingComment: 'Shopify environment variables',
      variables: {
        SHOPIFY_API_KEY: 'Env.schema.string()',
        SHOPIFY_API_SECRET: 'Env.schema.string()',
        SHOPIFY_API_VERSION: 'Env.schema.string()',
        SHOPIFY_API_SCOPES: 'Env.schema.string()',
        SHOPIFY_API_TRUSTED_APPS: `(name: string, value: string | undefined) => {
          const apps = value ? value.split(',') : []
          if (value && apps?.every((v) => v.split(':').length !== 2)) {
            throw new Error(\`Value for \${name} must be a valid format: KEY_1:SECRET_1,KEY_2:SECRET_2,KEY_3:SECRET_3...\`)
          }

          return apps?.map((a) => ({ api_key: a?.split(':')[0], api_secret: a?.split(':')[1] }))
        }`,
      },
    })
  } catch (error) {
    console.error('Unable to define env validations')
    console.error(error)
  }

  /**
   * Register provider
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('@mixxtor/adonisjs-shopify/provider')
  })

  /**
   * Create migration if it doesn't exist
   */
  // const migrationPattern = 'database/migrations/*_create_shopify_stores_table.ts'
  // const migrationFiles = project?.getSourceFiles(migrationPattern) || []
  // const migrationExists = migrationFiles.length > 0

  // if (!migrationExists) {
  //   const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '')
  //   await codemods.makeUsingStub(stubsRoot, 'migrations/create_shopify_stores_table.stub', {
  //     migration: {
  //       className: 'CreateShopifyStoresTable',
  //       fileName: `${timestamp}_create_shopify_stores_table.ts`,
  //     },
  //   })
  // }
}
