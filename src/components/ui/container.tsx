import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: string;
}

export function Container({
  as = "div",
  className,
  children,
  ...props
}: ContainerProps) {
  return React.createElement(
    as,
    {
      className: cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className),
      ...props,
    },
    children
  );
}
