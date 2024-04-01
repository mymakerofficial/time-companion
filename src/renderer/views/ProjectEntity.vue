<script setup lang="ts">
import { useProjectById } from '@renderer/composables/project/useProjectById'
import { Input } from '@renderer/components/ui/input'
import type { Maybe } from '@shared/lib/utils/types'
import { Switch } from '@renderer/components/ui/switch'
import { Label } from '@renderer/components/ui/label'
import { Button } from '@renderer/components/ui/button'
import { projectService } from '@renderer/factory/service/projectService'
import { isAbsent } from '@shared/lib/utils/checks'

const props = defineProps<{
  projectId: Maybe<string>
}>()

const project = useProjectById(() => props.projectId)

function handleDelete() {
  if (isAbsent(props.projectId)) {
    return
  }

  projectService.deleteProject(props.projectId)
}
</script>

<template>
  <div class="border rounded-md p-4 flex flex-col gap-4">
    <div class="mx-4 text-xs text-muted-foreground">
      {{ projectId ?? 'n/a' }}
    </div>
    <div class="ml-4 flex items-center gap-4">
      <Label class="text-right">Name</Label>
      <Input v-model="project.displayName" />
    </div>
    <div class="ml-4 flex items-center gap-4">
      <Label class="text-right">Color</Label>
      <Input v-model="project.color" />
    </div>
    <div class="ml-4 flex items-center gap-4">
      <Label class="text-right">Billable</Label>
      <Switch v-model:checked="project.isBillable" />
    </div>
    <div class="flex justify-end">
      <Button @click="handleDelete" variant="destructive">Delete</Button>
    </div>
    <pre class="p-4 bg-muted rounded-md">{{ project }}</pre>
  </div>
</template>
