/**
 * The results, against the model it was trained from.
 *
 * Every figure is from the model card: measured on one L40S, held-out sets
 * only, the base and Tura-S1 through the same harness. JevBench stays in the
 * table even though Tura-S1 is lower there, because it is the public benchmark
 * for this kind of model and the trade is the point: it gave up eleven of
 * JevBench's hard items to become far better at an agent's own decisions.
 */
const BARS = [
  { label: 'Agent-step routing', detail: 'Which tool next, or reply · Tura, held out (129)', base: 49.6, ours: 98.5 },
  { label: 'Product decisions', detail: 'Routing, turn end, reply mode · Tura, held out (170)', base: 41.8, ours: 90.0 },
  { label: 'Hard decisions', detail: 'JevK5’s hand-written hard set (65)', base: 78.5, ours: 83.1 },
  { label: 'General decisions', detail: 'Documents and questions, held out (900)', base: 58.0, ours: 68.1 },
] as const;

const TABLE = [
  ['Tura agent-step routing, held out (129)', '49.6%', '98.5%'],
  ['Tura product decisions, held out (170)', '41.8%', '90.0%'],
  ['Held-out general decisions (900)', '58.0%', '68.1%'],
  ['JevK5’s hand-written hard set (65)', '78.5%', '83.1%'],
  ['JevBench public (231)', '90.0%', '85.3%'],
  ['JevBench public, calibration error (ECE, lower is better)', '0.053', '0.036'],
] as const;

export function S1Benchmarks() {
  return (
    <section className="ts1-bench" id="results" aria-labelledby="ts1-bench-title">
      <header className="dhee-section-head">
        <p className="dhee-kicker">Results</p>
        <h2 id="ts1-bench-title">Twice as right on <em>an agent’s own decisions.</em></h2>
        <p>
          Tura-S1 against Plumb-4B, the model it was trained from, on decisions neither saw in training.
          Same harness, same GPU, one run each.
        </p>
      </header>

      <div className="ts1-bars" role="list">
        {BARS.map((bar) => (
          <div className="ts1-bars__row" role="listitem" key={bar.label}>
            <div className="ts1-bars__label">
              <strong>{bar.label}</strong>
              <span>{bar.detail}</span>
            </div>
            <div className="ts1-bars__tracks">
              <div className="ts1-bars__track is-base"><span><i style={{ width: `${bar.base}%` }} /></span><b>{bar.base.toFixed(1)}%</b></div>
              <div className="ts1-bars__track is-ours"><span><i style={{ width: `${bar.ours}%` }} /></span><b>{bar.ours.toFixed(1)}%</b></div>
            </div>
          </div>
        ))}
        <p className="ts1-bars__legend"><span><i className="is-base" />Plumb-4B, the base</span><span><i className="is-ours" />Tura-S1-4B</span></p>
      </div>

      <div className="dhee-differences ts1-table" role="table" aria-label="Tura-S1-4B compared with Plumb-4B">
        <div className="dhee-differences__row dhee-differences__row--head" role="row">
          <span role="columnheader">Benchmark</span>
          <span role="columnheader">Plumb-4B</span>
          <span role="columnheader">Tura-S1-4B</span>
        </div>
        {TABLE.map(([name, base, ours]) => (
          <div className="dhee-differences__row" role="row" key={name}>
            <span role="rowheader">{name}</span>
            <span role="cell">{base}</span>
            <span role="cell">{ours}</span>
          </div>
        ))}
      </div>
      <p className="ts1-note">
        The trade we chose: eleven of JevBench’s hard items, for agent routing and general decisions. Calibration
        improved on JevBench too. If you do not need tool routing, Plumb-4B is the stronger JevBench model. On Tura’s
        product decisions, always picking the most common answer would score 74.1%.
      </p>
    </section>
  );
}

const HOSTED = [
  ['Where it runs', 'A hosted API', 'Your own GPU'],
  ['Time per decision', 'About 311 ms per call, in our logs', '178 ms p50 on one L40S'],
  ['Cost per decision', 'Billed per call', 'Your hardware, nothing per call'],
  ['Weights', 'Closed', 'Open, Apache-2.0'],
  ['Trained on Tura’s agent decisions', 'No', 'Yes: 8,865 of them'],
  ['The request', 'POST /v1/systemone', 'The same request, served by JevK5’s runtime'],
] as const;

export function S1Hosted() {
  return (
    <section className="ts1-hosted" aria-labelledby="ts1-hosted-title">
      <header className="dhee-section-head">
        <p className="dhee-kicker">Against the hosted model</p>
        <h2 id="ts1-hosted-title">Built to replace <em>a call to someone else’s API.</em></h2>
        <p>
          Tura’s agent asks a decision model before it acts. Tura-S1 answers the same questions, in the same
          format, on hardware you own.
        </p>
      </header>
      <div className="dhee-differences" role="table" aria-label="Tura-S1-4B compared with a hosted Jev-class API">
        <div className="dhee-differences__row dhee-differences__row--head" role="row">
          <span role="columnheader" />
          <span role="columnheader">Hosted Jev API</span>
          <span role="columnheader">Tura-S1-4B</span>
        </div>
        {HOSTED.map(([question, hosted, ours]) => (
          <div className="dhee-differences__row ts1-hosted__row" role="row" key={question}>
            <span role="rowheader">{question}</span>
            <span role="cell">{hosted}</span>
            <span role="cell">{ours}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
