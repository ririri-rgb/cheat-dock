const TOKEN_MAP: Record<string, string> = {
  command: '⌘', cmd: '⌘', option: '⌥', alt: '⌥', shift: '⇧', control: '⌃', ctrl: '⌃',
  return: '↩', enter: '↩', backspace: '⌫', tab: '⇥', left: '←', right: '→', up: '↑', down: '↓',
  escape: 'Esc', esc: 'Esc', space: 'Space'
};
const SYMBOLS = new Set(['⌘', '⌥', '⇧', '⌃', '↩', '⌫', '⇥', '←', '→', '↑', '↓']);

export function formatMacShortcut(raw: string): string {
  const value = raw.normalize('NFKC').trim();
  if (!value) return '';
  const tokens = value
    .replace(/\+/g, ' ')
    .match(/[⌘⌥⇧⌃↩⌫⇥←→↑↓]|[^\s⌘⌥⇧⌃↩⌫⇥←→↑↓]+/g) ?? [];
  return tokens.map((token) => {
    if (SYMBOLS.has(token)) return token;
    return TOKEN_MAP[token.toLowerCase()] ?? token;
  }).join(' ');
}
