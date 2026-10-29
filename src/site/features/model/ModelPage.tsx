import { useState } from 'react';
import { BookOpenCheck, Calculator, Check, CircleHelp, Copy, FileText, Gauge, ListChecks, Route, Scale, ShieldOff, UserCheck } from 'lucide-react';

import { ButtonLink } from '@/site/components/atoms/ButtonLink';
import { Eyebrow } from '@/site/components/atoms/Eyebrow';
import { PaperThreads } from '@/site/components/atoms/PaperThreads';
import { PaperGround } from '@/site/components/molecules/PaperGround';
import { SiteFooter } from '@/site/components/organisms/SiteFooter';
import { SiteHeader } from '@/site/components/organisms/SiteHeader';
import { WaitlistButton } from '@/site/components/molecules/Waitlist';
import { CODE, FAMILIES, HF_URL, HIGH_COURT, LIVE_RUN, NEVER, SPECS } from '@/site/features/model/content';
import { CaseRun } from '@/site/features/model/CaseRun';
import { DecisionDemo } from '@/site/features/model/DecisionDemo';
import { ResultsChart } from '@/site/features/model/ResultsChart';
import '@/site/features/model/model.css';

const FAMILY_ICONS = [Calculator, FileText, UserCheck, Route, BookOpenCheck];
/* The homepage's tones, one per family, so the row reads as five things and not one colour. */
const FAMILY_TONES = ['sky', 'terracotta', 'mint', 'saffron', 'olive'];

/** The three ways in, as a small editor window: pick a tab, copy what it shows. */
function CodeWindow() {
  const [tab, setTab] = useState<(typeof CODE)[number]['id']>('serve');
  const [copied, setCopied] = useState(false);
  const code = CODE.find((c) => c.id === tab)!.code;
  return (
    <div className="s1-code">
      <div className="s1-code__bar">
        <span className="s1-code__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div className="s1-code__tabs" role="tablist">
          {CODE.map((c) => (
            <button key={c.id} type="button" role="tab" aria-selected={c.id === tab} className={c.id === tab ? 'is-on' : ''} onClick={() => setTab(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="s1-code__copy"
          aria-label="Copy"
          onClick={() => {
            void navigator.clipboard?.writeText(code).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            });
          }}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** Manu-S1: what it is in plain words, what it answers, how well, what it never does, and how to run it. */
export function ModelPage() {
  return (
    <div className="s1-page" id="top">
      <SiteHeader />
      <main>
        <section className="s1-hero">
          <PaperThreads tone="paper" seed={31} strands={7} pins={4} band={[0.1, 0.9]} className="s1-hero__threads" />
          <div className="s1-hero__inner">
            <div className="s1-hero__copy">
              <Eyebrow>Our first model · open weights</Eyebrow>
              <h1>
                Manu-S1
                <em>A court clerk’s instinct, in 64 milliseconds.</em>
              </h1>
              <p>
                A small AI model we trained ourselves. Give it a court record and one precise question: is this complaint
                in time, what kind of order is this, which court should hear it. It answers in the blink of an eye, and
                says how sure it is.
              </p>
              <div className="s1-hero__actions">
                <ButtonLink href={HF_URL} tone="ink" target="_blank" rel="noreferrer">
                  Get it on Hugging Face
                </ButtonLink>
                <ButtonLink href="#how" tone="outline" arrow={false}>
                  How it thinks
                </ButtonLink>
              </div>
            </div>
            <DecisionDemo />
          </div>
          <ul className="s1-hero__facts">
            <li>
              <b>91.8%</b> on 2,346 High Court orders it never saw
            </li>
            <li>
              <b>64 ms</b> for one decision
            </li>
            <li>
              <b>4B</b> parameters, runs on one GPU
            </li>
            <li>
              <b>Apache-2.0</b> free to use
            </li>
          </ul>
        </section>

        <section className="s1-section" id="how">
          <header className="s1-head">
            <Eyebrow>What “System 1” means</Eyebrow>
            <h2>
              Two ways to think. <em>Manu-S1 is the fast one.</em>
            </h2>
          </header>
          <div className="s1-minds">
            <article className="s1-mind is-fast">
              <span className="s1-mind__tag">System 1 · fast</span>
              <h3>Glance at an order sheet: “that’s an adjournment.”</h3>
              <p>The instinct a court clerk builds over years. Quick, narrow and usually right. This is Manu-S1.</p>
            </article>
            <article className="s1-mind is-slow">
              <span className="s1-mind__tag">System 2 · slow</span>
              <h3>Sit down and draft the argument.</h3>
              <p>Weighing, writing, reasoning step by step. That stays with people, and with larger models.</p>
            </article>
          </div>
          <ul className="s1-traits">
            <li>
              <ListChecks size={20} aria-hidden="true" />
              <b>It picks. It never writes.</b>
              <span>Every answer comes from a fixed list, so there is nothing to invent.</span>
            </li>
            <li>
              <CircleHelp size={20} aria-hidden="true" />
              <b>It can say “cannot tell”.</b>
              <span>When the record does not say, that is an answer it was trained to give.</span>
            </li>
            <li>
              <Gauge size={20} aria-hidden="true" />
              <b>It shows how sure it is.</b>
              <span>A share for every answer, not one word with false confidence.</span>
            </li>
            <li>
              <Calculator size={20} aria-hidden="true" />
              <b>Code counts the days.</b>
              <span>Dates are worked out by a calculator. The model only reads what it found.</span>
            </li>
          </ul>
        </section>

        <section className="s1-section s1-section--paper">
          <header className="s1-head">
            <Eyebrow>What it answers</Eyebrow>
            <h2>
              Procedure, <em>never the merits.</em>
            </h2>
          </header>
          <div className="s1-families">
            {FAMILIES.map((family, i) => {
              const Icon = FAMILY_ICONS[i];
              return (
                <article key={family.title} className={`s1-family tone-${FAMILY_TONES[i]}`}>
                  <span className="s1-family__icon">
                    <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <p className="s1-family__plain">{family.plain}</p>
                  <h3>{family.title}</h3>
                  <p>{family.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="s1-section" id="results">
          <header className="s1-head">
            <Eyebrow>How well it does</Eyebrow>
            <h2>
              Measured on cases <em>it never saw.</em>
            </h2>
          </header>
          <div className="s1-results" data-snap>
            <ResultsChart />
            <aside className="s1-speed">
              <p className="s1-speed__eyebrow">Speed</p>
              <p className="s1-speed__big">
                64<span>ms</span>
              </p>
              <p>
                Median time for one decision on one NVIDIA L40S. In one live run it made {LIVE_RUN.decisions} decisions in {LIVE_RUN.seconds}{' '}
                seconds, about {LIVE_RUN.perSecond} a second.
              </p>
              <div className="s1-blink" aria-hidden="true">
                <span className="s1-blink__row">
                  <i className="is-s1" style={{ width: '16%' }} /> Manu-S1
                </span>
                <span className="s1-blink__row">
                  <i style={{ width: '100%' }} /> A blink of the eye, 100–400 ms
                </span>
              </div>
            </aside>
          </div>
        </section>

        <section className="s1-section s1-section--paper" id="proof">
          <header className="s1-head">
            <Eyebrow>Proof on a real case</Eyebrow>
            <h2>
              A real trial file, <em>read end to end.</em>
            </h2>
          </header>
          <CaseRun />
          <div className="s1-hc" data-snap>
            <table>
              <thead>
                <tr>
                  <th>Public High Court order</th>
                  <th className="hide-sm">The registry recorded</th>
                  <th>Manu-S1 read</th>
                  <th className="num">Sure</th>
                  <th className="num hide-sm">Time</th>
                </tr>
              </thead>
              <tbody>
                {HIGH_COURT.map(([court, registry, read, sure, ms], i) => (
                  <tr key={i}>
                    <td>{court}</td>
                    <td className="hide-sm">{registry}</td>
                    <td>
                      <b>{read}</b>
                    </td>
                    <td className="num">{sure}%</td>
                    <td className="num hide-sm">{ms} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="s1-section s1-never">
          <PaperGround tile="scales" />
          <div className="s1-never__inner">
            <header className="s1-head">
              <Eyebrow>What it will never do</Eyebrow>
              <h2>
                It is never trained <em>to judge people.</em>
              </h2>
            </header>
            <ul className="s1-never__list">
              {NEVER.map((item) => (
                <li key={item}>
                  <ShieldOff size={14} aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
            <p className="s1-never__why">
              <Scale size={15} aria-hidden="true" /> The Supreme Court’s proposed rules on AI in courts (July 2026) prohibit
              risk scoring, including bail eligibility.
            </p>
          </div>
        </section>

        <section className="s1-section s1-section--paper" id="run">
          <div className="s1-run-head">
            <header className="s1-head">
              <Eyebrow>For builders</Eyebrow>
              <h2>
                Open weights. <em>Run it yourself.</em>
              </h2>
            </header>
            <ButtonLink href={HF_URL} tone="outline" target="_blank" rel="noreferrer">
              Model card and weights
            </ButtonLink>
          </div>
          <div className="s1-builder">
            <CodeWindow />
            <dl className="s1-specs">
              {SPECS.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="closing-section">
          <PaperThreads tone="navy" seed={17} strands={8} pins={3} ring band={[0.34, 0.92]} className="closing-section__threads" />
          <div>
            <Eyebrow inverse>A research model</Eyebrow>
            <h2>
              Advocates check it
              <br />
              before a court relies on it.
            </h2>
            <p className="closing-section__proof">
              <span>
                <Check size={15} aria-hidden="true" /> Measured against answers labelled by practising advocates, first.
              </span>
            </p>
            <div className="s1-close-actions">
              <ButtonLink href={HF_URL} tone="paper" target="_blank" rel="noreferrer">
                Get Manu-S1
              </ButtonLink>
              <WaitlistButton tone="outline" className="s1-close-waitlist">
                Join the Manu waitlist
              </WaitlistButton>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
