import type { MutateOptions } from '@tanstack/vue-query'

export type MutationOptions<TData = unknown, TVariables = void> = MutateOptions<
  TData,
  Error,
  TVariables
>
