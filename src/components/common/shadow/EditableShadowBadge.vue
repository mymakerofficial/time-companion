<script setup lang="ts">
import ShadowBadge, {type ShadowBadgeProps} from "@/components/common/shadow/ShadowBadge.vue";
import InplaceInput from "@/components/common/inputs/inplaceInput/InplaceInput.vue";

const props = defineProps<ShadowBadgeProps>()
</script>

<template>
  <ShadowBadge v-bind="props">
    <template #part="{ value }">
      <InplaceInput v-model="value.displayName" class="text-nowrap" />
    </template>
  </ShadowBadge>
</template>