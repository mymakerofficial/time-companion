<script setup lang="ts">
import {Popover, PopoverContent} from "@/components/ui/popover";
import {computed, reactive, ref} from "vue";
import {useMagicKeys, whenever} from "@vueuse/core";
import {PopoverAnchor} from "radix-vue";

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

const state = reactive({
  selectedIndex: 0,
  selectedOption: computed(() => props.options[state.selectedIndex]),
})

const { down, up, enter } = useMagicKeys()

whenever(down, () => {
  if (!open.value) {
    return
  }

  state.selectedIndex = Math.min(state.selectedIndex + 1, props.options.length - 1)
})

whenever(up, () => {
  if (!open.value) {
    return
  }

  state.selectedIndex = Math.max(state.selectedIndex - 1, 0)
})

whenever(enter, () => {
  if (!open.value) {
    return
  }

  handleConfirm()
})

function handleConfirm() {
  emit('selected', state.selectedOption)
}
</script>

<template>
  <Popover :open="open">
    <PopoverAnchor>
      <slot />
    </PopoverAnchor>
    <PopoverContent class="p-2">
      <div class="flex flex-col">
        <div
          v-for="(option, index) in props.options"
          :key="option.value"
          :data-active="index === state.selectedIndex"
          @mouseenter="state.selectedIndex = index"
          @click="handleConfirm"
          class="cursor-pointer py-1 px-2 rounded-sm data-[active=true]:bg-accent"
        >
          <div>{{ option.label }}</div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>