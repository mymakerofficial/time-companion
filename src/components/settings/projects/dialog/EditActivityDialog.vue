<script setup lang="ts">
import BaseDialog from "@/components/common/dialog/BaseDialog.vue";
import {isNotNull, isNull, type Nullable} from "@/lib/utils";
import {useProjectsStore} from "@/stores/projectsStore";
import {reactive, watch} from "vue";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useReferenceById} from "@/composables/useReferenceById";
import ColorSelect from "@/components/common/inputs/colorSelect/ColorSelect.vue";
import {whenever} from "@vueuse/core";
import type {ReactiveProject} from "@/model/project";
import {Slash} from "lucide-vue-next"
import type {ComboboxOption} from "@/components/common/inputs/combobox/types";
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";

const props = defineProps<{
  id: Nullable<string>
}>()

const emit = defineEmits<{
  close: []
}>()

const projectsStore = useProjectsStore()
const activity = useReferenceById(projectsStore.activities, () => props.id)

const projectOptions: ComboboxOption[] = projectsStore.projects.map((project) => ({
  value: project.id,
  label: project.displayName,
}))

const state = reactive({
  open: true,
  projectId: null as Nullable<ReactiveProject['id']>,
  displayName: '',
  color: null as Nullable<string>,
})

watch(activity, () => {
  if (isNull(activity.value)) {
    return
  }

  state.projectId = activity.value.parentProject?.id ?? null
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

  if (isNotNull(state.projectId) && state.projectId !== activity.value.parentProject?.id) {
    projectsStore.link(
      projectsStore.getProjectById(state.projectId),
      activity.value
    )
  }

  close()
}
</script>

<template>
  <BaseDialog v-model:open="state.open" title="Edit Activity" description="Activities are just for you.">
    <div class="flex flex-col gap-4">
      <div class="flex flex-row items-center gap-2">
        <Combobox v-model="state.projectId" :options="projectOptions" />
        <Slash class="size-4" />
        <Input v-model="state.displayName" placeholder="Name" />
      </div>
      <ColorSelect v-model="state.color" />
    </div>
    <template #footer>
      <div class="flex flex-row gap-4 justify-between">
        <div class="flex flex-row gap-4">
          <Button variant="destructive" @click="handleRemove">Delete</Button>
        </div>
        <div class="flex flex-row gap-4">
          <Button variant="ghost" @click="close()">Cancel</Button>
          <Button @click="handleSubmit">Save</Button>
        </div>
      </div>
    </template>
  </BaseDialog>
</template>