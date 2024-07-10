<script setup lang="ts">
import DatabaseExplorer from '@renderer/components/playground/database/DatabaseExplorer.vue'
import DatabaseSqlRunner from '@renderer/components/playground/database/DatabaseSqlRunner.vue'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@shadcn/resizable'
import { database } from '@renderer/factory/database/database'
import { Button } from '@shadcn/button'
import { Download } from 'lucide-vue-next'

function handleDownload() {
  // @ts-expect-error
  const client = database.client
  const data = client.sqlite3.capi.sqlite3_js_db_export(client.database)
  downloadBlob(data, 'db.sqlite', 'application/x-sqlite3')
}

function downloadURL(url: string, fileName: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.style.display = 'none'
  a.click()
  a.remove()
}

function downloadBlob(data: Uint8Array, fileName: string, mimeType: string) {
  const blob = new Blob([data], {
    type: mimeType,
  })

  const url = window.URL.createObjectURL(blob)

  downloadURL(url, fileName)

  setTimeout(() => window.URL.revokeObjectURL(url), 1000)
}
</script>

<template>
  <ResizablePanelGroup direction="horizontal" as="main">
    <ResizablePanel :default-size="58" :min-size="10" collapsible as="section">
      <div class="h-16 px-8 border-b border-border flex items-center">
        <h3 class="text-md font-medium tracking-wide">Database Explorer</h3>
      </div>
      <div class="p-6">
        <DatabaseExplorer>
          <template #right>
            <Button @click="handleDownload" class="gap-2">
              <Download class="size-4" /><span>Download Database</span>
            </Button>
          </template>
        </DatabaseExplorer>
      </div>
    </ResizablePanel>
    <ResizableHandle with-handle :tabindex="-1" />
    <ResizablePanel :min-size="10" collapsible as="section">
      <div class="h-16 px-8 border-b border-border flex items-center">
        <h3 class="text-md font-medium tracking-wide">SQL Runner</h3>
      </div>
      <DatabaseSqlRunner />
    </ResizablePanel>
  </ResizablePanelGroup>
</template>

<style scoped></style>
