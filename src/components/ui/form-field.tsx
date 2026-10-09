import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: {
    id: string;
    error: boolean;
    "aria-describedby"?: string;
    "aria-required"?: boolean;
  }) => React.ReactNode;
}

export function FormField({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium text-cocoa">
          {label}
          {required && (
            <span className="ml-1 text-error" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      </div>

      {children({
        id,
        error: !!error,
        "aria-describedby": describedBy,
        "aria-required": required,
      })}

      {hint && !error && (
        <p id={hintId} className="text-xs text-cocoa-muted">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-xs font-medium text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
