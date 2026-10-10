import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-blush text-cocoa",
        secondary: "border border-border bg-surface text-cocoa",
        gold: "border border-gold-deep/30 bg-gold-deep/10 text-gold-deep",
        success: "border border-success/30 bg-success/10 text-success",
        error: "border border-error/30 bg-error/10 text-error",
        outline: "border border-border text-cocoa",
        warning: "border border-gold-deep/30 bg-gold-deep/10 text-gold-deep",
        dev: "border border-dashed border-rose-deep bg-rose-deep/10 text-rose-deep uppercase font-mono tracking-wider",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
