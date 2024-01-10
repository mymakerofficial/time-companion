<script setup lang="ts">
import type {ReactiveProject} from "@/model/project";
import type {ReactiveActivity} from "@/model/activity";
import {useReferenceById} from "@/composables/use-reference-by-id";
import {computed, ref} from "vue";
import {Popover, PopoverTrigger, PopoverContent} from "@/components/ui/popover";

const props = defineProps<{
  projects: ReactiveProject[]
  activities: ReactiveActivity[]
}>()

const selectedProject = useReferenceById(props.projects)
const selectedActivity = useReferenceById(props.activities)

const projectOptions = computed(() => props.projects.map((project) => ({
  label: project.displayName,
  value: project.id,
})))

const activityOptions = computed(() => props.activities.map((activity) => ({
  label: activity.displayName,
  value: activity.id,
})))

const options = computed(() => {
  return projectOptions.value
})

const searchTerm = ref('')

const open = ref(true)

const hoveredIndex = ref(0)
</script>

<template>
  <Popover :open="open">
    <PopoverTrigger>
      <div class="inline-flex flex-row items-center justify-between">
        <div class="flex flex-row items-center">
          <div>{{ selectedProject?.displayName }}</div>
          <div>{{ selectedActivity?.displayName }}</div>
          <input v-model="searchTerm" />
        </div>
      </div>
    </PopoverTrigger>
    <PopoverContent class="p-2">
      <div class="flex flex-col">
        <div v-for="(option, index) in options" :key="option.value" :data-active="index === hoveredIndex" class="py-1 px-2 rounded-sm data-[active=true]:bg-accent">
          <div>{{ option.label }}</div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>