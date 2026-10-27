import type { ReactNode } from 'react';
import { AlarmClock, ArrowUp, Brain, Check, ChevronRight, FileText, Folder, Moon, Paperclip, PencilLine, Search, Settings2, ShieldCheck, Sparkles, SquarePen, Terminal } from 'lucide-react';

import { useReveal } from '@/site/features/chamber/useReveal';

/**
 * root's own screens, drawn in HTML from the app's real parts (the sidebar, a
 * session's trace lines and footer, the composer, the Jev and Memory panels,
 * Settings' rows) the way Chamber's page draws its board. Dark, ink-only, like
 * the app. Every line is something root really shows; the lines come in one
 * after another once the screen scrolls into view, and are all there in the
 * prerendered page.
 */
const STEP_MS = 420;

function reveal(index: number, start = 0) {
  return { '--delay': `${start + index * STEP_MS}ms` } as React.CSSProperties;
}

type Step = { icon: 'memory' | 'read' | 'edit' | 'run' | 'skill'; label: string; detail?: string; add?: number; del?: number };

const ICONS = {
  memory: <Brain size={14} />,
  read: <FileText size={14} />,
  edit: <PencilLine size={14} />,
  run: <Terminal size={14} />,
  skill: <Sparkles size={14} />,
};

function Steps({ steps, start = 0 }: { steps: Step[]; start?: number }) {
  return (
    <ul className="ra-steps">
      {steps.map((step, index) => (
        <li key={index} className="ra-reveal" style={reveal(index, start)}>
          <span className="ra-steps__icon">{ICONS[step.icon]}</span>
          <span className="ra-steps__label">{step.label}</span>
          {step.detail ? <span className="ra-steps__detail">{step.detail}</span> : null}
          {step.add !== undefined ? (
            <span className="ra-steps__diff"><ins>+{step.add}</ins> <del>−{step.del}</del></span>
          ) : (
            <ChevronRight size={13} className="ra-steps__chev" />
          )}
        </li>
      ))}
    </ul>
  );
}

function Turn({ prompt, steps, reply, footer }: { prompt: string; steps: Step[]; reply: string; footer: ReactNode }) {
  return (
    <div className="ra-turn">
      <div className="ra-user">{prompt}</div>
      <Steps steps={steps} />
      <p className="ra-reply ra-reveal" style={reveal(steps.length)}>{reply}</p>
      <div className="ra-footer ra-reveal" style={reveal(steps.length + 1)}>{footer}</div>
    </div>
  );
}

function Composer({ placeholder, folder }: { placeholder: string; folder: string }) {
  return (
    <div className="ra-composer">
      <span className="ra-composer__text">{placeholder}</span>
      <div className="ra-composer__row">
        <Paperclip size={14} />
        <span className="ra-chip"><Folder size={12} /> {folder}</span>
        <span className="ra-chip"><ShieldCheck size={12} /> Ask before acting</span>
        <span className="ra-composer__send" aria-hidden="true"><ArrowUp size={15} /></span>
      </div>
    </div>
  );
}

function Rail() {
  return (
    <aside className="ra-rail">
      <div className="ra-rail__brand">
        <img className="ra-rail__mark" src="/brand/sankhya-mark.png" alt="" width="22" height="22" />
        <strong className="ra-rail__word">root</strong>
        <Search size={15} className="ra-rail__search" />
      </div>
      <nav>
        <span><SquarePen size={15} /> New session</span>
        <span><AlarmClock size={15} /> Schedules</span>
      </nav>
      <p className="ra-rail__label">Workspaces</p>
      <ul>
        <li><Folder size={13} /> acme-api</li>
        <li className="ra-rail__session is-active">Retry failed payments<i className="ra-dot" /></li>
        <li className="ra-rail__session">Refund endpoint</li>
        <li className="ra-rail__session">Settle in paise everywhere</li>
        <li><Folder size={13} /> acme-web</li>
        <li><Folder size={13} /> acme-ios</li>
      </ul>
      <div className="ra-rail__foot">
        <span><Moon size={15} /> Dark</span>
        <span><Settings2 size={15} /> Settings</span>
      </div>
    </aside>
  );
}

function Window({ children, title, className }: { children: ReactNode; title: string; className?: string }) {
  const { ref, phase } = useReveal<HTMLElement>();
  return (
    <figure ref={ref} className={`ra-window is-${phase}${className ? ` ${className}` : ''}`}>
      <div className="ra-window__bar" aria-hidden="true"><span /><span /><span /><em>{title}</em></div>
      {children}
    </figure>
  );
}

/** The whole app: the sidebar, a session at work, the composer. */
export function RootAppScreen() {
  return (
    <Window title="root" className="ra-window--app">
      <div className="ra-app">
        <Rail />
        <section className="ra-main">
          <header className="ra-main__head">
            <strong>Retry failed payments</strong>
            <span className="ra-chip">deepseek-v4.1-flash</span>
          </header>
          <div className="ra-main__body">
            <Turn
              prompt="Failed payments should retry three times over 48 hours, then email the customer."
              steps={[
                { icon: 'memory', label: 'Checked memory', detail: 'tests run with uv run pytest -q' },
                { icon: 'read', label: 'Read 2 files, searched code', detail: 'webhook.py · retry.py' },
                { icon: 'edit', label: 'Edited retry.py', add: 22, del: 9 },
                { icon: 'run', label: 'Ran a command', detail: 'pytest tests/billing · 38 passed' },
              ]}
              reply="Failed payments now retry three times over 48 hours, then email the customer. I ran the billing tests: all 38 pass."
              footer={
                <>
                  <span>7:31 PM</span>
                  <span>41s</span>
                  <span>1 file changed</span>
                  <span className="ra-verified"><Check size={12} /> verified</span>
                  <span className="ra-link">Restore files</span>
                  <span className="ra-link">Copy</span>
                </>
              }
            />
          </div>
          <Composer placeholder="Add a test for the email…" folder="acme-api" />
        </section>
      </div>
    </Window>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="ra-panel">
      <p className="ra-panel__title">{title}</p>
      {children}
    </aside>
  );
}

/** A long task on a small model, with the Jev panel open beside it. */
export function JevScreen() {
  const decisions = [
    ['step 29 · act', 'call Grep', 'Grep 0.91 · ReadFile 0.06 · reply 0.03', '180 ms'],
    ['step 30 · act', 'call StrReplaceFile', 'StrReplaceFile 0.88 · reply 0.07', '160 ms'],
    ['step 31 · check', 'not done: 7 files still use it', 'continue 0.93 · reply 0.07', '150 ms'],
  ];
  return (
    <Window title="root · a small model">
      <div className="ra-split">
        <section className="ra-main ra-main--compact">
          <div className="ra-user">Move the settings page to the new form components.</div>
          <Steps
            steps={[
              { icon: 'read', label: 'Searched code', detail: 'OldForm · 9 files' },
              { icon: 'edit', label: 'Edited Profile.tsx', add: 31, del: 44 },
              { icon: 'edit', label: 'Edited 7 files', add: 182, del: 240 },
              { icon: 'run', label: 'Ran a command', detail: 'npm test · 212 passed' },
            ]}
          />
        </section>
        <Panel title="Jev · recent decisions">
          {decisions.map(([step, directive, ranked, ms], index) => (
            <div key={step} className="ra-decision ra-reveal" style={reveal(index, 300)}>
              <span className="ra-faint">{step}</span>
              <strong>{directive}</strong>
              <span className="ra-mono">{ranked}</span>
              <span className="ra-faint">{ms}</span>
            </div>
          ))}
        </Panel>
      </div>
    </Window>
  );
}

/** The Memory panel: what Dhee keeps, typed and scoped. */
export function MemoryScreen() {
  const memories = [
    ['project · convention', 'Money is integer paise, never floats.'],
    ['project · decision', 'Payment retries live in the webhook; the apps never retry.'],
    ['project · command', 'Tests run with uv run pytest -q.'],
    ['yours · preference', 'Keep pull requests small; one concern each.'],
  ];
  return (
    <Window title="root · new session, next week">
      <div className="ra-split">
        <section className="ra-main ra-main--compact">
          <div className="ra-user">Add a refund endpoint.</div>
          <Steps
            steps={[
              { icon: 'memory', label: 'Checked memory', detail: '3 memories for this request' },
              { icon: 'edit', label: 'Edited refunds.py', add: 46, del: 0 },
              { icon: 'run', label: 'Ran a command', detail: 'pytest · 41 passed' },
            ]}
          />
          <p className="ra-reply ra-reveal" style={reveal(3)}>Refunds are in, in paise like the rest of billing, with tests.</p>
        </section>
        <Panel title="Memory · acme-api">
          {memories.map(([tag, text], index) => (
            <div key={text} className="ra-memory ra-reveal" style={reveal(index, 200)}>
              <span className="ra-tag">{tag}</span>
              <span>{text}</span>
            </div>
          ))}
        </Panel>
      </div>
    </Window>
  );
}

/** What root learned from its own work: a lesson kept, and the skills it keeps measuring. */
export function LearningScreen() {
  const skills = [
    ['migrate-a-table', 'Write the migration, run it on a copy, then the model change and its tests.', '14 of 15 turns clean'],
    ['run-billing-tests', 'Billing tests need the Stripe fixtures: uv run pytest -q tests/billing.', '22 of 22 turns clean'],
  ];
  return (
    <Window title="root · Settings · Agent">
      <div className="ra-learning">
        <div className="ra-learned ra-reveal" style={reveal(0)}>
          <Sparkles size={13} />
          <span>Learned and kept 1 lesson — skill “migrate-a-table”.</span>
        </div>
        <p className="ra-learning__head">Skills root learned</p>
        {skills.map(([name, description, record], index) => (
          <div key={name} className="ra-skill ra-reveal" style={reveal(index + 1)}>
            <div>
              <strong className="ra-mono">{name}</strong>
              <span>{description}</span>
            </div>
            <span className="ra-faint">{record}</span>
          </div>
        ))}
        <p className="ra-learning__head">Runs without asking</p>
        <div className="ra-skill ra-reveal" style={reveal(3)}>
          <div>
            <strong className="ra-mono">uv run pytest</strong>
            <span>You approved it 3 times.</span>
          </div>
          <span className="ra-pill">Remove</span>
        </div>
      </div>
    </Window>
  );
}
