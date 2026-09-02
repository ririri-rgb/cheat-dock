import type { SearchHit } from './search.ts';

export interface OtherSheetSearchGroup {
  sheetId: string;
  sheetTitle: string;
  hits: SearchHit[];
}

export interface GroupedSearchHits {
  current: SearchHit[];
  other: OtherSheetSearchGroup[];
}

export function groupSearchHits(hits: readonly SearchHit[], currentSheetId: string): GroupedSearchHits {
  const current: SearchHit[] = [];
  const groups = new Map<string, OtherSheetSearchGroup>();

  for (const hit of hits) {
    if (hit.sheetId === currentSheetId) {
      current.push(hit);
      continue;
    }
    let group = groups.get(hit.sheetId);
    if (!group) {
      group = { sheetId: hit.sheetId, sheetTitle: hit.sheetTitle, hits: [] };
      groups.set(hit.sheetId, group);
    }
    group.hits.push(hit);
  }

  return { current, other: [...groups.values()] };
}
