export interface ForegroundApplication { bundleId?: string; name?: string; }

export function sheetForApplication(bundleId: string | undefined, sheets: { id: string; applications: string[] }[]): string | undefined {
  if (!bundleId) return undefined;
  return sheets.find((sheet) => sheet.applications.some((id) => id.toLocaleLowerCase() === bundleId.toLocaleLowerCase()))?.id;
}
