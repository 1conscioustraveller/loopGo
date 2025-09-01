import * as Tone from 'https://cdn.skypack.dev/tone@14.8.49';

await Tone.start();
Tone.Transport.bpm.value = 100;

// --- load your real samples ---
const drum = new Tone.Players({
  kick: './src/assets/samples/kick.wav',
  snare: './src/assets/samples/snare.wav'
}, () => console.log('samples loaded')).toDestination();

const synth = new Tone.Synth({ oscillator: { type: 'triangle' } }).toDestination();

let pattern = []; // [{note, time}]
let isRecording = false;
let recStartTicks = 0;

export const startRecord = () => {
  pattern = [];
  isRecording = true;
  recStartTicks = Tone.Transport.ticks;
};

export const stopRecord = () => (isRecording = false);

export const playLoop = () => {
  Tone.Transport.cancel();
  pattern.forEach(({note, time}) => synth.triggerAttackRelease(note, '8n', time));
  // 4-on-floor kick
  for (let bar = 0; bar < 4; bar++) drum.player('kick').start(`${bar}:0:0`);
  Tone.Transport.start('+0.1');
};

export const exportDraft = async () => {
  const buffer = await Tone.Offline(async () => {
    const offSynth = new Tone.Synth({ oscillator: { type: 'triangle' } }).toDestination();
    const offDrum = new Tone.Players({
      kick: './src/assets/samples/kick.wav',
      snare: './src/assets/samples/snare.wav'
    }).toDestination();
    pattern.forEach(({note, time}) => offSynth.triggerAttackRelease(note, '8n', time));
    for (let bar = 0; bar < 4; bar++) {
      offDrum.player('kick').start(`${bar}:0:0`);
      offDrum.player('snare').start(`${bar}:2:0`);
    }
    Tone.Transport.start();
  }, '4m');
  const wav = bufferToWav(buffer);
  download(new Blob([wav], {type:'audio/wav'}), 'draft.wav');
};

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function bufferToWav(buf) {
  const len = 44 + buf.length * buf.numberOfChannels * 2;
  const arr = new ArrayBuffer(len);
  const view = new DataView(arr);
  const write = (pos, str) => [...str].forEach((c, i) => view.setUint8(pos + i, c.charCodeAt(0)));
  write(0, 'RIFF'); view.setUint32(4, len - 8, true);
  write(8, 'WAVE'); write(12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, buf.numberOfChannels, true);
  view.setUint32(24, buf.sampleRate, true);
  view.setUint32(28, buf.sampleRate * buf.numberOfChannels * 2, true);
  view.setUint16(32, buf.numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  write(36, 'data'); view.setUint32(40, buf.length * buf.numberOfChannels * 2, true);
  let offset = 44;
  for (let i = 0; i < buf.length; i++) {
    for (let ch = 0; ch < buf.numberOfChannels; ch++) {
      const s = Math.max(-1, Math.min(1, buf.getChannelData(ch)[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
  }
  return arr;
}

export const notes = ['C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4','C5'];
