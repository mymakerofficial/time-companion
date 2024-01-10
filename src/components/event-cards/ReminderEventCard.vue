<script setup lang="ts">
import {MoreVertical} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import {useNow} from "@vueuse/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {computed} from "vue";
import {vProvideColor} from "@/directives/v-provide-color";
import type {CalendarReminder} from "@/lib/types";
import {isDefined, isNotDefined} from "@/lib/utils";

dayjs.extend(relativeTime)

const props = defineProps<{
  reminder: CalendarReminder
}>()

const now = useNow()

const timeLabel = computed(() => {
  return dayjs(now.value).to(props.reminder.remindAt)
})

const hasButton = computed(() => {
  return isDefined(props.reminder.buttonLabel) && isDefined(props.reminder.buttonAction)
})

function handleClick() {
  if (isNotDefined(props.reminder.buttonAction)) {
    return
  }

  props.reminder.buttonAction()
}
</script>

<template>
  <div v-provide-color="reminder.color" class="p-8 border-b border-border bg-primary text-primary-foreground">
    <div class="flex flex-row justify-between items-center gap-4">
      <div class="flex-grow">
        <h1 class="font-medium text-xl ml-3">{{ reminder.displayName }}</h1>
      </div>
      <div>
        <time class="text-2xl font-medium tracking-wide">{{ timeLabel }}</time>
      </div>
      <div class="flex flex-row items-center gap-2">
        <Button v-if="hasButton" variant="inverted" @click="handleClick()">{{ reminder.buttonLabel }}</Button>
        <Button variant="ghost" size="icon"><MoreVertical /></Button>
      </div>
    </div>
  </div>
</template>