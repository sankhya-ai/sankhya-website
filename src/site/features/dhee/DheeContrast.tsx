/**
 * The same twenty minutes, remembered two ways.
 *
 * A general memory layer is built for an assistant that has to recall what was
 * said — a coding agent that must not forget the decision made yesterday. It
 * keeps sentences and summaries and hands back whatever is most similar. For a
 * tutor that shape fails in four specific places, and the left card marks each
 * one where it happens rather than listing them in the abstract.
 *
 * The right card is what the tutor actually keeps: typed moments, a graded
 * answer tied to the key point it tested, and preferences only where the
 * student said them — with the words they used.
 */
const SUMMARY = [
  { text: 'Student is studying kinematics and', mark: null },
  { text: 'seemed confused about relative velocity.', mark: 1 },
  { text: 'Prefers visual explanations and a slower pace.', mark: 2 },
  { text: 'Good progress,', mark: null },
  { text: 'about 60% through the chapter.', mark: 3 },
] as const;

const FLAWS = [
  { mark: 1, title: 'Confused about what, exactly?', copy: 'Relative velocity is seven key points. “Confused” cannot tell the tutor which one to teach again.' },
  { mark: 2, title: 'Guessed, then kept', copy: 'Inferred from the tone of one message, and now it shapes every lesson after.' },
  { mark: 3, title: 'Pages turned, not things known', copy: 'Reading the chapter filled the bar. Nothing was asked, so nothing was learned.' },
  { mark: 4, title: 'Written once, wrong forever', copy: 'A summary cannot be re-scored. When the model improves, the note stays as it was.' },
] as const;

const FACTS = [
  { kind: 'read', subject: 'Relative velocity · p. 24', value: '38 s' },
  { kind: 'read', subject: 'Relative velocity · p. 25', value: '52 s' },
  { kind: 'quiz', subject: 'Frame of reference', value: 'Understand · right', tone: 'solid' },
  { kind: 'quiz', subject: 'Subtracting velocity vectors', value: 'Apply · wrong', tone: 'shaky' },
  { kind: 'pace', subject: '“can you go slower?”', value: 'slow', tone: 'said' },
  { kind: 'modality', subject: '“draw it for me”', value: 'visual', tone: 'said' },
] as const;

const DIFFERENCES = [
  ['What one memory is', 'A sentence, or a summary of several', 'A typed fact about one moment'],
  ['What counts as progress', 'Pages covered, blended into a score', 'Only a graded answer moves mastery'],
  ['A topic nobody has tested', 'Looks the same as a weak one', 'Stays empty until someone asks'],
  ['Time', 'The newest memory wins', 'Forgetting is modelled, point by point'],
  ['How it learns your preferences', 'Inferred from how you sound', 'Only from what you actually said'],
] as const;

export function DheeContrast() {
  return (
    <section className="dhee-contrast" aria-labelledby="dhee-contrast-title">
      <header className="dhee-section-head">
        <p className="dhee-kicker">Why a general memory is not enough</p>
        <h2 id="dhee-contrast-title">The same twenty minutes, <em>remembered two ways.</em></h2>
        <p>
          A student reads two pages on relative velocity, answers two questions (one right, one wrong) and asks
          the tutor to slow down and draw it. Here is what each kind of memory keeps.
        </p>
      </header>

      <div className="dhee-contrast__cards" data-snap>
        <article className="dhee-card dhee-card--general">
          <header>
            <span className="dhee-card__tag">General agent memory</span>
            <span className="dhee-card__meta">memory · summary</span>
          </header>
          <blockquote className="dhee-card__note">
            {SUMMARY.map(({ text, mark }) => (
              mark === null
                ? <span key={text}>{text} </span>
                : <mark key={text}>{text}<sup>{mark}</sup> </mark>
            ))}
            <sup className="dhee-card__whole">4</sup>
          </blockquote>
          <ol className="dhee-flaws">
            {FLAWS.map(({ mark, title, copy }) => (
              <li key={mark}>
                <span aria-hidden="true">{mark}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        <article className="dhee-card dhee-card--tutor">
          <header>
            <span className="dhee-card__tag">Dhee, as a tutor’s memory</span>
            <span className="dhee-card__meta">6 facts · 0 summaries</span>
          </header>
          <ul className="dhee-facts">
            {FACTS.map((fact) => (
              <li key={`${fact.kind}-${fact.subject}`} className={'tone' in fact ? `is-${fact.tone}` : undefined}>
                <code>{fact.kind}</code>
                <span>{fact.subject}</span>
                <em>{fact.value}</em>
              </li>
            ))}
          </ul>
          <div className="dhee-derived">
            <p>Worked out from those facts, not stored</p>
            <dl>
              <div><dt>Subtracting velocity vectors</dt><dd className="is-shaky">needs another look</dd></div>
              <div><dt>Relative velocity</dt><dd>2 of 7 key points checked · 5 not asked yet</dd></div>
              <div><dt>Next lesson</dt><dd>slower, with a diagram, because you asked</dd></div>
            </dl>
          </div>
        </article>
      </div>

      <div className="dhee-differences" data-snap role="table" aria-label="General agent memory compared with Dhee for tutoring">
        <div className="dhee-differences__row dhee-differences__row--head" role="row">
          <span role="columnheader" />
          <span role="columnheader">General agent memory</span>
          <span role="columnheader">Dhee, for a tutor</span>
        </div>
        {DIFFERENCES.map(([question, general, dhee]) => (
          <div className="dhee-differences__row" role="row" key={question}>
            <span role="rowheader">{question}</span>
            <span role="cell">{general}</span>
            <span role="cell">{dhee}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
