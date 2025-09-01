# Build Order & File Map

📁 root
├── index.html               ← one-line entry point (mobile PWA)
├── manifest.json            ← installable on Android/iOS, no server
├── src/
│   ├── sw.js                ← Service Worker (cache cap 50 MB, TTL 1 h)
│   ├── audio.js             ← Tone.js core + 10 chosen tools
│   ├── ui.js                ← 100 % touch UI (< 20 kB)
│   └── assets/
│       ├── samples/         ← 4 mono 22 kHz one-shots (< 200 kB total)
│       └── icons/           ← 192×192 & 512×512 PNG
├── STRUCTURE.md             ← this file
└── README.md                ← progressive checklist
