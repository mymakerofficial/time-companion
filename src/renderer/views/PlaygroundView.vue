<script setup lang="ts">
import ResponsiveContainer from '@renderer/components/common/layout/ResponsiveContainer.vue'
import SettingsSection from '@renderer/components/settings/layout/SettingsSection.vue'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { onMounted, ref } from 'vue'
import { faker } from '@faker-js/faker'
import { dayService } from '@renderer/factory/service/dayService'
import { PlainDate } from '@shared/lib/datetime/plainDate'
import { lastOf } from '@shared/lib/utils/list'
import { asyncGetOrNull } from '@shared/lib/utils/result'
import { timeEntryService } from '@renderer/factory/service/timeEntryService'
import { Button } from '@renderer/components/ui/button'
import { Toggle } from '@renderer/components/ui/toggle'

const day = ref()

const selectedTimeEntryId = ref('')
const dayIdInput = ref('')
const descriptionInput = ref(faker.lorem.sentence(4))
const startedAtInput = ref(PlainDateTime.now().toString())
const stoppedAtInput = ref(PlainDateTime.now().toString())
const stoppedAtIsNull = ref(true)
const patchDescription = ref(false)
const patchStartedAt = ref(false)
const patchStoppedAt = ref(false)

async function create() {
  await timeEntryService.createTimeEntry({
    dayId: dayIdInput.value,
    projectId: null,
    taskId: null,
    description: descriptionInput.value,
    startedAt: PlainDateTime.from(startedAtInput.value),
    stoppedAt: stoppedAtIsNull.value
      ? null
      : PlainDateTime.from(stoppedAtInput.value),
  })
}

async function patch() {
  await timeEntryService.patchTimeEntry(selectedTimeEntryId.value, {
    description: patchDescription.value ? descriptionInput.value : undefined,
    startedAt: patchStartedAt.value
      ? PlainDateTime.from(startedAtInput.value)
      : undefined,
    stoppedAt: patchStoppedAt.value
      ? stoppedAtIsNull.value
        ? null
        : PlainDateTime.from(stoppedAtInput.value)
      : undefined,
  })
}

onMounted(async () => {
  await asyncGetOrNull(
    dayService.createDay({
      date: PlainDate.now(),
      targetBillableDuration: null,
    }),
  )

  day.value = lastOf(await dayService.getDays())
  dayIdInput.value = day.value.id
})
</script>

<template>
  <ResponsiveContainer class="my-14 flex flex-col">
    <SettingsSection>
      <div>timeEntryId: {{ selectedTimeEntryId }}</div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label class="text-right">dayId</Label>
        <Input v-model="dayIdInput" class="col-span-2" />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label class="text-right">description</Label>
        <Input v-model="descriptionInput" class="col-span-2" />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label class="text-right">startedAt</Label>
        <Input v-model="startedAtInput" class="col-span-2" />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label class="text-right">stoppedAt</Label>
        <Input
          v-model="stoppedAtInput"
          :disabled="stoppedAtIsNull"
          class="col-span-2"
        />
        <Toggle v-model:pressed="stoppedAtIsNull">Null</Toggle>
      </div>
      <div class="flex gap-4">
        <Button @click="create">Create</Button>
      </div>
      <div class="flex gap-4">
        <Button @click="patch">Patch</Button>
        <Toggle v-model:pressed="patchDescription">descriptionInput</Toggle>
        <Toggle v-model:pressed="patchStartedAt">startedAt</Toggle>
        <Toggle v-model:pressed="patchStoppedAt">stoppedAt</Toggle>
      </div>
    </SettingsSection>
    <SettingsSection> </SettingsSection>
  </ResponsiveContainer>
</template>
