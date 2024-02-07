<script setup lang="ts" generic="TValue extends AcceptableValue">
import {cn, isDefined, type MaybeArray} from "@/lib/utils";
import {ComboboxRoot, PopoverAnchor} from "radix-vue";
import {Popover, PopoverContent} from "@/components/ui/popover";
import {CommandEmpty, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Button, buttonVariants} from "@/components/ui/button";
import {Check, ChevronsUpDown} from 'lucide-vue-next'
import {useToggle} from "@vueuse/core";
import {asArray, isNotEmpty} from "@/lib/listUtils";
import {computed} from "vue";

export type AcceptableValue = string | number | boolean | object

// TODO Figure out nullability
const model = defineModel<MaybeArray<TValue>>({ required: true, default: null })
const searchTerm = defineModel<string>('searchTerm', { required: false, default: '' })
const open = defineModel<boolean>('open', { required: false, default: false })

const props = withDefaults(defineProps<{
  options: TValue[]
  multiple?: boolean
  getOptionLabel?: (option: TValue) => string;
  filterFunction?: (list: TValue[], query: string) => TValue[];
  variant?: NonNullable<Parameters<typeof buttonVariants>[0]>['variant']
  triggerClass?: string
  popoverClass?: string
  label?: string
  placeholder?: string
  searchLabel?: string
  emptyLabel?: string
  noInput?: boolean
}>(), {
  multiple: false,
  variant: 'outline',
  noInput: false,
})

defineOptions({
  inheritAttrs: false
})

const toggleOpen = useToggle(open)

function isSelected(option: TValue): boolean {
  return asArray(model.value).includes(option)
}

function getOptionLabel(option: TValue): string {
  if (isDefined(props.getOptionLabel)) {
    return props.getOptionLabel(option)
  }

  return String(option)
}

function filterFunction(list: TValue[], query: string): TValue[] {
  if (isDefined(props.filterFunction)) {
    return props.filterFunction(list, query)
  }

  return list.filter((option) => {
    return getOptionLabel(option).toLowerCase().includes(query.toLowerCase())
  })
}

const label = computed(() => {
  if (isDefined(props.label)) {
    return props.label
  }

  return asArray(model.value)
    .map(getOptionLabel)
    .join(', ')
})

const showLabel = computed(() => isDefined(props.label) || isNotEmpty(model.value))
</script>

<template>
  <ComboboxRoot
    v-model="rootModel"
    v-model:search-term="searchTerm"
    :multiple="multiple"
    :filter-function="filterFunction"
    open
  >
    <Popover v-model:open="open">
      <PopoverAnchor as-child>
        <slot name="anchor" v-bind="{ value: model, toggleOpen }">
          <Button
            @click="toggleOpen"
            role="combobox"
            aria-haspopup="listbox"
            :aria-expanded="open"
            :variant="variant"
            :class="cn('w-52 justify-start', triggerClass)"
          >
            <slot name="trigger" :value="model">
              <template v-if="showLabel">
                <slot name="triggerLeading" :value="model" />
                <slot name="triggerLabel" :value="model">
                  <span class="truncate">{{ label }}</span>
                </slot>
              </template>
              <template v-else>
                <span class="text-muted-foreground truncate">{{ placeholder ?? $t('common.placeholders.select') }}</span>
              </template>
              <ChevronsUpDown class="ml-auto size-4 shrink-0 opacity-50" />
            </slot>
          </Button>
        </slot>
      </PopoverAnchor>
      <PopoverContent :class="cn('w-[200px] p-0', popoverClass)">
        <div class="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground">
          <CommandInput
            v-if="!noInput"
            :placeholder="searchLabel ?? $t('common.placeholders.search')"
          />
          <CommandEmpty>
            <slot name="empty">
              <span class="truncate">{{ emptyLabel ?? $t('common.placeholders.searchEmpty') }}</span>
            </slot>
          </CommandEmpty>
          <CommandList>
            <div class="p-1">
              <CommandItem
                v-for="(option, index) in options"
                :key="index"
                :value="option"
              >
                <slot name="option" :value="option">
                  <slot name="optionLeading" :value="option" />
                  <slot name="optionLabel" :value="option">
                    <span class="truncate">{{ getOptionLabel(option) }}</span>
                  </slot>
                  <Check
                    :data-active="isSelected(option)"
                    class="ml-auto size-4 opacity-0 data-[active=true]:opacity-100"
                  />
                </slot>
              </CommandItem>
            </div>
          </CommandList>
        </div>
      </PopoverContent>
    </Popover>
  </ComboboxRoot>
</template>