<script setup lang="ts">
import {Slash} from "lucide-vue-next";
import type {ReactiveCalendarEventShadow} from "@/model/eventShadow";
import {cn, type Nullable} from "@/lib/utils";
import type {HTMLAttributes} from "vue";
import {Badge, type BadgeVariants} from "@/components/ui/badge";
import {cva} from "class-variance-authority";

const props = defineProps<{
  shadow?: Nullable<ReactiveCalendarEventShadow>
  variant?: NonNullable<BadgeVariants>['variant']
  size?: NonNullable<BadgeVariants>['size']
  class?: HTMLAttributes['class']
}>()

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
    v-if="props.shadow || $slots.leading || $slots.project || $slots.activity || $slots.part || $slots.trailing"
    :variant="props.variant"
    :size="props.size"
    :color="shadow?.color"
    :class="cn(props.variant === 'skeleton' ? 'p-0' : '', props.class)"
  >
    <slot name="leading" :value="shadow" />
    <slot name="project" :value="shadow?.project ?? null">
      <slot name="part" v-if="shadow?.project" :value="shadow?.project ?? null">
        <span v-text="shadow?.project.displayName" class="text-nowrap" />
      </slot>
    </slot>
    <Slash v-if="shadow?.activity || $slots.activity" :class="cn(slashVariants({ size }))" />
    <slot name="activity" :value="shadow?.activity ?? null">
      <slot name="part" v-if="shadow?.activity" :value="shadow?.activity ?? null">
        <span v-text="shadow.activity?.displayName" class="text-nowrap" />
      </slot>
    </slot>
    <slot name="trailing" :value="shadow" />
  </Badge>
</template>