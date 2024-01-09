<script setup lang="ts">
import {Input} from "@/components/ui/input";
import {ref, watch} from "vue";

// duration in minutes
const model = defineModel<number>({ required: true })

// duration in minutes
const inputValue = ref(toTimeString(model.value))

watch(() => model.value, (value) => {
  inputValue.value = toTimeString(value)
})

function toTimeString(value: number) {
  const hours = Math.floor(value / 60)
  const minutes = value % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

function parse(value: string): number | null {
  const inputRegex = /(?<operator>[+-])?\s*(?<value>\d+.?\d*\w*)/gi
  const matches = [...value.matchAll(inputRegex)]

  if (matches.length === 0) {
    return null
  }

  const values = matches.map((match) => {
    const {operator, value: rawValue} = match.groups!

    const valueRegex = /^\s*((?<whole>\d{1,2})\.(?<decimal>\d+)?h?\s*$)|((?<hour>\d{1,2})(:|h| )?(?<minute>\d{2})?\s*$)|((?<value>\d+)\s*(?<unit>minute|min|m|hour|h)?\s*$)/gi
    const valueMatch = valueRegex.exec(rawValue)

    if (valueMatch === null) {
      return 0
    }

    const {whole, decimal, hour, minute, value: valueString, unit} = valueMatch.groups

    let value = 0

    if (whole !== undefined) {
      // value is given as a decimal (e.g. 1.5)
      const hours = parseInt(whole)
      const minutes = parseInt(decimal) / 10 * 60
      value = hours * 60 + minutes
    } else if (hour !== undefined) {
      // value is given in hours and minutes (e.g. 1:30)
      value = parseInt(hour) * 60 + (parseInt(minute) || 0)
    } else if (valueString !== undefined) {
      // value is given in minutes or hours (e.g. 90m or 1h)
      const isMinutes = unit === 'm' || unit === 'min' || unit === 'minute'
      value = parseInt(valueString) * (isMinutes ? 1 : 60)
    }

    const isNegative = operator === '-'
    value = isNegative ? -value : value

    return value
  })

  return values.reduce((acc, value) => acc + value, 0)
}

function handleChange() {
  const parsed = parse(inputValue.value)

  if (parsed === null) {
    inputValue.value = toTimeString(model.value)
  }

  model.value = parsed
}
</script>

<template>
  <Input v-model="inputValue" @change="handleChange" placeholder="00:00" />
</template>