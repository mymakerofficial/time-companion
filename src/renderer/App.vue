<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNavigation from '@renderer/components/common/layout/AppNavigation.vue'
import { TooltipProvider } from 'radix-vue'
import type { NavLink } from '@renderer/components/common/layout/nav/nav-link'
import { Archive, BugPlay, Calendar, Settings } from 'lucide-vue-next'
import DialogProvider from '@renderer/components/common/dialog/DialogProvider.vue'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { today } from '@renderer/lib/neoTime'
import { useActiveDayService } from '@renderer/services/activeDayService'
import { useCalendarService } from '@renderer/services/calendarService'
import { useLocaleService } from '@renderer/services/localeService'
import { useThemeService } from '@renderer/services/themeService'
import { Toaster } from '@renderer/components/ui/sonner'
import AppLoader from '@renderer/components/common/layout/AppLoader.vue'
import { usePreflight } from '@renderer/composables/preflight/usePreflight'

// initialize appearance settings
useLocaleService()
useThemeService()

const calendarService = useCalendarService()
const activeDayService = useActiveDayService()

calendarService.init()
activeDayService.setByDate(today())

const { t } = useI18n()

const links = computed<NavLink[]>(() => {
  const links = [
    {
      label: t('app.nav.dashboard'),
      to: { name: 'app-dashboard' },
      icon: Calendar,
    },
    { label: t('app.nav.report'), to: { name: 'app-report' }, icon: Archive },
    {
      label: t('app.nav.settings'),
      to: { name: 'app-settings' },
      icon: Settings,
    },
  ]

  if (import.meta.env.DEV) {
    links.push({
      label: 'Dev Playground',
      to: { name: 'playground' },
      icon: BugPlay,
    })
  }

  return links
})

const { isReady } = usePreflight()
</script>

<template>
  <DialogProvider />
  <Toaster />
  <TooltipProvider>
    <AppNavigation :links="links">
      <RouterView v-slot="{ Component }">
        <Transition>
          <component v-if="isReady" :is="Component" />
          <AppLoader v-else />
        </Transition>
      </RouterView>
    </AppNavigation>
  </TooltipProvider>
</template>
