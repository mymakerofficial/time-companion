<script setup lang="ts">
import ProjectSelect from '@renderer/components/common/inputs/projectInput/ProjectSelect.vue'
import { ref } from 'vue'
import type { Nullable } from '@shared/lib/utils/types'

// const workingDurationService = useWorkingDurationService()

const dummy = ref<Nullable<string>>(null)
</script>

<template>
  <ProjectSelect v-model="dummy" allow-deselect trigger-class="w-full" />
</template>
