<script setup lang="ts">
import BaseDialog from "@/components/common/dialog/BaseDialog.vue";
import {useProjectsStore} from "@/stores/projectsStore";
import {reactive, ref} from "vue";
import {Button} from "@/components/ui/button";
import ActivityForm from "@/components/settings/projects/activityDialog/ActivityForm.vue";
import {
  createActivityForm,
  createActivityFromForm,
} from "@/components/settings/projects/activityDialog/helpers";

const emit = defineEmits<{
  close: []
}>()

const open = ref(true)
function close() {
  open.value = false
  emit('close')
}

const projectsStore = useProjectsStore()

const form = reactive(createActivityForm())

function handleSubmit() {
  projectsStore.addActivity(createActivityFromForm(form))
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