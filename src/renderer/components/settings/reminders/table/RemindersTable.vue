<script setup lang="tsx">
import {useDialogStore} from "@renderer/stores/dialogStore";
import type {ReactiveCalendarReminder} from "@renderer/model/calendarReminder/types";
import {createRemindersColumns} from "@renderer/components/settings/reminders/table/remindersColumns";
import EditReminderDialog from "@renderer/components/settings/reminders/dialog/EditReminderDialog.vue";
import {toReminderRow} from "@renderer/components/settings/reminders/table/helpers";
import {computed, ref} from "vue";
import {getSortedRowModel, type SortingState, type TableOptions} from "@tanstack/vue-table";
import Table from "@renderer/components/common/table/Table.vue";
import {updater} from "@renderer/lib/helpers/tableHelpers";
import type {ReminderRow} from "@renderer/components/settings/reminders/table/types";
import type {MaybeReadonly} from "@renderer/lib/utils";

const props = defineProps<{
  reminders: MaybeReadonly<Array<ReactiveCalendarReminder>>
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