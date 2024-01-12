<script setup lang="ts">
import {createProject, type ReactiveProject} from "@/model/project";
import {createActivity, type ReactiveActivity} from "@/model/activity";
import {useReferenceById} from "@/composables/use-reference-by-id";
import {computed, reactive, watch} from "vue";
import AutocompleteCombobox from "@/components/inputs/AutocompleteCombobox.vue";
import {cn, isNotNull, isNull, type Nullable, takeIf} from "@/lib/utils";
import {vProvideColor} from "@/directives/v-provide-color";
import {isEmpty} from "@/lib/list-utils";
import AutoGrowInput from "@/components/inputs/AutoGrowInput.vue";
import {Popover, PopoverContent} from "@/components/ui/popover";
import {PopoverAnchor} from "radix-vue";
import {Slash, CornerDownLeft} from "lucide-vue-next";
import {useProjectsStore} from "@/stores/projects-store";

const projectModel = defineModel<Nullable<ReactiveProject>>('project', { required: true })
const activityModel = defineModel<Nullable<ReactiveActivity>>('activity', { required: true })
const noteModel = defineModel<string>('note', { required: true })

const props = defineProps<{
  placeholder?: string
  class?: string
}>()

const projectsStore = useProjectsStore()

const state = reactive({
  searchFocused: false,
  tagInputFocused: false,
  searchTerm: '',
})

const focused = computed(() => state.searchFocused || state.tagInputFocused)

const selectedProject = useReferenceById(projectsStore.projects)
const selectedActivity = useReferenceById(projectsStore.activities)

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

const projectOptions = computed(() => projectsStore.projects.map((project) => ({
  label: project.displayName,
  value: project.id,
})))

const activityOptions = computed(() => projectsStore.projects.map((activity) => ({
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

const autofillOpen = computed(() => {
  return focused.value && state.searchTerm.length > 0 && filteredOptions.value.length > 0
})

const promptOpen = computed(() => {
  return state.searchFocused &&
      (isNull(selectedProject.value) || isNull(selectedActivity.value)) &&
      state.searchTerm.length > 1 &&
      state.searchTerm.length <= 20 &&
      filteredOptions.value.length === 0
})

const promptMessage = computed(() => {
  if (isNull(selectedProject.value)) {
    return `Create project "${state.searchTerm}"?`
  }

  if (isNull(selectedActivity.value)) {
    return `Create activity "${state.searchTerm}"?`
  }
})

function addProject() {
  const project = createProject({
    displayName: state.searchTerm,
  }, {
    randomColor: true,
  })

  projectsStore.addProject(project)
  selectedProject.referenceBy(project.id)
  state.searchTerm = ''
}

function addActivity() {
  const activity = createActivity({
    displayName: state.searchTerm,
  })

  projectsStore.addActivity(activity)
  selectedActivity.referenceBy(activity.id)
  state.searchTerm = ''
}

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

function handleConfirm() {
  if (!promptOpen.value) {
    return
  }

  if (isNull(selectedProject.value)) {
    addProject()
    return
  }

  if (isNull(selectedActivity.value)) {
    addActivity()
    return
  }
}

const tags = computed(() => {
  return [
    selectedProject.value,
    selectedActivity.value,
  ].filter(isNotNull)
})
</script>

<template>
  <AutocompleteCombobox
    :open="autofillOpen"
    :options="filteredOptions"
    @selected="handleSelected"
  >
    <Popover :open="promptOpen">
      <PopoverAnchor>
        <div
          :data-focused="focused"
          :class="cn('inline-flex flex-row items-center justify-between w-full rounded-md border border-input bg-background p-1 font-medium text-xl ring-offset-background data-[focused=true]:ring-2 data-[focused=true]:ring-ring data-[focused=true]:ring-offset-2', props.class ?? '')"
        >
          <div class="flex-grow flex flex-row items-center gap-1">
            <div v-if="tags.length" v-provide-color="selectedProject?.color" class="px-3 py-1 flex flex-row items-center gap-1 text-xl font-medium bg-primary text-primary-foreground rounded-md">
              <div
                v-for="(tag, index) in tags"
                :key="tag.id"
                class="flex flex-row items-center"
              >
                <AutoGrowInput
                    v-model="tag.displayName"
                    @focus="state.tagInputFocused = true"
                    @blur="state.tagInputFocused = false"
                    @keydown.delete="handleDelete"
                    class="focus-visible:outline-none"
                />
                <Slash class="size-4 ml-2" v-if="index !== tags.length - 1" />
              </div>
            </div>
            <input
              v-model="state.searchTerm"
              @focus="state.searchFocused = true"
              @blur="state.searchFocused = false"
              @keydown.delete="handleDelete"
              @keydown.enter.prevent="handleConfirm"
              :placeholder="takeIf(tags, isEmpty, props.placeholder) || ''"
              class="flex-grow focus-visible:outline-none bg-inherit placeholder:text-muted-foreground py-1 mx-2"
            />
          </div>
        </div>
      </PopoverAnchor>
      <PopoverContent align="start" class="p-2">
        <div class="flex flex-row items-center justify-between gap-1 cursor-pointer py-1 px-2 rounded-sm bg-accent">
          <span>{{ promptMessage }}</span>
          <CornerDownLeft class="size-4" />
        </div>
      </PopoverContent>
    </Popover>
  </AutocompleteCombobox>
</template>