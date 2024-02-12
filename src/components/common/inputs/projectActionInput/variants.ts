import {cva} from "class-variance-authority";

export const projectActionInputBadgeVariants = cva(
  '',
  {
    variants: {
      size: {
        sm: 'ml-0.5 mr-2 rounded-sm',
        md: 'mx-1.5 rounded-sm',
        lg: 'mx-1 rounded-md',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)