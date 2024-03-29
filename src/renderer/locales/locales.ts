import { createI18n } from 'vue-i18n'
import enUs from './en-Us'
import deInformal from './de-Informal'
import nlNl from './nl-Nl'
import cat from './cat'

export const i18n = createI18n({
  locale: 'en-US',
  fallbackLocale: 'en-US',
  legacy: false,
  silentTranslationWarn: true,
  messages: {
    'en-US': enUs,
    'de-Informal': deInformal,
    'nl-NL': nlNl,
    cat: cat,
  },
})
