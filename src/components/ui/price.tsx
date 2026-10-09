import * as React from "react";
import { formatINR } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PriceProps extends React.HTMLAttributes<HTMLDivElement> {
  paise: number;
  compareAtPaise?: number;
  isDevPrice?: boolean;
  showZeroPaise?: boolean;
}

export function Price({
  paise,
  compareAtPaise,
  isDevPrice = false,
  showZeroPaise = false,
  className,
  ...props
}: PriceProps) {
  const formattedPrice = formatINR(paise, { showZeroPaise });
  const hasDiscount = typeof compareAtPaise === "number" && compareAtPaise > paise;
  const formattedCompare = hasDiscount
    ? formatINR(compareAtPaise, { showZeroPaise })
    : null;

  return (
    <div
      className={cn("inline-flex items-baseline gap-2 text-price", className)}
      {...props}
    >
      <span className="font-semibold text-cocoa">{formattedPrice}</span>

      {hasDiscount && (
        <span className="text-sm font-normal text-cocoa-muted line-through">
          <span className="sr-only">Original price was </span>
          <s>{formattedCompare}</s>
        </span>
      )}

      {isDevPrice && (
        <Badge variant="dev" className="text-[10px] px-1.5 py-0">
          Dev Price
        </Badge>
      )}
    </div>
  );
}
