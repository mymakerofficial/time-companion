<script lang="ts">
type PrimitiveAcceptableValue = string | number | true | false | object
export type AcceptableValue = string | number | boolean | object | null

type Wrapped<TValue> = { original: TValue }
</script>

<script setup lang="ts" generic="TValue extends AcceptableValue, TMultiple extends boolean">
import {cn, isDefined, type MaybeArray, type Nullable} from "@/lib/utils";
import {ComboboxRoot, PopoverAnchor} from "radix-vue";
import {Popover, PopoverContent} from "@/components/ui/popover";
import {CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Button, buttonVariants} from "@/components/ui/button";
import {Check, ChevronsUpDown} from 'lucide-vue-next'
import {useToggle} from "@vueuse/core";
import {asArray, isArray, isNotEmpty} from "@/lib/listUtils";
import {computed} from "vue";

const model = defineModel<TMultiple extends true ? TValue[] : TValue>({ required: true, default: null })
const searchTerm = defineModel<string>('searchTerm', { required: false, default: '' })
const open = defineModel<boolean>('open', { required: false, default: false })

const props = withDefaults(defineProps<{
  options: TValue[]
  multiple?: TMultiple
  displayValue?: (option: TValue) => string;
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
  variant: 'outline',
})

const emit = defineEmits<{
  'selected': [value: typeof model.value]
}>()

defineOptions({
  inheritAttrs: false
})

const toggleOpen = useToggle(open)

function isSelected(option: TValue): boolean {
  return asArray(model.value).includes(option)
}

function getDisplayValue(option: TValue): string {
  if (isDefined(props.displayValue)) {
    return props.displayValue(option)
  }

  return String(option)
}

function filterFunction(list: TValue[], query: string): TValue[] {
  if (isDefined(props.filterFunction)) {
    return props.filterFunction(list, query)
  }

  return list.filter((option) => {
    return getDisplayValue(option).toLowerCase().includes(query.toLowerCase())
  })
}

const label = computed(() => {
  if (isDefined(props.label)) {
    return props.label
  }

  return asArray(model.value)
    .map(getDisplayValue)
    .join(', ')
})

const showLabel = computed(() => isDefined(props.label) || isNotEmpty(asArray(model.value)))

// we handle selecting ourselves for more flexibility and to get around some radix weirdness
function handleSelect(option: TValue) {
  if (isArray(model.value)) {
    if (model.value.includes(option)) {
      const index = model.value.indexOf(option)
      model.value.splice(index, 1)
    } else {
      model.value.push(option)
    }
  } else {
    (model.value as TValue) = option
  }

  emit('selected', model.value)
}

const filteredOptions = computed(() => filterFunction(props.options, searchTerm.value))

// radix's Combobox doesn't support null as a value, so to support any value, we need to wrap it

function wrap(value: Nullable<TValue>) {
  return { original: value } as Wrapped<TValue>
}

function wrapMultiple(value: Array<TValue>) {
  return value.map(wrap)
}

function wrapModel(value: Nullable<MaybeArray<TValue>>) {
  return( isArray(value) ? wrapMultiple(value) : wrap(value)) as PrimitiveAcceptableValue
}

const primitiveModel = computed(() => wrapModel(model.value))
</script>

<template>
  <ComboboxRoot
    :model-value="primitiveModel"
    v-model:search-term="searchTerm"
    open
  >
    <Popover v-model:open="open">
      <PopoverAnchor as-child>
        <slot name="anchor" :value="model" :toggle-open="toggleOpen">
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
      <PopoverContent :class="cn('w-[200px] p-0', popoverClass)" align="start">
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
            <CommandGroup>
              <CommandItem
                v-for="option in filteredOptions"
                :key="options.findIndex((it) => it === option) /* keep the index stable */"
                :value="wrap(option) /* radix doesn't support null */"
                @click.prevent="() => handleSelect(option) /* override default behavior */"
              >
                <slot name="option" :value="option">
                  <slot name="optionLeading" :value="option" />
                  <slot name="optionLabel" :value="option">
                    <span class="truncate">{{ getDisplayValue(option) }}</span>
                  </slot>
                  <Check
                    :data-active="isSelected(option)"
                    class="ml-auto size-4 opacity-0 data-[active=true]:opacity-100"
                  />
                </slot>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </div>
      </PopoverContent>
    </Popover>
  </ComboboxRoot>
</template>