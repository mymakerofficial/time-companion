<script setup lang="ts">
import { Check, ChevronsUpDown } from 'lucide-vue-next'

import { ref } from 'vue'
import {Button, buttonVariants} from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import type {ComboboxOption} from "@/components/common/inputs/combobox/types";
import {useI18n} from "vue-i18n";

const model = defineModel<ComboboxOption['value']>({ required: true, default: null })

withDefaults(defineProps<{
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyLabel?: string
  variant?: NonNullable<Parameters<typeof buttonVariants>[0]>['variant']
}>(), {
  variant: 'outline',
})

const open = ref(false)

function filterFunction(list: object[], searchTerm: string): object[] {
  return list.filter((it) => {
    return (it as ComboboxOption).label.toLowerCase().includes(searchTerm.toLowerCase())
  })
}

function handleSelect(event: any) { // event should be SelectEvent, but it doesn't import properly
  model.value = event.detail.value.value
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        :variant="variant"
        role="combobox"
        :aria-expanded="open"
        class="w-52 justify-start"
      >
        <template v-if="options.some((it) => it.value === model)">
          <slot name="triggerLeading" v-bind="options.find((it) => it.value === model)" />
          {{ options.find((it) => it.value === model)?.label }}
        </template>
        <template v-else>
          <span class="text-muted-foreground">{{ placeholder }}</span>
        </template>
        <ChevronsUpDown class="ml-auto size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-52 p-0">
      <!-- @vue-ignore filterFunction is correct! -->
      <Command :filter-function="filterFunction">
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