<script setup lang="ts">
import {Button, buttonVariants} from "@/components/ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import type {NavLink} from "@/components/common/layout/nav/nav-link";
import {cn} from "@/lib/utils";

const props = defineProps<{
  links: NavLink[]
  class?: string
}>()
</script>

<template>
  <nav :class="cn('flex flex-col items-center gap-4', props.class ?? '')">
    <template v-for="link in props.links" :key="link.label">
      <Tooltip :delay-duration="0">
        <TooltipTrigger as="div">
          <RouterLink
            :to="link.to"
            active-class="active"
            :class="cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              '[&.active]:dark:bg-muted [&.active]:dark:text-muted-foreground [&.active]:dark:hover:bg-muted [&.active]:dark:hover:text-white',
              '[&.active]:bg-primary [&.active]:text-primary-foreground [&.active]:hover:bg-primary/90'
            )"
          >
            <component :is="link.icon" class="size-4" />
          </RouterLink>
        </TooltipTrigger>
        <TooltipContent side="right">
          {{ link.label }}
        </TooltipContent>
      </Tooltip>
    </template>
  </nav>
</template>