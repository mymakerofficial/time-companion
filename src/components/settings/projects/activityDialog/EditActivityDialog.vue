<script setup lang="ts">
import BaseDialog from "@/components/common/dialog/BaseDialog.vue";
import {isNotDefined, type Nullable} from "@/lib/utils";
import {reactive, ref} from "vue";
import {Button} from "@/components/ui/button";
import ActivityForm from "@/components/settings/projects/activityDialog/ActivityForm.vue";
import {createActivityForm, patchActivityWithForm} from "@/components/settings/projects/activityDialog/helpers";
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
const activity = useGetFrom(projectsService.activities, whereId(props.id))
const form = reactiveComputed(() => createActivityForm(activity.value))

function handleRemove() {
  if (isNotDefined(activity.value)) {
    return
  }

  projectsService.removeActivity(activity.value)

  close()
}

function handleSubmit() {
  if (isNotDefined(activity.value)) {
    return
  }

  patchActivityWithForm(activity.value, form)

  close()
}
</script>

<template>
  <BaseDialog
    v-model:open="open"
    :title="$t('dialog.activity.edit.title')"
    :description="$t('dialog.activity.edit.description')"
  >
    <ActivityForm :form="form" />
    <template #footer>
      <div class="flex flex-row gap-4 justify-between">
        <div class="flex flex-row gap-4">
          <Button variant="destructive" @click="handleRemove">{{ $t('dialog.activity.controls.delete') }}</Button>
        </div>
        <div class="flex flex-row gap-4">
          <Button variant="ghost" @click="close()">{{ $t('dialog.activity.controls.cancel') }}</Button>
          <Button @click="handleSubmit">{{ $t('dialog.activity.controls.save') }}</Button>
        </div>
      </div>
    </template>
  </BaseDialog>
</template>