<script setup lang="ts">
import type {NavLink} from "@/components/common/layout/nav/nav-link";
import HorizontalNav from "@/components/common/layout/nav/HorizontalNav.vue";
import ResponsiveContainer from "@/components/common/layout/ResponsiveContainer.vue";

const links: NavLink[] = [
  {label: 'Projects', to: { name: 'app-settings-projects' }},
  {label: 'Reminders', to: { name: 'app-settings-reminders' }},
  {label: 'Appearance', to: { name: 'app-settings-appearance' }},
]
</script>

<template>
  <ResponsiveContainer as="main" >
    <div class="col-span-2 sticky top-0 h-screen">
      <HorizontalNav :links="links" class="py-16" />
    </div>
    <section class="col-span-6">
      <RouterView />
    </section>
  </ResponsiveContainer>
</template>