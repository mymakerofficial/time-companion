<script setup lang="ts">
import {MoreVertical} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import {useNow} from "@vueuse/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {computed} from "vue";
import {vProvideColor} from "@/directives/vProvideColor";
import {isDefined, isNotDefined, isNotNull} from "@/lib/utils";
import type {ReactiveCalendarReminder} from "@/model/calendarReminder";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";

dayjs.extend(relativeTime)

const props = defineProps<{
  reminder: ReactiveCalendarReminder
}>()

const now = useNow({ interval: 60000 }) // update every minute

const timeLabel = computed(() => {
  return dayjs(now.value).to(props.reminder.remindAt)
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
  <div v-provide-color="reminder.color" class="p-8 border-b border-border bg-primary text-primary-foreground">
    <div class="flex flex-row justify-between items-center gap-4">
      <div class="flex-grow">
        <h1 class="font-medium text-xl ml-3">{{ reminder.displayText }}</h1>
      </div>
      <div>
        <time class="text-2xl font-medium tracking-wide">{{ timeLabel }}</time>
      </div>
      <div class="flex flex-row items-center gap-2">
        <Button v-if="hasButton" variant="inverted" @click="handleTrigger()">{{ reminder.actionLabel }}</Button>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon"><MoreVertical /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="handleDismiss()">Dismiss</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</template>