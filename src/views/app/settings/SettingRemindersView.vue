<script setup lang="ts">
import {useRemindersStore} from "@/stores/remiders-store";
import SettingsHeader from "@/components/SettingsHeader.vue";

const reminderStore = useRemindersStore()
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader title="Reminders" description="Manage your reminders" />
    <pre>{{ reminderStore.reminders.map((it) => it.toSerialized()) }}</pre>
  </div>
</template>