import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-violet-600/20 text-violet-300',
        secondary: 'border-transparent bg-zinc-800 text-zinc-300',
        outline: 'border-zinc-700 text-zinc-300',
        success: 'border-transparent bg-green-600/20 text-green-400',
        warning: 'border-transparent bg-amber-600/20 text-amber-400',
        danger: 'border-transparent bg-red-600/20 text-red-400',
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