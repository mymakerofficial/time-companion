import { runZod } from '@shared/lib/helpers/zod'
import type { SettingsPersistence } from '@shared/business/settings/settingsPersistence'
import type {
  InferSettingType,
  SettingsConfig,
  SettingsKeys,
  SettingsTypeMap,
} from '@shared/business/settings/types'
import {
  getSettingSchema,
  getSettingsMap,
  serializeSettingsValue,
} from '@shared/business/settings/helpers'

export type SettingsServiceDependencies = {
  settingsPersistence: SettingsPersistence
  config: SettingsConfig
}

export function createSettingsService<
  TDeps extends SettingsServiceDependencies,
>(deps: TDeps): SettingsService<SettingsTypeMap<TDeps['config']>> {
  return new SettingsService(
    deps.settingsPersistence,
    getSettingsMap(deps.config),
  )
}

export class SettingsService<TSettings extends SettingsTypeMap> {
  constructor(
    private readonly settingsPersistence: SettingsPersistence,
    private readonly settings: TSettings,
  ) {}

  getSchema<TKey extends SettingsKeys<TSettings>>(key: TKey) {
    return getSettingSchema(this.settings, key)
  }

  async getValue<TKey extends SettingsKeys<TSettings>>(
    key: TKey,
  ): Promise<InferSettingType<TSettings, TKey>> {
    const value = await this.settingsPersistence.getValue(key)
    return runZod(() => this.getSchema(key).parse(value))
  }

  async setValue<TKey extends SettingsKeys<TSettings>>(
    key: TKey,
    value: InferSettingType<TSettings, TKey>,
  ) {
    runZod(() => this.getSchema(key).parse(value))
    await this.settingsPersistence.setValue(key, serializeSettingsValue(value))
  }
}
