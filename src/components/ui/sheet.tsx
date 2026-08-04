import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Radix Dialog wrapper for the mobile drawer. Fixes D11 entirely — focus
 * trap, Escape, scroll lock, aria-modal, and focus restoration all come
 * from Radix. Sizing follows 07-MOBILE.md: `w-[min(320px,86vw)]`,
 * `h-[100dvh]`, its own `overflow-y-auto`.
 */
export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;
export const SheetTitle = Dialog.Title;
export const SheetDescription = Dialog.Description;

type SheetContentProps = React.ComponentProps<typeof Dialog.Content> & {
  /** Accessible label when no visible SheetTitle is rendered. */
  title?: string;
};

export function SheetContent({ className, children, title, ...props }: SheetContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
      <Dialog.Content
        aria-label={title}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col",
          "h-[100dvh] w-[min(320px,86vw)] overflow-y-auto",
          "border-l border-border bg-surface shadow-overlay",
          "rounded-l-lg",
          "transition-transform duration-[var(--dur-slow)] ease-[var(--ease-in-out)]",
          "pb-[env(safe-area-inset-bottom)]",
          className,
        )}
        {...props}
      >
        {children}
        <Dialog.Close
          aria-label="Close menu"
          className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-sm text-fg-muted hover:bg-bg-muted hover:text-fg"
        >
          <X className="size-4" aria-hidden="true" />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
