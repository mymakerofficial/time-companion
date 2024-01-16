<script setup lang="ts">
import {createEventShadow, type ReactiveCalendarEventShadow} from "@/model/calendar-event-shadow";
import {vProvideColor} from "@/directives/v-provide-color";
import {Slash, Play, PencilLine} from "lucide-vue-next";
import {computed} from "vue";
import {useProjectsStore} from "@/stores/projects-store";
import type {ReactiveProject} from "@/model/project";
import type {ReactiveActivity} from "@/model/activity";
import {useCalendarStore} from "@/stores/calendar-store";
import {isNotNull, isNull} from "@/lib/utils";

const emit = defineEmits<{
  start: [shadow: ReactiveCalendarEventShadow]
}>()

const projectsStore = useProjectsStore()
const calendarStore = useCalendarStore()

const maxActivitiesPerProject = 3
const maxShadows = 12

function byLastUsed(a: ReactiveProject | ReactiveActivity, b: ReactiveProject | ReactiveActivity) {
  return a.lastUsed > b.lastUsed ? -1 : 1
}

const shadows = computed(() => {
  return projectsStore.projects
    .flatMap((project) => {
      return [
        ...project.childActivities.sort(byLastUsed).map((activity) => createEventShadow({ project, activity })).slice(0, maxActivitiesPerProject),
        createEventShadow({ project })
      ]
    })
    .sort((a, b) => byLastUsed(
      a.activity ?? a.project,
      b.activity ?? b.project
    ))
    .slice(0, maxShadows)
})

const activeEventHasNoProject = computed(() => {
  return isNull(calendarStore.activeDay.currentEvent?.project)
})

function handleClick(shadow: ReactiveCalendarEventShadow) {
  if (activeEventHasNoProject.value && isNotNull(calendarStore.activeDay.currentEvent)) {
    calendarStore.activeDay.currentEvent.project = shadow.project
    calendarStore.activeDay.currentEvent.activity = shadow.activity
    return
  }

  emit('start', shadow)
}
</script>

<template>
  <div v-if="shadows.length" class="border-b border-border">
    <div class="flex flex-wrap gap-2 p-8">
      <button
        v-for="(shadow, index) in shadows"
        :key="index"
        @click="handleClick(shadow)"
        v-provide-color="shadow.color"
        class="px-8 py-4 min-w-52 rounded-md flex flex-row justify-between items-center gap-4 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-medium tracking-wide text-start"
      >
        <span class="flex flex-row items-center gap-1 max-w-56">
          <span class="truncate">{{ shadow.project.displayName }}</span>
          <Slash v-if="shadow.activity" class="size-4" />
          <span v-if="shadow.activity" class="truncate">{{ shadow.activity?.displayName }}</span>
        </span>
        <PencilLine v-if="activeEventHasNoProject" class="size-4" />
        <Play v-else class="size-4" />
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>