<script setup lang="ts">
import Switch from "@renderer/components/ui/switch/Switch.vue";
import Label from "@renderer/components/ui/label/Label.vue";
import type {ProjectForm} from "@renderer/components/settings/projects/projectDialog/helpers";
import ColorTextInput from "@renderer/components/common/inputs/colorTextInput/ColorTextInput.vue";
import {Info} from "lucide-vue-next";

defineProps<{
  form: ProjectForm
  isBreak?: boolean
}>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <ColorTextInput v-model:color="form.color" v-model:text="form.displayName" :placeholder="$t('dialog.project.form.displayName.placeholder')" />
    <div class="flex flex-row items-center justify-between rounded-lg border p-4">
      <div class="space-y-0.5">
        <Label class="text-base">{{ $t('dialog.project.form.isBillable.label') }}</Label>
        <p class="text-sm text-muted-foreground">{{ $t('dialog.project.form.isBillable.description') }}</p>
      </div>
      <div>
        <Switch v-model:checked="form.isBillable" />
      </div>
    </div>
    <div v-if="isBreak" class="flex flex-row items-center justify-between -mx-6 p-4 px-8 bg-muted/50">
      <div class="space-y-0.5">
        <h2 class="font-medium">{{ $t('dialog.project.form.isBreak.label')}}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('dialog.project.form.isBreak.description') }}</p>
      </div>
      <div class="mx-4">
        <Info class="size-6" />
      </div>
    </div>
  </div>
</template>
