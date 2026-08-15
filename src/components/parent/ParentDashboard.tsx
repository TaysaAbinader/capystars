import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckSquare,
  Gift,
  Clock,
  Star,
  Settings,
  HardDrive,
  Check,
  Shield,
  RefreshCw,
} from 'lucide-react';
import type { Chore, Reward, StarLog, AppSettings } from '../../types';
import { ChoreManager } from './ChoreManager';
import { RewardManager } from './RewardManager';
import { ApprovalQueue } from './ApprovalQueue';
import { StarLedger } from './StarLedger';
import { BackupRestore } from './BackupRestore';
import { GistSyncSettings } from './GistSyncSettings';
import { hashPin } from '../../utils/crypto';

interface ParentDashboardProps {
  settings: AppSettings;
  chores: Chore[];
  rewards: Reward[];
  starLogs: StarLog[];
  onExitParentMode: () => void;
  onSaveChore: (chore: Chore) => Promise<void>;
  onDeleteChore: (id: string) => Promise<void>;
  onSaveReward: (reward: Reward) => Promise<void>;
  onDeleteReward: (id: string) => Promise<void>;
  onFulfillReward: (id: string) => Promise<void>;
  onCancelClaimedReward: (id: string) => Promise<void>;
  onApproveChore: (choreId: string) => Promise<void>;
  onRejectChore: (choreId: string) => Promise<void>;
  onAdjustStars: (amount: number, reason: string) => Promise<void>;
  onUpdateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  onReloadAllData: () => Promise<void>;
}

type ParentTab = 'chores' | 'rewards' | 'approvals' | 'ledger' | 'settings' | 'backup' | 'sync';

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  settings,
  chores,
  rewards,
  starLogs,
  onExitParentMode,
  onSaveChore,
  onDeleteChore,
  onSaveReward,
  onDeleteReward,
  onFulfillReward,
  onCancelClaimedReward,
  onApproveChore,
  onRejectChore,
  onAdjustStars,
  onUpdateSettings,
  onReloadAllData,
}) => {
  const [activeTab, setActiveTab] = useState<ParentTab>('chores');

  // Settings State
  const [childName, setChildName] = useState(settings.childName);
  const [requireApproval, setRequireApproval] = useState(settings.requireApproval);
  const [newPin, setNewPin] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  const pendingChores = chores.filter((c) => c.status === 'pending_approval');
  const claimedRewardsCount = rewards.filter((r) => r.status === 'claimed').length;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<AppSettings> = {
      childName: childName.trim() || 'My Champion',
      requireApproval,
    };

    if (newPin.trim().length === 4) {
      updates.pinHash = hashPin(newPin.trim());
    }

    await onUpdateSettings(updates);
    setNewPin('');
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 safe-top">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onExitParentMode}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Kid View</span>
            </button>
            <div className="hidden sm:block">
              <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-500" />
                Parent Command Center
              </h1>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Daughter: <span className="font-extrabold text-slate-800">{settings.childName}</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          <button
            onClick={() => setActiveTab('chores')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'chores'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <span>Chores ({chores.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rewards'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Gift className="w-4 h-4 text-pink-400" />
            <span>Rewards ({rewards.length})</span>
            {claimedRewardsCount > 0 && (
              <span className="bg-pink-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {claimedRewardsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'approvals'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Approvals</span>
            {pendingChores.length > 0 && (
              <span className="bg-blue-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                {pendingChores.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ledger'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400" />
            <span>Star Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Backup</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sync'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-blue-400" />
            <span>Sync</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'chores' && (
          <ChoreManager
            chores={chores}
            onSaveChore={onSaveChore}
            onDeleteChore={onDeleteChore}
          />
        )}

        {activeTab === 'rewards' && (
          <RewardManager
            rewards={rewards}
            onSaveReward={onSaveReward}
            onDeleteReward={onDeleteReward}
            onFulfillReward={onFulfillReward}
            onCancelClaimedReward={onCancelClaimedReward}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalQueue
            pendingChores={pendingChores}
            onApprove={onApproveChore}
            onReject={onRejectChore}
          />
        )}

        {activeTab === 'ledger' && (
          <StarLedger
            currentStars={settings.currentStars}
            totalEarnedStars={settings.totalEarnedStars}
            starLogs={starLogs}
            onAdjustStars={onAdjustStars}
          />
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs max-w-xl">
            <h3 className="text-lg font-black text-slate-900 mb-1">Parent & Child Settings</h3>
            <p className="text-xs text-slate-500 mb-6">Customize child name, approval rules, and security PIN</p>

            {settingsSaved && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>Settings updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <label htmlFor="childNameInput" className="block text-xs font-bold text-slate-700 mb-1">Daughter's Name</label>
                <input
                  id="childNameInput"
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-900"
                />
              </div>

              {/* Strict Approval Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Require Parent Approval</h4>
                  <p className="text-[11px] text-slate-500">
                    When ON, completed chores go to the Approval Queue before awarding stars.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              {/* Change 4-digit PIN */}
              <div>
                <label htmlFor="newPinInput" className="block text-xs font-bold text-slate-700 mb-1">Change 4-Digit Parent PIN</label>
                <input
                  id="newPinInput"
                  type="password"
                  maxLength={4}
                  pattern="[0-9]*"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 4 numbers (e.g. 5678)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1">Leave blank to keep your current PIN.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-extrabold text-white bg-slate-900 hover:bg-slate-800 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save All Settings</span>
              </button>
            </form>
          </div>
        )}

        {activeTab === 'backup' && (
          <BackupRestore onDataRestored={onReloadAllData} />
        )}

        {activeTab === 'sync' && (
          <GistSyncSettings onSyncComplete={onReloadAllData} />
        )}
      </div>
    </div>
  );
};
