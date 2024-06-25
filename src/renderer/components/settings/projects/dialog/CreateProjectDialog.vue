<script setup lang="ts">
import BaseDialog from '@renderer/components/common/dialog/BaseDialog.vue'
import { Button } from '@shadcn/button'
import ProjectForm from '@renderer/components/common/forms/project/ProjectForm.vue'
import { useCreateProject } from '@renderer/composables/mutations/projects/useCreateProject'
import type { CreateProject } from '@shared/model/project'
import { useDialogContext } from '@renderer/composables/dialog/useDialog'

const { close, open } = useDialogContext()
const { mutate: createProject } = useCreateProject({
  onSuccess: close,
})

function handleSubmit(values: CreateProject) {
  createProject(values)
}
</script>

<template>
  <BaseDialog
    v-model:open="open"
    :title="$t('dialog.project.new.title')"
    :description="$t('dialog.project.new.description')"
  >
    <ProjectForm @submit="handleSubmit" #actions>
      <Button type="button" @click="close()" variant="ghost">
        {{ $t('dialog.project.controls.cancel') }}
      </Button>
      <Button type="submit">
        {{ $t('dialog.project.controls.create') }}
      </Button>
    </ProjectForm>
    <template #footer>
      <!-- TODO: put actions in footer -->
    </template>
  </BaseDialog>
</template>
