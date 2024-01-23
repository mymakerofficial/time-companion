<script setup lang="ts">
import BaseDialog from "@/components/common/dialog/BaseDialog.vue";
import {isNull, type Nullable} from "@/lib/utils";
import {useProjectsStore} from "@/stores/projectsStore";
import {reactive, ref} from "vue";
import {Button} from "@/components/ui/button";
import {useReferenceById} from "@/composables/useReferenceById";
import ActivityForm from "@/components/settings/projects/activityDialog/ActivityForm.vue";
import {createActivityForm, patchActivityWithForm} from "@/components/settings/projects/activityDialog/helpers";

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

const projectsStore = useProjectsStore()
const activity = useReferenceById(projectsStore.activities, () => props.id)

const form = reactive(createActivityForm(activity.value))

function handleRemove() {
  if (isNull(activity.value)) {
    return
  }

  projectsStore.removeActivity(activity.value)

  close()
}

function handleSubmit() {
  if (isNull(activity.value)) {
    return
  }

  patchActivityWithForm(activity.value, form)

  close()
}
</script>

<template>
  <BaseDialog v-model:open="open" title="Edit Activity" description="Activities are just for you.">
    <ActivityForm :form="form" />
    <template #footer>
      <div class="flex flex-row gap-4 justify-between">
        <div class="flex flex-row gap-4">
          <Button variant="destructive" @click="handleRemove">Delete</Button>
        </div>
        <div class="flex flex-row gap-4">
          <Button variant="ghost" @click="close()">Cancel</Button>
          <Button @click="handleSubmit">Save</Button>
        </div>
      </div>
    </template>
  </BaseDialog>
</template>