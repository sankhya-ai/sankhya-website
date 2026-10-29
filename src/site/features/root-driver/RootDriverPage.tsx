import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { ButtonLink } from '@/site/components/atoms/ButtonLink';
import { GitHubMark } from '@/site/components/atoms/GitHubMark';
import { SiteFooter } from '@/site/components/organisms/SiteFooter';
import { SiteHeader } from '@/site/components/organisms/SiteHeader';
import '@/site/features/root-driver/root-driver.css';

/**
 * root-driver, laid out the way cua-driver presents itself: what it is in one
 * line, then a quickstart that ends in a result you can check (6 × 7 = 42 in
 * Calculator, with your cursor where you left it), the agents it connects to,
 * its tools, how it works and what it cannot do. Every line is from the
 * repository's README (github.com/tura-learn/root-driver).
 *
 * There is no GitHub release yet, so the one-line installer 404s today; the
 * page says so and gives the build from source until the first release.
 */
const GITHUB = 'https://github.com/tura-learn/root-driver';
const INSTALL = `curl -fsSL ${GITHUB}/releases/latest/download/install.sh | bash`;
const FROM_SOURCE = `git clone ${GITHUB}.git\ncd root-driver\nmake install`;

const AGENTS = [
  ['Claude Code', 'root-driver install claude', 'An MCP entry for your user, and a skill'],
  ['Codex', 'root-driver install codex', 'An MCP server in ~/.codex/config.toml, and a skill'],
  ['Cursor', 'root-driver install cursor', '~/.cursor/mcp.json'],
  ['Claude desktop', 'root-driver install claude-desktop', 'claude_desktop_config.json'],
  ['Windsurf', 'root-driver install windsurf', '~/.codeium/windsurf/mcp_config.json'],
  ['Gemini CLI', 'root-driver install gemini', '~/.gemini/settings.json'],
  ['root', 'Nothing to do', 'Built in: Settings → Plugins → Mac apps'],
  ['Anything else', '~/.local/bin/root-driver mcp', 'Any agent that speaks MCP over stdio'],
] as const;

const TOOLS = [
  { kind: 'Look', note: 'Never changes anything', tone: 'blue', tools: ['get_window_state', 'capture_window', 'zoom_region', 'vision_ground', 'list_apps', 'list_windows', 'verify_action', 'snapshot_diff'] },
  { kind: 'Operate', note: 'Clicks, keys and fields', tone: 'sage', tools: ['click', 'double_click', 'right_click', 'drag', 'scroll', 'set_value', 'type_text', 'press_key', 'hotkey', 'launch_app', 'bring_to_front'] },
  { kind: 'Close', note: 'Marked destructive', tone: 'rose', tools: ['close_window', 'kill_app'] },
] as const;

const HOW = [
  ['One background driver', 'macOS charges a permission to the app responsible for a process. root-driver runs as RootDriver.app, a background app with no menu, so Accessibility and Screen Recording are granted once, in its own name, and never to your terminal or editor.'],
  ['One loop, shared', 'Every agent talks to the same loop over one unix socket. A snapshot taken by one call is good in the next, whichever agent made it.'],
  ['Only you', 'The socket is readable by your user alone, so only your own agents can drive your apps.'],
  ['In the background', 'Clicks and keys go to the target app’s own process, and fields are set through accessibility. Targets are found again in the live tree on every action; stored coordinates are never trusted.'],
] as const;

const LIMITS = [
  'Only the current Space. macOS lists accessibility windows for the current Space alone, so a window on another Space, or a minimised one, reads empty until bring_to_front brings it over.',
  'macOS only. cua-driver covers Windows and Linux too.',
  'Password fields are never typed into.',
] as const;

function Code({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };
  return (
    <div className="rd-code">
      <pre aria-label={label}><code>{text}</code></pre>
      <button type="button" onClick={copy} aria-label={copied ? 'Copied' : `Copy: ${label}`}>
        {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
      </button>
    </div>
  );
}

export function RootDriverPage() {
  return (
    <div className="lab-tone dhee-page rd-page" id="top">
      <SiteHeader />
      <main>
        <section className="rd-hero" aria-labelledby="rd-hero-title">
          <div className="rd-hero__copy">
            <p className="dhee-hero__eyebrow"><span aria-hidden="true" />root-driver · open source, from Sankhya AI Labs</p>
            <h1 id="rd-hero-title">Let any agent use your Mac’s apps <em>without taking your Mac.</em></h1>
            <p>
              root-driver reads a window through the accessibility tree, then clicks, types and fills forms in the
              background. Your cursor stays put and focus never moves. One signed app, one command, every agent.
            </p>
            <div className="dhee-hero__actions">
              <ButtonLink href={GITHUB} target="_blank" rel="noopener noreferrer" className="dhee-github">
                <GitHubMark /> View on GitHub
              </ButtonLink>
              <ButtonLink href="#install" tone="outline" arrow={false}>Install</ButtonLink>
            </div>
            <p className="rd-hero__facts">macOS 13 or later · MCP over stdio · native Swift, no runtime to install · signed with a Developer ID</p>
          </div>
          <figure className="rd-hero__diagram">
            <img src="/art/root-driver/how-it-works-light.svg" alt="Any agent runs root-driver; one background RootDriver.app holds the macOS permissions and drives your apps" />
          </figure>
        </section>

        <section className="rd-section" id="install" aria-labelledby="rd-start-title">
          <header className="dhee-section-head">
            <p className="dhee-kicker">Quickstart</p>
            <h2 id="rd-start-title">From install to <em>6 × 7 = 42.</em></h2>
            <p>Install root-driver, connect your agent, and have it work out a sum in Calculator while you keep typing somewhere else.</p>
          </header>

          <ol className="rd-steps">
            <li data-snap>
              <span className="rd-steps__no">01</span>
              <div>
                <h3>Install</h3>
                <p>One line puts RootDriver.app in ~/Applications, links the command, adds it to every agent it finds on this Mac, and opens it once so macOS can ask for its permissions.</p>
                <Code text={INSTALL} label="Install root-driver" />
                <p className="rd-note">
                  The installer fetches the latest GitHub release, and the first release is not out yet. Until it is,
                  build from source, which does the same:
                </p>
                <Code text={FROM_SOURCE} label="Build and install from source" />
              </div>
            </li>
            <li data-snap>
              <span className="rd-steps__no">02</span>
              <div>
                <h3>Allow it, once</h3>
                <p>macOS asks for <b>Accessibility</b> and <b>Screen Recording</b> in the name of <b>Root Driver</b>. Grant both. Every agent shares them, so nothing needs them granted to your terminal or editor.</p>
                <Code text="root-driver doctor" label="Check permissions and setup" />
              </div>
            </li>
            <li data-snap>
              <span className="rd-steps__no">03</span>
              <div>
                <h3>Connect your agent</h3>
                <p>The installer already connected the agents it found. To add one later, run its line from the table below. It only adds its own entry, running it twice changes nothing, and <code>root-driver uninstall</code> takes it out.</p>
              </div>
            </li>
            <li data-snap>
              <span className="rd-steps__no">04</span>
              <div>
                <h3>Ask</h3>
                <blockquote>Open Calculator, work out 6 × 7, and check that it shows 42.</blockquote>
              </div>
            </li>
            <li data-snap>
              <span className="rd-steps__no">05</span>
              <div>
                <h3>Check the result</h3>
                <p>Calculator shows 42, and your agent reports it from a fresh look at the window. Your own window, focus and cursor are where you left them.</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="rd-section" aria-labelledby="rd-agents-title">
          <header className="dhee-section-head">
            <p className="dhee-kicker">Agents</p>
            <h2 id="rd-agents-title">Every agent on the Mac, <em>one grant.</em></h2>
          </header>
          <div className="rd-table" role="table" aria-label="Agents root-driver connects to">
            <div className="rd-table__row rd-table__row--head" role="row">
              <span role="columnheader">Agent</span><span role="columnheader">Command</span><span role="columnheader">What it writes</span>
            </div>
            {AGENTS.map(([agent, command, writes]) => (
              <div className="rd-table__row" role="row" key={agent}>
                <span role="rowheader">{agent}</span>
                <span role="cell"><code>{command}</code></span>
                <span role="cell">{writes}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rd-section" aria-labelledby="rd-tools-title">
          <header className="dhee-section-head">
            <p className="dhee-kicker">Tools</p>
            <h2 id="rd-tools-title">Look, then act, <em>then look again.</em></h2>
            <p>
              <code>get_window_state</code> returns a snapshot and a token for every element. An action takes those two and
              says what it did, and a fresh look or <code>verify_action</code> checks it landed. Each tool carries its risk
              as an MCP annotation, so your agent can map it to its own approvals.
            </p>
          </header>
          <div className="rd-tools">
            {TOOLS.map(({ kind, note, tone, tools }) => (
              <article key={kind} className={`rd-tools__col tone-${tone}`}>
                <h3>{kind}</h3>
                <p>{note}</p>
                <ul>{tools.map((tool) => <li key={tool}><code>{tool}</code></li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section className="rd-section" aria-labelledby="rd-how-title">
          <header className="dhee-section-head">
            <p className="dhee-kicker">How it works</p>
            <h2 id="rd-how-title">One app holds the permissions, <em>every agent shares them.</em></h2>
          </header>
          <div className="rd-how" data-snap>
            {HOW.map(([title, copy]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <div className="rd-limits" data-snap>
            <h3>What it cannot do yet</h3>
            <ul>{LIMITS.map((limit) => <li key={limit}>{limit}</li>)}</ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
