import { ButtonLink } from '@/site/components/atoms/ButtonLink';
import { MetricsRow, type Metric } from '@/site/components/molecules/MetricsRow';
import { SiteFooter } from '@/site/components/organisms/SiteFooter';
import { SiteHeader } from '@/site/components/organisms/SiteHeader';
import { S1Benchmarks, S1Hosted } from '@/site/features/tura-s1/S1Benchmarks';
import { S1Decision } from '@/site/features/tura-s1/S1Decision';
import { S1_HF } from '@/site/features/tura-s1/links';

/**
 * Tura-S1-4B, the decision model we trained for Tura's agent.
 *
 * Written the way Microsoft introduced its decision model: name the category
 * first (a model that scores options rather than writing an answer), then what
 * it is for, then the results against named models, then how to run it. Every
 * number is from the model card and the runs behind it; the decision in the
 * hero is labelled illustrative.
 */
const METRICS: readonly Metric[] = [
  { value: 98.5, decimals: 1, suffix: '%', label: 'Agent-step routing', note: 'Which tool next, or reply, on Tura decisions it never saw. The base: 49.6%.' },
  { value: 90, decimals: 1, suffix: '%', label: 'Tura’s product decisions', note: 'Routing, turn end and reply mode, held out. The base: 41.8%.' },
  { value: 0, decimals: 0, suffix: '', label: 'Tokens generated', note: 'Every option is scored in one forward pass.' },
  { value: 178, decimals: 0, suffix: ' ms', label: 'Per decision', note: 'Median, on one NVIDIA L40S, at about 2,000 tokens of state.' },
];

const STEPS = [
  { title: 'A state', copy: 'Whatever the decision depends on: a conversation, a document, an agent’s steps so far. Up to 4,096 tokens in training.' },
  { title: 'A typed question', copy: 'Yes or no, a choice among up to 16 options, or a score. The options are part of the question, so the answer can only be one of them.' },
  { title: 'A probability for each', copy: 'One forward pass reads the option letters off the model’s logits. Nothing is generated, so nothing has to be parsed.' },
] as const;

const MIX = [
  { label: 'Tura’s own agent decisions', detail: 'Tool routing, turn end, reply mode', count: 8865, tone: 'tura' },
  { label: 'General decisions', detail: 'Documents and questions, double-checked', count: 20000, tone: 'general' },
  { label: 'Public tool calling', detail: 'ToolACE, Glaive, Hermes, When2Call', count: 5000, tone: 'tools' },
] as const;
const MIX_TOTAL = MIX.reduce((sum, part) => sum + part.count, 0);

const USES = [
  ['Tool routing', 'Before each step, choose the next tool or decide to reply, and act only when the top option is sure.'],
  ['Turn-end checks', 'Ask whether the agent has done what the turn needs before it stops.'],
  ['Reply mode', 'Decide how to answer a message: explain, quiz, draw, or ask back.'],
  ['Guardrails', 'Check a draft against a written rule before it is sent.'],
  ['Labelling', 'Sort messages, tickets or documents into fixed classes, with a probability you can threshold.'],
  ['Model routing', 'Send each request to the cheapest model that can do it well.'],
] as const;

const CODE = [
  '# install JevK5’s runtime, then serve Tura-S1',
  'pip install git+https://github.com/allebee/jevk5',
  'jevk5-serve --model AshishDwi99/tura-s1-4b --port 8090',
  '',
  '# or in Python',
  'from jevk5.runtime import JevK5',
  'model = JevK5("AshishDwi99/tura-s1-4b")',
];

const QUESTIONS = [
  ['What is a decision model?', 'A model that scores a fixed set of options instead of writing an answer. You give it a state and a question with its options; it gives back a probability for every option in one forward pass. Agents make hundreds of these small decisions, and a decision model makes each one quickly, cheaply and in a form that cannot fail to parse.'],
  ['What is Tura-S1-4B built on?', 'Plumb-4B, which is JevK5 v0.2 with a LoRA on Qwen3.5-4B. We trained one more LoRA on 33,756 questions and merged it. Tura-S1 keeps JevK5’s format, so JevK5’s runtime serves it unchanged.'],
  ['Was it trained on the benchmarks it is scored on?', 'No. Every training item was checked against JevBench’s 231 public items, by exact match and by shared eight-word sequences, and matches were removed. No JevBench item was trained on, tuned on or used to choose the model, and the rule for choosing a checkpoint was fixed before JevBench was run once.'],
  ['How well calibrated is it?', 'One temperature, 1.48, fitted on held-out development data, ships with the weights. On JevBench public its expected calibration error is 0.036, lower than its base’s 0.053: when it says 0.9, it is right about nine times in ten.'],
  ['What does it need to run?', 'About 9 GB in bf16 and a GPU. It reads English, and answers up to 16 options in one pass; more go through JevK5’s knockout, several passes at a time.'],
  ['Can I use it commercially?', 'Yes. The weights are Apache-2.0, with notices for the weights, code and data it builds on.'],
] as const;

export function TuraS1Page() {
  return (
    <div className="lab-tone dhee-page ts1-page" id="top">
      <SiteHeader />
      <main>
        <section className="ts1-hero" aria-labelledby="ts1-hero-title">
          <div className="ts1-hero__copy">
            <p className="dhee-hero__eyebrow"><span aria-hidden="true" />Tura-S1-4B · open weights, from Sankhya AI Labs</p>
            <h1 id="ts1-hero-title">A decision in <em>one forward pass.</em></h1>
            <p>
              Tura-S1 reads a state and scores every option at once: which tool next, whether the turn is done, how
              to reply. We trained it on the decisions inside Tura’s own agent, and it gets them right twice as often
              as the model it came from.
            </p>
            <div className="ts1-hero__actions">
              <ButtonLink href={S1_HF} target="_blank" rel="noopener noreferrer">Get it on Hugging Face</ButtonLink>
              <ButtonLink href="#results" tone="outline" arrow={false}>See the results</ButtonLink>
            </div>
          </div>
          <S1Decision />
        </section>

        <MetricsRow metrics={METRICS} label="Tura-S1-4B in numbers" />

        <section className="ts1-why" aria-labelledby="ts1-why-title">
          <header className="dhee-section-head">
            <p className="dhee-kicker">Why a decision model</p>
            <h2 id="ts1-why-title">An agent decides far more often <em>than it writes.</em></h2>
            <p>
              Before every step, an agent decides: look something up, or answer? Is this turn finished? Should the
              reply explain, or ask? Asking a chat model each time means waiting for it to write, then parsing what
              it wrote. A decision model answers the question directly, with a probability for every option, in the
              time it takes to read the state once.
            </p>
          </header>
          <ol className="ts1-steps">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <span className="chamber-start__number">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <S1Benchmarks />
        <S1Hosted />

        <section className="ts1-training" aria-labelledby="ts1-training-title">
          <header className="dhee-section-head">
            <p className="dhee-kicker">How we trained it</p>
            <h2 id="ts1-training-title">33,756 decisions, <em>a quarter of them our own.</em></h2>
            <p>
              One LoRA, rank 16, one epoch on Plumb-4B. Tura’s decisions were labelled by what the agent actually
              did, by its written rules, and by an open-weight teacher, with personal data removed.
            </p>
          </header>
          <div className="ts1-mix">
            <div className="ts1-mix__bar" aria-hidden="true">
              {MIX.map((part) => <i key={part.label} className={`is-${part.tone}`} style={{ flexGrow: part.count }} />)}
            </div>
            <dl>
              {MIX.map((part) => (
                <div key={part.label} className={`is-${part.tone}`}>
                  <dt>{part.label}</dt>
                  <dd><strong>{part.count.toLocaleString('en-GB')}</strong> · {Math.round((part.count / MIX_TOTAL) * 100)}% · {part.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="ts1-uses" aria-labelledby="ts1-uses-title">
          <header className="dhee-section-head">
            <p className="dhee-kicker">What it is for</p>
            <h2 id="ts1-uses-title">Wherever an agent <em>has to choose.</em></h2>
          </header>
          <ul className="ts1-uses__grid">
            {USES.map(([title, copy]) => (
              <li key={title}><h3>{title}</h3><p>{copy}</p></li>
            ))}
          </ul>
        </section>

        <section className="ts1-start" aria-labelledby="ts1-start-title">
          <header className="dhee-section-head">
            <p className="dhee-kicker">Get started</p>
            <h2 id="ts1-start-title">Two commands <em>to your first decision.</em></h2>
            <p>It serves the same request as a hosted decision API, so an agent that calls one can call it instead.</p>
          </header>
          <pre className="ts1-code"><code>
            {CODE.map((line, index) => (
              <span key={index} className={line.startsWith('#') ? 'ts1-code__comment' : undefined}>{line}{'\n'}</span>
            ))}
          </code></pre>
        </section>

        <section className="faq-section" id="questions">
          <header className="faq-section__heading">
            <p className="dhee-kicker">Questions</p>
            <h2>About Tura-S1.</h2>
          </header>
          <div className="faq-section__list">
            {QUESTIONS.map(([question, answer]) => (
              <details key={question}>
                <summary>{question} <i>+</i></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="chamber-closing">
          <h2>Open weights. <em>Built for agents.</em></h2>
          <p>Tura-S1-4B is free to use, change and ship, under Apache-2.0.</p>
          <div className="dhee-closing__actions">
            <ButtonLink href={S1_HF} target="_blank" rel="noopener noreferrer">Get it on Hugging Face</ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
