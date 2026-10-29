import { useEffect, useRef, useState } from 'react';
import { Gavel, RotateCcw } from 'lucide-react';

import run from '@/site/features/model/case-run.json';

/* A real special-court trial file, read end to end by Manu-S1 v1, replayed as the order register
   a court clerk keeps by hand, one entry at the model's own speed. Exported by nyaya-s1's
   demo/export_masked.py: the model's decisions only, with every name, number, date and word of the
   orders removed. */

type Order = { m: number; kind: string; conf: number; n: number; ms: number; appear: Record<string, [string, number]> };

const KIND: Record<string, [string, string]> = {
  procedural_direction: ['Directions issued', 'k-dir'],
  adjournment: ['Adjourned', 'k-adj'],
  interlocutory_disposal: ['Application decided', 'k-int'],
  interim_relief: ['Interim relief', 'k-rel'],
  final_disposal: ['Final order', 'k-fin'],
};

const APPEAR: Record<string, [string, string]> = {
  in_person_with_counsel: ['With lawyer', 'a-with'],
  in_person_without_counsel: ['Alone', 'a-alone'],
  through_counsel_only: ['Lawyer only', 'a-counsel'],
  not_appeared_after_service: ['Absent', 'a-absent'],
  cannot_tell: ['Unclear', 'a-unsure'],
};

const ORDERS = run.orders as Order[];
const ACCUSED = Array.from({ length: run.accused }, (_, i) => `A-${i + 1}`);
const VISIBLE = 7;

function seconds(ms: number) {
  return (ms / 1000).toFixed(1);
}

export function CaseRun() {
  const [read, setRead] = useState(0);
  const [started, setStarted] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const done = read >= ORDERS.length;
  const elapsed = ORDERS.slice(0, read).reduce((sum, o) => sum + o.ms, 0);
  const decisions = ORDERS.slice(0, read).reduce((sum, o) => sum + o.n, 0);
  const first = Math.max(0, read - VISIBLE);
  const rows = ORDERS.slice(first, read)
    .map((o, i) => ({ o, no: first + i + 1 }))
    .reverse();

  // Start when the register comes into view; reduced motion shows the finished register.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRead(ORDERS.length);
      return undefined;
    }
    const seen = new IntersectionObserver(([entry]) => entry.isIntersecting && setStarted(true), { threshold: 0.35 });
    if (box.current) seen.observe(box.current);
    return () => seen.disconnect();
  }, []);

  // Each entry appears after exactly the time the model took to read that order.
  useEffect(() => {
    if (!started || done) return undefined;
    const next = window.setTimeout(() => setRead((r) => r + 1), ORDERS[read].ms);
    return () => window.clearTimeout(next);
  }, [started, read, done]);

  return (
    <div className="s1-case" data-snap>
      <div className="s1-ledger" ref={box}>
        <header className="s1-ledger__head">
          <div className="s1-ledger__count">
            <b>
              {read}
              <small> / {ORDERS.length}</small>
            </b>
            <span>orders read</span>
          </div>
          <div className="s1-ledger__count is-clock">
            <b>
              {seconds(elapsed)}
              <small> s</small>
            </b>
            <span>{done ? 'the whole file' : 'elapsed, in real time'}</span>
          </div>
          <div className="s1-ledger__count">
            <b>{decisions.toLocaleString('en-IN')}</b>
            <span>entries made</span>
          </div>
          <div className="s1-ledger__count">
            <b>
              {read ? seconds(elapsed / read) : '0.0'}
              <small> s</small>
            </b>
            <span>per order</span>
          </div>
        </header>

        <div className="s1-ledger__progress" aria-hidden="true">
          <i style={{ width: `${(read / ORDERS.length) * 100}%` }} />
        </div>

        <table className="s1-ledger__table">
          <thead>
            <tr>
              <th>Order</th>
              <th>What the court did</th>
              {ACCUSED.map((a) => (
                <th key={a} className="is-person">
                  {a}
                </th>
              ))}
              <th className="is-time">Read in</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ o, no }, i) => (
              <tr key={no} className={i === 0 && !done ? 'is-new' : ''}>
                <td className="is-no">{no}</td>
                <td>
                  <span className={`s1-ledger__kind ${KIND[o.kind][1]}`}>{KIND[o.kind][0]}</span>
                </td>
                {ACCUSED.map((a) => {
                  const p = o.appear[a];
                  return (
                    <td key={a} className="is-person">
                      {p ? <span className={`s1-ledger__who ${APPEAR[p[0]][1]}`}>{APPEAR[p[0]][0]}</span> : <span className="s1-ledger__none">·</span>}
                    </td>
                  );
                })}
                <td className="is-time">{seconds(o.ms)} s</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={ACCUSED.length + 3} className="s1-ledger__wait">
                  Opening the file…
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <footer className="s1-ledger__foot">
          <span>A real special-court trial file · names and case details removed · replayed at the model’s own speed on one GPU</span>
          {done ? (
            <button type="button" onClick={() => setRead(0)}>
              <RotateCcw size={13} aria-hidden="true" /> Replay
            </button>
          ) : null}
        </footer>
      </div>

      <div className="s1-case__court">
        <span className="s1-case__court-icon">
          <Gavel size={18} aria-hidden="true" />
        </span>
        <span className="s1-case__court-q">Which court should hear it?</span>
        <b>Prevention of Corruption Act special court</b>
        <em>
          {Math.round(run.special.conf * 1000) / 10}% sure · {run.special.ms} ms · 24 of 24 right
        </em>
      </div>
    </div>
  );
}
