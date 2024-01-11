<script setup lang="ts">
import {Popover, PopoverContent} from "@/components/ui/popover";
import {computed, ref} from "vue";
import {useMagicKeys, whenever} from "@vueuse/core";
import {PopoverAnchor} from "radix-vue";
import {clamp} from "@/lib/utils";

interface Option {
  label: string
  value: string
}

const open = defineModel('open')

const props = defineProps<{
  options: Option[]
}>()

const emit = defineEmits<{
  selected: [option: Option]
}>()

const selectedIndex = ref(0)
const selectedOption = computed(() => props.options[selectedIndex.value])

const { down, up, enter } = useMagicKeys()

whenever(down, () => {
  if (!open.value) {
    return
  }

  selectedIndex.value = clamp(selectedIndex.value + 1, 0, props.options.length - 1)
})

whenever(up, () => {
  if (!open.value) {
    return
  }

  selectedIndex.value = clamp(selectedIndex.value - 1, 0, props.options.length - 1)
})

whenever(enter, () => {
  if (!open.value) {
    return
  }

  handleConfirm()
})

function handleConfirm() {
  emit('selected', selectedOption.value)
}
</script>

<template>
  <Popover :open="open">
    <PopoverAnchor>
      <slot />
    </PopoverAnchor>
    <PopoverContent align="start" class="p-2">
      <div role="presentation" class="flex flex-col">
        <div
          v-for="(option, index) in props.options"
          :key="option.value"
          :data-active="index === selectedIndex"
          @mouseenter="selectedIndex = index"
          @click="handleConfirm"
          role="option"
          class="cursor-pointer py-1 px-2 rounded-sm data-[active=true]:bg-accent"
        >
          <div>{{ option.label }}</div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>