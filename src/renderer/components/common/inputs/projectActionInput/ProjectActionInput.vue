<script setup lang="ts">
import { computed, type HTMLAttributes, onMounted, ref, watch } from 'vue'
import { Input } from '@renderer/components/ui/input'
import Combobox from '@renderer/components/common/inputs/combobox/Combobox.vue'
import ComboboxInput from '@renderer/components/common/inputs/combobox/ComboboxInput.vue'
import {
  isDefined,
  isNotDefined,
  isNotNull,
  isNull,
  type Nullable,
} from '@renderer/lib/utils'
import { useQuickAccess } from '@renderer/composables/useQuickAccess'
import type { ReactiveCalendarEventShadow } from '@renderer/model/eventShadow/types'
import { createEventShadow } from '@renderer/model/eventShadow/model'
import ShadowBadge from '@renderer/components/common/shadow/ShadowBadge.vue'
import { firstOf, isEmpty, isNotEmpty, secondOf } from '@renderer/lib/listUtils'
import { onStartTyping, unrefElement, useFocus } from '@vueuse/core'
import type { ReactiveProject } from '@renderer/model/project/types'
import { createProject } from '@renderer/model/project/model'
import type { ReactiveActivity } from '@renderer/model/activity/types'
import { createActivity } from '@renderer/model/activity/model'
import { projectActionInputBadgeVariants } from '@renderer/components/common/inputs/projectActionInput/variants'
import type { BadgeVariants } from '@renderer/components/ui/badge'
import { useProjectsService } from '@renderer/services/projectsService'
import EditableShadowBadge from '@renderer/components/common/shadow/EditableShadowBadge.vue'

const projectModel = defineModel<Nullable<ReactiveProject>>('project', {
  required: false,
  default: null,
})
const activityModel = defineModel<Nullable<ReactiveActivity>>('activity', {
  required: false,
  default: null,
})
const noteModel = defineModel<string>('note', { required: false, default: '' })

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    variant?: NonNullable<BadgeVariants>['variant']
    class?: HTMLAttributes['class']
    wrapperClass?: HTMLAttributes['class']
    placeholder?: HTMLAttributes['placeholder']
    focusWhenTyping?: boolean
  }>(),
  {
    size: 'md',
    variant: 'default',
  },
)

const emit = defineEmits<{
  selected: []
  startTyping: []
  backspace: []
}>()

defineOptions({
  inheritAttrs: false,
})

const projectsService = useProjectsService()

const searchTerm = ref('')

watch(searchTerm, (newValue, oldValue) => {
  if (isEmpty(oldValue) && isNotEmpty(newValue)) {
    emit('startTyping')
  }
})

onMounted(() => {
  // wait for the combobox, so it doesn't reset the value
  setTimeout(() => {
    watch(
      noteModel,
      (value) => {
        searchTerm.value = value
      },
      { immediate: true },
    )
  }, 2)
  watch(searchTerm, (value) => {
    noteModel.value = value
  })
})

const input = ref()
const { focused: inputFocused } = useFocus(input)
const inputElement = computed(() => unrefElement(input))

onStartTyping(() => {
  if (props.focusWhenTyping) {
    inputElement.value.focus()
  }
})

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
  },
})

const shadows = useQuickAccess(() => ({
  maxActivitiesPerProject:
    isNotNull(selected.value) || isNotEmpty(searchTerm.value)
      ? Infinity
      : undefined,
  maxShadows:
    isNotNull(selected.value) || isNotEmpty(searchTerm.value)
      ? Infinity
      : undefined,
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
      project: selected.value.project,
    })
    return
  }

  if (selected.value?.project) {
    selected.value = null
    return
  }

  emit('backspace')
}

const createParts = computed(() => {
  if (isDefined(selected.value?.project)) {
    return [selected.value?.project.displayName, searchTerm.value]
  }

  return searchTerm.value.split('/', 2).filter(isNotEmpty)
})

function createProjectFromTerm() {
  if (isNotNull(selected.value)) {
    return selected.value.project
  }

  const displayName = firstOf(createParts.value)

  if (isNotDefined(displayName)) {
    return null
  }

  const project = createProject(
    {
      displayName,
    },
    {
      randomColor: true,
    },
  )

  projectsService.addProject(project)

  return project
}

function createActivityFromTerm(project: Nullable<ReactiveProject>) {
  if (isNotNull(selected.value) && isNotNull(selected.value.activity)) {
    return selected.value.activity
  }

  const displayName = secondOf(createParts.value)

  if (isNotDefined(displayName)) {
    return null
  }

  const activity = createActivity({
    displayName,
    parentProject: project,
  })

  projectsService.addActivity(activity)

  return activity
}

function handleCreate() {
  const project = createProjectFromTerm()
  const activity = createActivityFromTerm(project)

  if (isNull(project)) {
    return
  }

  selected.value = createEventShadow({
    project,
    activity,
  })

  searchTerm.value = ''
}

function handleSelect() {
  searchTerm.value = ''
  emit('selected')
}

const open = computed(() => {
  if (inputFocused.value === false) {
    return false
  }

  if (selected.value?.activity) {
    return false
  }

  if (isEmpty(searchTerm) && isEmpty(shadows)) {
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
    @create="handleCreate"
    @selected="handleSelect"
    no-input
    hide-when-empty
    allow-create
    :max-create-length="24"
    prevent-close
    prevent-input-clear
    popover-class="w-auto"
    :class="props.wrapperClass"
  >
    <template #anchor>
      <Input
        @keydown.backspace="handleBackspace"
        :size="size"
        :placeholder="placeholder"
        :class="props.class"
        v-bind="$attrs"
      >
        <template #leading>
          <EditableShadowBadge
            :shadow="selected"
            :variant="variant"
            :size="size"
            :class="projectActionInputBadgeVariants({ size })"
          />
        </template>
        <template #input="props">
          <ComboboxInput ref="input" v-bind="props" />
        </template>
        <template #trailing>
          <slot name="trailing" />
        </template>
      </Input>
    </template>
    <template #optionLabel="{ value }">
      <ShadowBadge :shadow="value" variant="skeleton" size="md" />
    </template>
    <template #createLabel>
      <ShadowBadge variant="skeleton" size="md">
        <template #project>
          <span class="text-nowrap">{{ firstOf(createParts) }}</span>
        </template>
        <template #activity v-if="isNotNull(secondOf(createParts))">
          <span class="text-nowrap">{{ secondOf(createParts) }}</span>
        </template>
      </ShadowBadge>
    </template>
  </Combobox>
</template>
