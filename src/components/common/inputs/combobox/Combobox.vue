<script lang="ts">
import type {MaybeReadonly} from "@/lib/utils";
import {buttonVariants} from "@/components/ui/button";
import type {HTMLAttributes} from "vue";

type PrimitiveAcceptableValue = string | number | true | false | object
export type AcceptableValue = string | number | boolean | object | null

type Wrapped<TValue> = { original: TValue }

export interface ComboboxProps<TValue extends AcceptableValue, TMultiple extends boolean> {
  options: MaybeReadonly<Array<TValue>>
  multiple?: TMultiple
  allowDeselect?: boolean
  displayValue?: (option: TValue) => string;
  filterFunction?: (list: MaybeReadonly<Array<TValue>>, query: string) => TValue[];
  getKey?: (option: TValue) => string | number;
  limit?: number
  variant?: NonNullable<Parameters<typeof buttonVariants>[0]>['variant']
  class?: HTMLAttributes['class']
  triggerClass?: HTMLAttributes['class']
  popoverClass?: HTMLAttributes['class']
  label?: string
  placeholder?: HTMLAttributes['placeholder']
  searchLabel?: string
  emptyLabel?: string
  noInput?: boolean
  preventClose?: boolean
  preventInputClear?: boolean
  allowCreate?: boolean
  maxCreateLength?: number
  hideWhenEmpty?: boolean
}
</script>

<script setup lang="ts" generic="TValue extends AcceptableValue, TMultiple extends boolean">
import {cn, isDefined, isNotNull, type MaybeArray, type Nullable} from "@/lib/utils";
import {ComboboxRoot, PopoverAnchor} from "radix-vue";
import {Popover, PopoverContent} from "@/components/ui/popover";
import {CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Button} from "@/components/ui/button";
import {Check, ChevronsUpDown, Plus} from 'lucide-vue-next'
import {useToggle} from "@vueuse/core";
import {asArray, isArray, isEmpty, isNotEmpty} from "@/lib/listUtils";
import {computed, triggerRef} from "vue";

const model = defineModel<TMultiple extends true ? TValue[] : Nullable<TValue>>({ required: true, default: null })
const searchTerm = defineModel<string>('searchTerm', { required: false, default: '' })
const openModel = defineModel<boolean>('open', { required: false, default: false })

const props = withDefaults(defineProps<ComboboxProps<TValue, TMultiple>>(), {
  limit: Infinity,
  variant: 'outline',
  maxCreateLength: Infinity,
})

const emit = defineEmits<{
  'selected': [value: typeof model.value]
  'create': [value: string]
}>()

defineOptions({
  inheritAttrs: false
})

const toggleOpen = useToggle(openModel)

function isSelected(option: TValue): boolean {
  return asArray(model.value).includes(option)
}

function getDisplayValue(option: TValue): string {
  if (isDefined(props.displayValue)) {
    return props.displayValue(option)
  }

  return String(option)
}

function filterFunction(list: MaybeReadonly<Array<TValue>>, query: string): TValue[] {
  if (isDefined(props.filterFunction)) {
    return props.filterFunction(list, query)
  }

  return list.filter((option) => {
    return getDisplayValue(option).toLowerCase().includes(query.toLowerCase())
  })
}

function getKey(option: TValue): string | number {
  if (isDefined(props.getKey)) {
    return props.getKey(option)
  }

  return props.options.findIndex((it) => it === option)
}

const label = computed(() => {
  if (isDefined(props.label)) {
    return props.label
  }

  return asArray(model.value)
      .map(getDisplayValue)
      .join(', ')
})

const showLabel = computed(() => {
  return isNotEmpty(label.value)
})

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
    if (
        isNotNull(option) &&
        option === model.value &&
        props.allowDeselect
    ) {
      (model.value as null) = null
    } else {
      (model.value as TValue) = option
    }
  }

  emit('selected', model.value)
}

function handleCreate() {
  if (props.allowCreate) {
    emit('create', searchTerm.value)
  }
}

function handleUpdateClose(value: boolean) {
  if (value) {
    return
  }

  if (props.preventClose) {
    return
  }

  open.value = false
}

function handleUpdateSearchTerm(value: string) {
  if (isEmpty(value) && props.preventInputClear) {
    return
  }

  searchTerm.value = value
}

const filteredOptions = computed(() =>
    filterFunction(props.options, searchTerm.value)
        .slice(0, props.limit) // limit the number of options (default: Infinity)
)

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

const showCreate = computed(() => {
  return props.allowCreate && isNotEmpty(searchTerm.value)
})

const showEmpty = computed(() => {
  return isEmpty(filteredOptions.value) && !showCreate.value
})

const open = computed({
  get() {
    if (isEmpty(props.options) && !props.allowCreate) {
      return false
    }

    if (props.hideWhenEmpty && showEmpty.value) {
      return false
    }

    if (props.allowCreate && props.maxCreateLength < searchTerm.value.length) {
      return false
    }

    return openModel.value
  },
  set(value) {
    openModel.value = value
  }
})
</script>

<template>
  <ComboboxRoot
    :model-value="primitiveModel"
    :search-term="searchTerm"
    @update:search-term="handleUpdateSearchTerm"
    open
    :class="props.class"
  >
    <Popover :open="open" @update:open="handleUpdateClose">
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
      <PopoverContent
          :class="cn('min-w-[200px] w-[200px] p-0', popoverClass)"
          align="start"
      >
        <div class="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground">
          <CommandInput
              v-if="!noInput"
              :placeholder="searchLabel ?? $t('common.placeholders.search')"
          />
          <div v-if="showEmpty" class="py-6 text-center text-sm">
            <slot name="empty">
              <span class="truncate">{{ emptyLabel ?? $t('common.placeholders.searchEmpty') }}</span>
            </slot>
          </div>
          <CommandList>
            <div class="p-1">
              <CommandItem
                  v-for="option in filteredOptions"
                  :key="getKey(option) /* keep the index stable */"
                  :value="wrap(option) /* radix doesn't support null */"
                  @click.prevent="() => handleSelect(option) /* override default behavior */"
              >
                <slot name="option" :value="option">
                  <slot name="optionLeading" :value="option" />
                  <slot name="optionLabel" :value="option">
                    <span class="truncate">{{ getDisplayValue(option) }}</span>
                  </slot>
                  <span class="ml-auto">
                    <Check
                        :data-active="isSelected(option)"
                        class="ml-2 size-4 opacity-0 data-[active=true]:opacity-100"
                    />
                  </span>
                </slot>
              </CommandItem>
              <CommandItem
                  v-if="showCreate"
                  :value="{}"
                  @click.prevent="() => handleCreate()"
              >
                <slot name="create">
                  <slot name="createLeading" :value="searchTerm" />
                  <slot name="createLabel" :value="searchTerm">
                    <span class="truncate">{{ searchTerm }}</span>
                  </slot>
                  <span class="ml-auto">
                    <Plus class="ml-2 size-4" />
                  </span>
                </slot>
              </CommandItem>
            </div>
          </CommandList>
        </div>
      </PopoverContent>
    </Popover>
  </ComboboxRoot>
</template>