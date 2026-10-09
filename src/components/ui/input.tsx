import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex min-h-[44px] w-full rounded-sm border bg-surface px-3 py-2 text-base text-cocoa transition-colors placeholder:text-cocoa-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-error focus-visible:ring-error"
            : "border-border hover:border-cocoa/30",
          className
        )}
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
