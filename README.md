# Mobile Draft-DAW – Progressive Checklist
Tick every box before moving to the next line.

- [ ] 0. Clone repo → run `npx serve .` → open on 1 GB Android phone.
- [ ] 1. `index.html` loads without network errors; `manifest.json` installs as PWA.
- [ ] 2. `sw.js` registers → DevTools → Application → Cache Storage shows **max 50 MB**.
- [ ] 3. Tap “Mic Test” → records 3 s → downloads MP3 instantly; RAM < 120 MB.
- [ ] 4. Tap “Loop” → hears 4-bar C-E-G + kick pattern; no pops on cheap earbuds.
- [ ] 5. Tap “Export Stems” → 4 WAV files + 1 MP3 mixdown → all in Downloads folder.
- [ ] 6. Close tab → reopen → confirm **no data persists** (IDB & Cache empty).
- [ ] 7. Stress test: 8 tracks looping → RAM never > 150 MB (Chrome Task Manager).
- [ ] 8. Bump version in `manifest.json` → tag `git tag v0.1-draft`.
