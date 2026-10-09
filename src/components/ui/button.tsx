import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-rose-deep text-surface shadow-sm hover:bg-rose-deeper active:opacity-95",
        secondary:
          "border border-cocoa/30 bg-surface text-cocoa shadow-sm hover:bg-beige/40 active:bg-beige/60",
        outline:
          "border border-border bg-transparent text-cocoa hover:bg-surface/80 active:bg-surface",
        ghost:
          "text-cocoa hover:bg-cocoa/5 active:bg-cocoa/10",
        link:
          "text-rose-deep underline-offset-4 hover:underline p-0 h-auto min-h-0",
      },
      size: {
        sm: "h-9 min-h-[36px] px-3 text-sm",
        md: "min-h-[44px] px-5 py-2.5 text-base", // 44px minimum touch target for WCAG 2.2 AA
        lg: "min-h-[50px] px-7 py-3 text-lg",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px] p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading ? "true" : undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-current" aria-hidden="true" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
