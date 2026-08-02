/* ─────────────────────────────────────────────────────────────
   Footer — quiet, informative, matches the design language.
   ───────────────────────────────────────────────────────────── */

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#322C24] bg-[#1C1915]">
      <div className="mx-auto max-w-[1120px] px-4 py-10 text-center text-sm text-[#9C948A]">
        <p>
          IT Committee · IIM Bodh Gaya · {year}
        </p>
        <p className="mt-2 mono">
          "The committee that runs the campus's tech."
        </p>
      </div>
    </footer>
  );
}