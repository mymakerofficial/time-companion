<script setup lang="ts">
import {ArrowRight, MoreVertical} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import {reactive} from "vue";
import {isNotNull} from "@/lib/utils";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import type {ReactiveCalendarEventShadow} from "@/model/calendarEventShadow";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import ProjectActionInput from "@/components/common/inputs/projectActionInput/ProjectActionInput.vue";
import TimeInput from "@/components/common/inputs/timeInput/TimeInput.vue";
import {mapWritable} from "@/model/modelHelpers";

const props = defineProps<{
  event: ReactiveCalendarEvent
}>()

const emit = defineEmits<{
  continue: [shadow: ReactiveCalendarEventShadow]
  remove: [event: ReactiveCalendarEvent]
}>()

const state = reactive({
  ...mapWritable(props.event, [
    'project',
    'activity',
    'note',
    'startedAt',
    'endedAt',
    'duration'
  ])
})

function handleContinue() {
  emit('continue', props.event.createShadow())
}

function handleRemove() {
  emit('remove', props.event)
}
</script>

<template>
  <div class="p-8 border-b border-border">
    <div class="flex flex-row justify-between items-center gap-4">
      <div class="flex-grow">
        <ProjectActionInput
          v-model:project="state.project"
          v-model:activity="state.activity"
          v-model:note="state.note"
          size="lg"
          class="w-full"
        />
      </div>
      <div class="flex flex-row items-center gap-2">
        <TimeInput v-if="event.hasStarted" v-model="state.startedAt" placeholder="00:00" size="lg" class="w-20" />
        <ArrowRight v-show="event.hasEnded" class="size-4" />
        <TimeInput v-if="event.hasEnded"  v-model="state.endedAt" placeholder="00:00" size="lg" class="w-20" />
      </div>
      <!-- TODO add duration input -->
      <!--<div>
        <TimeInput v-if="event.hasEnded" v-model="state.duration" placeholder="00:00" class="w-20 text-center font-medium text-xl border-none" />
      </div>-->
      <div class="flex flex-row items-center gap-2">
        <Button v-if="isNotNull(event.project)" @click="handleContinue()">{{ $t('dashboard.controls.continueEvent') }}</Button>
        <DropdownMenu>
          <DropdownMenuTrigger><Button variant="ghost" size="icon"><MoreVertical /></Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="handleRemove()">{{ $t('dashboard.controls.deleteEvent') }}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</template>