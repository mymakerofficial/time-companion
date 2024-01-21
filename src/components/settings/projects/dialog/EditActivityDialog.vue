<script setup lang="ts">
import BaseDialog from "@/components/common/dialog/BaseDialog.vue";
import {isNotNull, isNull, type Nullable} from "@/lib/utils";
import {useProjectsStore} from "@/stores/projectsStore";
import {computed, reactive, watch} from "vue";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useReferenceById} from "@/composables/useReferenceById";
import ColorSelect from "@/components/common/inputs/colorSelect/ColorSelect.vue";
import {whenever} from "@vueuse/core";

const props = defineProps<{
  id: Nullable<string>
}>()

const emit = defineEmits<{
  close: []
}>()

const projectsStore = useProjectsStore()
const activity = useReferenceById(projectsStore.activities)

const state = reactive({
  open: true,
  displayName: '',
  color: null as Nullable<string>,
})

watch(() => props.id, (id) => {
  activity.referenceBy(id)

  if (isNull(activity.value)) {
    return
  }

  state.displayName = activity.value.displayName
  state.color = activity.value.color
}, { immediate: true })

whenever(() => !state.open, () => emit('close'))

function close() {
  state.open = false
}

function handleRemove() {
  if (isNull(activity.value)) {
    return
  }

  projectsStore.removeActivity(activity.value)

  close()
}

function handleSubmit() {
  if (isNull(activity.value)) {
    return
  }

  activity.value.displayName = state.displayName
  activity.value.color = state.color

  close()
}
</script>

<template>
  <BaseDialog v-model:open="state.open" title="Edit Activity" description="Edit the activity.">
    <div class="flex flex-col gap-4">
      <div>Parent Project: {{ activity?.parentProject?.displayName }}</div>
      <Input v-model="state.displayName" placeholder="Name" />
      <ColorSelect v-model="state.color" />
      <div class="flex flex-row gap-4 justify-between">
        <div class="flex flex-row gap-4">
          <Button variant="destructive" @click="handleRemove">Delete</Button>
        </div>
        <div class="flex flex-row gap-4">
          <Button variant="ghost" @click="close()">Cancel</Button>
          <Button @click="handleSubmit">Save</Button>
        </div>
      </div>
    </div>
  </BaseDialog>
</template>