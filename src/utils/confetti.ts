import confetti from 'canvas-confetti';

// Single task star burst
export function triggerTaskConfetti(originX = 0.5, originY = 0.5): void {
  confetti({
    particleCount: 40,
    spread: 60,
    origin: { x: originX, y: originY },
    colors: ['#F59E0B', '#FBBF24', '#34D399', '#60A5FA', '#F472B6'],
    shapes: ['star', 'circle'],
    scalar: 1.2,
    disableForReducedMotion: true,
  });
}

// Major Routine Completion Shower
export function triggerRoutineCelebration(): void {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Blast from both bottom corners
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.15, y: 0.8 },
      colors: ['#F59E0B', '#EC4899', '#8B5CF6', '#10B981', '#3B82F6'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.85, y: 0.8 },
      colors: ['#F59E0B', '#EC4899', '#8B5CF6', '#10B981', '#3B82F6'],
    });
  }, 250);
}

// Reward Claim Fireworks
export function triggerRewardFireworks(): void {
  confetti({
    particleCount: 100,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#FFD700', '#FFA500', '#FF69B4', '#00FFFF'],
    shapes: ['star'],
    scalar: 1.5,
  });
}
