import { invoke } from '@tauri-apps/api/core';

export interface ForegroundApplication { bundleId?: string; name?: string; }

export async function foregroundApplication(): Promise<ForegroundApplication> {
  try { return await invoke<ForegroundApplication>('foreground_application'); }
  catch { return {}; }
}

export function sheetForApplication(bundleId: string | undefined, sheets: { id: string; applications: string[] }[]): string | undefined {
  if (!bundleId) return undefined;
  return sheets.find((sheet) => sheet.applications.some((id) => id.toLocaleLowerCase() === bundleId.toLocaleLowerCase()))?.id;
}
