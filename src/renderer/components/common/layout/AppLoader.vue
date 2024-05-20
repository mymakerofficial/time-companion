<script setup lang="ts">
import { Check, Dot, Loader2, X } from 'lucide-vue-next'
import { usePreflight } from '@renderer/composables/preflight/usePreflight'
import { useTimeout } from '@vueuse/core'

const { isErrored, database, databaseMigrations } = usePreflight()

const show = useTimeout(100)

function getIcon(state: string) {
  if (state === 'idle') return Dot
  if (state === 'running') return Loader2
  if (state === 'skipped') return Check
  if (state === 'finished') return Check
  if (state === 'failed') return X
  return Dot
}

function getShow(state: string) {
  return state !== 'idle' && state !== 'skipped'
}

// TODO i18n
</script>

<template>
  <main class="flex justify-center items-center absolute w-full h-full">
    <div v-show="show" class="flex flex-col gap-4 fade-in">
      <h1 v-if="isErrored" class="text-lg font-medium text-red-500">
        Failed to start application.
      </h1>
      <h1 v-else class="text-lg font-medium">Getting things ready</h1>
      <div class="flex flex-col gap-2">
        <div
          v-if="getShow(database)"
          :data-state="database"
          class="flex gap-2 items-center text-sm text-muted-foreground data-[state=failed]:text-red-500 font-medium"
        >
          <component
            :is="getIcon(database)"
            :data-state="database"
            class="data-[state=running]:animate-spin size-4"
          />
          <p>Opening database</p>
        </div>
        <div
          v-if="getShow(databaseMigrations)"
          :data-state="databaseMigrations"
          class="flex gap-2 items-center text-sm text-muted-foreground data-[state=failed]:text-red-500 font-medium"
        >
          <component
            :is="getIcon(databaseMigrations)"
            :data-state="databaseMigrations"
            class="data-[state=running]:animate-spin size-4"
          />
          <p>Migrating data</p>
        </div>
      </div>
    </div>
  </main>
</template>
