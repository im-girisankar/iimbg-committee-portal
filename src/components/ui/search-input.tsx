import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  "aria-label"?: string;
}

/**
 * Leading Search icon, live onChange filtering debounced ~150ms, a clear
 * button when non-empty, Escape clears. `role="searchbox"`. Does not render
 * a result count — that lives with the page, which knows what "results"
 * means (this stays app-agnostic).
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  debounceMs = 150,
  className,
  ...aria
}: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => setLocal(value), [value]);
  useEffect(() => () => clearTimeout(timer.current), []);

  function update(next: string) {
    setLocal(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(next), debounceMs);
  }

  function clear() {
    clearTimeout(timer.current);
    setLocal("");
    onChange("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && local) {
      event.preventDefault();
      clear();
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle"
        aria-hidden="true"
      />
      <input
        type="search"
        role="searchbox"
        value={local}
        placeholder={placeholder}
        aria-label={aria["aria-label"] ?? placeholder}
        onChange={(event) => update(event.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-9 w-full rounded-sm border border-border-strong bg-surface pl-9 text-ui text-fg",
          local ? "pr-9" : "pr-3",
          "placeholder:text-fg-subtle transition-colors duration-[--dur-fast] hover:border-fg-faint",
        )}
      />
      {local && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={clear}
          className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-xs text-fg-subtle hover:bg-bg-muted hover:text-fg"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
