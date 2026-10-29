import { useState } from 'react';

/**
 * The memory, as the layers it is built in.
 *
 * Only the bottom layer stores anything. The two above it are read from it —
 * which is the design, and the reason the picture on the right draws the log as
 * the one solid slab with light passing up through the rest. The top layer is
 * the screen a student actually sees, so it shows the real screenshot rather
 * than a diagram of one.
 */
const LAYERS = [
  {
    id: 'log',
    name: 'The log',
    title: 'Every study moment, kept as it happened.',
    copy: 'One line per moment, appended and never edited. It is the only layer that stores anything, which is what lets everything above it be improved without losing a day of your history.',
    tags: ['read', 'asked', 'quizzed', 'taught', 'watched', 'noted', 'highlighted', 'built', 'sat a paper'],
  },
  {
    id: 'curve',
    name: 'The curve',
    title: 'Where you stand, worked out per key point.',
    copy: 'Exposure and mastery are kept apart and never averaged. Each key point carries how strong it is, how long it will last, and how likely you are to recall it today.',
    tags: ['not asked yet', 'read', 'working', 'holding', 'needs another look', 'fading'],
  },
  {
    id: 'learner',
    name: 'The learner',
    title: 'What you told the tutor, in your own words.',
    copy: 'Pace, depth, how you like things explained, what you care about, and the misconceptions it has seen. Each one typed, with where it came from and how far it can be trusted.',
    tags: ['pace', 'depth', 'modality', 'language', 'accessibility', 'interests', 'misconceptions'],
  },
  {
    id: 'insights',
    name: 'Insights',
    title: 'And the one you see.',
    copy: 'Your whole library as a field of rings, with the topics worth your next hour set out beside it. It is drawn from the layers below every time you open it, so it is never out of date.',
    tags: ['every course', 'worth your next hour', 'marks from your papers'],
  },
] as const;

const PLATE_TONES = ['#356f96', '#6f9e32', '#be6d4b', '#df9d53'];
/* The same four, lifted for reading on navy. */
const TAB_TONES = ['#8fc0df', '#a9cf7d', '#e7a283', '#f0c58f'];
/* And washed out for the face of a lifted plate, which has to stay paper. */
const FACE_TONES = ['#e4eff6', '#ebf2df', '#f7e6dc', '#faeedb'];

function Stack({ active }: { active: number }) {
  // Four isometric plates, the log at the bottom. The active plate lifts and
  // takes its colour; the rest stay as paper outlines.
  const plates = [0, 1, 2, 3];
  return (
    <svg className="dhee-stack" viewBox="0 -40 520 520" aria-hidden="true">
      <defs>
        <linearGradient id="dhee-plate-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf8" />
          <stop offset="1" stopColor="#efe9dc" />
        </linearGradient>
      </defs>
      {plates.map((index) => {
        // The chosen plate lifts, and everything above it makes room, so a
        // plate low in the stack is never hidden under the ones on top.
        const lift = index === active ? -22 : index > active ? -44 : 0;
        const cy = 380 - index * 92 + lift;
        const tone = PLATE_TONES[index];
        const isActive = index === active;
        const top = `M260 ${cy - 70} L440 ${cy} L260 ${cy + 70} L80 ${cy} Z`;
        return (
          <g key={index} className={isActive ? 'dhee-stack__plate is-active' : 'dhee-stack__plate'} style={{ '--tone': tone } as React.CSSProperties}>
            <path d={`M80 ${cy} L260 ${cy + 70} L260 ${cy + 84} L80 ${cy + 14} Z`} fill={isActive ? tone : '#e6dfd0'} opacity={isActive ? 0.55 : 1} />
            <path d={`M440 ${cy} L260 ${cy + 70} L260 ${cy + 84} L440 ${cy + 14} Z`} fill={isActive ? tone : '#d9d1c1'} opacity={isActive ? 0.75 : 1} />
            <path d={top} fill={isActive ? FACE_TONES[index] : 'url(#dhee-plate-shade)'} stroke={isActive ? tone : 'rgba(23,42,56,.22)'} strokeWidth="1.2" />
            {index === 0 && (
              <g opacity={isActive ? 1 : 0.5} stroke={isActive ? tone : '#8a949a'} strokeWidth="2.2" strokeLinecap="round">
                {[-36, -18, 0, 18, 36].map((offset, row) => (
                  <path key={offset} d={`M${190 + row * 6} ${cy + offset - 12} l${60 - row * 4} ${30 - row * 2}`} transform={`translate(${offset * 1.1} 0)`} />
                ))}
              </g>
            )}
            {index === 1 && (
              <path
                d={`M150 ${cy + 6} C 200 ${cy - 60}, 250 ${cy - 44}, 290 ${cy - 10} S 360 ${cy + 26}, 380 ${cy - 4}`}
                fill="none"
                stroke={isActive ? tone : '#8a949a'}
                strokeWidth="2.4"
                opacity={isActive ? 1 : 0.5}
              />
            )}
            {index === 2 && (
              <g opacity={isActive ? 1 : 0.5}>
                {[[200, -8], [250, -30], [300, -4], [250, 20], [340, -22]].map(([x, offset]) => (
                  <circle key={`${x}-${offset}`} cx={x} cy={cy + offset} r="7" fill="none" stroke={isActive ? tone : '#8a949a'} strokeWidth="2.2" />
                ))}
              </g>
            )}
            {index === 3 && (
              <g opacity={isActive ? 1 : 0.55}>
                {Array.from({ length: 9 }, (_, dot) => {
                  const angle = (dot / 9) * Math.PI * 2;
                  return <circle key={dot} cx={260 + Math.cos(angle) * 44} cy={cy + Math.sin(angle) * 18} r="4" fill="none" stroke={isActive ? tone : '#8a949a'} strokeWidth="1.8" />;
                })}
                <circle cx="260" cy={cy} r="9" fill={isActive ? tone : 'none'} fillOpacity=".5" stroke={isActive ? tone : '#8a949a'} strokeWidth="2.2" />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function DheeLayers() {
  const [active, setActive] = useState(0);
  const layer = LAYERS[active];

  return (
    <section className="dhee-layers" aria-labelledby="dhee-layers-title">
      <header className="dhee-section-head dhee-section-head--inverse">
        <p className="dhee-kicker">Inside Dhee</p>
        <h2 id="dhee-layers-title">One layer stores. <em>Everything else is worked out.</em></h2>
      </header>

      <div className="dhee-layers__body" data-snap>
        <div className="dhee-layers__list" role="tablist" aria-label="Layers of the tutor’s memory" aria-orientation="vertical">
          {LAYERS.map((item, index) => (
            <button
              type="button"
              role="tab"
              key={item.id}
              id={`dhee-layer-${item.id}`}
              aria-selected={index === active}
              aria-controls="dhee-layer-panel"
              className="dhee-layers__tab"
              style={{ '--tone': TAB_TONES[index] } as React.CSSProperties}
              onClick={() => setActive(index)}
              onPointerEnter={() => setActive(index)}
            >
              <span className="dhee-layers__index">0{index + 1}</span>
              <span className="dhee-layers__name">{item.name}</span>
              <span className="dhee-layers__title">{item.title}</span>
              {index === active ? (
                <span className="dhee-layers__detail">
                  <span>{item.copy}</span>
                  <span className="dhee-layers__tags">
                    {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </span>
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="dhee-layers__visual" id="dhee-layer-panel" role="tabpanel" aria-labelledby={`dhee-layer-${layer.id}`}>
          {layer.id === 'insights' ? (
            <figure className="dhee-layers__screen">
              <img src="/art/tura-insights.jpg" alt="The Tura Insights screen drawing six courses as fields of topic rings" width="1800" height="1125" loading="lazy" decoding="async" />
            </figure>
          ) : (
            <Stack active={active} />
          )}
        </div>
      </div>
    </section>
  );
}
