<script setup lang="ts">
import { Check, ChevronsUpDown } from 'lucide-vue-next'

import { ref } from 'vue'
import {cn, isDefined, type Nullable} from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import type {SelectEvent} from "radix-vue/dist/Combobox/ComboboxItem";
import type {ComboboxOption} from "@/components/common/inputs/combobox/types";

const model = defineModel<Nullable<ComboboxOption['value']>>({ required: true, default: null })

withDefaults(defineProps<{
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyLabel?: string
}>(), {
  options: [],
  placeholder: '',
  searchPlaceholder: 'Search...',
  emptyLabel: '',
})

const open = ref(false)

function filterFn(option: ComboboxOption, search: string) {
  return option.label.toLowerCase().includes(search.toLowerCase())
}

function handleSelect(event: SelectEvent) {
  model.value = event.detail.value.value
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="w-52 justify-start"
      >
        <slot name="triggerLeading" v-bind="options.find((it) => it.value === model)" />
        {{ options.find((it) => it.value === model)?.label ?? placeholder }}
        <ChevronsUpDown class="ml-auto size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-52 p-0">
      <Command :filter-function="filterFn">
        <CommandInput :placeholder="searchPlaceholder" />
        <CommandEmpty>{{ emptyLabel }}</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandItem
              v-for="option in options"
              :key="option.value"
              :value="option"
              @select="handleSelect"
            >
              <slot name="optionLeading" v-bind="option" />
              {{ option.label }}
              <Check
                :data-active="model === option.value"
                class="ml-auto size-4 opacity-0 data-[active=true]:opacity-100"
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>