<script setup lang="ts">
import {MoreVertical} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import {computed} from "vue";
import {vProvideColor} from "@/directives/vProvideColor";
import {isNotNull,} from "@/lib/utils";
import type {ReactiveCalendarReminder} from "@/model/calendarReminder/types";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {useTimeNow} from "@/composables/useNow";
import {durationBetween, humanizeDuration, minutes} from "@/lib/neoTime";

const props = defineProps<{
  reminder: ReactiveCalendarReminder
}>()

const now = useTimeNow({
  interval: minutes(1)
})

const timeLabel = computed(() => {
  return `in ${humanizeDuration(durationBetween(now.value, props.reminder.startAt))}`
})

const hasButton = computed(() => {
  return isNotNull(props.reminder.actionLabel)
})

function handleTrigger() {
  props.reminder.triggerAction()
}

function handleDismiss() {
  props.reminder.dismiss()
}
</script>

<template>
  <div>
    <div class="flex flex-row justify-between items-center gap-8">
      <div class="flex-grow flex items-center gap-4">
        <span v-provide-color="reminder.color" class="size-3 rounded-sm bg-primary" />
        <h3 class="font-medium text-sm">{{ reminder.displayText }}</h3>
      </div>
      <div>
        <time class="text-sm font-medium">{{ timeLabel }}</time>
      </div>
      <div class="flex flex-row items-center gap-2">
        <Button v-if="hasButton" @click="handleTrigger()" variant="secondary" size="sm">{{ $t('dashboard.controls.startEvent') }}</Button>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon"><MoreVertical class="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="handleDismiss()">{{ $t('dashboard.controls.dismissReminder') }}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</template>