import { type VariantProps, cva } from 'class-variance-authority'

export { default as Badge } from './Badge.vue'

export const badgeVariants = cva(
  'inline-flex items-center gap-1 items-center rounded-md text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'px-2.5 py-1 border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
        secondary:
          'px-2.5 py-1 border-transparent bg-secondary text-secondary-foreground hover:bg-primary/90',
        ghost:
          'px-2.5 py-1 border-transparent bg-primary/20 text-primary-foreground dark:text-primary hover:bg-primary/15',
        skeleton: 'text-foreground font-normal',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
