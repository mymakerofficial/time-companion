<script setup lang="ts">
import {Slash} from "lucide-vue-next";
import type {ReactiveCalendarEventShadow} from "@/model/eventShadow/types";
import {cn, type Nullable} from "@/lib/utils";
import {computed, type HTMLAttributes} from "vue";
import {Badge, type BadgeVariants} from "@/components/ui/badge";
import {cva} from "class-variance-authority";
import type {ReactiveProject} from "@/model/project/types";
import type {ReactiveActivity} from "@/model/activity/types";

export interface ShadowBadgeProps {
  project?: Nullable<ReactiveProject>
  activity?: Nullable<ReactiveActivity>
  shadow?: Nullable<ReactiveCalendarEventShadow>
  variant?: NonNullable<BadgeVariants>['variant']
  size?: NonNullable<BadgeVariants>['size']
  class?: HTMLAttributes['class']
}

const props = defineProps<ShadowBadgeProps>()

defineSlots<{
  leading(): any
  project(props: { value: Nullable<ReactiveProject> }): any
  activity(props: { value: Nullable<ReactiveActivity> }): any
  part(props: { value: ReactiveProject | ReactiveActivity }): any
  trailing(): any
}>()

const project = computed(() => props.project ?? props.shadow?.project ?? null)
const activity = computed(() => props.activity ?? props.shadow?.activity ?? null)

const slashVariants = cva(
  '',
  {
    variants: {
      size: {
        sm: 'size-3',
        md: 'size-3',
        lg: 'size-4',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
)
</script>

<template>
  <Badge
    v-if="props.shadow || $slots.leading || $slots.project || $slots.activity || $slots.trailing"
    :variant="props.variant"
    :size="props.size"
    :color="shadow?.color"
    :class="cn(props.variant === 'skeleton' ? 'p-0' : '', props.class)"
  >
    <slot name="leading" />
    <slot name="project" :value="project">
      <slot name="part" v-if="project" :value="project">
        <span v-text="project.displayName" class="text-nowrap" />
      </slot>
    </slot>
    <Slash v-if="activity || $slots.activity" :class="cn(slashVariants({ size }))" />
    <slot name="activity" :value="activity">
      <slot name="part" v-if="activity" :value="activity">
        <span v-text="activity?.displayName" class="text-nowrap" />
      </slot>
    </slot>
    <slot name="trailing" />
  </Badge>
</template>