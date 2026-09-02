export type CheatKind = 'shortcut' | 'command' | 'operation' | 'procedure' | 'snippet';
export type SupportedLocale = 'en' | 'ja';
export type LocalizedTitles = Partial<Record<Exclude<SupportedLocale, 'en'>, string>>;

export interface CheatItem {
  id: string;
  title: string;
  localizedTitles?: LocalizedTitles;
  kind: CheatKind;
  description?: string;
  shortcut?: string;
  command?: string;
  aliases: string[];
  tags: string[];
  body?: string;
  source?: string;
  userOwned?: boolean;
}

export interface CheatSection {
  id: string;
  title: string;
  localizedTitles?: LocalizedTitles;
  items: CheatItem[];
  userOwned?: boolean;
}

export interface CheatSheet {
  id: string;
  title: string;
  localizedTitles?: LocalizedTitles;
  description?: string;
  aliases: string[];
  applications: string[];
  related: string[];
  sections: CheatSection[];
  userOwned?: boolean;
}

export interface AppState {
  version: 1;
  pinned: string[];
  recent: Record<string, string[]>;
  expanded: Record<string, string[]>;
  userSheets: CheatSheet[];
  overlays: Record<string, CheatSection[]>;
}

export const EMPTY_STATE: AppState = {
  version: 1,
  pinned: ['excel', 'git', 'vim', 'my-work'],
  recent: {},
  expanded: {},
  userSheets: [],
  overlays: {}
};
