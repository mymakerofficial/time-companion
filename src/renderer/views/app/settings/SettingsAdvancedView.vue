<script setup lang="ts">
import SettingsHeader from '@renderer/components/settings/layout/SettingsHeader.vue'
import SettingsSection from '@renderer/components/settings/layout/SettingsSection.vue'
import { Button } from '@renderer/components/ui/button'
import { useDialog } from '@renderer/composables/dialog/useDialog'
import DeleteEverythingDialog from '@renderer/components/settings/advanced/DeleteEverythingDialog.vue'
import { Trash2 } from 'lucide-vue-next'

const { open: openDeleteEverythingDialog } = useDialog(DeleteEverythingDialog)
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader title="Advanced" />
    <SettingsSection
      title="Delete my data"
      description="Want to loose all your data quick? This is the way!"
    >
      <Button
        variant="destructive"
        class="gap-2"
        @click="openDeleteEverythingDialog"
      >
        <Trash2 class="size-4" /><span>Delete Everything</span>
      </Button>
    </SettingsSection>
  </div>
</template>
