/**
 * One decision, as Tura-S1 sees it: a state, a question, and a probability for
 * every option at once. The figures are illustrative — the shape of one answer,
 * not a measurement — and the caption says so. The state is the kind of agent
 * step the model was trained on: a student asks about their own mistakes, and
 * the right move is to read their record before replying.
 */
const OPTIONS = [
  { name: 'read_learner_record', p: 0.91 },
  { name: 'reply_to_user', p: 0.05 },
  { name: 'find_in_books', p: 0.03 },
  { name: 'make_quiz', p: 0.01 },
] as const;

export function S1Decision() {
  return (
    <figure className="ts1-decision">
      <div className="ts1-decision__head">
        <span>choice</span>
        <em>1 forward pass · 0 tokens generated</em>
      </div>
      <div className="ts1-decision__state">
        <p className="ts1-decision__label">State</p>
        <p><b>Student</b> what do I keep getting wrong in thermodynamics?</p>
        <p><b>Agent so far</b> nothing called yet · 14 tools available</p>
      </div>
      <p className="ts1-decision__question"><span className="ts1-decision__label">Question</span>What should the agent do next?</p>
      <ol className="ts1-decision__options">
        {OPTIONS.map((option, index) => (
          <li key={option.name} className={index === 0 ? 'is-top' : undefined}>
            <code>{option.name}</code>
            <span className="ts1-decision__bar" aria-hidden="true"><i style={{ width: `${option.p * 100}%` }} /></span>
            <strong>{option.p.toFixed(2)}</strong>
          </li>
        ))}
      </ol>
      <figcaption>Illustrative. Every option gets a calibrated probability, together, so the agent can act on the top one or ask when nothing is sure.</figcaption>
    </figure>
  );
}
