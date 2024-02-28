<script setup lang="ts">
import RadioGroup from "@/components/ui/radio-group/RadioGroup.vue";
import RadioGroupItem from "@/components/ui/radio-group/RadioGroupItem.vue";
import Label from "@/components/ui/label/Label.vue";
import {useColorMode} from "@vueuse/core";
import {vProvideColor} from "@/directives/vProvideColor";
import {computed} from "vue";
import {isNotNull} from "@/lib/utils";
import {useProjectsService} from "@/services/projectsService";
import {useActiveDayService} from "@/services/activeDayService";
import {dateTimeCompare} from "@/lib/neoTime";

const activeDayService = useActiveDayService()
const projectsService = useProjectsService()

const themes = ['dark', 'light']

const theme = useColorMode({
  attribute: 'data-theme',
  storageKey: 'time-companion-theme',
})

const eventColors = computed(() => {
  if (isNotNull(activeDayService.day) && activeDayService.day.events.length >= 3) {
    return activeDayService.day.events
      .slice(-3)
      .map((event) => event.color)
      .reverse() ?? []
  }

  if (projectsService.projects.length >= 3) {
    return [...projectsService.projects]
      .sort((a, b) => dateTimeCompare(a.lastUsed, b.lastUsed))
      .slice(0, 3)
      .map((project) => project.color)
  }

  return ['lime', 'blue', 'rose']
})

</script>

<template>
  <RadioGroup v-model="theme">
    <div class="flex flex-wrap gap-8">
      <template v-for="theme in themes" :key="theme.value">
        <div class="aspect-video w-2/5 flex flex-col rounded-md border overflow-hidden">
          <div :data-theme="theme" class="flex-grow overflow-hidden border-b bg-background text-foreground">
            <div class="grid grid-cols-12 h-full">
              <div class="col-span-7 border-r h-full flex flex-col">
                <div class="h-3 border-b flex justify-between items-center px-2">
                  <div class="flex items-center gap-1">
                    <div class="h-1 w-7 bg-foreground rounded-[2px]" />
                  </div>
                </div>
                <div class="h-6 bg-primary border-b flex justify-between items-center px-2">
                  <div class="flex items-center gap-1">
                    <div v-provide-color="eventColors[0]" class="h-2 w-12 bg-primary rounded-[2px]" />
                    <div class="h-1 w-6 bg-primary-foreground rounded-[2px]" />
                  </div>
                  <div class="flex items-center gap-1">
                    <div class="h-1 w-2 bg-primary-foreground rounded-[2px]" />
                    <div class="h-2 w-3 bg-primary-foreground rounded-[2px]" />
                  </div>
                </div>
                <div class="h-6 border-b flex justify-between items-center px-2">
                  <div class="flex items-center gap-1">
                    <div v-provide-color="eventColors[1]" class="h-2 w-10 bg-primary rounded-[2px]" />
                    <div class="h-1 w-12 bg-foreground rounded-[2px]" />
                  </div>
                  <div class="flex items-center gap-1">
                    <div class="h-1 w-2 bg-foreground rounded-[2px]" />
                    <div class="h-1 w-2 bg-foreground rounded-[2px]" />
                    <div class="h-1 w-2 bg-foreground rounded-[2px]" />
                    <div class="h-2 w-3 bg-primary rounded-[2px]" />
                  </div>
                </div>
                <div class="border-b flex flex-wrap gap-1 items-center p-2">
                  <div v-provide-color="eventColors[0]" class="h-3 w-12 bg-primary rounded-[2px]" />
                  <div v-provide-color="eventColors[1]" class="h-3 w-8 bg-primary rounded-[2px]" />
                  <div v-provide-color="eventColors[1]" class="h-3 w-5 bg-primary rounded-[2px]" />
                  <div v-provide-color="eventColors[2]" class="h-3 w-5 bg-primary rounded-[2px]" />
                </div>
              </div>
              <div class="col-span-5 h-full flex flex-col">
                <div class="h-3 border-b flex justify-between items-center px-2">
                  <div class="flex items-center gap-1">
                    <div class="h-1 w-10 bg-foreground rounded-[2px]" />
                  </div>
                  <div class="flex items-center gap-1">
                    <div class="h-1 w-4 bg-foreground rounded-[2px]" />
                  </div>
                </div>
                <div class="ml-3">
                  <div class="h-1/3" />
                  <div v-provide-color="eventColors[2]" class="m-1 p-1 h-3 bg-primary rounded-[2px]">
                    <div class="h-1 w-4 bg-primary-foreground rounded-[2px]" />
                  </div>
                  <div v-provide-color="eventColors[1]" class="m-1 p-1 h-7 bg-primary rounded-[2px]">
                    <div class="h-1 w-7 bg-primary-foreground rounded-[2px]" />
                  </div>
                  <div v-provide-color="eventColors[0]" class="m-1 p-1 h-4 bg-primary rounded-[2px]">
                    <div class="h-1 w-5 bg-primary-foreground rounded-[2px]" />
                  </div>
                  <div class="mx-1 h-[2px] bg-primary">
                    <span class="absolute size-[6px] rounded-full bg-primary -ml-[6px] -mt-[2px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="p-4 flex flex-row items-center gap-4">
            <RadioGroupItem :value="theme" :id="`theme-option-${theme}`" />
            <Label :for="`theme-option-${theme}`">{{ $t(`common.themes.${theme}`) }}</Label>
          </div>
        </div>
      </template>
    </div>
  </RadioGroup>
</template>
