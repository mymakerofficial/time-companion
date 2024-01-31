<script setup lang="ts">
import Switch from "@/components/ui/switch/Switch.vue";
import Label from "@/components/ui/label/Label.vue";
import type {ProjectForm} from "@/components/settings/projects/projectDialog/helpers";
import ColorTextInput from "@/components/common/inputs/colorTextInput/ColorTextInput.vue";

defineProps<{
  form: ProjectForm
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
  </div>
</template>
