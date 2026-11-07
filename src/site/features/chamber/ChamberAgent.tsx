import { useState } from 'react';

import './chamber-agent.css';

/**
 * Setting Chamber up by asking a coding agent: one command adds the Chamber skill, then the
 * person asks in plain words. Every row here is something the skill really does
 * (sankhya-ai/chamber, skills/chamber/SKILL.md).
 */
const INSTALLS = [
  { agent: 'Claude Code', command: '/plugin install chamber --marketplace sankhya-ai/chamber' },
  { agent: 'Codex', command: 'codex plugin marketplace add sankhya-ai/chamber && codex plugin add chamber@chamber' },
  { agent: 'Cursor and others', command: 'npx skills add sankhya-ai/chamber' },
] as const;

const ASKS = [
  ['“Set up Chamber for our team”', 'Installs the Mac app after checking it is signed and notarized, creates your chamber on your free Cloudflare account and connects the project you are in.'],
  ['“Invite Maya”', 'Writes Maya’s invite: a short message with a join link that works once and expires after three days. You send it to her.'],
  ['You paste the invite you were sent', 'Joins your team’s chamber under the name your admin chose, then asks which of your projects to connect.'],
  ['“Open Chamber”', 'Opens the app, and installs it first if it isn’t there.'],
] as const;

function Command({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(command).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      },
      () => {},
    );
  };
  return (
    <div className="cx-agent__command">
      <code>{command}</code>
      <button type="button" onClick={copy} aria-label={`Copy ${command}`}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

export function ChamberAgent() {
  return (
    <section className="cx-agent" id="agent" aria-labelledby="cx-agent-title">
      <header className="dhee-section-head">
        <p className="dhee-kicker">Let your agent do it</p>
        <h2 id="cx-agent-title">Ask Claude Code <em>to set it up.</em></h2>
        <p>
          Add the Chamber skill once. After that, ask in any session and your agent does the setup. You sign in to
          Cloudflare once, and only if you are the one creating the chamber.
        </p>
      </header>
      <div className="cx-agent__installs">
        {INSTALLS.map((install) => (
          <div key={install.agent} className="cx-agent__install">
            <p>{install.agent}</p>
            <Command command={install.command} />
          </div>
        ))}
      </div>
      <dl className="cx-agent__asks">
        {ASKS.map(([ask, does]) => (
          <div key={ask}>
            <dt>{ask}</dt>
            <dd>{does}</dd>
          </div>
        ))}
      </dl>
      <p className="cx-agent__note">
        Codex asks before it downloads anything, so expect a few approvals. Whatever your agent does shows up in the
        app straight away, and anything you do in the app works from your agent too.
      </p>
    </section>
  );
}
