<script setup lang="ts">
import BaseDialog from '@renderer/components/common/dialog/BaseDialog.vue'
import { reactive, ref } from 'vue'
import { Button } from '@renderer/components/ui/button'
import ProjectForm from '@renderer/components/settings/projects/projectDialog/ProjectForm.vue'
import {
  createProjectForm,
  createProjectFromForm,
} from '@renderer/components/settings/projects/projectDialog/helpers'
import { useProjectsService } from '@renderer/services/projectsService'

const emit = defineEmits<{
  close: []
}>()

const open = ref(true)
function close() {
  open.value = false
  emit('close')
}

const projectsService = useProjectsService()

const form = reactive(createProjectForm())

function handleSubmit() {
  projectsService.addProject(createProjectFromForm(form))
  close()
}
</script>

<template>
  <BaseDialog
    v-model:open="open"
    :title="$t('dialog.project.new.title')"
    :description="$t('dialog.project.new.description')"
  >
    <ProjectForm :form="form" />
    <template #footer>
      <div class="flex flex-row justify-end gap-4">
        <Button variant="ghost" @click="close()">{{
          $t('dialog.project.controls.cancel')
        }}</Button>
        <Button @click="handleSubmit">{{
          $t('dialog.project.controls.create')
        }}</Button>
      </div>
    </template>
  </BaseDialog>
</template>
