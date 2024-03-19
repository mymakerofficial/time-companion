<script setup lang="ts">
import { Slash } from 'lucide-vue-next'
import type { ActivityForm } from '@renderer/components/settings/projects/activityDialog/helpers'
import ColorTextInput from '@renderer/components/common/inputs/colorTextInput/ColorTextInput.vue'
import ProjectSelect from '@renderer/components/common/inputs/projectInput/ProjectSelect.vue'

defineProps<{
  form: ActivityForm
}>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-row items-center gap-2">
      <ProjectSelect
        v-model="form.project"
        :placeholder="$t('dialog.activity.form.parentProject.placeholder')"
      />
      <Slash class="size-4" />
      <ColorTextInput
        v-model:color="form.color"
        v-model:text="form.displayName"
        :placeholder="$t('dialog.activity.form.displayName.placeholder')"
      />
    </div>
  </div>
</template>
