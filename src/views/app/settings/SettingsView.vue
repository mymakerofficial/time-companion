<script setup lang="ts">
import type {NavLink} from "@/components/common/layout/nav/nav-link";
import HorizontalNav from "@/components/common/layout/nav/HorizontalNav.vue";
import ResponsiveContainer from "@/components/common/layout/ResponsiveContainer.vue";
import {useI18n} from "vue-i18n";
import {computed} from "vue";

const { t } = useI18n()

const links = computed<NavLink[]>(() => [
  { label: t('settings.projects.title'), to: { name: 'app-settings-projects' } },
  { label: t('settings.reminders.title'), to: { name: 'app-settings-reminders' } },
  { label: t('settings.general.title'), to: { name: 'app-settings-general' } },
  { label: t('settings.appearance.title'), to: { name: 'app-settings-appearance' } },
])
</script>

<template>
  <ResponsiveContainer as="main" class="grid grid-cols-8">
    <div class="col-span-2 sticky top-0 h-viewport">
      <HorizontalNav :links="links" class="py-16" />
    </div>
    <section class="col-span-6">
      <RouterView />
    </section>
  </ResponsiveContainer>
</template>