import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/shared/drizzle/schema.ts',
  out: './public/migrations',
  dialect: 'sqlite',
})
