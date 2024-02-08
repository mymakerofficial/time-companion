<script setup lang="ts">
import {ref} from "vue";
import {Input} from "@/components/ui/input";
import {ComboboxInput} from "radix-vue";
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";
import {useProjectsStore} from "@/stores/projectsStore";
import type {ReactiveProject} from "@/model/project";
import type {Nullable} from "@/lib/utils";
import {vProvideColor} from "@/directives/vProvideColor";

const open = ref(false)
const searchTerm = ref('')

const { projects } = useProjectsStore()
const project = ref<Nullable<ReactiveProject>>(null)
</script>

<template>
  <Combobox
    v-model="project"
    :options="projects"
    :display-value="(project) => project?.displayName"
    :open="open"
    :search-term="searchTerm"
    no-input
    prevent-close
  >
    <template #anchor>
      <Input
        v-model="searchTerm"
        :as="ComboboxInput"
        @focusin="open = true"
        @focusout="open = false"
        v-slot:leading
      >
        <span
          v-if="project"
          v-text="project?.displayName"
          v-provide-color="project?.color ?? null"
          class="mx-1 px-2 py-1 rounded-md bg-primary text-primary-foreground"
        />
      </Input>
    </template>
  </Combobox>
</template>