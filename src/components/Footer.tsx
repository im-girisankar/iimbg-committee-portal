/* ─────────────────────────────────────────────────────────────
   Footer — quiet, informative, matches the design language.
   ───────────────────────────────────────────────────────────── */

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-[1120px] px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Branding with logos */}
          <div className="flex items-center gap-3 flex-wrap">
            <img
              src="/images/Logos/College%20logo%20(transparent).png"
              alt="IIM Bodh Gaya"
              className="h-6 w-auto opacity-60"
              aria-hidden="true"
            />
            <img
              src="/images/Logos/It%20comm%20logo%20(transparent).png"
              alt="IT Committee"
              className="h-6 w-auto opacity-60"
              aria-hidden="true"
            />
            <p className="text-sm text-[var(--color-secondary)] font-[var(--font-sans)]">
              Built by <span className="text-[var(--color-primary)] font-medium">Envision × IT Committee</span> · IIM Bodh Gaya · {year}
            </p>
          </div>
          {/* Right: Tagline */}
          <p className="mono text-[var(--color-secondary)]">
            "Empowering the next generation of founders"
          </p>
        </div>
      </div>
    </footer>
  );
}