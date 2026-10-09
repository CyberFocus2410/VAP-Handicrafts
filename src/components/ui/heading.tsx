import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva("text-cocoa tracking-tight", {
  variants: {
    level: {
      display: "text-display font-medium",
      h1: "text-h1 font-medium",
      h2: "text-h2 font-medium",
      h3: "text-h3 font-medium",
      h4: "text-xl font-medium",
      eyebrow: "text-eyebrow font-semibold text-cocoa-muted",
    },
  },
  defaultVariants: {
    level: "h2",
  },
});

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: HeadingTag;
}

export function Heading({
  as,
  level = "h2",
  className,
  children,
  ...props
}: HeadingProps) {
  const defaultTagMap: Record<NonNullable<VariantProps<typeof headingVariants>["level"]>, HeadingTag> = {
    display: "h1",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    eyebrow: "p",
  };

  const Component = as ?? (level ? defaultTagMap[level] : "h2");

  return (
    <Component
      className={cn(headingVariants({ level }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}
