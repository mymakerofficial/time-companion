import type { z } from 'zod'

export type SettingsValidType = string | number | boolean | null

export type SettingDefinition<
  TKey extends string,
  TSchema extends z.ZodType,
> = {
  key: TKey
  schema: TSchema
}

export type SettingsConfig = {
  [key: string]: SettingDefinition<string, z.ZodType>
}

// { 'CoolSetting': { key: 'cool_setting', schema: z.string() } } -> { 'cool_setting': z.string() }
export type SettingsTypeMap<TConfig extends SettingsConfig = SettingsConfig> = {
  [P in keyof TConfig as TConfig[P]['key']]: TConfig[P]['schema']
}

export type SettingsEnum<TConfig extends SettingsConfig> = {
  [K in keyof TConfig]: TConfig[K]['key']
}

export type InferSettingType<
  TSettings extends SettingsTypeMap,
  TKey extends SettingsKeys<TSettings>,
> = z.infer<TSettings[TKey]>

export type SettingsKeys<TSettings extends SettingsTypeMap> = keyof TSettings &
  string
