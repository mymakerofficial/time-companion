import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/shared/drizzle/schema.ts',
  out: './src/shared/drizzle/migrations',
  dialect: 'sqlite',
})
