import type { RouteLocationRaw } from 'vue-router'
import type { Icon } from 'lucide-vue-next'

export interface NavLink {
  label: string
  to: RouteLocationRaw
  icon?: Icon
}
