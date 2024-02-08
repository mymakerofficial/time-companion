<script lang="ts">
type PrimitiveAcceptableValue = string | number | true | false | object
export type AcceptableValue = string | number | boolean | object | null

type Wrapped<TValue> = { value: TValue }
</script>

<script setup lang="ts" generic="TValue extends AcceptableValue">
import {cn, isDefined, type MaybeArray, type Nullable} from "@/lib/utils";
import {ComboboxRoot, PopoverAnchor} from "radix-vue";
import {Popover, PopoverContent} from "@/components/ui/popover";
import {CommandEmpty, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Button, buttonVariants} from "@/components/ui/button";
import {Check, ChevronsUpDown} from 'lucide-vue-next'
import {useToggle, watchIgnorable} from "@vueuse/core";
import {asArray, isArray, isNotEmpty} from "@/lib/listUtils";
import {computed, ref, watch} from "vue";

const model = defineModel<Nullable<MaybeArray<TValue>>>({ required: true, default: null })
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

const showLabel = computed(() => isDefined(props.label) || isNotEmpty(asArray(model.value)))

// radix's Combobox doesn't support null as a value, so to support any value, we need to wrap it
// TODO simplify this
// TODO selecting using the keyboard doesn't work

function wrapSingle(value: Nullable<TValue>) {
  return { value } as Wrapped<TValue>
}

function unwrapSingle(value: Wrapped<TValue>) {
  return value.value as TValue
}

function wrapMultiple(value: Array<TValue>) {
  return value.map(wrapSingle)
}

function unwrapMultiple(value: Array<Wrapped<TValue>>) {
  return value.map(unwrapSingle)
}

function wrapModel(value: Nullable<MaybeArray<TValue>>) {
  return( isArray(value) ? wrapMultiple(value) : wrapSingle(value)) as PrimitiveAcceptableValue
}

function unwrapModel(value: PrimitiveAcceptableValue) {
  return isArray(value) ? unwrapMultiple(value as Array<Wrapped<TValue>>) : unwrapSingle(value as Wrapped<TValue>)
}

// we cant use a computed here because it would not react to updates when given an array
const primitiveModel = ref(wrapModel(model.value))

const { ignoreUpdates: ignoreModelUpdate } = watchIgnorable(model, (value) => {
  ignorePrimitiveUpdate(() => {
    primitiveModel.value = wrapModel(value)
  })
}, { deep: true })

const { ignoreUpdates: ignorePrimitiveUpdate } = watchIgnorable(primitiveModel, (value) => {
  ignoreModelUpdate(() => {
    model.value = unwrapModel(value)
  })
}, { deep: true })

function primitiveFilterFunction(list: string[] | number[] | false[] | true[] | object[], query: string) {
  return wrapMultiple(filterFunction(unwrapMultiple(list as Array<Wrapped<TValue>>), query)) as string[] | number[] | false[] | true[] | object[]
}

function primitiveDisplayValue(value: PrimitiveAcceptableValue) {
  return getOptionLabel(unwrapSingle(value as Wrapped<TValue>))
}
</script>

<template>
  <ComboboxRoot
    v-model="primitiveModel"
    v-model:search-term="searchTerm"
    :multiple="multiple"
    :filter-function="primitiveFilterFunction"
    :display-value="primitiveDisplayValue"
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
            <div class="p-1">
              <CommandItem
                v-for="(option, index) in options"
                :key="index"
                :value="wrapSingle(option)"
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