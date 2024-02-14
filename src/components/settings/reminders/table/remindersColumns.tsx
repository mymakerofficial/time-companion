import {createColumnHelper, type Row} from "@tanstack/vue-table";
import {ArrowRight, Pencil, Slash} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import type {ReminderRow} from "@/components/settings/reminders/table/types";
import {getSortableHeader} from "@/helpers/table/tableHelpers";
import {useI18n} from "vue-i18n";
import {formatTime} from "@/lib/neoTime";
import {DateTimeFormatter} from "@js-joda/core";

function getReminderActionCell(value: ReminderRow['action']) {
  const { t } = useI18n()

  // TODO use ShadowBadge component
  return (
    <span class="flex flex-row items-center gap-2">
      <span>{ t(`reminder.actionType.${value.type}`) }</span>
      { value.targetProject && <><ArrowRight class="size-3"/><span>{value.targetProject?.displayName}</span></> }
      { value.targetActivity && <><Slash class="size-3"/><span>{value.targetActivity?.displayName}</span></> }
    </span>
  )
}

function getActionsCell(row: Row<ReminderRow>, options: RemindersColumnsOptions) {
  return (
    <Button onClick={() => options.onOpenEditReminderDialog(row.original.id)} variant="ghost" size="icon"><Pencil class="size-4" /></Button>
  )
}

const columnHelper = createColumnHelper<ReminderRow>()

interface RemindersColumnsOptions {
  onOpenEditReminderDialog: (id: string) => void;
}

export function  createRemindersColumns(
  options: RemindersColumnsOptions
) {
  const { t } = useI18n()

  return [
    columnHelper.accessor('name', {
      header: ({ column }) => getSortableHeader(column, t('settings.reminders.table.columns.name')),
    }),
    columnHelper.accessor('startAt', {
      header: ({ column }) => getSortableHeader(column, t('settings.reminders.table.columns.startAt')),
      cell: (info) => formatTime(info.getValue(), DateTimeFormatter.ofPattern('HH:mm')),
    }),
    columnHelper.accessor('action', {
      header: t('settings.reminders.table.columns.action'),
      cell: (info) => getReminderActionCell(info.getValue()),
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => getActionsCell(row, options),
      meta: {
        className: 'w-0',
      }
    })
  ]
}