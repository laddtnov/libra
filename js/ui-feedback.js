import { state } from './state.js';

function initAudioContext() {
  const AudioContextCtor = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!state.audioContext && AudioContextCtor) state.audioContext = new AudioContextCtor();
  return state.audioContext;
}

export function playClickSound() {
  if (!state.soundEnabled) return;
  try {
    const ctx = initAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 600;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch (error) {
    console.debug('Click sound skipped:', error);
  }
}

export function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  const btn = document.getElementById('sound-toggle');
  if (btn) {
    btn.textContent = state.soundEnabled ? '🔊 ON' : '🔇 OFF';
    btn.style.color = state.soundEnabled ? '#00ff00' : '#444';
  }
}

export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = `> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 2200);
}
