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
import { getSchemaDefaults } from '@shared/lib/helpers/getSchemaDefaults'

const props = defineProps<{
  project?: ProjectDto
}>()

const emit = defineEmits<{
  submit: [values: ProjectDto]
}>()

const form = useForm({
  validationSchema: toTypedSchema(projectSchema),
  initialValues: props.project ?? getSchemaDefaults(projectSchema),
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
          <ColorSelect
            :model-value="componentField.modelValue"
            @update:model-value="componentField['onUpdate:modelValue']"
          />
        </FormControl>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="isBillable">
      <FormItem class="grid grid-cols-4 items-center gap-4">
        <FormLabel
          class="text-right"
          v-t="'dialog.project.form.isBillable.label'"
        />
        <FormControl class="col-span-3">
          <Switch v-bind="componentField" />
        </FormControl>
      </FormItem>
    </FormField>
    <div class="flex flex-row justify-end gap-4">
      <slot name="actions" />
    </div>
  </form>
</template>
