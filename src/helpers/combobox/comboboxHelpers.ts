import type {ComboboxOption} from "@/components/common/inputs/combobox/types";

export function optionsFromRecord(record: Record<string, string>): ComboboxOption[] {
  return Object.entries(record).map(([value, label]) => ({
    value,
    label,
  }))
}