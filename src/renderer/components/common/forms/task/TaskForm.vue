<script setup lang="ts">
import ColorSelect from '@renderer/components/common/inputs/colorSelect/ColorSelect.vue'
import { FormControl, FormField, FormItem, FormLabel } from '@shadcn/form'
import { Input } from '@shadcn/input'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { getSchemaDefaults } from '@shared/lib/helpers/getSchemaDefaults'
import { taskSchema, type UpdateTask } from '@shared/model/task'

const props = defineProps<{
  task?: UpdateTask
}>()

const emit = defineEmits<{
  submit: [values: UpdateTask]
}>()

const form = useForm({
  validationSchema: toTypedSchema(taskSchema),
  initialValues: props.task ?? getSchemaDefaults(taskSchema),
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
    <div class="flex flex-row justify-end gap-4">
      <slot name="actions" />
    </div>
  </form>
</template>
