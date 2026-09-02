export interface NavigationMeasurement {
  id: string;
  width: number;
}

export function fitNavigation(
  candidates: readonly NavigationMeasurement[],
  availableWidth: number,
  gap = 3
): string[] {
  if (!candidates.length || availableWidth <= 0) return candidates[0] ? [candidates[0].id] : [];
  const visible: string[] = [];
  let used = 0;

  for (const candidate of candidates) {
    const width = Math.max(28, candidate.width);
    const next = width + (visible.length ? gap : 0);
    if (!visible.length || used + next <= availableWidth) {
      visible.push(candidate.id);
      used += next;
    }
  }
  return visible;
}
