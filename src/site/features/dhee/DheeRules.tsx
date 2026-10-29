import { useEffect, useRef, useState } from 'react';

import { MemoryField, type FieldStage } from '@/site/components/molecules/MemoryField';
import { FieldLegend } from '@/site/features/dhee/FieldLegend';

/**
 * Five rules, one picture.
 *
 * The field stays pinned while the rules scroll past it, and each rule changes
 * only the part of the picture it is about: reading fills in outlines, a graded
 * answer fills a core, a wrong answer turns red, time turns amber, and a new
 * model grows the whole field again from the same history. The fact in the
 * corner is the kind of line that rule is built on. On a phone nothing pins:
 * the field is shown once, whole, above the rules.
 */
const RULES: { title: string; copy: string; stage: FieldStage; fact: [string, string, string] }[] = [
  {
    title: 'Every moment is written down as a fact.',
    copy: 'Page 24 for thirty-eight seconds. Vector subtraction, at Apply, wrong. Nine kinds of moment, each one typed, none of them a summary, and nothing rounded into a score.',
    stage: 'facts',
    fact: ['read', 'Kinematics · p. 24', '38 s'],
  },
  {
    title: 'Reading is not learning.',
    copy: 'Turning pages outlines a topic; it never fills one in. A key point only fills when you answer on it, and a question that makes you apply an idea proves more than one that asks you to recall it.',
    stage: 'exposure',
    fact: ['quiz', 'Second law · Apply', 'right'],
  },
  {
    title: 'Not asked is not the same as weak.',
    copy: 'Two of seven points checked is two of seven, not 28%. The other five stay empty until someone asks. Red is kept for the ideas you actually got wrong, and only the idea, never the whole chapter.',
    stage: 'unknown',
    fact: ['quiz', 'Relative velocity · Apply', 'wrong'],
  },
  {
    title: 'It knows when you will start to forget.',
    copy: 'A right answer spaced from the last one makes a memory last longer; five in one minute count once. When something you had begins to slip, it turns amber: two minutes of review, not another lesson.',
    stage: 'fading',
    fact: ['due', 'Torque · last right 9 days ago', 'review'],
  },
  {
    title: 'It gets better without forgetting you.',
    copy: 'Because only facts are kept, where you stand is worked out fresh every time you open Tura. When the model improves, your whole history is read again under the new one, so nothing drifts.',
    stage: 'full',
    fact: ['replay', 'Every scene, re-scored', 'today'],
  },
];

/* Below this the rules are a plain column and the field is shown once, whole. */
const PINNED_QUERY = '(min-width: 1024px)';

export function DheeRules() {
  // Unpinned on the first render, which is also the prerendered one: there is no
  // viewport at build time, and hydration must start from the same markup. The
  // effect below settles it a frame later.
  const [pinned, setPinned] = useState(false);
  const [active, setActive] = useState(0);
  const [replay, setReplay] = useState(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);
  const lastActive = useRef(0);

  useEffect(() => {
    const query = window.matchMedia(PINNED_QUERY);
    const update = () => setPinned(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!pinned) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const line = window.innerHeight * 0.55;
      let next = 0;
      stepRefs.current.forEach((step, index) => {
        if (step && step.getBoundingClientRect().top <= line) next = index;
      });
      if (next !== lastActive.current) {
        if (next === RULES.length - 1) setReplay((value) => value + 1);
        lastActive.current = next;
        setActive(next);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [pinned]);

  const rule = pinned ? RULES[active] : RULES[RULES.length - 1];

  return (
    <section className="dhee-rules" id="how-it-remembers" aria-labelledby="dhee-rules-title">
      <header className="dhee-section-head">
        <p className="dhee-kicker">How it remembers</p>
        <h2 id="dhee-rules-title">Memory shaped like <em>learning.</em></h2>
        <p>Five rules the tutor’s memory runs by. Watch what each one does to the same library.</p>
      </header>

      <div className="dhee-rules__body">
        <div className="dhee-rules__stage">
          <div className="dhee-rules__panel">
            <MemoryField stage={rule.stage} replay={replay} className="dhee-rules__canvas" label={`The Insights field, showing: ${rule.title}`} />
            <div className="dhee-rules__fact" aria-live="polite">
              <code>{rule.fact[0]}</code>
              <span>{rule.fact[1]}</span>
              <em>{rule.fact[2]}</em>
            </div>
            <FieldLegend className="dhee-rules__legend" />
          </div>
        </div>

        <ol className="dhee-rules__steps">
          {RULES.map((item, index) => (
            <li
              data-snap
              key={item.title}
              ref={(node) => { stepRefs.current[index] = node; }}
              className={pinned && index === active ? 'is-active' : undefined}
            >
              <span className="dhee-rules__number">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
