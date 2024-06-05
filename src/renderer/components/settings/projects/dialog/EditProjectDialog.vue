<script setup lang="ts">
import BaseDialog from '@renderer/components/common/dialog/BaseDialog.vue'
import { ref } from 'vue'
import { Button } from '@renderer/components/ui/button'
import ProjectForm from '@renderer/components/settings/projects/dialog/ProjectForm.vue'
import { useGetProjectById } from '@renderer/composables/queries/useGetProjectById'
import { usePatchProjectById } from '@renderer/composables/mutations/usePatchProjectById'
import type { ProjectDto } from '@shared/model/project'
import { useSoftDeleteProject } from '@renderer/composables/mutations/useSoftDeleteProject'

const props = defineProps<{
  id: string
}>()

const emit = defineEmits<{
  close: []
}>()

const open = ref(true)
function close() {
  open.value = false
  emit('close')
}

const { data: project, isPending, isError, error } = useGetProjectById(props.id)
const { mutateAsync: patchProject } = usePatchProjectById()
const { mutateAsync: deleteProject } = useSoftDeleteProject()

async function handleSubmit(project: ProjectDto) {
  await patchProject({
    id: props.id,
    project,
  })
  close()
}

async function handleDelete() {
  await deleteProject(props.id)
  close()
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
