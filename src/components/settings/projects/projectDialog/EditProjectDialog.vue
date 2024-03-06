<script setup lang="ts">
import BaseDialog from "@/components/common/dialog/BaseDialog.vue";
import {isNotDefined, type Nullable} from "@/lib/utils";
import {ref} from "vue";
import {Button} from "@/components/ui/button";
import ProjectForm from "@/components/settings/projects/projectDialog/ProjectForm.vue";
import {createProjectForm, patchProjectWithForm} from "@/components/settings/projects/projectDialog/helpers";
import {useProjectsService} from "@/services/projectsService";
import {useGetFrom} from "@/composables/useGetFrom";
import {whereId} from "@/lib/listUtils";
import {reactiveComputed} from "@vueuse/core";

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

const projectsService = useProjectsService()
const project = useGetFrom(projectsService.projects, whereId(props.id))
const form = reactiveComputed(() => createProjectForm(project.value))

function handleRemove() {
  if (isNotDefined(project.value)) {
    return
  }

  projectsService.removeProject(project.value)

  close()
}

function handleSubmit() {
  if (isNotDefined(project.value)) {
    return
  }

  patchProjectWithForm(project.value, form)

  close()
}
</script>

<template>
  <BaseDialog
    v-model:open="open"
    :title="$t('dialog.project.edit.title')"
    :description="$t('dialog.project.edit.description')"
  >
    <ProjectForm :form="form" :is-break="project?.isBreak ?? false" />
    <template #footer>
      <div class="flex flex-row gap-4 justify-between">
        <div class="flex flex-row gap-4">
          <Button variant="destructive" @click="handleRemove">{{ $t('dialog.project.controls.delete') }}</Button>
        </div>
        <div class="flex flex-row gap-4">
          <Button variant="ghost" @click="close()">{{ $t('dialog.project.controls.cancel') }}</Button>
          <Button @click="handleSubmit">{{ $t('dialog.project.controls.save') }}</Button>
        </div>
      </div>
    </template>
  </BaseDialog>
</template>