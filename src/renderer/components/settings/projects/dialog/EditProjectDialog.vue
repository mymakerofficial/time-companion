<script setup lang="ts">
import BaseDialog from '@renderer/components/common/dialog/BaseDialog.vue'
import { Button } from '@renderer/components/ui/button'
import ProjectForm from '@renderer/components/common/forms/project/ProjectForm.vue'
import { useGetProjectById } from '@renderer/composables/queries/projects/useGetProjectById'
import { usePatchProjectById } from '@renderer/composables/mutations/projects/usePatchProjectById'
import type { UpdateProject } from '@shared/model/project'
import { useSoftDeleteProject } from '@renderer/composables/mutations/projects/useSoftDeleteProject'
import { useDialogContext } from '@renderer/composables/dialog/useDialog'

const props = defineProps<{
  id: string
}>()

const { close, open } = useDialogContext()
const { data: project, isPending, isError, error } = useGetProjectById(props.id)
const { mutate: patchProject } = usePatchProjectById({
  onSuccess: close,
})
const { mutate: deleteProject } = useSoftDeleteProject({
  onSuccess: close,
})

function handleSubmit(project: UpdateProject) {
  patchProject({
    id: props.id,
    project,
  })
}

function handleDelete() {
  deleteProject(props.id)
}
</script>

<template>
  <BaseDialog
    v-model:open="open"
    :title="$t('dialog.project.edit.title')"
    :description="$t('dialog.project.edit.description')"
  >
    <div v-if="isPending">Loading...</div>
    <div v-else-if="isError">Error: {{ error }}</div>
    <ProjectForm
      v-else-if="project"
      :project="project"
      @submit="handleSubmit"
      #actions
    >
      <Button
        type="button"
        @click="handleDelete"
        variant="destructive"
        class="mr-auto"
      >
        {{ $t('dialog.project.controls.delete') }}
      </Button>
      <Button type="button" @click="close" variant="ghost">
        {{ $t('dialog.project.controls.cancel') }}
      </Button>
      <Button type="submit">
        {{ $t('dialog.project.controls.save') }}
      </Button>
    </ProjectForm>
    <template #footer>
      <!-- TODO: put actions in footer -->
    </template>
  </BaseDialog>
</template>
