<script setup lang="ts">
import { useProvedDialogContext } from '@renderer/composables/dialog/useDialog'

const props = defineProps<{
  id: string
}>()

useProvedDialogContext(props.id)
</script>

<template>
  <slot />
</template>
