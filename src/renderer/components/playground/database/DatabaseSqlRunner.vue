<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@shadcn/button'
import { database } from '@renderer/factory/database/database'
import { sql } from 'drizzle-orm'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { Loader2, Play } from 'lucide-vue-next'

const queryClient = useQueryClient()

const query = ref('')

const {
  data,
  mutate: run,
  error,
  isPending,
  isIdle,
} = useMutation({
  mutationFn: async (
    query: string,
  ): Promise<{
    result: any
    duration: number
  }> => {
    const start = new Date()
    const result = await new Promise((resolve, reject) => {
      try {
        const result = database.all(sql.raw(query))
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
    const end = new Date()
    return { result, duration: end.getTime() - start.getTime() }
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['databaseExplorer'],
    })
  },
})

function handleRun() {
  run(query.value)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <textarea
        v-model="query"
        class="p-3 w-full rounded-md bg-secondary ring-offset-background placeholder:text-muted-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2"
      />
      <Button @click="handleRun" :disabled="isPending" class="gap-2">
        <Loader2 v-if="isPending" class="animate-spin size-4" />
        <Play v-else class="size-4" />
        <span>Run</span>
      </Button>
    </div>
    <div v-if="!isIdle" class="flex flex-col gap-2 bg-accent p-3 rounded-md">
      <template v-if="error">
        <div class="text-red-500 font-bold" v-text="error.message" />
      </template>
      <template v-else-if="data">
        <div class="text-muted-foreground text-sm">
          executed in <b>{{ `${data.duration} ms` }}</b
          >, returned <b>{{ `${data.result.length} row/s` }}</b>
        </div>
        <pre v-text="data.result" />
      </template>
    </div>
  </div>
</template>
