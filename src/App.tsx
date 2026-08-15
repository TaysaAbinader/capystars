import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db,
  initializeDatabase,
  completeChore,
  uncompleteChore,
  claimReward,
  fulfillReward,
  cancelClaimedReward,
  adjustStars,
  switchPet,
  approveChore,
  rejectChore,
} from './db';
import type { Chore, Reward, PetType, AppSettings, SyncStatus } from './types';
import { DEFAULT_SETTINGS, DEFAULT_PET } from './db/defaultData';
import { Header } from './components/common/Header';
import { PinPadModal } from './components/common/PinPadModal';
import { ChildDashboard } from './components/child/ChildDashboard';
import { RewardShop } from './components/child/RewardShop';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { unlockAudio } from './utils/sound';
import { loadSyncConfig, syncWithGist } from './utils/gistSync';

export function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [isParentMode, setIsParentMode] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [activeChildView, setActiveChildView] = useState<'chores' | 'rewards'>('chores');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  // Reactive live queries from Dexie IndexedDB
  const settings = useLiveQuery(() => db.settings.get('global_settings'), []) || DEFAULT_SETTINGS;
  const petRecord = useLiveQuery(() => db.pet.get('active_pet'), []);
  const activePet = petRecord || { id: 'active_pet', ...DEFAULT_PET };
  const chores = useLiveQuery(() => db.chores.orderBy('orderIndex').toArray(), []) || [];
  const rewards = useLiveQuery(() => db.rewards.toArray(), []) || [];
  const starLogs = useLiveQuery(() => db.starLogs.orderBy('createdAt').reverse().toArray(), []) || [];

  // Initialize DB on launch, then auto-sync if configured
  useEffect(() => {
    initializeDatabase().then(async () => {
      setIsDbReady(true);
      // Auto-sync on startup if Gist sync is configured
      const syncConfig = loadSyncConfig();
      if (syncConfig?.enabled && syncConfig.gistId && syncConfig.pat) {
        setSyncStatus('syncing');
        const result = await syncWithGist(syncConfig);
        setSyncStatus(result.ok ? 'synced' : 'error');
        // Reset to idle after 3s so the dot doesn't stay forever
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    });
  }, []);

  // Unlock web audio on first tap
  useEffect(() => {
    const handleFirstTouch = () => {
      unlockAudio();
      window.removeEventListener('pointerdown', handleFirstTouch);
    };
    window.addEventListener('pointerdown', handleFirstTouch);
    return () => window.removeEventListener('pointerdown', handleFirstTouch);
  }, []);

  if (!isDbReady) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-2">🦫✨</div>
          <p className="font-extrabold text-amber-950 text-base">Waking up CapyStars...</p>
        </div>
      </div>
    );
  }

  // ---------------- Handlers ---------------- //

  const handleToggleChore = async (chore: Chore) => {
    if (chore.status === 'completed' || chore.status === 'pending_approval') {
      await uncompleteChore(chore.id);
    } else {
      await completeChore(chore.id);
    }
  };

  const handleSelectPet = async (type: PetType, name: string) => {
    await switchPet(type, name);
  };

  const handleClaimReward = async (rewardId: string) => {
    return await claimReward(rewardId);
  };

  const handleSaveChore = async (chore: Chore) => {
    await db.chores.put(chore);
  };

  const handleDeleteChore = async (id: string) => {
    await db.chores.delete(id);
  };

  const handleSaveReward = async (reward: Reward) => {
    await db.rewards.put(reward);
  };

  const handleDeleteReward = async (id: string) => {
    await db.rewards.delete(id);
  };

  const handleToggleSound = async () => {
    const newSound = !settings.soundEnabled;
    await db.settings.update('global_settings', { soundEnabled: newSound });
  };

  const handleUpdateSettings = async (updates: Partial<AppSettings>) => {
    await db.settings.update('global_settings', updates);
  };

  const handleReloadAllData = async () => {
    // Triggers reactive reload
    const current = await db.settings.get('global_settings');
    if (current) {
      await db.settings.update('global_settings', { id: 'global_settings' });
    }
  };

  // ---------------- View Rendering ---------------- //

  if (isParentMode) {
    return (
      <ParentDashboard
        settings={settings}
        chores={chores}
        rewards={rewards}
        starLogs={starLogs}
        onExitParentMode={() => setIsParentMode(false)}
        onSaveChore={handleSaveChore}
        onDeleteChore={handleDeleteChore}
        onSaveReward={handleSaveReward}
        onDeleteReward={handleDeleteReward}
        onFulfillReward={fulfillReward}
        onCancelClaimedReward={cancelClaimedReward}
        onApproveChore={approveChore}
        onRejectChore={rejectChore}
        onAdjustStars={adjustStars}
        onUpdateSettings={handleUpdateSettings}
        onReloadAllData={handleReloadAllData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/50 text-slate-800 pb-16">
      {/* 1. Common Top Header */}
      <Header
        settings={settings}
        activeView={activeChildView}
        onViewChange={setActiveChildView}
        onOpenParentGate={() => setIsPinModalOpen(true)}
        onToggleSound={handleToggleSound}
        syncStatus={syncStatus}
      />

      {/* 2. Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-5">
        {activeChildView === 'chores' ? (
          <ChildDashboard
            chores={chores}
            pet={activePet}
            onToggleChore={handleToggleChore}
            onSelectPet={handleSelectPet}
            soundEnabled={settings.soundEnabled}
          />
        ) : (
          <RewardShop
            currentStars={settings.currentStars}
            rewards={rewards}
            onClaimReward={handleClaimReward}
            soundEnabled={settings.soundEnabled}
          />
        )}
      </main>

      {/* 3. PIN Pad Modal for Parent Access */}
      <PinPadModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          setIsPinModalOpen(false);
          setIsParentMode(true);
        }}
        storedPinHash={settings.pinHash}
        soundEnabled={settings.soundEnabled}
      />
    </div>
  );
}

export default App;
