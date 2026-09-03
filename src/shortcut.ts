const MODIFIERS = ['Command', 'Control', 'Option', 'Shift'] as const;
type CanonicalModifier = typeof MODIFIERS[number];

const MODIFIER_ALIASES: Record<string, CanonicalModifier> = {
  command: 'Command', cmd: 'Command', meta: 'Command', '⌘': 'Command',
  control: 'Control', ctrl: 'Control', '⌃': 'Control',
  option: 'Option', alt: 'Option', '⌥': 'Option',
  shift: 'Shift', '⇧': 'Shift'
};

const KEY_ALIASES: Record<string, string> = {
  return: 'Enter', enter: 'Enter', '↩': 'Enter',
  backspace: 'Backspace', '⌫': 'Backspace',
  delete: 'Delete', '⌦': 'Delete',
  tab: 'Tab', '⇥': 'Tab',
  escape: 'Escape', esc: 'Escape',
  space: 'Space',
  left: 'Left', arrowleft: 'Left', '←': 'Left',
  right: 'Right', arrowright: 'Right', '→': 'Right',
  up: 'Up', arrowup: 'Up', '↑': 'Up',
  down: 'Down', arrowdown: 'Down', '↓': 'Down'
};

const MAC_GLYPHS: Record<string, string> = {
  Command: '⌘', Control: '⌃', Option: '⌥', Shift: '⇧',
  Enter: '↩', Backspace: '⌫', Delete: '⌦', Tab: '⇥', Escape: 'Esc', Space: 'Space',
  Left: '←', Right: '→', Up: '↑', Down: '↓'
};

function tokenize(raw: string): string[] {
  const value = raw.normalize('NFKC').trim();
  if (!value) return [];
  if (value.includes('+')) return value.split(/\s*\+\s*/).map((token) => token.trim()).filter(Boolean);
  if (/[⌘⌃⌥⇧↩⌫⌦⇥←→↑↓]/.test(value)) {
    return value.match(/[⌘⌃⌥⇧↩⌫⌦⇥←→↑↓]|[^\s⌘⌃⌥⇧↩⌫⌦⇥←→↑↓]+/g) ?? [];
  }
  return [value];
}

function canonicalKey(token: string): string | null {
  const value = token.normalize('NFKC').trim();
  if (!value) return null;
  const alias = KEY_ALIASES[value.toLowerCase()] ?? KEY_ALIASES[value];
  if (alias) return alias;
  if (/^f(?:[1-9]|1\d|2[0-4])$/i.test(value)) return value.toUpperCase();
  if (value.length === 1) return value.toUpperCase();
  return null;
}

export interface ParsedKeyboardChord {
  modifiers: CanonicalModifier[];
  key: string;
  canonical: string;
}

export function parseKeyboardChord(raw: string, allowSingleKey = true): ParsedKeyboardChord | null {
  const rawTokens = tokenize(raw);
  if (!rawTokens.length) return null;
  const modifierSet = new Set<CanonicalModifier>();
  let key: string | null = null;

  for (const token of rawTokens) {
    const modifier = MODIFIER_ALIASES[token.toLowerCase()] ?? MODIFIER_ALIASES[token];
    if (modifier) {
      modifierSet.add(modifier);
      continue;
    }
    const nextKey = canonicalKey(token);
    if (!nextKey || key) return null;
    key = nextKey;
  }

  if (!key) return null;
  const modifiers = MODIFIERS.filter((modifier) => modifierSet.has(modifier));
  if (!allowSingleKey && !modifiers.length) return null;
  return { modifiers, key, canonical: [...modifiers, key].join(' + ') };
}

export function normalizeKeyboardChord(raw: string): string | null {
  return parseKeyboardChord(raw)?.canonical ?? null;
}

export function formatMacShortcut(raw: string): string {
  const parsed = parseKeyboardChord(raw);
  if (!parsed) return raw.normalize('NFKC').trim();
  return [...parsed.modifiers.map((modifier) => MAC_GLYPHS[modifier] ?? modifier), MAC_GLYPHS[parsed.key] ?? parsed.key].join(' ');
}

const EXPLICIT_CHORD = /\b(?:Command|Cmd|Control|Ctrl|Option|Alt|Shift)\s*\+\s*(?:(?:Command|Cmd|Control|Ctrl|Option|Alt|Shift)\s*\+\s*){0,3}(?:Arrow(?:Up|Down|Left|Right)|Backspace|Delete|Escape|Esc|Enter|Return|Space|Tab|F(?:[1-9]|1\d|2[0-4])|Up|Down|Left|Right|[A-Z0-9])\b/gi;

export function formatExplicitKeyboardChords(text: string): string {
  return text.replace(EXPLICIT_CHORD, (match) => {
    const parsed = parseKeyboardChord(match, false);
    return parsed ? formatMacShortcut(parsed.canonical) : match;
  });
}

export interface KeyboardCaptureEventLike {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  isComposing?: boolean;
  repeat?: boolean;
}

export type KeyboardCaptureResult =
  | { status: 'ignore' }
  | { status: 'pending' }
  | { status: 'cancel' }
  | { status: 'commit'; value: string };

const MODIFIER_KEYS = new Set(['Meta', 'Control', 'Alt', 'Shift', 'CapsLock', 'Fn', 'FnLock']);

function eventKey(key: string): string | null {
  if (key === ' ') return 'Space';
  return canonicalKey(key);
}

export function captureKeyboardEvent(event: KeyboardCaptureEventLike): KeyboardCaptureResult {
  if (event.isComposing || event.repeat) return { status: 'ignore' };
  if (event.key === 'Escape') return { status: 'cancel' };
  if (MODIFIER_KEYS.has(event.key)) return { status: 'pending' };
  const key = eventKey(event.key);
  if (!key) return { status: 'ignore' };
  const modifiers: CanonicalModifier[] = [];
  if (event.metaKey) modifiers.push('Command');
  if (event.ctrlKey) modifiers.push('Control');
  if (event.altKey) modifiers.push('Option');
  if (event.shiftKey) modifiers.push('Shift');
  return { status: 'commit', value: [...modifiers, key].join(' + ') };
}
