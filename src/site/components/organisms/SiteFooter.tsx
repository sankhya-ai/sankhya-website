import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

import { COMPANY, CONTACT_EMAIL } from '@/site/config/site';
import { isExternal, PRODUCTS } from '@/site/config/products';

/**
 * The lab's footer: what we make, where it is public, and who we are, on the
 * pale card with the wordmark pinned to its bottom-left corner so the rounded
 * edge crops it.
 */
export function SiteFooter() {
  return (
    <>
      <footer className="site-footer">
        <div className="site-footer__top">
          <div className="site-footer__wordmark" lang="hi" aria-hidden="true">सांख्य</div>
          <p className="site-footer__legal">
            © {new Date().getFullYear()} {COMPANY}. Manu prepares; people act. Nothing on this site is legal advice.
          </p>
          <div className="site-footer__nav site-footer__nav--two">
            <p>Products</p>
            {PRODUCTS.map(({ name, href }) =>
              isExternal(href) ? <a key={name} className="site-footer__out" href={href} target="_blank" rel="noopener">{name}<ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" /></a> : <Link key={name} to={href}>{name}</Link>,
            )}
          </div>
          <div className="site-footer__nav">
            <p>Open</p>
            <a href="https://github.com/tura-learn/Dhee" target="_blank" rel="noopener noreferrer">Dhee on GitHub</a>
            <a href="https://github.com/tura-learn/chamber" target="_blank" rel="noopener noreferrer">Chamber on GitHub</a>
            <a href="https://huggingface.co/AshishDwi99/tura-s1-4b" target="_blank" rel="noopener noreferrer">Tura-S1 weights</a>
            <a href="https://huggingface.co/sankhya-aI/manu-s1-4b" target="_blank" rel="noopener noreferrer">Manu-S1 weights</a>
          </div>
          <div className="site-footer__nav">
            <p>Company</p>
            <a href="/privacy">Privacy</a>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
        </div>
        <div className="site-footer__bottom" />
      </footer>
    </>
  );
}
