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
const project = useReferenceById(projectsStore.projects)

const state = reactive({
  open: true,
  displayName: '',
  color: null as Nullable<string>,
})

watch(() => props.id, (id) => {
  project.referenceBy(id)

  if (isNull(project.value)) {
    return
  }

  state.displayName = project.value.displayName
  state.color = project.value.color
}, { immediate: true })

whenever(() => !state.open, () => emit('close'))

function close() {
  state.open = false
}

function handleRemove() {
  if (isNull(project.value)) {
    return
  }

  projectsStore.removeProject(project.value)

  close()
}

function handleSubmit() {
  if (isNull(project.value)) {
    return
  }

  project.value.displayName = state.displayName
  project.value.color = state.color

  close()
}
</script>

<template>
  <BaseDialog v-model:open="state.open" title="Edit Project" description="Edit the project.">
    <div class="flex flex-col gap-4">
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