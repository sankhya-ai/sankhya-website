import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';

import { Brand } from '@/site/components/atoms/Brand';
import { openWaitlist, WaitlistDialog } from '@/site/components/molecules/Waitlist';
import { CONTACT_EMAIL } from '@/site/config/site';
import { isExternal, PRODUCT_GROUPS, PRODUCTS, type Product } from '@/site/config/products';

/** Manu's own pages keep its name in the corner and its waitlist on the pill. */
const MANU_PATHS = new Set(['/manu', '/manu-s1']);

function ProductLink({ product, here, onPick, tabIndex }: { product: Product; here: boolean; onPick: () => void; tabIndex?: number }) {
  const { name, href, note, icon: Icon, badge } = product;
  const body = (
    <>
      <span className="site-nav__menu-icon">
        <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
      </span>
      <span>
        <b>
          {name}
          {badge ? <i>{badge}</i> : null}
          {isExternal(href) ? <ArrowUpRight className="site-nav__menu-out" size={13} strokeWidth={2} aria-label="(opens turalearn.com)" /> : null}
        </b>
        <small>{note}</small>
      </span>
    </>
  );
  return isExternal(href) ? (
    <a href={href} role="menuitem" tabIndex={tabIndex} target="_blank" rel="noopener" onClick={onPick}>{body}</a>
  ) : (
    <Link to={href} role="menuitem" tabIndex={tabIndex} className={here ? 'is-here' : ''} onClick={onPick}>{body}</Link>
  );
}

/** Home, Products as a grouped menu, and a pill on the end. */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const onProduct = PRODUCTS.some((p) => p.href === pathname);
  const manu = MANU_PATHS.has(pathname);

  useEffect(() => setProducts(false), [pathname]);
  useEffect(() => {
    if (!products) return undefined;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !menu.current?.contains(event.target as Node)) setProducts(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [products]);

  const pill = manu ? (
    <button type="button" className="site-nav__login" onClick={openWaitlist}>
      Join waitlist
    </button>
  ) : (
    <a className="site-nav__login" href={`mailto:${CONTACT_EMAIL}`}>
      Write to us
    </a>
  );

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">
        <Brand product={manu ? 'Manu' : undefined} />
        <div className="site-nav__links">
          <Link to="/" aria-current={pathname === '/' ? 'page' : undefined}>
            Home
          </Link>
          <div className="site-nav__products" ref={menu}>
            <button
              type="button"
              className="site-nav__products-toggle"
              aria-expanded={products}
              aria-current={onProduct ? 'page' : undefined}
              onClick={() => setProducts((v) => !v)}
            >
              Products <ChevronDown size={14} aria-hidden="true" />
            </button>
            {products ? (
              <div className="site-nav__menu site-nav__menu--grouped" role="menu">
                {PRODUCT_GROUPS.map((group) => (
                  <div className="site-nav__group" key={group} role="group" aria-label={group}>
                    <p>{group}</p>
                    {PRODUCTS.filter((p) => p.group === group).map((product) => (
                      <ProductLink key={product.name} product={product} here={pathname === product.href} onPick={() => setProducts(false)} />
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          {pill}
        </div>
        <button className="site-nav__toggle" type="button" aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((value) => !value)}>
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </nav>
      {open ? (
        <div className="mobile-menu">
          <Link to="/" aria-current={pathname === '/' ? 'page' : undefined} onClick={() => setOpen(false)}>
            Home
          </Link>
          {PRODUCT_GROUPS.map((group) => (
            <div className="mobile-menu__group" key={group}>
              <p>{group}</p>
              {PRODUCTS.filter((p) => p.group === group).map(({ name, href, note }) =>
                isExternal(href) ? (
                  <a key={name} href={href} target="_blank" rel="noopener">
                    <span>{name} <small>{note}</small></span>
                    <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <Link key={name} to={href} aria-current={pathname === href ? 'page' : undefined} onClick={() => setOpen(false)}>
                    <span>{name} <small>{note}</small></span>
                  </Link>
                ),
              )}
            </div>
          ))}
          {manu ? (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openWaitlist();
              }}
            >
              Join waitlist <span>↗</span>
            </button>
          ) : (
            <a href={`mailto:${CONTACT_EMAIL}`}>
              Write to us <span>↗</span>
            </a>
          )}
        </div>
      ) : null}
      <WaitlistDialog />
    </header>
  );
}
