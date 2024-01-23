<script setup lang="ts">
import {Input} from "@/components/ui/input";
import Switch from "@/components/ui/switch/Switch.vue";
import Label from "@/components/ui/label/Label.vue";
import ColorSelect from "@/components/common/inputs/colorSelect/ColorSelect.vue";
import type {ProjectForm} from "@/components/settings/projects/projectDialog/helpers";

defineProps<{
  form: ProjectForm
}>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <Input v-model="form.displayName" placeholder="Name" />
    <div class="flex flex-row items-center justify-between rounded-lg border p-4">
      <div class="space-y-0.5">
        <Label class="text-base">
          Color
        </Label>
        <p class="text-sm text-muted-foreground">
          Give your life some color!
        </p>
      </div>
      <div>
        <ColorSelect v-model="form.color" variant="ghost" />
      </div>
    </div>
    <div class="flex flex-row items-center justify-between rounded-lg border p-4">
      <div class="space-y-0.5">
        <Label class="text-base">
          Billable
        </Label>
        <p class="text-sm text-muted-foreground">
          Does this project count towards your tracked time?
        </p>
      </div>
      <div>
        <Switch v-model:checked="form.isBillable" />
      </div>
    </div>
  </div>
</template>
