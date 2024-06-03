<script setup lang="ts">
import BaseDialog from '@renderer/components/common/dialog/BaseDialog.vue'
import { ref } from 'vue'
import { Button } from '@renderer/components/ui/button'
import ProjectForm from '@renderer/components/settings/projects/projectDialog/ProjectForm.vue'
import { useCreateProject } from '@renderer/composables/mutations/useCreateProject'
import type { ProjectDto } from '@shared/model/project'

const emit = defineEmits<{
  close: []
}>()

const open = ref(true)
function close() {
  open.value = false
  emit('close')
}

const { mutateAsync: createProject } = useCreateProject()

async function handleSubmit(values: ProjectDto) {
  await createProject(values)
  close()
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
