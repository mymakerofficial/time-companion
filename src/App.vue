<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppSidebar from "@/components/common/layout/AppSidebar.vue";
import {TooltipProvider} from "radix-vue"
import type {NavLink} from "@/components/common/layout/nav/nav-link";
import {Archive, Calendar, Settings} from "lucide-vue-next";
import {now} from "@/lib/timeUtils";
import {useCalendarStore} from "@/stores/calendarStore";
import {useRemindersStore} from "@/stores/remidersStore";
import DialogProvider from "@/components/common/dialog/DialogProvider.vue";
import {useI18n} from "vue-i18n";

const calendarStore = useCalendarStore()
const remindersStore = useRemindersStore()

remindersStore.init()
calendarStore.init()

calendarStore.setActiveDay(now())

const { t } = useI18n()

const links: NavLink[] = [
  {label: t('app.nav.dashboard'), to: { name: 'app-dashboard' }, icon: Calendar},
  {label: t('app.nav.report'), to: { name: 'app-report' }, icon: Archive},
  {label: t('app.nav.settings'), to: { name: 'app-settings' }, icon: Settings},
]
</script>

<template>
  <DialogProvider />
  <TooltipProvider>
    <div class="flex flex-row w-full">
      <AppSidebar :links="links" />
      <RouterView />
    </div>
  </TooltipProvider>
</template>