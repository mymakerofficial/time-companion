<script setup lang="ts">
import TimeEntryInput from '@renderer/components/common/inputs/timeEntryInput/TimeEntryInput.vue'
import DateTimeInput from '@renderer/components/common/inputs/timeInput/DateTimeInput.vue'
import { ArrowRight, Clock, MoreVertical, Pen, Trash2 } from 'lucide-vue-next'
import { type TimeEntryBase, timeEntrySchema } from '@shared/model/timeEntry'
import { reactive, watch } from 'vue'
import { getSchemaDefaults } from '@shared/lib/helpers/getSchemaDefaults'
import { useUntil } from '@renderer/composables/datetime/useUntil'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shadcn/dropdown-menu'
import { Button } from '@shadcn/button'
import { useFormattedDuration } from '@renderer/composables/datetime/useFormattedDuration'
import { useDialog } from '@renderer/composables/dialog/useDialog'
import EditProjectDialog from '@renderer/components/settings/projects/dialog/EditProjectDialog.vue'
import { isNull } from '@shared/lib/utils/checks'

const props = defineProps<{
  timeEntry: Partial<TimeEntryBase>
}>()
const emit = defineEmits<{
  change: [values: TimeEntryBase]
  delete: []
}>()

const { open: openEditProject } = useDialog(EditProjectDialog)

const values = reactive<TimeEntryBase>({
  ...getSchemaDefaults(timeEntrySchema),
})

watch(
  () => props.timeEntry,
  (timeEntry) => {
    Object.assign(values, timeEntry)
  },
  {
    immediate: true,
  },
)

const duration = useUntil(values.startedAt, values.stoppedAt)
const durationLabel = useFormattedDuration(duration)

function handleChange() {
  emit('change', { ...values })
}
function handleDelete() {
  emit('delete')
}
function handleEditProject() {
  if (isNull(values.projectId)) return
  openEditProject({
    id: values.projectId,
  })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-row items-center gap-2">
      <TimeEntryInput
        v-model:project-id="values.projectId"
        v-model:description="values.description"
        @change="handleChange"
        class="flex-1"
      />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" size="icon">
            <MoreVertical class="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            @click="handleEditProject"
            :disabled="isNull(values.projectId)"
            class="space-x-2"
          >
            <Pen class="size-4" />
            <span>Edit Project</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            @click="handleDelete"
            :disabled="isNull(values.stoppedAt)"
            variant="destructive"
            class="space-x-2"
          >
            <Trash2 class="size-4" />
            <span>Delete Entry</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div class="grid grid-cols-3 items-center gap-2 mr-12">
      <DateTimeInput
        v-model="values.startedAt"
        @change="handleChange"
        class="bg-background"
        #leading
      >
        <Clock class="mx-3 h-4 text-muted-foreground" />
      </DateTimeInput>
      <DateTimeInput
        v-if="values.stoppedAt"
        v-model="values.stoppedAt"
        @change="handleChange"
        class="bg-background"
        #leading
      >
        <ArrowRight class="mx-3 h-4 text-muted-foreground" />
      </DateTimeInput>
      <time
        v-if="values.stoppedAt"
        class="mr-3 text-end text-lg"
        v-text="durationLabel"
      />
    </div>
  </div>
</template>
