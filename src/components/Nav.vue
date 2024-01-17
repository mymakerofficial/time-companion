<script setup lang="ts">
import {Button} from "@/components/ui/button";
import type {RouteLocationRaw} from "vue-router";
import type {Icon} from "lucide-vue-next";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

export interface NavLink {
  label: string
  to: RouteLocationRaw
  icon: Icon
}

defineProps<{
  links: NavLink[]
}>()
</script>

<template>
  <component is="nav" class="flex flex-col items-center gap-4 py-4">
    <template v-for="link in links" :key="link.label">
      <Tooltip :delay-duration="0">
        <TooltipTrigger as="div">
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
              size="icon"
              :class="{'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white': isActive}"
            >
              <component :is="link.icon" class="size-5" />
            </Button>
          </RouterLink>
        </TooltipTrigger>
        <TooltipContent side="right">
          {{ link.label }}
        </TooltipContent>
      </Tooltip>
    </template>
  </component>
</template>