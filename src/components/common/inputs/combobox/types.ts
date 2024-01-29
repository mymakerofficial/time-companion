export interface ComboboxOption<T extends string | number | symbol | null = string> {
  label: string
  value: T
}