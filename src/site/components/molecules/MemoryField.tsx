import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * The Insights field, redrawn for the website.
 *
 * Same grammar as the screen inside Tura, so that what a visitor sees here is
 * what a student sees there: a **topic is a ring of its key points**, a
 * **chapter is a cluster** of those rings, and a course is a neighbourhood of
 * clusters in its own colour. The ring is the thing; the **core** is what is
 * known, absent until a point has been asked about and growing with what holds.
 * Only two states break the pastels — `shaky` and `fading` — because they are
 * the two a student can act on tonight.
 *
 * The library drawn here is invented and seeded, so it is the same picture on
 * every visit. `stage` walks it through the rules the page explains, one at a
 * time, and every change between stages is eased rather than cut.
 */

export type FieldStage = 'facts' | 'exposure' | 'unknown' | 'fading' | 'full';
type Tone = 'untouched' | 'read' | 'working' | 'solid' | 'shaky' | 'fading';

/* Blue, violet, green: three of the product's pastels, and none of them near
   the red and amber that are kept for trouble. */
const HUES = ['#3d78ad', '#7565ab', '#5c8a44'];
const ALARM: Record<'shaky' | 'fading', [number, number, number]> = { shaky: [194, 89, 63], fading: [193, 137, 63] };

const SHELVES = [
  {
    name: 'Physics',
    read: 0.94, check: 0.7, wrong: 0.14, fade: 0.14,
    chapters: [
      ['Kinematics', ['Rest and motion', 'Distance and displacement', 'Speed and velocity', 'Relative velocity', 'Motion in a plane', 'Projectile motion']],
      ['Newton’s laws of motion', ['Inertial frames', 'First law', 'Second law', 'Third law', 'Friction', 'Equilibrium of a particle', 'Pseudo forces']],
      ['Work and energy', ['Work done by a force', 'Kinetic energy', 'Potential energy', 'Conservation of energy', 'Power']],
      ['Rotation', ['Angular velocity', 'Torque', 'Moment of inertia', 'Rolling motion']],
    ],
  },
  {
    name: 'Chemistry',
    read: 0.7, check: 0.42, wrong: 0.12, fade: 0.1,
    chapters: [
      ['Hydrocarbons', ['Alkanes', 'Alkenes', 'Alkynes', 'Aromatic substitution', 'Preparation of hydrocarbons']],
      ['Chemical equilibrium', ['Law of mass action', 'Le Chatelier’s principle', 'Kc and Kp', 'Ionic equilibrium', 'Buffer solutions']],
      ['Electrochemistry', ['Galvanic cells', 'Nernst equation', 'Conductance', 'Electrolysis']],
    ],
  },
  {
    name: 'Finance',
    read: 0.36, check: 0.14, wrong: 0, fade: 0,
    chapters: [
      ['Time value of money', ['Compounding', 'Discounting', 'Effective annual rate', 'Continuous compounding']],
      ['Valuing cash flows', ['Perpetuities', 'Annuities', 'Growing annuities', 'Loan amortisation', 'Net present value']],
      ['Portfolio return', ['Expected return', 'Variance and risk', 'Diversification', 'CAPM']],
    ],
  },
] as const;

/* Spacing, in world units, borrowed from the product's own layout. */
const POINT_RING_MIN = 13;
const POINT_STEP = 9.2;
const TOPIC_RING_MIN = 32;
const RADIUS = { chapter: 9.5, topic: 6.2, point: 3.1 };
const CLUSTER_GAP = 14;
const GOLDEN_ANGLE = 2.399963229728653;
const MAX_NODE_PX = 24;

interface PointFacts { read: boolean; checked: boolean; mastery: number; wrong: boolean; fades: boolean }

interface FieldNode {
  kind: 'chapter' | 'topic' | 'point';
  x: number;
  y: number;
  r: number;
  hue: number;
  shelf: number;
  chapter: number;
  topic: number;
  facts?: PointFacts;
  children: FieldNode[];
  title: string;
  /* eased display state */
  core: number;
  ring: number;
  alarm: number;
  alarmTone: 'shaky' | 'fading';
}

interface Field {
  nodes: FieldNode[];
  topics: FieldNode[];
  shelves: { name: string; x: number; y: number; hue: number }[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
}

function seeded(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildField(): Field {
  const random = seeded(20260914);
  const nodes: FieldNode[] = [];
  const topics: FieldNode[] = [];
  const clusters: { node: FieldNode; radius: number; shelf: number; ax: number; ay: number }[] = [];
  const blank = { core: 0, ring: 0, alarm: 0, alarmTone: 'shaky' as const, children: [] as FieldNode[] };

  SHELVES.forEach((shelf, shelfIndex) => {
    const anchorAngle = -Math.PI / 2 + (shelfIndex * Math.PI * 2) / SHELVES.length + 0.35;
    const ax = Math.cos(anchorAngle) * 175 * 1.5;
    const ay = Math.sin(anchorAngle) * 120;

    shelf.chapters.forEach(([chapterTitle, topicTitles], chapterIndex) => {
      const chapter: FieldNode = { ...blank, children: [], kind: 'chapter', x: 0, y: 0, r: RADIUS.chapter, hue: shelfIndex, shelf: shelfIndex, chapter: nodes.length, topic: -1, title: chapterTitle };
      nodes.push(chapter);
      const pointRing = POINT_RING_MIN;
      const topicRing = Math.max(TOPIC_RING_MIN, (topicTitles.length * 2 * (pointRing + RADIUS.point + 4)) / (Math.PI * 2));
      const start = random() * Math.PI * 2;

      topicTitles.forEach((topicTitle, topicIndex) => {
        const angle = start + (topicIndex / topicTitles.length) * Math.PI * 2;
        const topic: FieldNode = {
          ...blank, children: [], kind: 'topic', r: RADIUS.topic * (0.9 + random() * 0.45), hue: shelfIndex, shelf: shelfIndex,
          chapter: chapter.chapter, topic: topics.length, title: topicTitle,
          x: Math.cos(angle) * topicRing, y: Math.sin(angle) * topicRing,
        };
        const count = 4 + Math.floor(random() * 4);
        const ring = Math.max(pointRing, (count * POINT_STEP) / (Math.PI * 2));
        const offset = random() * Math.PI * 2;
        // Trouble is decided per topic, and is one key point at most: a student
        // misses an idea, not a chapter, and a field where every cluster is red
        // says nothing about where to look.
        const trouble = random();
        const troubled = Math.floor(random() * count);
        for (let index = 0; index < count; index += 1) {
          const read = random() < shelf.read;
          const checked = read && (random() < shelf.check || index === troubled);
          const wrong = checked && index === troubled && trouble < shelf.wrong;
          const fades = checked && index === troubled && trouble >= shelf.wrong && trouble < shelf.wrong + shelf.fade;
          const point: FieldNode = {
            ...blank, children: [], kind: 'point', r: RADIUS.point, hue: shelfIndex, shelf: shelfIndex, chapter: chapter.chapter, topic: topic.topic, title: topicTitle,
            x: topic.x + Math.cos(offset + (index / count) * Math.PI * 2) * ring,
            y: topic.y + Math.sin(offset + (index / count) * Math.PI * 2) * ring,
            facts: { read, checked, wrong, fades, mastery: wrong ? 0.15 + random() * 0.2 : 0.45 + random() * 0.55 },
          };
          topic.children.push(point);
        }
        chapter.children.push(topic);
        topics.push(topic);
      });

      const spiral = Math.sqrt(chapterIndex + 0.5) * 92;
      clusters.push({
        node: chapter,
        radius: topicRing + pointRing + RADIUS.point + 6,
        shelf: shelfIndex,
        ax, ay,
      });
      chapter.x = ax + Math.cos(chapterIndex * GOLDEN_ANGLE + shelfIndex) * spiral;
      chapter.y = ay + Math.sin(chapterIndex * GOLDEN_ANGLE + shelfIndex) * spiral;
    });
  });

  // Push the clusters apart until none touch, with a light pull back towards
  // their own course so each course stays a neighbourhood.
  for (let pass = 0; pass < 160; pass += 1) {
    for (let i = 0; i < clusters.length; i += 1) {
      const a = clusters[i];
      a.node.x += (a.ax - a.node.x) * 0.012;
      a.node.y += (a.ay - a.node.y) * 0.012;
      for (let j = i + 1; j < clusters.length; j += 1) {
        const b = clusters[j];
        const dx = b.node.x - a.node.x;
        const dy = b.node.y - a.node.y;
        const distance = Math.hypot(dx, dy) || 0.01;
        const needed = a.radius + b.radius + CLUSTER_GAP * (a.shelf === b.shelf ? 1 : 2.4);
        if (distance < needed) {
          const push = (needed - distance) / 2;
          a.node.x -= (dx / distance) * push;
          a.node.y -= (dy / distance) * push;
          b.node.x += (dx / distance) * push;
          b.node.y += (dy / distance) * push;
        }
      }
    }
  }

  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const { node: chapter } of clusters) {
    for (const topic of chapter.children) {
      topic.x += chapter.x;
      topic.y += chapter.y;
      for (const point of topic.children) {
        point.x += chapter.x;
        point.y += chapter.y;
        nodes.push(point);
        bounds.minX = Math.min(bounds.minX, point.x);
        bounds.maxX = Math.max(bounds.maxX, point.x);
        bounds.minY = Math.min(bounds.minY, point.y);
        bounds.maxY = Math.max(bounds.maxY, point.y);
      }
      nodes.push(topic);
    }
  }

  const shelves = SHELVES.map((shelf, index) => {
    const own = clusters.filter((cluster) => cluster.shelf === index);
    const x = own.reduce((sum, cluster) => sum + cluster.node.x, 0) / own.length;
    const y = Math.max(...own.map((cluster) => cluster.node.y + cluster.radius)) + 20;
    return { name: shelf.name, x, y, hue: index };
  });
  bounds.maxY = Math.max(bounds.maxY, ...shelves.map((shelf) => shelf.y + 8));
  return { nodes, topics, shelves, bounds };
}

/* ── what each stage shows ────────────────────────────────────────────────── */

const STAGE_ORDER: FieldStage[] = ['facts', 'exposure', 'unknown', 'fading', 'full'];

function pointTone(facts: PointFacts, stage: FieldStage): Tone {
  const level = STAGE_ORDER.indexOf(stage);
  if (!facts.read) return 'untouched';
  if (level === 0 || !facts.checked) return 'read';
  if (facts.wrong && level >= 2) return 'shaky';
  if (facts.fades && level >= 3) return 'fading';
  return facts.mastery >= 0.75 ? 'solid' : 'working';
}

interface Summary { tone: Tone; mastery: number; checked: number; total: number }

function summarise(tones: Summary[]): Summary {
  const checked = tones.filter((item) => item.checked > 0);
  const total = tones.reduce((sum, item) => sum + item.total, 0);
  const checkedCount = tones.reduce((sum, item) => sum + item.checked, 0);
  const mastery = checked.length ? checked.reduce((sum, item) => sum + item.mastery, 0) / checked.length : 0;
  let tone: Tone = 'untouched';
  if (tones.some((item) => item.tone === 'shaky')) tone = 'shaky';
  else if (tones.some((item) => item.tone === 'fading')) tone = 'fading';
  else if (checked.length) tone = checked.every((item) => item.tone === 'solid') ? 'solid' : 'working';
  else if (tones.some((item) => item.tone !== 'untouched')) tone = 'read';
  return { tone, mastery, checked: checkedCount, total };
}

function summaries(field: Field, stage: FieldStage) {
  const map = new Map<FieldNode, Summary>();
  for (const node of field.nodes) {
    if (node.kind !== 'point' || !node.facts) continue;
    const tone = pointTone(node.facts, stage);
    const checked = tone !== 'untouched' && tone !== 'read';
    map.set(node, { tone, mastery: checked ? node.facts.mastery : 0, checked: checked ? 1 : 0, total: 1 });
  }
  for (const topic of field.topics) map.set(topic, summarise(topic.children.map((child) => map.get(child)!)));
  for (const node of field.nodes) {
    if (node.kind === 'chapter') map.set(node, summarise(node.children.map((child) => map.get(child)!)));
  }
  return map;
}

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

const HUE_RGB = HUES.map(hexToRgb);

function colourOf(node: FieldNode, alpha: number) {
  const base = HUE_RGB[node.hue % HUE_RGB.length];
  const alarm = ALARM[node.alarmTone];
  const mix = node.alarm;
  const r = Math.round(base[0] + (alarm[0] - base[0]) * mix);
  const g = Math.round(base[1] + (alarm[1] - base[1]) * mix);
  const b = Math.round(base[2] + (alarm[2] - base[2]) * mix);
  return `rgba(${r},${g},${b},${Math.round(alpha * 100) / 100})`;
}

interface Hover { title: string; detail: string; x: number; y: number }

export function MemoryField({
  stage = 'full',
  replay = 0,
  className,
  label = 'A student’s library drawn as Tura’s Insights field',
}: {
  stage?: FieldStage;
  replay?: number;
  className?: string;
  label?: string;
}) {
  const field = useMemo(() => buildField(), []);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const live = useRef({
    stage,
    targets: summaries(field, stage),
    intro: 0,
    introStart: -1,
    visible: false,
    hoverTopic: -1,
    hoverChapter: -1,
    dim: 0,
    frame: 0,
    transform: { k: 1, x: 0, y: 0 },
    draw: () => {},
  });

  /* The whole animation is one loop that stops itself when nothing is moving. */
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const state = live.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const glowCache = new Map<string, CanvasGradient>();
    let width = 0;
    let height = 0;
    let last = performance.now();

    const fit = () => {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const { minX, minY, maxX, maxY } = field.bounds;
      const pad = Math.min(36, width * 0.05);
      const k = Math.min((width - pad * 2) / (maxX - minX + 20), (height - pad * 2) / (maxY - minY + 20), MAX_NODE_PX / RADIUS.chapter);
      state.transform = { k, x: width / 2 - ((minX + maxX) / 2) * k, y: height / 2 - ((minY + maxY) / 2) * k };
    };

    const glow = (colour: string) => {
      let gradient = glowCache.get(colour);
      if (!gradient) {
        gradient = context.createRadialGradient(0, 0, 0.8, 0, 0, 3.6);
        gradient.addColorStop(0, colour.replace(/,[\d.]+\)$/, ',.4)'));
        gradient.addColorStop(0.4, colour.replace(/,[\d.]+\)$/, ',.12)'));
        gradient.addColorStop(1, colour.replace(/,[\d.]+\)$/, ',0)'));
        glowCache.set(colour, gradient);
      }
      return gradient;
    };

    const step = (now: number) => {
      state.frame = 0;
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      let moving = false;

      if (state.visible && state.introStart < 0) state.introStart = now;
      if (state.introStart >= 0 && state.intro < 1) {
        state.intro = reduceMotion ? 1 : Math.min(1, (now - state.introStart) / 1700);
        moving = true;
      }

      const ease = reduceMotion ? 1 : 1 - Math.exp(-dt * 5.5);
      for (const node of field.nodes) {
        const summary = state.targets.get(node);
        if (!summary) continue;
        const alarm = summary.tone === 'shaky' || summary.tone === 'fading';
        if (alarm) node.alarmTone = summary.tone as 'shaky' | 'fading';
        const targetCore = summary.checked > 0 ? 0.2 + 0.55 * summary.mastery : 0;
        const targetRing = summary.tone === 'untouched' ? 0.38 : summary.tone === 'read' ? 0.78 : alarm ? 1 : 0.72 + 0.28 * summary.mastery;
        const targetAlarm = alarm ? 1 : 0;
        const next = [
          node.core + (targetCore - node.core) * ease,
          node.ring + (targetRing - node.ring) * ease,
          node.alarm + (targetAlarm - node.alarm) * ease,
        ];
        if (Math.abs(next[0] - targetCore) + Math.abs(next[1] - targetRing) + Math.abs(next[2] - targetAlarm) > 0.004) moving = true;
        [node.core, node.ring, node.alarm] = next;
      }

      const dimTarget = state.hoverTopic >= 0 ? 1 : 0;
      state.dim += (dimTarget - state.dim) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 9));
      if (Math.abs(state.dim - dimTarget) > 0.01) moving = true;

      draw();
      if (moving && state.visible) state.frame = requestAnimationFrame(step);
    };

    const draw = () => {
      const { k, x, y } = state.transform;
      context.clearRect(0, 0, width, height);
      if (state.introStart < 0) return;
      context.save();
      context.translate(x, y);
      context.scale(k, k);

      const { minX, minY, maxX, maxY } = field.bounds;
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const reach = Math.hypot(maxX - minX, maxY - minY) / 2;

      const drawn: { node: FieldNode; radius: number; alpha: number }[] = [];
      for (const node of field.nodes) {
        const delay = Math.min(0.55, (Math.hypot(node.x - cx, node.y - cy) / reach) * 0.55);
        const t = Math.max(0, Math.min(1, (state.intro - delay) / (1 - delay)));
        if (t <= 0) continue;
        const grow = t * t * (3 - 2 * t);
        const inFocus = state.hoverTopic < 0 || node.chapter === state.hoverChapter;
        const alpha = inFocus ? 1 : 1 - state.dim * 0.6;
        drawn.push({ node, radius: node.r * grow * (node.topic === state.hoverTopic && node.kind === 'topic' ? 1.25 : 1), alpha });
      }

      // Light first, and only where something is holding: the glow on this
      // field is literally the work the student has done.
      for (const { node, radius, alpha } of drawn) {
        if (node.core < 0.3 || node.alarm > 0.5) continue;
        context.save();
        context.translate(node.x, node.y);
        context.scale(radius, radius);
        context.globalAlpha = alpha * Math.min(1, node.core * 1.2);
        context.fillStyle = glow(colourOf(node, 1));
        context.beginPath();
        context.arc(0, 0, 3.6, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }

      for (const { node, radius, alpha } of drawn) {
        const alarm = node.alarm > 0.5;
        context.beginPath();
        context.arc(node.x, node.y, radius, 0, Math.PI * 2);
        context.lineWidth = Math.max(0.9 / k, radius * (alarm ? 0.4 : 0.34));
        context.strokeStyle = colourOf(node, alpha * node.ring);
        context.stroke();
        if (node.core > 0.01) {
          context.beginPath();
          context.arc(node.x, node.y, radius * node.core, 0, Math.PI * 2);
          context.fillStyle = colourOf(node, alpha * (alarm ? 0.92 : 0.7 + 0.3 * node.core));
          context.fill();
        }
      }

      context.restore();

      // Course names, spaced and faint, the way the product labels a field.
      context.save();
      context.font = '560 10px "Roboto Flex Variable", "Helvetica Neue", sans-serif';
      context.textAlign = 'center';
      if ('letterSpacing' in context) (context as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '2.6px';
      context.globalAlpha = Math.max(0, Math.min(1, (state.intro - 0.55) / 0.45)) * 0.62;
      for (const shelf of field.shelves) {
        context.fillStyle = HUES[shelf.hue];
        context.fillText(shelf.name.toUpperCase(), x + shelf.x * k, y + shelf.y * k);
      }
      context.restore();
    };

    state.draw = () => {
      if (!state.frame) {
        last = performance.now();
        state.frame = requestAnimationFrame(step);
      }
    };

    fit();
    const resize = new ResizeObserver(() => {
      fit();
      draw();
    });
    resize.observe(wrap);
    const seen = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting;
      if (state.visible) state.draw();
    }, { threshold: 0.15 });
    seen.observe(wrap);
    void document.fonts?.ready.then(() => draw());

    return () => {
      resize.disconnect();
      seen.disconnect();
      if (state.frame) cancelAnimationFrame(state.frame);
      state.frame = 0;
    };
  }, [field]);

  useEffect(() => {
    const state = live.current;
    state.stage = stage;
    state.targets = summaries(field, stage);
    state.draw();
  }, [field, stage]);

  /* A replay grows the field again from its middle: a new model re-reading
     the same history. */
  useEffect(() => {
    if (replay === 0) return;
    const state = live.current;
    state.intro = 0;
    state.introStart = -1;
    state.draw();
  }, [replay]);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = live.current;
    const rect = event.currentTarget.getBoundingClientRect();
    const { k, x, y } = state.transform;
    const wx = (event.clientX - rect.left - x) / k;
    const wy = (event.clientY - rect.top - y) / k;
    let best: FieldNode | null = null;
    let bestDistance = POINT_RING_MIN + 6;
    for (const topic of field.topics) {
      const distance = Math.hypot(topic.x - wx, topic.y - wy);
      if (distance < bestDistance) {
        best = topic;
        bestDistance = distance;
      }
    }
    const nextTopic = best ? best.topic : -1;
    if (nextTopic === state.hoverTopic) return;
    state.hoverTopic = nextTopic;
    state.hoverChapter = best ? best.chapter : -1;
    state.draw();
    if (!best) {
      setHover(null);
      return;
    }
    const summary = state.targets.get(best)!;
    const words: Record<Tone, string> = {
      untouched: 'not opened yet',
      read: 'read, not asked yet',
      working: 'getting there',
      solid: 'holding',
      shaky: 'needs another look',
      fading: 'starting to fade',
    };
    setHover({
      title: best.title,
      detail: `${summary.checked} of ${summary.total} key points checked · ${words[summary.tone]}`,
      x: x + best.x * k,
      y: y + best.y * k - (POINT_RING_MIN + 8) * k,
    });
  };

  const onPointerLeave = () => {
    const state = live.current;
    state.hoverTopic = -1;
    state.hoverChapter = -1;
    state.draw();
    setHover(null);
  };

  return (
    <div
      ref={wrapRef}
      className={['memory-field', className].filter(Boolean).join(' ')}
      role="img"
      aria-label={label}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      {hover ? (
        <div className="memory-field__tip" style={{ left: hover.x, top: hover.y }} aria-hidden="true">
          <strong>{hover.title}</strong>
          <span>{hover.detail}</span>
        </div>
      ) : null}
    </div>
  );
}
