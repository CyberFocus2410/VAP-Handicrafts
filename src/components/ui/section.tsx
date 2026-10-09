import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  surface?: "default" | "surface" | "blush" | "beige";
}

export function Section({
  as: Component = "section",
  surface = "default",
  className,
  children,
  ...props
}: SectionProps) {
  const surfaceClasses = {
    default: "bg-bg text-cocoa",
    surface: "bg-surface text-cocoa",
    blush: "bg-blush/20 text-cocoa",
    beige: "bg-beige/30 text-cocoa",
  }[surface];

  return (
    <Component
      className={cn("py-12 md:py-20 lg:py-28", surfaceClasses, className)}
      {...props}
    >
      {children}
    </Component>
  );
}
