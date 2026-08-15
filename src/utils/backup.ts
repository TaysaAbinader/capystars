import type { BackupData } from '../types';
import { exportAllData, importAllData } from '../db';

export async function downloadBackupJson(): Promise<void> {
  const data = await exportAllData();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const nowStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `capystars-family-backup-${nowStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function parseAndRestoreBackupFile(file: File): Promise<{ success: boolean; error?: string }> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text) as BackupData;
    return await importAllData(parsed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid JSON file';
    return { success: false, error: msg };
  }
}
