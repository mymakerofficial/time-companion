<script setup lang="ts">
import type {ReactiveProject} from "@/model/project";
import type {ReactiveActivity} from "@/model/activity";
import {useReferenceById} from "@/composables/use-reference-by-id";
import {computed, reactive, watch} from "vue";
import AutocompleteCombobox from "@/components/AutocompleteCombobox.vue";
import {cn, isNotNull, isNull, type Nullable, takeIf} from "@/lib/utils";
import {vProvideColor} from "@/directives/v-provide-color";
import {isEmpty} from "@/lib/list-utils";
import AutoGrowInput from "@/components/AutoGrowInput.vue";

const projectModel = defineModel<Nullable<ReactiveProject>>('project', { required: true })
const activityModel = defineModel<Nullable<ReactiveActivity>>('activity', { required: true })
const noteModel = defineModel<string>('note', { required: true })

const props = defineProps<{
  projects: ReactiveProject[]
  activities: ReactiveActivity[]
  placeholder?: string
  class?: string
}>()

const state = reactive({
  focused: false,
  searchTerm: '',
})

const selectedProject = useReferenceById(props.projects)
const selectedActivity = useReferenceById(props.activities)

watch(projectModel, (value) => {
  selectedProject.referenceBy(value?.id ?? null)
}, { immediate: true })
watch(selectedProject, () => {
  projectModel.value = selectedProject.value
})

watch(activityModel, (value) => {
  selectedActivity.referenceBy(value?.id ?? null)
}, { immediate: true })
watch(selectedActivity, () => {
  activityModel.value = selectedActivity.value
})

watch(noteModel, (value) => {
  state.searchTerm = value
})
watch(() => state.searchTerm, (value) => {
  noteModel.value = value
})

const projectOptions = computed(() => props.projects.map((project) => ({
  label: project.displayName,
  value: project.id,
})))

const activityOptions = computed(() => props.activities.map((activity) => ({
  label: activity.displayName,
  value: activity.id,
})))

const options = computed(() => {
  if (isNull(selectedProject.value)) {
    return projectOptions.value
  }

  if (isNull(selectedActivity.value)) {
    return activityOptions.value
  }

  return []
})

const filteredOptions = computed(() => {
  return options.value.filter((option) => {
    return option.label.toLowerCase().includes(state.searchTerm.toLowerCase())
  })
})

function handleSelected(option: { label: string, value: string }) {
  state.searchTerm = ''

  if (isNull(selectedProject.value)) {
    selectedProject.referenceBy(option.value)
    return
  }

  if (isNull(selectedActivity.value)) {
    selectedActivity.referenceBy(option.value)
    return
  }
}

function handleDelete(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement

  if (input.selectionStart !== 0 || input.selectionEnd !== 0) {
    return
  }

  if (isNotNull(selectedActivity.value)) {
    selectedActivity.value = null
    return
  }

  if (isNotNull(selectedProject.value)) {
    selectedProject.value = null
    return
  }
}

const tags = computed(() => {
  return [
    selectedProject.value,
    selectedActivity.value,
  ].filter(isNotNull)
})

const autofillOpen = computed(() => {
  return state.focused && state.searchTerm.length > 0 && filteredOptions.value.length > 0
})
</script>

<template>
  <AutocompleteCombobox
    :open="autofillOpen"
    :options="filteredOptions"
    @selected="handleSelected"
  >
    <div
      :data-focused="state.focused"
      :class="cn('inline-flex flex-row items-center justify-between w-full rounded-md border border-input bg-background p-1 font-medium text-xl ring-offset-background data-[focused=true]:ring-2 data-[focused=true]:ring-ring data-[focused=true]:ring-offset-2', props.class ?? '')"
    >
      <div class="flex-grow flex flex-row items-center gap-1">
        <div
          v-provide-color="selectedProject?.color"
          v-for="tag in tags"
          :key="tag.id"
          class="flex flex-row items-center bg-primary text-primary-foreground rounded-md px-3 py-1 text-xl font-medium"
        >
          <AutoGrowInput
            v-model="tag.displayName"
            @focus="state.focused = true"
            @blur="state.focused = false"
            @keydown.delete="handleDelete"
            class="focus-visible:outline-none"
          />
        </div>
        <input
          v-model="state.searchTerm"
          @focus="state.focused = true"
          @blur="state.focused = false"
          @keydown.delete="handleDelete"
          :placeholder="takeIf(tags, isEmpty, props.placeholder) || ''"
          class="flex-grow focus-visible:outline-none bg-inherit placeholder:text-muted-foreground py-1 mx-2"
        />
      </div>
    </div>
  </AutocompleteCombobox>
</template>