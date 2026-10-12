import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb navigation"
      className={`flex items-center space-x-1.5 text-xs text-cocoa-muted mb-6 overflow-x-auto whitespace-nowrap py-1 ${className}`}
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1 hover:text-rose-deep transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
      >
        <Home className="w-3.5 h-3.5 text-cocoa/60" aria-hidden="true" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <ChevronRight className="w-3.5 h-3.5 text-cocoa/40 shrink-0" aria-hidden="true" />
            {isLast || !item.href ? (
              <span className="font-semibold text-cocoa truncate max-w-[220px] sm:max-w-none" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-rose-deep transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs truncate max-w-[180px] sm:max-w-none"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
