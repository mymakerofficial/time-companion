<script setup lang="ts">
import {computed, ref} from "vue";
import {Input} from "@/components/ui/input";
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";
import ComboboxInput from "@/components/common/inputs/combobox/ComboboxInput.vue";
import {isNotNull, type Nullable} from "@/lib/utils";
import {useQuickAccess} from "@/composables/useQuickAccess";
import {createEventShadow, type ReactiveCalendarEventShadow} from "@/model/calendarEventShadow";
import ShadowBadge from "@/components/common/shadow/ShadowBadge.vue";
import {isNotEmpty} from "@/lib/listUtils";
import {useFocus} from "@vueuse/core";

const searchTerm = ref('')
const input = ref()
const { focused: inputFocused } = useFocus(input)

const selected = ref<Nullable<ReactiveCalendarEventShadow>>(null)

const shadows = useQuickAccess(() => ({
  maxActivitiesPerProject: isNotNull(selected.value) || isNotEmpty(searchTerm.value) ? Infinity : undefined,
  maxShadows: isNotNull(selected.value) || isNotEmpty(searchTerm.value) ? Infinity : undefined,
  project: selected.value?.project ?? null,
  exclude: selected.value ?? null,
}))

function handleBackspace() {
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
      <Input>
        <template #leading>
          <ShadowBadge :shadow="selected" variant="default" size="md" class="mx-1.5 rounded-sm" />
        </template>
        <template #input="props">
          <ComboboxInput
            ref="input"
            v-model="searchTerm"
            @keyup.backspace="handleBackspace"
            v-bind="props"
          />
        </template>
      </Input>
    </template>
    <template #optionLabel="{ value }">
      <ShadowBadge :shadow="value" variant="skeleton" size="md" />
    </template>
  </Combobox>
</template>