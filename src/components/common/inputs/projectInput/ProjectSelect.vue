<script setup lang="ts">
import Combobox, {type ComboboxProps} from "@/components/common/inputs/combobox/Combobox.vue";
import {useProjectsService} from "@/services/projectsService";
import type {ReactiveProject} from "@/model/project/types";
import type {Nullable} from "@/lib/utils";

const model = defineModel<Nullable<ReactiveProject>>({ required: true })

const props = defineProps<Pick<ComboboxProps<ReactiveProject, false>,
  'allowDeselect' |
  'placeholder' |
  'searchLabel' |
  'emptyLabel'
>>()

const { projects } = useProjectsService()
</script>

<template>
  <Combobox
    v-bind="props"
    v-model="model"
    :options="projects"
    :display-value="(project) => project?.displayName"
  />
</template>