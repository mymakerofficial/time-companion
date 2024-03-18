<script setup lang="ts">
import BaseDialog from "@renderer/components/common/dialog/BaseDialog.vue";
import {reactive, ref} from "vue";
import {Button} from "@renderer/components/ui/button";
import ActivityForm from "@renderer/components/settings/projects/activityDialog/ActivityForm.vue";
import {
  createActivityForm,
  createActivityFromForm,
} from "@renderer/components/settings/projects/activityDialog/helpers";
import {useProjectsService} from "@renderer/services/projectsService";

const emit = defineEmits<{
  close: []
}>()

const open = ref(true)
function close() {
  open.value = false
  emit('close')
}

const projectsService = useProjectsService()

const form = reactive(createActivityForm())

function handleSubmit() {
  projectsService.addActivity(createActivityFromForm(form))
  close()
}
</script>

<template>
  <BaseDialog
    v-model:open="open"
    :title="$t('dialog.activity.new.title')"
    :description="$t('dialog.activity.new.description')"
  >
    <ActivityForm :form="form" />
    <template #footer>
      <div class="flex flex-row justify-end gap-4">
        <Button variant="ghost" @click="close()">{{ $t('dialog.activity.controls.cancel') }}</Button>
        <Button @click="handleSubmit">{{ $t('dialog.activity.controls.create') }}</Button>
      </div>
    </template>
  </BaseDialog>
</template>