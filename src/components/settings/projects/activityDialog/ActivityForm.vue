<script setup lang="ts">
import Combobox from "@/components/common/inputs/combobox/ComboboxOld.vue";
import {Slash} from "lucide-vue-next";
import type {ComboboxOption} from "@/components/common/inputs/combobox/types";
import {useProjectsStore} from "@/stores/projectsStore";
import type {ActivityForm} from "@/components/settings/projects/activityDialog/helpers";
import ColorTextInput from "@/components/common/inputs/colorTextInput/ColorTextInput.vue";

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
      <Combobox v-model="form.projectId" :options="projectOptions" :placeholder="$t('dialog.activity.form.parentProject.placeholder')" />
      <Slash class="size-4" />
      <ColorTextInput v-model:color="form.color" v-model:text="form.displayName" :placeholder="$t('dialog.activity.form.displayName.placeholder')" />
    </div>
  </div>
</template>