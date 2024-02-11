<script setup lang="ts">
import {computed, type HTMLAttributes, ref, useAttrs} from "vue";
import {Input} from "@/components/ui/input";
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";
import ComboboxInput from "@/components/common/inputs/combobox/ComboboxInput.vue";
import {cn, isNotDefined, isNotNull, isNull, type Nullable} from "@/lib/utils";
import {useQuickAccess} from "@/composables/useQuickAccess";
import {createEventShadow, type ReactiveCalendarEventShadow} from "@/model/calendarEventShadow";
import ShadowBadge from "@/components/common/shadow/ShadowBadge.vue";
import {isNotEmpty} from "@/lib/listUtils";
import {useFocus} from "@vueuse/core";
import type {ReactiveProject} from "@/model/project";
import type {ReactiveActivity} from "@/model/activity";

const projectModel = defineModel<Nullable<ReactiveProject>>('project', { required: false, default: null })
const activityModel = defineModel<Nullable<ReactiveActivity>>('activity', { required: false, default: null })
const searchTerm = defineModel<string>('note', { required: false, default: '' })

const props = defineProps<{
  class?: HTMLAttributes['class']
  placeholder?: HTMLAttributes['placeholder']
}>()

defineOptions({
  inheritAttrs: false
})

const input = ref()
const { focused: inputFocused } = useFocus(input)

const selected = computed<Nullable<ReactiveCalendarEventShadow>>({
  get() {
    if (isNotDefined(projectModel.value)) {
      return null
    }

    return createEventShadow({
      project: projectModel.value,
      activity: activityModel.value,
    })
  },
  set(value) {
    if (isNull(value)) {
      projectModel.value = null
      activityModel.value = null
      return
    }

    projectModel.value = value.project
    activityModel.value = value.activity
  }
})

const shadows = useQuickAccess(() => ({
  maxActivitiesPerProject: isNotNull(selected.value) || isNotEmpty(searchTerm.value) ? Infinity : undefined,
  maxShadows: isNotNull(selected.value) || isNotEmpty(searchTerm.value) ? Infinity : undefined,
  project: selected.value?.project ?? null,
  exclude: selected.value ?? null,
}))

function handleBackspace(event: KeyboardEvent) {
  const target = event.target as HTMLInputElement

  if (target.selectionStart !== 0 || target.selectionEnd !== 0) {
    return
  }

  if (selected.value?.activity) {
    // replace with new shadow, otherwise the color will not update
    selected.value = createEventShadow({
      project: selected.value.project
    })
    return
  }

  if (selected.value?.project) {
    selected.value = null
  }
}

const open = computed(() => {
  if (inputFocused.value === false) {
    return false
  }

  if (selected.value?.activity) {
    return false
  }

  return true
})

const placeholder = computed(() => {
  if (isNotNull(selected.value)) {
    return null
  }

  return props.placeholder
})
</script>

<template>
  <Combobox
    v-model="selected"
    :options="shadows"
    :display-value="(shadow) => shadow.combinedName"
    :get-key="(shadow) => [shadow.project?.id, shadow.activity?.id].join('-')"
    :open="open"
    v-model:search-term="searchTerm"
    :limit="6"
    no-input
    prevent-close
    popover-class="w-auto"
  >
    <template #anchor>
      <Input
        v-model="searchTerm"
        @keydown.backspace="handleBackspace"
        :placeholder="placeholder"
        :class="props.class"
        v-bind="$attrs"
      >
        <template #leading>
          <ShadowBadge :shadow="selected" variant="default" size="md" class="mx-1.5 rounded-sm" />
        </template>
        <template #input="props">
          <ComboboxInput ref="input" v-bind="props" />
        </template>
      </Input>
    </template>
    <template #optionLabel="{ value }">
      <ShadowBadge :shadow="value" variant="skeleton" size="md" />
    </template>
  </Combobox>
</template>