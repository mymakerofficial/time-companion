<script setup lang="ts">
import {ref} from "vue";
import {Input} from "@/components/ui/input";
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";
import ComboboxInput from "@/components/common/inputs/combobox/ComboboxInput.vue";
import type {Nullable} from "@/lib/utils";
import {useQuickAccess} from "@/composables/useQuickAccess";
import type {ReactiveCalendarEventShadow} from "@/model/calendarEventShadow";
import ShadowBadge from "@/components/common/shadow/ShadowBadge.vue";

const open = ref(false)
const searchTerm = ref('')

const selected = ref<Nullable<ReactiveCalendarEventShadow>>(null)

const shadows = useQuickAccess()
</script>

<template>
  <Combobox
    v-model="selected"
    :options="shadows"
    :display-value="(shadow) => shadow.combinedName"
    :open="open"
    :search-term="searchTerm"
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
            v-model="searchTerm"
            @focusin="open = true"
            @focusout="open = false"
            @keydown="open = true"
            @keyup.backspace="() => {if (selected) {selected = null; open = false}}"
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