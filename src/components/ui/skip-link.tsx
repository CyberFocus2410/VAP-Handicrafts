import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  targetId?: string;
}

export function SkipLink({
  targetId = "main-content",
  className,
  children = "Skip to main content",
  ...props
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-sm focus:bg-rose-deep focus:px-4 focus:py-2.5 focus:text-surface focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}
