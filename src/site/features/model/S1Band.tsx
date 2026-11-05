import { ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router';

import { Eyebrow } from '@/site/components/atoms/Eyebrow';
import '@/site/features/model/model.css';

/** The home page's word about Manu-S1: what it is in one line, three numbers, and the way to its page. */
export function S1Band() {
  return (
    <section className="s1-band" id="manu-s1">
      <div className="s1-band__inner">
        <div className="s1-band__copy">
          <Eyebrow>New · our own model</Eyebrow>
          <h2>
            Manu-S1, <em>a small model for court procedure.</em>
          </h2>
          <p>
            We trained a small model that reads a court record and answers one procedural question: is it in
            time, what kind of order is it, which court should hear it. Open weights, free to use.
          </p>
          <Link className="button-link button-link--ink" to="/manu-s1">
            <span>Meet Manu-S1</span>
            <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </div>
        <ul className="s1-band__stats">
          <li>
            <b>91.8%</b>
            <span>on 2,346 High Court orders it never saw</span>
          </li>
          <li>
            <b>
              <Zap size={22} aria-hidden="true" /> 64 ms
            </b>
            <span>for one decision, on one GPU</span>
          </li>
          <li>
            <b>0</b>
            <span>decisions about bail, guilt or outcomes. Procedure only.</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
