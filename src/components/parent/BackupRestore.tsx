import React, { useRef, useState } from 'react';
import { Download, Upload, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { downloadBackupJson, parseAndRestoreBackupFile } from '../../utils/backup';
import { db, initializeDatabase } from '../../db';

interface BackupRestoreProps {
  onDataRestored: () => Promise<void>;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ onDataRestored }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = async () => {
    try {
      await downloadBackupJson();
      setStatusMessage({ text: 'Backup downloaded successfully! Keep this file in a safe place. 📁' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch {
      setStatusMessage({ text: 'Failed to download backup.', isError: true });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const result = await parseAndRestoreBackupFile(file);
    setIsProcessing(false);

    if (result.success) {
      await onDataRestored();
      setStatusMessage({ text: 'Backup successfully restored! 🎉' });
    } else {
      setStatusMessage({ text: result.error || 'Failed to restore backup.', isError: true });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Are you sure you want to reset all chores, stars, and rewards to default starter values? This cannot be undone.')) {
      setIsProcessing(true);
      await db.settings.clear();
      await db.pet.clear();
      await db.chores.clear();
      await db.rewards.clear();
      await db.starLogs.clear();
      await initializeDatabase();
      await onDataRestored();
      setIsProcessing(false);
      setStatusMessage({ text: 'Reset to starter defaults complete!' });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-black text-slate-900">Backup & Data Portability</h3>
        <p className="text-xs text-slate-500">
          Save your family chores and star balances, or transfer data between devices
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
            statusMessage.isError
              ? 'bg-rose-100 text-rose-900 border border-rose-300'
              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
          }`}
        >
          {statusMessage.isError ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Export Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900">Export Family Backup</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Download a single `.json` file with all your routines, pets, and star records.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-amber-500 hover:bg-amber-600 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup (.json)</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900">Restore from Backup</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Upload a previously exported `.json` file to restore all your data.
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{isProcessing ? 'Restoring...' : 'Select Backup File'}</span>
          </button>
        </div>
      </div>

      {/* Danger / Reset Box */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h5 className="font-bold text-xs text-slate-800">Reset to Starter Defaults</h5>
          <p className="text-[11px] text-slate-500">Restore the original starter chores and rewards</p>
        </div>
        <button
          onClick={handleResetDefaults}
          disabled={isProcessing}
          className="py-2 px-3 rounded-xl font-bold text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset App Data</span>
        </button>
      </div>
    </div>
  );
};
