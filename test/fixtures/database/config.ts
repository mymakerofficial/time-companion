import {
  personsTable,
  petsTable,
  testTable,
} from '@test/fixtures/database/schema'
import { defineConfig } from '@database/schema/defineConfig'

export default defineConfig({
  migrations: [
    () => import('@test/fixtures/database/migrations/001_add_persons'),
    () => import('@test/fixtures/database/migrations/002_add_pets'),
    () => import('@test/fixtures/database/migrations/003_add_test_table'),
  ],
  schema: {
    persons: personsTable,
    pets: petsTable,
    test: testTable,
  },
})
