import { GitHubMark } from '@/site/components/atoms/GitHubMark';
import { CHAMBER_DOWNLOAD, CHAMBER_GITHUB, SANKHYA } from '@/site/features/chamber/links';

/** Chamber's own header: it lives at chamber.sankhyaailabs.com, so its links stay on its page. */
export function ChamberHeader() {
  return (
    <header className="cx-nav">
      <a className="cx-nav__brand" href="/" aria-label="Chamber home">
        chamber<span aria-hidden="true" />
      </a>
      <nav aria-label="Chamber">
        <a href="/#what">Features</a>
        <a href="/#self-host">Self-host</a>
        <a href={CHAMBER_GITHUB} target="_blank" rel="noopener noreferrer" className="cx-nav__gh"><GitHubMark /> GitHub</a>
      </nav>
      <a className="cx-nav__cta" href={CHAMBER_DOWNLOAD}>Download</a>
    </header>
  );
}

export function ChamberFooter() {
  return (
    <footer className="cx-foot">
      <p>
        Chamber is made by <a href={SANKHYA}>Sankhya AI Labs</a>. Open source under Apache 2.0.
      </p>
      <p>
        <a href={CHAMBER_GITHUB} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href={`${SANKHYA}/privacy`}>Privacy</a>
        <a href="mailto:hello@sankhyaailabs.com">hello@sankhyaailabs.com</a>
      </p>
    </footer>
  );
}
