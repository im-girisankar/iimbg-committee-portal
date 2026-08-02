/* ─────────────────────────────────────────────────────────────
   Footer — quiet, informative, matches the design language.
   ───────────────────────────────────────────────────────────── */

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-[1120px] px-4 py-10 text-center text-sm">
        <p className="text-[var(--color-secondary)] font-[var(--font-sans)]">
          Built by <span className="text-[var(--color-primary)] font-medium">Envision × IT Committee</span> · IIM Bodh Gaya · {year}
        </p>
        <p className="mt-2 mono">
          "The committee that runs the campus's tech."
        </p>
      </div>
    </footer>
  );
}