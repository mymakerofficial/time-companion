<script setup lang="ts">
import {TableCell, TableRow} from "@/components/ui/table";
</script>

<template>
  <TableRow>
    <TableCell
      :colspan="4"
      class="h-24 text-center text-muted-foreground italic"
    >
      {{ $t('common.placeholder.noEntries') }}
    </TableCell>
  </TableRow>
</template>