<script setup lang="ts">
import {TableCell, TableRow} from "@renderer/components/ui/table";

defineProps<{
  colSpan: number
}>()
</script>

<template>
  <TableRow>
    <TableCell
      :colspan="colSpan"
      class="h-24 text-center text-muted-foreground italic"
    >
      {{ $t('common.placeholders.noEntries') }}
    </TableCell>
  </TableRow>
</template>