<script setup lang="ts">
import DatabaseExplorer from '@renderer/components/playground/database/DatabaseExplorer.vue'
import DatabaseSqlRunner from '@renderer/components/playground/database/DatabaseSqlRunner.vue'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@shadcn/resizable'
</script>

<template>
  <ResizablePanelGroup direction="horizontal" as="main">
    <ResizablePanel :default-size="58" :min-size="10" collapsible as="section">
      <div class="h-16 px-8 border-b border-border flex items-center">
        <h3 class="text-md font-medium tracking-wide">Database Explorer</h3>
      </div>
      <div class="p-6">
        <DatabaseExplorer />
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
