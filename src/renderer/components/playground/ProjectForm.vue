<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { type ProjectDto, projectSchema } from '@shared/model/project'
import { useForm } from 'vee-validate'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import ColorSelect from '@renderer/components/common/inputs/colorSelect/ColorSelect.vue'
import { Switch } from '@renderer/components/ui/switch'
import { computed, watch } from 'vue'
import type { Nullable } from '@shared/lib/utils/types'

const props = withDefaults(
  defineProps<{
    project?: Nullable<ProjectDto>
    submitText?: string
  }>(),
  {
    submitText: 'Submit',
  },
)

const emit = defineEmits<{
  submit: [values: ProjectDto]
}>()

const project = computed(() => {
  return (
    props.project ?? {
      displayName: 'Test Project',
      color: 'red',
      isBillable: true,
      isBreak: false,
    }
  )
})

const formSchema = toTypedSchema(projectSchema)

const form = useForm({
  validationSchema: formSchema,
  initialValues: project.value,
})

watch(project, () => {
  form.resetForm({
    values: project.value,
  })
})

const onSubmit = form.handleSubmit((values) => {
  emit('submit', values)
})
</script>

<template>
  <form @submit="onSubmit" class="flex flex-col gap-4">
    <FormField v-slot="{ componentField }" name="displayName">
      <FormItem class="grid grid-cols-4 items-center gap-4">
        <FormLabel>Name</FormLabel>
        <FormControl class="col-span-3">
          <Input type="text" v-bind="componentField" />
        </FormControl>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="color">
      <FormItem class="grid grid-cols-4 items-center gap-4">
        <FormLabel>Color</FormLabel>
        <FormControl class="col-span-3">
          <ColorSelect v-model="componentField.modelValue" />
        </FormControl>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="isBillable">
      <FormItem class="grid grid-cols-4 items-center gap-4">
        <FormLabel>Billable</FormLabel>
        <FormControl class="col-span-3">
          <Switch v-model:checked="componentField.modelValue" />
        </FormControl>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="isBreak">
      <FormItem class="grid grid-cols-4 items-center gap-4">
        <FormLabel>Break</FormLabel>
        <FormControl class="col-span-3">
          <Switch v-model:checked="componentField.modelValue" />
        </FormControl>
      </FormItem>
    </FormField>
    <div class="flex justify-end gap-4">
      <slot name="action" />
      <Button type="submit"> {{ submitText }} </Button>
    </div>
  </form>
</template>
