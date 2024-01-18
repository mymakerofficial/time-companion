<script setup lang="ts">
import type {NavLink} from "@/components/common/layout/nav/nav-link";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

const props = defineProps<{
  links: NavLink[]
  class?: string
}>()
</script>

<template>
  <nav :class="cn('flex flex-col gap-1', props.class ?? '')">
    <template v-for="link in props.links" :key="link.label">
      <RouterLink
        :to="link.to"
        custom
        v-slot="{ isActive, href, navigate }"
      >
        <Button
          as="a"
          :href="href"
          @click="navigate"
          variant="ghost"
          :class="cn(
              'flex flex-row gap-4 items-center justify-start',
            isActive && 'dark:bg-muted dark:hover:bg-muted'
          )"
        >
          <component v-if="link.icon" :is="link.icon" class="size-4" />
          {{ link.label }}
        </Button>
      </RouterLink>
    </template>
  </nav>
</template>