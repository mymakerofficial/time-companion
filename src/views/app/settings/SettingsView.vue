<script setup lang="ts">
import type {NavLink} from "@/components/nav/nav-link";
import HorizontalNav from "@/components/nav/HorizontalNav.vue";

const links: NavLink[] = [
  {label: 'Projects', to: { name: 'app-settings-projects' }},
  {label: 'Reminders', to: { name: 'app-settings-reminders' }},
  {label: 'Appearance', to: { name: 'app-settings-appearance' }},
]
</script>

<template>
  <main class="w-2/3 mx-auto grid grid-cols-8">
    <div class="col-span-2 sticky top-0 h-screen">
      <HorizontalNav :links="links" class="py-16" />
    </div>
    <section class="col-span-6">
      <RouterView />
    </section>
  </main>
</template>