<script setup lang="ts" generic="TValue extends string | number | symbol | null">
import {Check, ChevronsUpDown} from 'lucide-vue-next'

import {computed, ref} from 'vue'
import {Button, buttonVariants} from '@/components/ui/button'
import {Popover, PopoverContent,} from '@/components/ui/popover'
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import type {ComboboxOption} from "@/components/common/inputs/combobox/types";
import {isDefined, type MaybeArray} from "@/lib/utils";
import {asArray, isArray} from "@/lib/listUtils";
import {PopoverAnchor} from "radix-vue";
import {useToggle} from "@vueuse/core";

const model = defineModel<MaybeArray<TValue>>({ required: true, default: null })
const open = defineModel<boolean>('open',{ required: false, default: false })

const props = withDefaults(defineProps<{
  options: ComboboxOption<TValue>[]
  multiple?: boolean
  label?: string
  emptyLabel?: string
  placeholder?: string
  searchPlaceholder?: string
  variant?: NonNullable<Parameters<typeof buttonVariants>[0]>['variant']
}>(), {
  variant: 'outline',
})

const toggleOpen = useToggle(open)

const searchTerm = ref('')

function filterFunction(list: object[], searchTerm: string): object[] {
  return list.filter((it) => {
    return (it as ComboboxOption<TValue>).label.toLowerCase().includes(searchTerm.toLowerCase())
  })
}

function isSelected(option: ComboboxOption<TValue>): boolean {
  return asArray(model.value).includes(option.value)
}

function handleSelect(event: any) { // event should be SelectEvent, but it doesn't import properly
  if (props.multiple && isArray(model.value)) {
    if (model.value.includes(event.detail.value.value)) {
      model.value = model.value.filter((it) => it !== event.detail.value.value)
    } else {
      model.value = [...model.value, event.detail.value.value]
    }
    searchTerm.value = ''
  } else {
    model.value = event.detail.value.value
    open.value = false
  }
}

const selectedOptions = computed(() => {
  if (props.multiple && isArray(model.value)) {
    return props.options.filter(isSelected)
  }

  return props.options.find(isSelected)
})

const label = computed(() => {
  if (isDefined(props.label)) {
    return props.label
  }

  return asArray(selectedOptions.value)
    .map((it) => it.label)
    .join(', ')
})

const showLabel = computed(() => {
  if (isDefined(props.label)) {
    return true
  }

  return props.options.some(isSelected)
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverAnchor as-child>
      <slot name="trigger" :selected="selectedOptions">
        <Button
          :variant="variant"
          role="combobox"
          :aria-expanded="open"
          class="w-52 justify-start"
          @click="toggleOpen"
        >
          <template v-if="showLabel">
            <slot name="triggerLeading" :selected="selectedOptions" />
            {{ label }}
          </template>
          <template v-else>
            <span class="text-muted-foreground">{{ placeholder ?? $t('common.placeholders.select') }}</span>
          </template>
          <ChevronsUpDown class="ml-auto size-4 shrink-0 opacity-50" />
        </Button>
      </slot>
    </PopoverAnchor>
    <PopoverContent class="w-52 p-0" align="start">
      <!-- @vue-ignore filterFunction is correct! -->
      <Command v-model:search-term="searchTerm" :filter-function="filterFunction">
        <CommandInput :placeholder="searchPlaceholder ?? $t('common.placeholders.search')" />
        <CommandEmpty>{{ emptyLabel ?? $t('common.placeholders.searchEmpty') }}</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandItem
              v-for="option in options"
              :key="option.value ?? 'null'"
              :value="option"
              @select="handleSelect"
            >
              <slot name="optionLeading" :option="option" />
              {{ option.label }}
              <Check
                :data-active="isSelected(option)"
                class="ml-auto size-4 opacity-0 data-[active=true]:opacity-100"
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>