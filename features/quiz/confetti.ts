export async function fireConfetti() {
  if (typeof window === "undefined") return;

  try {
    const mod = await import("canvas-confetti");
    const confetti = mod.default;
    confetti({
      particleCount: 80,
      spread: 55,
      startVelocity: 28,
      scalar: 0.75,
      origin: { y: 0.2 }
    });
  } catch {
    // graceful fallback
  }
}
