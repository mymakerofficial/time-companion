<script setup lang="ts">
import type {ReactiveTimeReport} from "@/model/time-report";
import AutoGrowInput from "@/components/inputs/AutoGrowInput.vue";
import {formatMinutes} from "@/lib/time-utils";
import {isNotEmpty} from "@/lib/list-utils";
import {Clock} from "lucide-vue-next";
import {isNull} from "@/lib/utils";

const props = defineProps<{
  report: ReactiveTimeReport
}>()
</script>

<template>
  <div v-if="isNotEmpty(report.projects)" class="border-t border-border">
    <div class="flex flex-row justify-between items-center px-8 py-4">
      <div>
        <h3 class="text-md font-medium tracking-wide">Total Time</h3>
      </div>
      <time class="text-md font-medium tracking-wide">{{ formatMinutes(report.totalDurationMinutes) }}</time>
    </div>
    <table class="w-full border-t border-border">
      <tr class="h-16 border-b border-border last:border-none">
        <th v-for="project in report.projects" :key="project.project?.id ?? 'null'" class="px-4 text-md font-medium tracking-wide text-start border-r border-border last:border-none even:bg-secondary/30">
          <span v-if="isNull(project.project)" class="px-4 py-2">Unassigned</span>
          <AutoGrowInput v-else v-model="project.projectDisplayName" class="px-4 py-2 focus-visible:outline-none" />
        </th>
      </tr>
      <tr class="h-16">
        <td v-for="project in report.projects" :key="project.project?.id ?? 'null'" class="px-8 py-2 border-r border-border last:border-none even:bg-secondary/30">
          <div class="flex flex-row items-center gap-2">
            <Clock v-if="project.isOngoing" class="size-4" />
            <time>{{ formatMinutes(project.durationMinutes) }}</time>
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>