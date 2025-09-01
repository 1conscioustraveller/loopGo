// Track mute states (dot toggles)
let trackActive = {
  kick: true,
  bass: true,
  snare: true,
  chord: true
};

// ======== STEP TOGGLING =========
document.querySelectorAll('.step').forEach(step => {
  step.addEventListener('click', () => {
    step.classList.toggle('active');
  });
});

// ======== DOT TOGGLES =========
document.querySelectorAll('.minimal-toggle input').forEach(checkbox => {
  checkbox.addEventListener('change', function() {
    const track = this.dataset.track;
    trackActive[track] = this.checked; // mute/unmute track
  });
});

// ======== AUDIO CONTEXT + FX (your previous setup, unchanged) ========
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioCtx.createGain();
masterGain.connect(audioCtx.destination);
masterGain.gain.value = 1;

// ... (lowpass, highpass, distortion, delay, reverb, chorus, etc. as before)

// ======== SOUND GENERATORS (unchanged except mute check in scheduler) ========

// ======== SEQUENCER =========
const steps = document.querySelectorAll('.step');
let currentStep = 0;
let bpm = 120;
let isPlaying = false;
let timer;

function getInterval() {
  return (60 / bpm) / 2; // 8th notes
}

function scheduler() {
  const now = audioCtx.currentTime;

  document.querySelectorAll('.sequencer').forEach((seq, seqIndex) => {
    const grid = seq.querySelectorAll('.step');
    const step = grid[currentStep];

    grid.forEach(s => s.classList.remove('playing'));
    step.classList.add('playing');

    if (step.classList.contains('active')) {
      switch (seqIndex) {
        case 0: if (trackActive.kick) playKick(now); break;
        case 1: if (trackActive.bass) playBass(now); break;
        case 2: if (trackActive.snare) playSnare(now); break;
        case 3: if (trackActive.chord) playChord(now); break;
      }
    }
  });

  currentStep = (currentStep + 1) % 8;
  timer = setTimeout(scheduler, getInterval() * 1000);
}

// ======== CONTROLS =========
document.getElementById('playBtn').addEventListener('click', () => {
  if (!isPlaying) {
    if (audioCtx.state === "suspended") audioCtx.resume();
    isPlaying = true;
    scheduler();
  }
});
document.getElementById('stopBtn').addEventListener('click', () => {
  isPlaying = false;
  clearTimeout(timer);
  currentStep = 0;
  document.querySelectorAll('.step').forEach(s => s.classList.remove('playing'));
});
document.getElementById('tempo').addEventListener('input', e => {
  bpm = parseInt(e.target.value, 10);
  document.getElementById('tempoValue').textContent = bpm;
});
