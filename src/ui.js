import { notes, startRecord, stopRecord, playLoop, exportDraft } from './audio.js';

// build one-octave mini piano
const piano = document.getElementById('piano');
const whiteIdx = [0,2,4,5,7,9,11,12];
whiteIdx.forEach(idx => {
  const btn = document.createElement('button');
  btn.textContent = notes[idx];
  btn.className = 'white';
  btn.onclick = () => synth.triggerAttackRelease(notes[idx], '8n');
  piano.appendChild(btn);
});
[1,3,6,8,10].forEach(idx => {
  const btn = document.createElement('button');
  btn.textContent = notes[idx];
  btn.className = 'black';
  btn.onclick = () => synth.triggerAttackRelease(notes[idx], '8n');
  piano.appendChild(btn);
});

// record / loop / export buttons
let recording = false;
document.getElementById('recBtn').addEventListener('click', () => {
  if (!recording) { startRecord(); recording = true; document.getElementById('recBtn').textContent = '⏹ Stop'; }
  else { stopRecord(); recording = false; document.getElementById('recBtn').textContent = '⏺ Record'; }
});
document.getElementById('loopBtn').addEventListener('click', playLoop);
document.getElementById('expBtn').addEventListener('click', exportDraft);

// service worker registration
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./src/sw.js');
