import type { SupportedLocale } from './model.ts';

export interface UiText {
  allSheets: string;
  search: string;
  pin: string;
  unpin: string;
  addItem: string;
  addSheet: string;
  recent: string;
  noMatches: string;
  noItems: string;
  resultSuffix: string;
  edit: string;
  delete: string;
}

const EN: UiText = {
  allSheets: 'All Sheets…', search: 'Search all Cheat Sheets', pin: 'Pin', unpin: 'Unpin',
  addItem: '＋ Item', addSheet: '＋ Sheet', recent: 'Recently viewed', noMatches: 'No matches.',
  noItems: 'No items yet.', resultSuffix: 'results across all sheets', edit: 'Edit', delete: 'Delete'
};

const JA: UiText = {
  ...EN,
  search: 'すべてのチートシートを検索', pin: 'ピン留め', unpin: 'ピン解除', recent: '最近見た項目',
  noMatches: '一致する項目はありません。', noItems: '項目はまだありません。', resultSuffix: '件の検索結果'
};

export function uiText(locale: SupportedLocale): UiText {
  return locale === 'ja' ? JA : EN;
}
