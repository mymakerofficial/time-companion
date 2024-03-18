import {cva, type VariantProps} from 'class-variance-authority'

export { default as Badge } from './Badge.vue'

export const badgeVariants = cva(
  'inline-flex items-center items-center font-semibold transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-color text-color-foreground hover:bg-color/90',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-primary/90',
        ghost:
          'bg-color/20 text-color-foreground dark:text-color hover:bg-color/15',
        skeleton: '',
      },
      size: {
        xs: 'gap-0.5 text-xs px-1 rounded-sm',
        sm: 'gap-1 text-xs px-2.5 py-1',
        md: 'gap-1.5 text-md px-3 py-1',
        lg: 'gap-2 text-lg px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
