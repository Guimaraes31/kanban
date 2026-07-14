import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-zinc-600 bg-zinc-100 text-black',
        secondary: 'border-transparent bg-zinc-800 text-zinc-300',
        outline: 'border-zinc-700 text-zinc-300',
        success: 'border-transparent bg-zinc-200 text-black',
        warning: 'border-zinc-600 bg-zinc-800 text-zinc-100',
        danger: 'border-zinc-400 bg-zinc-100 text-black',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
