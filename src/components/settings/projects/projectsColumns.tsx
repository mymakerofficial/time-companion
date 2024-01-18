import {createColumnHelper} from "@tanstack/vue-table";
import {getColorStyleVariables} from "@/directives/vProvideColor";
import {isNotNull} from "@/lib/utils";
import {CheckCircle2, Circle, MoreHorizontal} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import type {ProjectRow} from "@/components/settings/projects/types";

const columnHelper = createColumnHelper<ProjectRow>()
export const projectsColumns = [
  columnHelper.accessor('name', {
    header: 'Name',
  }),
  columnHelper.accessor('color', {
    header: 'Color',
    cell: (props) => <div style={getColorStyleVariables(props.getValue())} class="size-3 rounded-full bg-primary" />,
  }),
  columnHelper.accessor('billable', {
    header: 'Billable',
    cell: (props) => isNotNull(props.getValue()) ? props.getValue() ? <CheckCircle2 class="size-5" /> : <Circle class="size-5" /> : null, // i dont like ternary operators
  }),
  columnHelper.accessor('lastUsed', {
    header: 'Last Used',
  }),
  columnHelper.display({
    id: 'actions',
    cell: () => <Button variant="ghost" size="icon"><MoreHorizontal /></Button>,
  })
]