<script setup lang="ts">
import type {NavLink} from "@renderer/components/common/layout/nav/nav-link";
import {buttonVariants} from "@renderer/components/ui/button";
import {cn} from "@renderer/lib/utils";

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
        active-class="active"
        :class="cn(
          buttonVariants({ variant: 'ghost' }),
          'flex flex-row gap-4 items-center justify-start',
          '[&.active]:dark:text-foreground [&.active]:dark:bg-muted [&.active]:dark:hover:bg-muted',
          '[&.active]:bg-primary [&.active]:text-primary-foreground [&.active]:hover:bg-primary/90'
        )"
      >
        <component v-if="link.icon" :is="link.icon" class="size-4" />
        {{ link.label }}
      </RouterLink>
    </template>
  </nav>
</template>