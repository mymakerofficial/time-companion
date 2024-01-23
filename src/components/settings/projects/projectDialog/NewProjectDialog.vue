<script setup lang="ts">
import BaseDialog from "@/components/common/dialog/BaseDialog.vue";
import {useProjectsStore} from "@/stores/projectsStore";
import {reactive, ref, watch} from "vue";
import {Button} from "@/components/ui/button";
import ProjectForm from "@/components/settings/projects/projectDialog/ProjectForm.vue";
import {
  createProjectForm,
  createProjectFromForm,
} from "@/components/settings/projects/projectDialog/helpers";

const emit = defineEmits<{
  close: []
}>()

const open = ref(true)
function close() {
  open.value = false
  emit('close')
}

const projectsStore = useProjectsStore()

const form = reactive(createProjectForm())

function handleSubmit() {
  projectsStore.addProject(createProjectFromForm(form))
  close()
}
</script>

<template>
  <BaseDialog v-model:open="open" title="New Project" description="Projects are what your time counts towards">
    <ProjectForm :form="form" />
    <template #footer>
      <div class="flex flex-row justify-end gap-4">
        <Button variant="ghost" @click="close()">Cancel</Button>
        <Button @click="handleSubmit">Create</Button>
      </div>
    </template>
  </BaseDialog>
</template>