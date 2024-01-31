<script setup lang="ts">
import ColorSelect from "@/components/common/inputs/colorSelect/ColorSelect.vue";
import {Button} from "@/components/ui/button";
import {vProvideColor} from "@/directives/vProvideColor";
import type {Nullable} from "@/lib/utils";
import {ref} from "vue";
import {Input} from "@/components/ui/input";
import {useToggle} from "@vueuse/core";

const color = defineModel<Nullable<string>>('color', { required: true, default: null })
const text = defineModel<string>('text', { required: true, default: '' })

defineProps<{
  placeholder?: string
}>()

const open = ref(false)
const toggleOpen = useToggle(open)
</script>

<template>
  <ColorSelect v-model="color" v-model:open="open" v-slot:trigger="{ selected: selectedColor }">
    <Input v-model="text" :placeholder="placeholder" v-slot:leading>
      <Button variant="ghost" class="mx-1 size-8 p-0" @click="toggleOpen()">
        <div v-provide-color="selectedColor?.value" class="size-3 rounded-sm bg-primary"/>
      </Button>
    </Input>
  </ColorSelect>
</template>