<script setup lang="ts">
import {ArrowRight, MoreVertical} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import {reactive} from "vue";
import {isNotNull} from "@/lib/utils";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import type {ReactiveCalendarEventShadow} from "@/model/eventShadow";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import ProjectActionInput from "@/components/common/inputs/projectActionInput/ProjectActionInput.vue";
import TimeInput from "@/components/common/inputs/timeInput/TimeInput.vue";
import {mapWritable} from "@/model/modelHelpers";
import DateTimeInput from "@/components/common/inputs/timeInput/DateTimeInput.vue";

const props = defineProps<{
  event: ReactiveCalendarEvent
}>()

const emit = defineEmits<{
  continue: [shadow: ReactiveCalendarEventShadow]
  remove: [event: ReactiveCalendarEvent]
}>()

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
          v-model:project="event.project"
          v-model:activity="event.activity"
          v-model:note="event.note"
          size="lg"
          class="w-full"
        />
      </div>
      <div class="flex flex-row items-center gap-2">
        <DateTimeInput v-if="event.startAt" v-model="event.startAt" placeholder="00:00" size="lg" class="w-20" />
        <ArrowRight v-show="event.endAt" class="size-4" />
        <DateTimeInput v-if="event.endAt"  v-model="event.endAt" placeholder="00:00" size="lg" class="w-20" />
      </div>
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