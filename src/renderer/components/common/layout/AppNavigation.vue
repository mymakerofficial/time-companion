<script setup lang="ts">
import IconNav from '@renderer/components/common/layout/nav/IconNav.vue'
import type { NavLink } from '@renderer/components/common/layout/nav/nav-link'
import { cn } from '@renderer/lib/utils'
import { Clock, PanelLeft } from 'lucide-vue-next'
import { Button } from '@renderer/components/ui/button'
import { useToggle } from '@vueuse/core'
import { useElectronService } from '@renderer/services/electronService'

defineProps<{
  links: NavLink[]
}>()

const electronService = useElectronService()

const customTitleBar = electronService.getPlatform() === 'win32'

const [expandSidebar, toggleExpandSidebar] = useToggle(true)
</script>

<template>
  <div
    :data-custom-title-bar="customTitleBar"
    class="fixed left-0 top-0 flex flex-col w-screen h-dvh"
  >
    <header
      v-if="customTitleBar"
      class="electron-title-bar h-title-bar flex items-center"
    >
      <div class="electron-no-drag mx-3 flex justify-center gap-2">
        <Button variant="ghost" size="icon" class="h-7">
          <Clock class="size-4" />
        </Button>
        <Button
          @click="toggleExpandSidebar"
          variant="ghost"
          size="icon"
          class="h-7"
        >
          <PanelLeft class="size-4" />
        </Button>
      </div>
    </header>
    <div class="flex flex-row">
      <div
        :data-expand="expandSidebar"
        :class="
          cn(
            'w-16 sticky top-0 pt-20 overflow-hidden',
            customTitleBar &&
              'pt-1 data-[expand=false]:w-0 data-[expand=false]:opacity-0 data-[expand=true]:w-16 data-[expand=true]:opacity-100 transition-all duration-75 ease-out',
          )
        "
      >
        <IconNav :links="links" class="py-2.5" />
      </div>
      <div
        :class="
          cn(
            'flex-1 h-viewport bg-background border-l border-border overflow-auto box-content',
            customTitleBar && 'border-t',
            customTitleBar && expandSidebar && 'rounded-tl-md',
            customTitleBar && !expandSidebar && 'border-l-0',
          )
        "
      >
        <slot />
      </div>
    </div>
  </div>
</template>
