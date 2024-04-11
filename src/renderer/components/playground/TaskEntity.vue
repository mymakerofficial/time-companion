<script setup lang="ts">
import { Input } from '@renderer/components/ui/input'
import type { Maybe } from '@shared/lib/utils/types'
import { Label } from '@renderer/components/ui/label'
import { Button } from '@renderer/components/ui/button'
import { isAbsent } from '@shared/lib/utils/checks'
import { Separator } from '@renderer/components/ui/separator'
import ColorSelect from '@renderer/components/common/inputs/colorSelect/ColorSelect.vue'
import { taskService } from '@renderer/factory/service/taskService'
import { useTaskById } from '@renderer/composables/project/useTaskById'
import { Trash } from 'lucide-vue-next'

const props = defineProps<{
  taskId: Maybe<string>
}>()

const task = useTaskById(() => props.taskId)

function handleDelete() {
  if (isAbsent(props.taskId)) {
    return
  }

  taskService.deleteTask(props.taskId)
}
</script>

<template>
  <div class="border rounded-md p-4 flex flex-col gap-4">
    <slot />
    <div class="mx-4 text-xs text-muted-foreground">
      {{ taskId ?? 'n/a' }}
    </div>
    <div class="ml-4 flex items-center gap-4">
      <Label class="text-right">ProjectId</Label>
      <Input v-model="task.projectId" />
    </div>
    <div class="ml-4 flex items-center gap-4">
      <Label class="text-right">Name</Label>
      <Input v-model="task.displayName" />
    </div>
    <div class="ml-4 flex items-center gap-4">
      <Label class="text-right">Color</Label>
      <ColorSelect v-model="task.color" />
    </div>
    <div class="flex justify-end">
      <Button @click="handleDelete" variant="destructive" class="gap-2">
        Delete <Trash class="size-4" />
      </Button>
    </div>
    <Separator />
    <pre class="p-4 bg-muted rounded-md">{{ task }}</pre>
  </div>
</template>
