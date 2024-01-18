<script setup lang="ts">
import type {ReactiveTimeReport} from "@/model/timeReport";
import {formatMinutes} from "@/lib/timeUtils";
import {isNotEmpty} from "@/lib/listUtils";
import {Clock} from "lucide-vue-next";
import {isNotNull} from "@/lib/utils";

defineProps<{
  report: ReactiveTimeReport
}>()
</script>

<template>
  <div v-if="isNotEmpty(report.projects)">
    <div class="flex flex-row justify-between items-center px-8 py-4">
      <div>
        <h3 class="text-md font-medium tracking-wide">Total Time</h3>
      </div>
      <time class="text-md font-medium tracking-wide">{{ formatMinutes(report.totalDurationMinutes) }}</time>
    </div>
    <table class="w-full border-t border-border">
      <tr class="h-16 border-b border-border last:border-none">
        <th v-for="project in report.projects" :key="project.project?.id ?? 'null'" class="px-4 text-md font-medium tracking-wide text-start border-r border-border last:border-none even:bg-secondary/30">
          <span class="px-4 py-2">{{isNotNull(project.project) ? project.projectDisplayName : 'Unassigned'}}</span>
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