<script setup lang="ts">
import BaseDialog from "@/components/common/dialog/BaseDialog.vue";
import {isNull, type Nullable} from "@/lib/utils";
import {useProjectsStore} from "@/stores/projectsStore";
import {reactive, ref, watch} from "vue";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useReferenceById} from "@/composables/useReferenceById";
import ColorSelect from "@/components/common/inputs/colorSelect/ColorSelect.vue";
import {whenever} from "@vueuse/core";
import Switch from "@/components/ui/switch/Switch.vue";
import Label from "@/components/ui/label/Label.vue";
import ProjectForm from "@/components/settings/projects/projectDialog/ProjectForm.vue";
import {createProjectForm, patchProjectWithForm} from "@/components/settings/projects/projectDialog/helpers";

const props = defineProps<{
  id: Nullable<string>
}>()

const emit = defineEmits<{
  close: []
}>()

const open = ref(true)
function close() {
  open.value = false
  emit('close')
}

const projectsStore = useProjectsStore()
const project = useReferenceById(projectsStore.projects, () => props.id)

const form = reactive(createProjectForm(project.value))

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

  patchProjectWithForm(project.value, form)

  close()
}
</script>

<template>
  <BaseDialog v-model:open="open" title="Edit Project" description="Projects are what your time counts towards">
    <ProjectForm :form="form" />
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