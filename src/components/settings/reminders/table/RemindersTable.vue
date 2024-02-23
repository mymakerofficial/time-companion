<script setup lang="tsx">
import {useDialogStore} from "@/stores/dialogStore";
import type {ReactiveCalendarReminder} from "@/model/calendarReminder/types";
import {createRemindersColumns} from "@/components/settings/reminders/table/remindersColumns";
import EditReminderDialog from "@/components/settings/reminders/dialog/EditReminderDialog.vue";
import {toReminderRow} from "@/components/settings/reminders/table/helpers";
import {computed, ref} from "vue";
import {getSortedRowModel, type SortingState, type TableOptions} from "@tanstack/vue-table";
import Table from "@/components/common/table/Table.vue";
import {updater} from "@/helpers/table/tableHelpers";
import type {ReminderRow} from "@/components/settings/reminders/table/types";

const props = defineProps<{
  reminders: ReactiveCalendarReminder[]
}>()

const dialogStore = useDialogStore()

const columns = createRemindersColumns({
  onOpenEditReminderDialog: (id) => {
    dialogStore.openDialog(<EditReminderDialog id={id} />)
  },
})

const data = computed(() => props.reminders.map(toReminderRow))

const sorting = ref<SortingState>([])

const tableOptions: Partial<TableOptions<ReminderRow>> = {
  state: {
    get sorting() { return sorting.value },
  },
  onSortingChange: (updaterOrValue) => updater(updaterOrValue, sorting),
  getSortedRowModel: getSortedRowModel(),
}
</script>

<template>
  <Table :data="data" :columns="columns" :options="tableOptions" />
</template>