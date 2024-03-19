<script setup lang="ts">
import BaseDialog from '@renderer/components/common/dialog/BaseDialog.vue'
import { Button } from '@renderer/components/ui/button'
import type { ErrorProps } from '@renderer/composables/useNotifyError'
import { ref } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'

defineProps<ErrorProps>()

const open = ref(true)

function handleClick(handler: () => void) {
  handler()
  open.value = false
}
</script>

<template>
  <BaseDialog v-model:open="open" :description="message">
    <template #title>
      <AlertTriangle class="size-5 text-red" /><span>{{ title }}</span>
    </template>
    <template #footer>
      <div class="flex flex-row justify-end gap-4">
        <template v-for="(action, index) in actions" :key="index">
          <Button @click="handleClick(action.handler)">{{
            action.label
          }}</Button>
        </template>
      </div>
    </template>
  </BaseDialog>
</template>
