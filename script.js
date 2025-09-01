// ======== TRACK STATES =========
// Track mute states (dot toggles)
let trackActive = {
  kick: true,
  bass: true,
  snare: true,
  chord: true
};

// Track-by-track FX bypass state (FX toggles)
let trackFXEnabled = {
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

// ======== DOT TOGGLES (mute/unmute tracks) =========
document.querySelectorAll('.minimal-toggle input').forEach(checkbox => {
  checkbox.addEventListener('change', function() {
    const track = this.dataset.track;
    trackActive[track] = this.checked; // mute/unmute
  });
});

// ======== FX TOGGLES (bypass FX for a track) =========
document.querySelectorAll(".fx-toggle").forEach(toggle => {
  toggle.addEventListener("change", e => {
    const track = e.target.dataset.track;
    trackFXEnabled[track] = e.target.checked;

    // Optional: dim sequencer steps when FX are bypassed
    const sequencer = e.target.closest(".sequencer");
    if (sequencer) {
      sequencer.querySelectorAll(".step").forEach(step => {
        step.style.opacity = e.target.checked ? "1" : "0.3";
      });
    }
  });
});

// ======== AUDIO CONTEXT + FX NODES =========
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioCtx.createGain();
masterGain.connect(audioCtx.destination);
masterGain.gain.value = 1;

// Example FX nodes (define all your FX here)
const lowpass = audioCtx.createBiquadFilter();
lowpass.type = "lowpass";
const highpass = audioCtx.createBiquadFilter();
highpass.type = "highpass";
const distortion = audioCtx.createWaveShaper();
const delay = audioCtx.createDelay();
const reverb = audioCtx.createConvolver();
const chorus = audioCtx.createGain(); // placeholder

// Track FX active state (global FX toggles/buttons)
let fxActive = {
  lowpass: false,
  highpass: false,
  distortion: false,
  delay: false,
  reverb: false,
  chorus: false
};

// ======== BUILD AUDIO ROUTING =========
function buildChain(source, track) {
  let node = source;

  if (trackFXEnabled[track]) {
    // Pass through active FX chain
    if (fxActive.lowpass) node = node.connect(lowpass);
    if (fxActive.highpass) node = node.connect(highpass);
    if (fxActive.distortion) node = node.connect(distortion);
    if (fxActive.delay) node = node.connect(delay);
    if (fxActive.reverb) node = node.connect(reverb);
    if (fxActive.chorus) node = node.connect(chorus);
  }

  // Always connect last node to master
  node.connect(masterGain);
}

// ======== SOUND GENERATORS =========
function playKick(time) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(0.001, time + 0.5);

  gain.gain.setValueAtTime(1, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

  osc.connect(gain);
  buildChain(gain, "kick");

  osc.start(time);
  osc.stop(time + 0.5);
}

function playBass(time) {
  const osc = audioCtx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = 55;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

  osc.connect(gain);
  buildChain(gain, "bass");

  osc.start(time);
  osc.stop(time + 0.5);
}

function playSnare(time) {
  const bufferSize = audioCtx.sampleRate * 0.2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1000;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(1, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

  noise.connect(filter);
  filter.connect(gain);
  buildChain(gain, "snare");

  noise.start(time);
  noise.stop(time + 0.2);
}

function playChord(time) {
  const freqs = [261.63, 329.63, 392.00]; // C major triad
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5);

  freqs.forEach(f => {
    const osc = audioCtx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = f;
    osc.connect(gain);
    osc.start(time);
    osc.stop(time + 1.5);
  });

  buildChain(gain, "chord");
}

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
