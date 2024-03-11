<script setup lang="ts">
import ProjectActionInput from "@/components/common/inputs/projectActionInput/ProjectActionInput.vue";
import {Button} from "@/components/ui/button";
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import type {Nullable} from "@/lib/utils";
import type {ReactiveProject} from "@/model/project/types";
import type {ReactiveActivity} from "@/model/activity/types";

const project = defineModel<Nullable<ReactiveProject>>('project', { required: false, default: null })
const activity = defineModel<Nullable<ReactiveActivity>>('activity', { required: false, default: null })
const note = defineModel<string>('note', { required: false, default: '' })

const props = defineProps<{
  isRunning: boolean
}>()

const emit = defineEmits<{
  start: []
  stop: []
}>()

const { t } = useI18n()

const buttonLabel = computed(() => {
  if (props.isRunning) {
    return t('dashboard.controls.stopEvent')
  } else {
    return t('dashboard.controls.startEvent')
  }
})

function handleStartStop() {
  if (props.isRunning) {
    emit('stop')
  } else {
    emit('start')
  }
}
</script>

<template>
  <ProjectActionInput
    v-model:project="project"
    v-model:activity="activity"
    v-model:note="note"
    focus-when-typing
    placeholder="what are you working on?..."
    size="lg"
    class="w-full"
    v-slot:trailing
  >
    <Button @click="handleStartStop" size="sm" class="mr-1 px-3 py-1">{{ buttonLabel }}</Button>
  </ProjectActionInput>
</template>