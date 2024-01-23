<script setup lang="ts">
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";
import {Input} from "@/components/ui/input";
import {Slash} from "lucide-vue-next";
import ColorSelect from "@/components/common/inputs/colorSelect/ColorSelect.vue";
import type {ComboboxOption} from "@/components/common/inputs/combobox/types";
import {useProjectsStore} from "@/stores/projectsStore";
import type {ActivityForm} from "@/components/settings/projects/activityDialog/helpers";
import Label from "@/components/ui/label/Label.vue";

defineProps<{
  form: ActivityForm
}>()

const projectsStore = useProjectsStore()

const projectOptions: ComboboxOption[] = projectsStore.projects.map((project) => ({
  value: project.id,
  label: project.displayName,
}))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-row items-center gap-2">
      <Combobox v-model="form.projectId" :options="projectOptions" placeholder="Select Project" />
      <Slash class="size-4" />
      <Input v-model="form.displayName" placeholder="Name" />
    </div>
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
  </div>
</template>