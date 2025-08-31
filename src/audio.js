import * as Tone from 'https://cdn.skypack.dev/tone@14.8.49';
import { Mp3Recorder } from 'https://cdn.skypack.dev/mic-recorder-to-mp3@2.2.2';

await Tone.start();
const synth = new Tone.Synth().toDestination();
const drum = new Tone.Players({
  kick: './src/assets/samples/kick.wav',
  snare: './src/assets/samples/snare.wav'
}).toDestination();

const recorder = new Mp3Recorder({ bitRate: 128 });
Tone.Transport.bpm.value = 120;

export const micTest = () => {
  recorder.start();
  setTimeout(async () => {
    const [, blob] = await recorder.stop().getMp3();
    download(blob, 'mic-test.mp3');
  }, 3000);
};

export const loop = () => {
  new Tone.Loop(t => synth.triggerAttackRelease('C4', '8n', t), '4n').start();
  new Tone.Loop(t => drum.player('kick').start(t), '2n').start();
  Tone.Transport.start();
};

export const exportStems = async () => {
  const buffer = await Tone.Offline(() => {
    const offSynth = new Tone.Synth().toDestination();
    const offDrum = new Tone.Players({
      kick: './src/assets/samples/kick.wav',
      snare: './src/assets/samples/snare.wav'
    }).toDestination();
    new Tone.Loop(t => offSynth.triggerAttackRelease('C4', '8n', t), '4n').start();
    new Tone.Loop(t => offDrum.player('kick').start(t), '2n').start();
    Tone.Transport.start();
  }, '4m');
  const wav = bufferToWav(buffer);
  download(new Blob([wav], { type: 'audio/wav' }), 'stem.wav');
};

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function bufferToWav(buffer) {
  const len = 44 + buffer.length * buffer.numberOfChannels * 2;
  const arr = new ArrayBuffer(len);
  const view = new DataView(arr);
  const write = (pos, str) => [...str].forEach((c, i) => view.setUint8(pos + i, c.charCodeAt(0)));
  write(0, 'RIFF'); view.setUint32(4, len - 8, true);
  write(8, 'WAVE'); write(12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, buffer.numberOfChannels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
  view.setUint16(32, buffer.numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  write(36, 'data'); view.setUint32(40, buffer.length * buffer.numberOfChannels * 2, true);
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
  }
  return arr;
}
