import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Check, X, Link, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import type { SyncConfig, SyncStatus } from '../../types';
import {
  loadSyncConfig,
  saveSyncConfig,
  clearSyncConfig,
  createGist,
  validatePat,
  syncWithGist,
} from '../../utils/gistSync';

interface GistSyncSettingsProps {
  onSyncComplete?: () => Promise<void>;
}

export const GistSyncSettings: React.FC<GistSyncSettingsProps> = ({ onSyncComplete }) => {
  const [config, setConfig] = useState<SyncConfig | null>(null);
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Form state
  const [patInput, setPatInput] = useState('');
  const [gistIdInput, setGistIdInput] = useState('');
  const [showPat, setShowPat] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [setupStep, setSetupStep] = useState<'idle' | 'enter_pat' | 'choose_gist'>('idle');

  useEffect(() => {
    const saved = loadSyncConfig();
    if (saved) setConfig(saved);
  }, []);

  const isConfigured = !!config?.enabled && !!config.gistId && !!config.pat;

  async function handleManualSync() {
    if (!config) return;
    setStatus('syncing');
    setStatusMessage('Syncing...');
    const result = await syncWithGist(config);
    if (result.ok) {
      setStatus('synced');
      setStatusMessage(result.message);
      const updated = loadSyncConfig();
      if (updated) setConfig(updated);
      await onSyncComplete?.();
    } else {
      setStatus('error');
      setStatusMessage(result.error);
    }
  }

  async function handleValidatePat() {
    if (!patInput.trim()) return;
    setIsValidating(true);
    const ok = await validatePat(patInput.trim());
    setIsValidating(false);
    if (ok) {
      setSetupStep('choose_gist');
    } else {
      setStatus('error');
      setStatusMessage('Token invalid or missing "gist" scope. Please check and retry.');
    }
  }

  async function handleCreateGist() {
    if (!patInput.trim()) return;
    setIsCreating(true);
    const gistId = await createGist(patInput.trim());
    setIsCreating(false);
    if (gistId) {
      const newConfig: SyncConfig = {
        pat: patInput.trim(),
        gistId,
        enabled: true,
        lastSyncedAt: new Date().toISOString(),
      };
      saveSyncConfig(newConfig);
      setConfig(newConfig);
      setSetupStep('idle');
      setPatInput('');
      setStatus('synced');
      setStatusMessage('Gist created and initial data pushed!');
      await onSyncComplete?.();
    } else {
      setStatus('error');
      setStatusMessage('Failed to create Gist. Check your token permissions.');
    }
  }

  async function handleConnectExisting() {
    if (!patInput.trim() || !gistIdInput.trim()) return;
    const newConfig: SyncConfig = {
      pat: patInput.trim(),
      gistId: gistIdInput.trim(),
      enabled: true,
    };
    saveSyncConfig(newConfig);
    setConfig(newConfig);
    setSetupStep('idle');
    setPatInput('');
    setGistIdInput('');
    // Immediately sync to verify
    setStatus('syncing');
    setStatusMessage('Verifying connection...');
    const result = await syncWithGist(newConfig);
    if (result.ok) {
      setStatus('synced');
      setStatusMessage('Connected and synced!');
      const updated = loadSyncConfig();
      if (updated) setConfig(updated);
      await onSyncComplete?.();
    } else {
      setStatus('error');
      setStatusMessage(result.error);
    }
  }

  function handleDisconnect() {
    clearSyncConfig();
    setConfig(null);
    setStatus('idle');
    setStatusMessage('');
    setSetupStep('idle');
  }

  // ── Status Badge ───────────────────────────────────────────────────────────
  const statusColors: Record<SyncStatus, string> = {
    idle: 'bg-slate-100 text-slate-600',
    syncing: 'bg-blue-100 text-blue-700',
    synced: 'bg-emerald-100 text-emerald-700',
    error: 'bg-red-100 text-red-700',
    offline: 'bg-orange-100 text-orange-700',
  };

  const StatusIcon = () => {
    if (status === 'syncing') return <RefreshCw className="w-3.5 h-3.5 animate-spin" />;
    if (status === 'synced') return <Check className="w-3.5 h-3.5" />;
    if (status === 'error') return <X className="w-3.5 h-3.5" />;
    if (status === 'offline') return <WifiOff className="w-3.5 h-3.5" />;
    return <Wifi className="w-3.5 h-3.5" />;
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs max-w-xl">
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="p-2 rounded-xl bg-slate-900 text-white mt-0.5">
          <RefreshCw className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 leading-tight">GitHub Gist Sync</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sync your family's progress between devices via a private GitHub Gist — completely free.
          </p>
        </div>
      </div>

      {/* Status badge */}
      {statusMessage && (
        <div className={`mb-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${statusColors[status]}`}>
          <StatusIcon />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ── CONNECTED STATE ───────────────────────────────────────────────── */}
      {isConfigured && setupStep === 'idle' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Check className="w-4 h-4 stroke-[2.5]" />
              Sync connected
            </div>
            <div className="space-y-1 text-xs text-emerald-700">
              <div className="flex items-center gap-2">
                <Link className="w-3.5 h-3.5 opacity-60" />
                <span className="font-mono truncate">Gist: {config.gistId}</span>
              </div>
              {config.lastSyncedAt && (
                <div className="flex items-center gap-2 opacity-70">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Last synced: {new Date(config.lastSyncedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleManualSync}
              disabled={status === 'syncing'}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${status === 'syncing' ? 'animate-spin' : ''}`} />
              {status === 'syncing' ? 'Syncing…' : 'Sync Now'}
            </button>
            <button
              onClick={handleDisconnect}
              className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 cursor-pointer transition-all"
              title="Disconnect sync"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Sync happens automatically on app open. Tap "Sync Now" to force a manual sync.
          </p>
        </div>
      )}

      {/* ── NOT CONNECTED ─────────────────────────────────────────────────── */}
      {!isConfigured && setupStep === 'idle' && (
        <div className="space-y-3">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1.5">
            <p className="font-bold">How it works:</p>
            <ol className="list-decimal list-inside space-y-1 text-amber-700">
              <li>Create a GitHub Personal Access Token with <code className="bg-amber-100 px-1 rounded">gist</code> scope</li>
              <li>Click "Set Up Sync" below — we'll create a private Gist automatically</li>
              <li>Paste the same token on your other device to link them</li>
            </ol>
          </div>

          <a
            href="https://github.com/settings/tokens/new?scopes=gist&description=CapyStars+Sync"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Create GitHub Token (opens GitHub)
          </a>

          <button
            onClick={() => setSetupStep('enter_pat')}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            Set Up Sync
          </button>
        </div>
      )}

      {/* ── STEP 1: Enter PAT ─────────────────────────────────────────────── */}
      {setupStep === 'enter_pat' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              GitHub Personal Access Token
            </label>
            <div className="relative">
              <input
                type={showPat ? 'text' : 'password'}
                value={patInput}
                onChange={(e) => setPatInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPat((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPat ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Needs only the <code className="bg-slate-100 px-1 rounded">gist</code> scope.
              Stored locally on this device only.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setSetupStep('idle'); setPatInput(''); }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleValidatePat}
              disabled={!patInput.trim() || isValidating}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 disabled:opacity-50 cursor-pointer transition-all"
            >
              {isValidating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isValidating ? 'Validating…' : 'Validate Token'}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Choose Gist ───────────────────────────────────────────── */}
      {setupStep === 'choose_gist' && (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-bold">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            Token validated successfully!
          </div>

          <p className="text-sm font-bold text-slate-800">How would you like to connect?</p>

          {/* Option A: New Gist */}
          <button
            onClick={handleCreateGist}
            disabled={isCreating}
            className="w-full text-left p-4 rounded-2xl border-2 border-slate-900 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 font-black text-slate-900 text-sm mb-1">
              <Plus className="w-4 h-4" />
              {isCreating ? 'Creating Gist…' : 'Create a new Gist (first device)'}
            </div>
            <p className="text-xs text-slate-500">
              Creates a private Gist from your current data. Use this on the first device you set up.
            </p>
          </button>

          {/* Option B: Existing Gist */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Link className="w-4 h-4" />
              Connect to existing Gist (second device)
            </div>
            <p className="text-xs text-slate-500">
              Paste the Gist ID from your first device to link and sync.
            </p>
            <input
              type="text"
              value={gistIdInput}
              onChange={(e) => setGistIdInput(e.target.value.trim())}
              placeholder="e.g. abc123def456..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-900"
            />
            <button
              onClick={handleConnectExisting}
              disabled={!gistIdInput.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-all"
            >
              <Link className="w-4 h-4" />
              Connect & Sync
            </button>
          </div>

          <button
            onClick={() => setSetupStep('enter_pat')}
            className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer underline"
          >
            ← Change token
          </button>
        </div>
      )}
    </div>
  );
};
