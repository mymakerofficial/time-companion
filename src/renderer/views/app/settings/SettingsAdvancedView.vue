<script setup lang="ts">
import SettingsHeader from '@renderer/components/settings/layout/SettingsHeader.vue'
import SettingsSection from '@renderer/components/settings/layout/SettingsSection.vue'
import { Button } from '@renderer/components/ui/button'
import { database } from '@renderer/factory/database/database'
import { toast } from 'vue-sonner'

function handleDeleteForReal() {
  database.unsafe.dropSchema().then(() => {
    toast.info('Congrats!', {
      description:
        'You just deleted everything. Its all gone now. Reload the page to get things working again.',
      duration: Infinity,
    })
  })
}

function handleDelete() {
  toast.warning('Are you sure?', {
    description:
      'You are about to delete all your data. **THIS ACTION CAN NOT BE UNDONE**.',
    action: {
      label: 'Do it!',
      onClick: handleDeleteForReal,
    },
  })
}
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader title="Advanced" />
    <SettingsSection
      title="Delete my data"
      description="Want to loose all your data quick? This is the way!"
    >
      <Button variant="destructive" @click="handleDelete">Delete me!</Button>
    </SettingsSection>
  </div>
</template>
