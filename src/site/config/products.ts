import { Cpu, GraduationCap, MessagesSquare, MousePointerClick, NotebookText, Orbit, SquareTerminal, type LucideIcon } from 'lucide-react';

/**
 * Everything Sankhya AI Labs makes, in one list for the menu, the footer and
 * the home page's register.
 *
 * Grouped by where the work lands: the courts (Manu and its model), students
 * (Tura, which lives on turalearn.com, so its entry leaves this site, and
 * Tura-S1, the model trained on Tura's agent), the open-source agent tools, and
 * Dhee, the memory. Every `fact` is a number or a state that is
 * true of the product as shipped; each one names where it comes from.
 */
export type Product = {
  name: string;
  /** A path on this site, or a full address when the product lives elsewhere. */
  href: string;
  note: string;
  icon: LucideIcon;
  group: ProductGroup;
  /** Shown in the register: what it is, one true figure, and how to get it. */
  kind: string;
  line: string;
  fact: string;
  status: string;
  badge?: string;
};

export type ProductGroup = 'Legal' | 'Education' | 'Open source' | 'Memory';
export const PRODUCT_GROUPS: readonly ProductGroup[] = ['Legal', 'Education', 'Open source', 'Memory'];

export const TURA_URL = 'https://www.turalearn.com';

export const PRODUCTS: readonly Product[] = [
  {
    name: 'Manu',
    href: '/manu',
    note: 'The case diary that reads the court',
    icon: NotebookText,
    group: 'Legal',
    kind: 'Case diary',
    line: 'Follows a case by its CNR, reads every new order each morning, and shows the words each line came from.',
    fact: 'Section 479 and default-bail working shown, never a bail prediction',
    status: 'Waitlist',
  },
  {
    name: 'Manu-S1',
    href: '/manu-s1',
    note: 'Our fast model for court procedure',
    icon: Cpu,
    group: 'Legal',
    kind: 'Decision model',
    // The model card: huggingface.co/sankhya-aI/manu-s1-4b.
    line: 'Reads a court record and answers one procedural question: is it in time, what kind of order is it, which court hears it.',
    fact: '91.8% on 2,346 High Court orders it never saw · 64 ms',
    status: 'Open weights',
  },
  {
    name: 'Tura',
    href: TURA_URL,
    note: 'An AI tutor for your exams',
    icon: GraduationCap,
    group: 'Education',
    kind: 'Tutor',
    line: 'Teaches from a student’s own lecture notes and textbooks, in the shape their past papers ask, on a whiteboard it draws as it explains.',
    fact: 'On the web and the Mac, free to start',
    status: 'Live',
  },
  {
    name: 'root',
    href: '/root',
    note: 'The coding agent we work in',
    icon: SquareTerminal,
    group: 'Open source',
    kind: 'Coding agent',
    line: 'Bring an OpenRouter key and any model. A decision model picks every step, so smaller models finish long tasks.',
    fact: 'Every turn can be undone',
    status: 'Free for Mac',
  },
  {
    name: 'root-driver',
    href: '/root-driver',
    note: 'Your Mac’s apps, for any agent',
    icon: MousePointerClick,
    group: 'Open source',
    kind: 'Computer use',
    // github.com/tura-learn/root-driver: one signed Swift app, MCP and a CLI.
    line: 'Lets any agent read a Mac app’s window and click, type and fill forms in it, without moving your cursor or taking focus.',
    fact: 'One signed app, one permission grant, every agent',
    status: 'Open source',
  },
  {
    name: 'Chamber',
    href: 'https://chamber.sankhyaailabs.com',
    note: 'Where your team’s agents talk',
    icon: MessagesSquare,
    group: 'Open source',
    kind: 'Agent workspace',
    line: 'Your agent asks a teammate’s agent and gets the answer back, file attached. People see every talk and can step in.',
    fact: 'Sealed on your machine before it leaves; the relay runs on your Cloudflare',
    status: 'Open source',
  },
  {
    name: 'Dhee',
    href: '/dhee',
    note: 'Typed memory for agents',
    icon: Orbit,
    group: 'Memory',
    kind: 'Memory',
    // The Dhee README.
    line: 'Keeps decisions, conventions and facts as typed memories, and replaces a fact when it changes instead of piling the new one beside it.',
    fact: '99.4% R@5 on LongMemEval',
    status: 'Open source',
  },
  {
    name: 'Tura-S1',
    href: '/tura-s1',
    note: 'A decision in one forward pass',
    icon: Cpu,
    group: 'Education',
    kind: 'Decision model',
    // The model card: huggingface.co/AshishDwi99/tura-s1-4b.
    line: 'Scores every option an agent has, which tool next or reply, in one forward pass. Nothing is generated, so nothing has to be parsed.',
    fact: '98.5% on agent steps it never saw · 178 ms',
    status: 'Open weights',
  },
];

export const isExternal = (href: string) => /^https?:/.test(href);
