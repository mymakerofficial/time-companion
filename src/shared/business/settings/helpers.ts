import { z } from 'zod'
import { entriesOf } from '@shared/lib/utils/object'
import { isNotNull } from '@shared/lib/utils/checks'
import type {
  SettingDefinition,
  SettingsConfig,
  SettingsEnum,
  SettingsTypeMap,
  SettingsValidType,
} from '@shared/business/settings/types'

export function setting<TKey extends string, TSchema extends z.ZodType>(
  key: TKey,
  schema: TSchema,
): SettingDefinition<TKey, TSchema> {
  return { key, schema }
}

export function defineSettings<T extends SettingsConfig>(config: T) {
  const Setting = Object.freeze(
    entriesOf(config).reduce((acc, [accessor, { key }]) => {
      acc[accessor] = key
      return acc
    }, {} as SettingsEnum<T>),
  )

  return {
    /***
     * Enum for setting keys
     */
    Setting,
    config,
  }
}

export function getSettingsMap<T extends SettingsConfig>(config: T) {
  return entriesOf(config).reduce((acc, [_, { key, schema }]) => {
    // @ts-expect-error
    acc[key] = schema
    return acc
  }, {} as SettingsTypeMap<T>)
}

export function getSettingSchema<T extends SettingsTypeMap>(
  config: T,
  key: keyof T,
) {
  return config[key]
}

export function serializeSettingsValue(value: SettingsValidType) {
  return isNotNull(value) ? value.toString() : null
}
