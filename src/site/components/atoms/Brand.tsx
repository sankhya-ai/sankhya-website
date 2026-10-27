import { Link } from 'react-router';

import { cn } from '@/site/lib/cn';

type BrandProps = { inverse?: boolean; className?: string; product?: string };

/**
 * Sankhya's mark and name. On a product's own pages the product comes first
 * and the lab is named beside it (Manu | Sankhya AI Labs); everywhere else it
 * is the lab alone. The mark and the lab's name always go to the lab's home
 * page; the product's name goes to the product's own.
 */
export function Brand({ inverse = false, className, product }: BrandProps) {
  if (!product) {
    return (
      <Link className={cn('brand', 'brand--lab', inverse && 'brand--inverse', className)} to="/" aria-label="Sankhya AI Labs, home">
        <img className="brand__mark" src="/brand/sankhya-mark.png" alt="" width="142" height="142" />
        <strong>Sankhya</strong>
        <span className="brand__by">AI Labs</span>
      </Link>
    );
  }
  return (
    <span className={cn('brand', inverse && 'brand--inverse', className)}>
      <Link to="/" aria-label="Sankhya AI Labs, home">
        <img className="brand__mark" src="/brand/sankhya-mark.png" alt="" width="142" height="142" />
      </Link>
      <Link to={`/${product.toLowerCase()}`}>
        <strong>{product}</strong>
      </Link>
      <Link className="brand__by" to="/">Sankhya AI Labs</Link>
    </span>
  );
}
