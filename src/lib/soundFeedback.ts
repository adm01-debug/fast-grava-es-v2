// Sound feedback utility for operator interactions
// Uses Web Audio API for lightweight, no-file-needed sounds

const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as unknown as Record<string, typeof AudioContext>).webkitAudioContext)() : null;

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  if (!audioContext) return;
  
  try {
    // Resume context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch {
    // Silently fail if audio is not available
  }
}

export const SoundFeedback = {
  /** Short success beep - production started or finished */
  success() {
    playTone(880, 0.15, 'sine');
    setTimeout(() => playTone(1100, 0.2, 'sine'), 150);
  },

  /** Warning tone - pause */
  warning() {
    playTone(440, 0.3, 'triangle');
  },

  /** Error tone */
  error() {
    playTone(200, 0.4, 'sawtooth', 0.1);
  },

  /** Soft click for interactions */
  click() {
    playTone(600, 0.05, 'sine', 0.08);
  },

  /** Achievement unlocked fanfare */
  achievement() {
    playTone(523, 0.1, 'sine');
    setTimeout(() => playTone(659, 0.1, 'sine'), 100);
    setTimeout(() => playTone(784, 0.15, 'sine'), 200);
    setTimeout(() => playTone(1047, 0.3, 'sine'), 300);
  },
};
