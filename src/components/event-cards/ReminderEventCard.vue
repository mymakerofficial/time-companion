<script setup lang="ts">
import {MoreVertical} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import {useNow} from "@vueuse/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {computed} from "vue";
import {vProvideColor} from "@/directives/v-provide-color";

dayjs.extend(relativeTime)

const props = defineProps<{
  displayName: string
  remindAt: Date
  color: string
  buttonLabel: string
}>()

const now = useNow()

const timeLabel = computed(() => {
  return dayjs(now.value).to(props.remindAt)
})
</script>

<template>
  <div v-provide-color="color" class="p-8 border-b border-border bg-primary text-primary-foreground">
    <div class="flex flex-row justify-between items-center gap-4">
      <div class="flex-grow">
        <h1 class="font-medium text-xl ml-3">{{ displayName }}</h1>
      </div>
      <div>
        <time class="text-2xl font-medium tracking-wide">{{ timeLabel }}</time>
      </div>
      <div class="flex flex-row items-center gap-2">
        <Button v-if="buttonLabel" variant="inverted">{{ buttonLabel }}</Button>
        <Button variant="ghost" size="icon"><MoreVertical /></Button>
      </div>
    </div>
  </div>
</template>