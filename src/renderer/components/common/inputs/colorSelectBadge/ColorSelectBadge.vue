<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Badge } from '@shadcn/badge'
import ColorSelect from '@renderer/components/common/inputs/colorSelect/ColorSelect.vue'
import type { Nullable } from '@renderer/lib/utils'

const model = defineModel<Nullable<string>>({ required: true })

const { t } = useI18n()

const label = computed(() => t(`common.colors.${model.value ?? 'noColor'}`))
</script>

<template>
  <ColorSelect v-model="model" #anchor="{ toggleOpen }">
    <Badge as="button" @click="toggleOpen" :color="model" variant="ghost">
      <span class="bg-color size-1.5 mr-1 rounded-full" />
      <span>{{ label }}</span>
    </Badge>
  </ColorSelect>
</template>
