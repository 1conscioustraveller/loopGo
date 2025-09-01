// ======== AUDIO CONTEXT =========
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// ======== SOUND GENERATORS =========
function playKick(time) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(0.001, time + 0.5);

  gain.gain.setValueAtTime(1, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

  osc.connect(gain).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + 0.5);
}

function playSnare(time) {
  const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.2, audioCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1000;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(1, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

  noise.connect(filter).connect(gain).connect(audioCtx.destination);
  noise.start(time);
  noise.stop(time + 0.2);
}

function playBass(time) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(55, time);

  gain.gain.setValueAtTime(0.5, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

  osc.connect(gain).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + 0.5);
}

function playChord(time) {
  const freqs = [261.63, 329.63, 392.00]; // C major chord
  freqs.forEach(freq => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 1);
  });
}

// ======== SEQUENCER LOGIC =========
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

    // Highlight current step
    grid.forEach(s => s.classList.remove('playing'));
    step.classList.add('playing');

    if (step.classList.contains('active')) {
      if (seqIndex === 0) playKick(now);
      if (seqIndex === 1) playBass(now);
      if (seqIndex === 2) playSnare(now);
      if (seqIndex === 3) playChord(now);
    }
  });

  currentStep = (currentStep + 1) % 8;
  timer = setTimeout(scheduler, getInterval() * 1000);
}

// ======== STEP TOGGLING =========
steps.forEach(step => {
  step.addEventListener('click', () => {
    step.classList.toggle('active');
  });
});

// ======== CONTROLS =========
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const tempoSlider = document.getElementById('tempo');
const tempoValue = document.getElementById('tempoValue');

playBtn.addEventListener('click', () => {
  if (!isPlaying) {
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    isPlaying = true;
    scheduler();
  }
});

stopBtn.addEventListener('click', () => {
  isPlaying = false;
  clearTimeout(timer);
  currentStep = 0;
  document.querySelectorAll('.step').forEach(s => s.classList.remove('playing'));
});

tempoSlider.addEventListener('input', e => {
  bpm = parseInt(e.target.value, 10);
  tempoValue.textContent = bpm;
});
