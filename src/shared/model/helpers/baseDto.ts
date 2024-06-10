import type { HasId } from '@shared/model/helpers/hasId'
import type { HasCreatedAt } from '@shared/model/helpers/hasCreatedAt'
import type { HasModifiedAt } from '@shared/model/helpers/hasModifiedAt'
import type { HasDeletedAt } from '@shared/model/helpers/hasDeletedAt'
import { Temporal } from 'temporal-polyfill'

export type BaseDto<TId = string, TDate = Temporal.PlainDateTime> = HasId<TId> &
  HasCreatedAt<TDate> &
  HasModifiedAt<TDate> &
  HasDeletedAt<TDate>
