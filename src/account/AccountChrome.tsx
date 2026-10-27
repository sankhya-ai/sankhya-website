import { NavLink } from 'react-router';

/**
 * The account half's header and footer. Same height as the old navigation
 * (a 32px strip over a 56/64px bar), so the account pages' own offsets still
 * line up, but with nothing in it that points at pages that no longer exist.
 * Links back to the public site are plain anchors: that is a fresh load.
 */
export function AccountHeader() {
  const link = 'inline-flex h-10 items-center px-3 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[#504a43] hover:text-[#050505]';
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="flex h-8 items-center justify-center border-b border-white/10 bg-[#080706] px-5 font-mono text-[9px] font-bold uppercase tracking-[0.09em] text-[#f8ead8] md:text-[10px]">
        Sankhya AI Labs
      </div>
      <nav className="h-16 border-b border-[#cbc5ba] bg-[#f0ede6]/90 backdrop-blur-2xl md:h-14" aria-label="Primary navigation">
        <div className="mx-auto flex h-full max-w-[1540px] items-center justify-between">
          <a href="/" className="flex shrink-0 items-center gap-3 px-4" aria-label="Sankhya AI Labs home">
            <img src="/assets/sankhya-logo.png" alt="" className="size-[29px] shrink-0" width="29" height="29" />
            <span className="flex items-baseline gap-2.5 leading-none">
              <span className="font-bit text-[24px] leading-none text-[#050505] md:text-[26px]">Sankhya</span>
              <span className="font-bit text-[9px] font-bold leading-none text-[#050505]/68 md:text-[10px]">AI LABS</span>
            </span>
          </a>
          <div className="flex items-center pr-2">
            <a className={link} href="/manu">Manu</a>
            <NavLink className={link} to="/account">Account</NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
}

export function AccountFooter() {
  return (
    <footer className="border-t border-[#cbc5ba] px-5 py-8 font-mono text-[10px] uppercase tracking-[0.08em] text-[#716a62] md:px-8 lg:px-10">
      <div className="mx-auto flex max-w-[1540px] flex-wrap items-center justify-between gap-3">
        <span>© {new Date().getFullYear()} Sankhya AI Labs</span>
        <span className="flex gap-5">
          <a href="/manu" className="hover:text-[#050505]">Manu</a>
          <a href="mailto:hello@sankhyaailabs.com" className="hover:text-[#050505]">hello@sankhyaailabs.com</a>
        </span>
      </div>
    </footer>
  );
}
