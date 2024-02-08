<script setup lang="ts">
import ColorSelect from "@/components/common/inputs/colorSelect/ColorSelect.vue";
import {Button} from "@/components/ui/button";
import {vProvideColor} from "@/directives/vProvideColor";
import type {Nullable} from "@/lib/utils";
import {Input} from "@/components/ui/input";

const color = defineModel<Nullable<string>>('color', { required: true, default: null })
const text = defineModel<string>('text', { required: true, default: '' })

defineProps<{
  placeholder?: string
}>()
</script>

<template>
  <ColorSelect v-model="color" v-slot:anchor="{ toggleOpen }">
    <Input v-model="text" :placeholder="placeholder" v-slot:leading>
      <Button variant="ghost" class="mx-1 size-8 p-0" @click="toggleOpen">
        <div v-provide-color="color" class="size-3 rounded-sm bg-primary"/>
      </Button>
    </Input>
  </ColorSelect>
</template>