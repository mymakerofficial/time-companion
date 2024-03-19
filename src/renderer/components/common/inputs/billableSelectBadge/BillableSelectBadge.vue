<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, X } from 'lucide-vue-next'
import { Badge } from '@renderer/components/ui/badge'
import Combobox from '@renderer/components/common/inputs/combobox/Combobox.vue'

const model = defineModel<boolean>({ required: true })

const { t } = useI18n()

const options = [true, false]

function getLabel(value: boolean) {
  return value ? t(`common.labels.yes`) : t(`common.labels.no`)
}

const color = computed(() => (model.value ? 'green' : 'red'))
const label = computed(() => getLabel(model.value))
const icon = computed(() => (model.value ? Check : X))
</script>

<template>
  <Combobox
    v-model="model"
    :options="options"
    :display-value="getLabel"
    #anchor="{ toggleOpen }"
  >
    <Badge as="button" @click="toggleOpen" :color="color" variant="ghost">
      <component :is="icon" class="size-3" />
      <span>{{ label }}</span>
    </Badge>
  </Combobox>
</template>
