import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldAria {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  /** helper text, e.g. "Max 400 characters" */
  description?: string;
  /** when present, renders role="alert" and sets aria-invalid */
  error?: string;
  className?: string;
  children: (aria: FieldAria) => ReactNode;
}

/**
 * Owns label association, description, error, and aria-* wiring so correct
 * form a11y is the default rather than something every page re-derives.
 */
export function Field({ id, label, required, description, error, className, children }: FieldProps) {
  const descId = description ? `${id}-desc` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = errorId ?? descId;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-label text-fg">
        {label}
        {required && (
          <>
            <span className="text-danger" aria-hidden="true">
              {" "}
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {description && !error && (
        <p id={descId} className="text-caption text-fg-subtle">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
