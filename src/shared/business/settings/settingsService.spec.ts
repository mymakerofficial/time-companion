import { describe, expect, it } from 'vitest'
import { useServiceTest } from '@test/fixtures/service/serviceFixtures'
import { defineSettings, setting } from '@shared/business/settings/helpers'
import { z } from 'zod'

describe('settingsService', () => {
  const { Setting, config } = defineSettings({
    theme: setting('theme', z.enum(['light', 'dark', 'system'])),
    locale: setting('locale', z.string()),
    isCool: setting('is_cool', z.boolean()),
  })
  const { settingsService } = useServiceTest({ settingsConfig: config })

  it('should get the default value of a setting', async () => {
    await settingsService.setValue(Setting.theme, 'light')
    const theme = await settingsService.getValue(Setting.theme)
    expect(theme).toBe('light')
  })
})
