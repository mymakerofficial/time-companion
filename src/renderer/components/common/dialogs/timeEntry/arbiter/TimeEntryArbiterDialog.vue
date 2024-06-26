<script setup lang="ts">
import BaseDialog from '@renderer/components/common/dialog/BaseDialog.vue'
import { useDialogContext } from '@renderer/composables/dialog/useDialog'
import TimeEntryRealtimeForm from '@renderer/components/common/forms/timeEntry/TimeEntryRealtimeForm.vue'
import { type TimeEntryBase, timeEntrySchema } from '@shared/model/timeEntry'
import { useGetTimeEntry } from '@renderer/composables/queries/timeEntries/useGetTimeEntry'
import { ref, watch } from 'vue'
import { Button } from '@shadcn/button'
import { getSchemaDefaults } from '@shared/lib/helpers/getSchemaDefaults'
import { usePatchTimeEntry } from '@renderer/composables/mutations/timeEntries/usePatchTimeEntry'
import { useSoftDeleteTimeEntry } from '@renderer/composables/mutations/timeEntries/useSoftDeleteTimeEntry'

const props = defineProps<{
  id: string
  userInput: Partial<TimeEntryBase>
  error: Error
}>()

const { close, open } = useDialogContext()
const { data: actualEntry } = useGetTimeEntry(props.id)
const { mutateAsync: deleteTimeEntry } = useSoftDeleteTimeEntry()
const { mutateAsync: patchTimeEntry } = usePatchTimeEntry()

const completeUserInput = ref<TimeEntryBase>(getSchemaDefaults(timeEntrySchema))
watch(
  [() => props.userInput, actualEntry],
  ([userInput, actualEntry]) => {
    completeUserInput.value = {
      ...getSchemaDefaults(timeEntrySchema),
      ...actualEntry,
      ...userInput,
    }
  },
  {
    immediate: true,
  },
)

function handleChange(values: TimeEntryBase) {
  completeUserInput.value = values
}
async function handleDelete() {
  close()
  await deleteTimeEntry(props.id)
}
async function handleSubmit() {
  close()
  await patchTimeEntry({
    id: props.id,
    timeEntry: completeUserInput.value,
  })
}
</script>

<template>
  <BaseDialog
    v-model:open="open"
    title="Your input caused an error."
    :description="`Please resolve the following to continue: ${error.message}`"
  >
    <TimeEntryRealtimeForm
      :time-entry="completeUserInput"
      @change="handleChange"
      hide-more
    />
    <template #footer>
      <div class="flex flex-row justify-end gap-4">
        <Button @click="handleDelete" variant="destructive" class="mr-auto">
          Delete
        </Button>
        <Button @click="close" variant="ghost">Cancel</Button>
        <Button @click="handleSubmit">Continue</Button>
      </div>
    </template>
  </BaseDialog>
</template>
