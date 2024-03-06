<script setup lang="ts">
import Combobox, {type ComboboxProps} from "@/components/common/inputs/combobox/Combobox.vue";
import {useProjectsService} from "@/services/projectsService";
import type {ReactiveProject} from "@/model/project/types";
import type {Nullable} from "@/lib/utils";
import {createProject} from "@/model/project/model";

const model = defineModel<Nullable<ReactiveProject>>({ required: true })

const props = defineProps<Pick<ComboboxProps<ReactiveProject, false>,
  'allowDeselect' |
  'placeholder' |
  'searchLabel' |
  'emptyLabel'
>>()

const projectsService = useProjectsService()

function handleCreate(displayName: string) {
  const project = createProject({
    displayName
  }, { randomColor: true})

  projectsService.addProject(project)

  model.value = project
}
</script>

<template>
  <Combobox
    v-bind="props"
    v-model="model"
    :options="projectsService.projects"
    :display-value="(project) => project?.displayName"
    allow-create
    @create="handleCreate"
  />
</template>