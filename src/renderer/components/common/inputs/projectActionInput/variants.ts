import { cva } from 'class-variance-authority'

export const projectActionInputBadgeVariants = cva('rounded-md', {
  variants: {
    size: {
      sm: 'ml-0.5 mr-2',
      md: 'mx-1.5',
      lg: 'ml-1 mr-3',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
