import { personsTable, petsTable } from '@test/fixtures/database/schema'
import { defineConfig } from '@shared/database/schema/defineConfig'

export default defineConfig({
  migrations: [
    () => import('@test/fixtures/database/migrations/001_add_persons'),
    () => import('@test/fixtures/database/migrations/002_add_pets'),
  ],
  schema: {
    persons: personsTable,
    pets: petsTable,
  },
})
