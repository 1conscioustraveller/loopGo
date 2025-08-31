import { micTest, loop, exportStems } from './audio.js';

document.getElementById('micBtn').onclick = micTest;
document.getElementById('loopBtn').onclick = loop;
document.getElementById('expBtn').onclick = exportStems;

// Register Service Worker
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./src/sw.js');
