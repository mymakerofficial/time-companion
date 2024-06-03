<script setup lang="ts">
import ColorSelect from '@renderer/components/common/inputs/colorSelect/ColorSelect.vue'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import { toTypedSchema } from '@vee-validate/zod'
import { type ProjectDto, projectSchema } from '@shared/model/project'
import { useForm } from 'vee-validate'
import { Switch } from '@renderer/components/ui/switch'

const props = defineProps<{
  project?: ProjectDto
}>()

const emit = defineEmits<{
  submit: [values: ProjectDto]
}>()

const formSchema = toTypedSchema(projectSchema)

const form = useForm({
  validationSchema: formSchema,
  initialValues: props.project ?? {
    displayName: '',
    color: 'red',
    isBillable: true,
    isBreak: false,
  },
})

const onSubmit = form.handleSubmit((values) => {
  emit('submit', values)
})
</script>

<template>
  <form @submit="onSubmit" class="flex flex-col gap-4">
    <FormField v-slot="{ componentField }" name="displayName">
      <FormItem class="grid grid-cols-4 items-center gap-4">
        <FormLabel
          class="text-right"
          v-t="'dialog.project.form.displayName.label'"
        />
        <FormControl class="col-span-3">
          <Input v-bind="componentField" />
        </FormControl>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="color">
      <FormItem class="grid grid-cols-4 items-center gap-4">
        <FormLabel class="text-right" v-t="'dialog.project.form.color.label'" />
        <FormControl class="col-span-3">
          <ColorSelect v-bind="componentField" />
        </FormControl>
      </FormItem>
    </FormField>
    <FormField v-slot="{ field }" name="isBillable">
      <FormItem class="grid grid-cols-4 items-center gap-4">
        <FormLabel
          class="text-right"
          v-t="'dialog.project.form.isBillable.label'"
        />
        <FormControl class="col-span-3">
          <Switch v-bind="field" />
        </FormControl>
      </FormItem>
    </FormField>
    <div class="flex flex-row justify-end gap-4">
      <slot name="actions" />
    </div>
  </form>
</template>
