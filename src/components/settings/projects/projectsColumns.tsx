import {createColumnHelper} from "@tanstack/vue-table";
import {getColorStyleVariables} from "@/directives/vProvideColor";
import {isNotNull} from "@/lib/utils";
import {CheckCircle2, ChevronsDownUp, ChevronsUpDown, Circle, MoreHorizontal, Slash} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import type {ProjectRow} from "@/components/settings/projects/types";

const columnHelper = createColumnHelper<ProjectRow>()
export const projectsColumns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => <>
      <span class="flex items-center gap-2">
        <span>{info.getValue()[0]}</span>
        {info.getValue()[1] && <>
          <Slash class="size-3"/>
          <span>{info.getValue()[1]}</span>
        </>}
      </span>
    </>,
  }),
  columnHelper.accessor('color', {
    header: 'Color',
    cell: (info) => info.getValue() && <div style={getColorStyleVariables(info.getValue())} class="size-3 rounded-full bg-primary" />,
  }),
  columnHelper.accessor('billable', {
    header: 'Billable',
    cell: (info) => isNotNull(info.getValue()) ? info.getValue() ? <CheckCircle2 class="size-5" /> : <Circle class="size-5" /> : null, // i dont like ternary operators
  }),
  columnHelper.accessor('lastUsed', {
    header: 'Last Used',
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => <>
      <span class="flex justify-end gap-1 items-center">
        { row.getCanExpand() && <Button onClick={() => row.toggleExpanded()} variant="ghost" size="icon">{row.getIsExpanded() ? <ChevronsDownUp class="size-5" /> : <ChevronsUpDown class="size-5" />}</Button> }
        <Button variant="ghost" size="icon"><MoreHorizontal class="size-5" /></Button>
      </span>
    </>,
    meta: {
      className: 'w-10',
    }
  })
]