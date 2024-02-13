import {cva, type VariantProps} from "class-variance-authority";

export { default as Input } from './Input.vue'
export { default as InputPrimitive } from './InputPrimitive.vue'

export const inputContainerVariants = cva(
  'flex items-center w-full overflow-hidden border border-input bg-background ring-offset-background placeholder:text-muted-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2',
  {
    variants: {
      size: {
        sm: 'h-7 rounded-sm text-xs',
        md: 'h-10 rounded-md text-sm',
        lg: 'h-11 rounded-lg text-xl font-medium',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export const inputInputVariants = cva(
  'h-full w-full bg-transparent file:border-0 file:bg-transparent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'first:pl-2 last:pr-2 py-1 file:text-sm file:font-medium',
        md: 'first:pl-3 last:pr-3 py-2 file:text-sm file:font-medium',
        lg: 'first:pl-3 last:pr-3 py-2 file:text-xl file:font-medium',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type InputVariants = VariantProps<typeof inputContainerVariants>