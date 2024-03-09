<script setup lang="ts">
import {ArrowRight, Clock, MoreVertical, Trash, EyeOff, Play} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import {isNotNull} from "@/lib/utils";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import type {ReactiveCalendarEventShadow} from "@/model/eventShadow/types";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import ProjectActionInput from "@/components/common/inputs/projectActionInput/ProjectActionInput.vue";
import DateTimeInput from "@/components/common/inputs/timeInput/DateTimeInput.vue";
import DurationInput from "@/components/common/inputs/timeInput/DurationInput.vue";
import DashboardSection from "@/components/dashboard/cards/DashboardSection.vue";

const props = defineProps<{
  event: ReactiveCalendarEvent
}>()

const emit = defineEmits<{
  continue: [shadow: ReactiveCalendarEventShadow]
  remove: [event: ReactiveCalendarEvent]
  dismiss: []
}>()

function handleContinue() {
  const shadow = props.event.createShadow()

  if (isNotNull(shadow)) {
    emit('continue', shadow)
  }
}

function handleRemove() {
  emit('remove', props.event)
}

function handleDismiss() {
  emit('dismiss')
}
</script>

<template>
  <DashboardSection label="Edit tracked time">
    <div class="flex items-center gap-3">
      <div class="flex-grow">
        <ProjectActionInput
          v-model:project="event.project"
          v-model:activity="event.activity"
          v-model:note="event.note"
          size="lg"
          class="w-full"
        />
      </div>
      <div class="flex items-center gap-2">
        <DateTimeInput v-if="event.startAt" v-model="event.startAt" placeholder="00:00" size="sm" class="border-none h-11 w-fit text-sm" input-class="w-12" v-slot:leading>
          <Clock class="mx-3 size-4 text-muted-foreground" />
        </DateTimeInput>
        <DateTimeInput v-if="event.endAt" v-model="event.endAt" placeholder="00:00" size="sm" class="border-none h-11 w-fit text-sm" input-class="w-12" v-slot:leading>
          <ArrowRight class="mx-3 size-4 text-muted-foreground" />
        </DateTimeInput>
        <DurationInput v-if="event.endAt" v-model="event.duration" size="sm" class="border-none h-11 w-fit text-lg font-medium" input-class="w-24 text-center" />
      </div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger><Button variant="ghost" size="icon"><MoreVertical class="size-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem v-if="isNotNull(event.project)" @click="handleContinue()" class="space-x-2"><Play class="size-4" /><span>{{ $t('dashboard.controls.continueEvent') }}</span></DropdownMenuItem>
            <DropdownMenuItem @click="handleDismiss()" class="space-x-2"><EyeOff class="size-4" /><span>{{ $t('common.controls.dismiss') }}</span></DropdownMenuItem>
            <DropdownMenuItem @click="handleRemove()" class="text-destructive space-x-2"><Trash class="size-4" /><span>{{ $t('dashboard.controls.deleteEvent') }}</span></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </DashboardSection>
</template>