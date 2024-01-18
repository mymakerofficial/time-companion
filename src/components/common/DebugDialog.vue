<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import {useProjectsStore} from "@/stores/projectsStore";
import {useRemindersStore} from "@/stores/remidersStore";
import {useCalendarStore} from "@/stores/calendarStore";
import {Button} from "@/components/ui/button";

const projectsStore = useProjectsStore()
const remindersStore = useRemindersStore()
const calendarStore = useCalendarStore()
</script>

<template>
  <Dialog>
    <DialogTrigger>
      <Button variant="link" class="text-secondary">Debug</Button>
    </DialogTrigger>
    <DialogContent class="h-2/3 max-w-3xl overflow-y-scroll">
      <div class="p-8">
        <label class="block font-bold">Active Day</label>
        <pre>{{ calendarStore.activeDay.day?.toSerialized() }}</pre>
        <br />
        <label class="block font-bold">Projects</label>
        <pre>{{ projectsStore.projects.map((it) => it.toSerialized()) }}</pre>
        <br />
        <label class="block font-bold">Activities</label>
        <pre>{{ projectsStore.activities.map((it) => it.toSerialized()) }}</pre>
        <br />
        <label class="block font-bold">Reminders</label>
        <pre>{{ remindersStore.reminders.map((it) => it.toSerialized()) }}</pre>
        <br />
        <label class="block font-bold">Days</label>
        <pre>{{ calendarStore.days.map((it) => it.toSerialized()) }}</pre>
        <br />
      </div>
    </DialogContent>
  </Dialog>
</template>