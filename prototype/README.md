# PDF/A Studio — prototipo completo (UI + validazione in browser)

Conversione e validazione **100% nel browser**, in Web Workers. Nessun upload.
Architettura a due motori (entrambi AGPL-3.0, WASM):

- **Kura** (`kura-pdf-wasm@1.2.1`, default): converte, ripara e **valida** con regole
  allineate a veraPDF. Un solo download (~16 MB).
- **Ghostscript 10.06** (`@bentopdf/gs-wasm@0.1.1`, opzionale): conversione classica con
  `-dPDFA=1|2`. L'output viene comunque validato con Kura; se non conforme, il file viene
  automaticamente riconvertito/riparato con Kura.

Nota: la verifica di Kura è un preflight allineato a veraPDF, non sostituisce un
validatore indipendente; nella fase di sviluppo i file prodotti sono stati campionati
con veraPDF 1.30.3 CLI (esito: PASS).

## Avvio

```cmd
node server.js
```

Poi apri http://127.0.0.1:8471/ — scegli un PDF e il livello (1b/2b).
Il pulsante "Test con PDF di esempio" converte `sample.pdf` (utile per verifica automatica).
La prima conversione scarica/carica ~15 MB di engine WASM (poi in cache).

## Deployment su programmifree.com

Dalla radice del progetto (`voglio-creare-una-web/`):

```cmd
make-deploy.cmd
```

Crea/aggiorna `deploy\` (esclusi test, server di sviluppo, README di sviluppo).
Caricare **il contenuto di `deploy\`** in `programmifree.com/web/app/pdfa/`
via FTP o file manager dell'hosting. Requisito: servire `.wasm` come
`application/wasm` (default sulla maggior parte degli hosting).

In `deploy\` sono inclusi `LICENSE.txt` (AGPL-3.0), `NOTICE.txt` (crediti)
e `DEPLOY-README.txt`. Ogni volta che pubblichi una nuova versione dell'app,
incrementa `VERSION` in `sw.js` (es. `v1.0.1`) per far aggiornare la cache
dei browser degli utenti.

### PWA / offline
- `sw.js`: precache completo (HTML, motori WASM, icone) → funziona offline
  dalla seconda visita; aggiornamento automatico alla nuova versione.
- `manifest.webmanifest`: app installabile ("Programmifree PDF/A Studio").
- Verificato: pagina e conversione completa funzionano a server spento.

### GitHub (sorgente pubblico, richiesto da AGPL)
1. Con l'account bazztn: creare repo `pdfa-studio` oppure creare l'organizzazione
   gratuita `programmifree` e il repo al suo interno.
2. Inizializzare il repo locale con il contenuto del progetto (vedi NOTICE.txt).
3. Footer dell'app già linkato a `https://github.com/programmifree`:
   aggiornare l'URL quando il repo è online.

## Struttura

- `index.html` — interfaccia (drag&drop, selettore livello/motore, badge di validazione, download)
- `gs-worker.js` — conversione Ghostscript: MEMFS + `callMain` con `-dPDFA=1|2 -sColorConversionStrategy=RGB -dPDFACompatibilityPolicy=1`
- `kura-worker.js` — conversione, riparazione e verifica Kura (`convert` / `check`)
- `vendor/` — Ghostscript WASM (AGPL-3.0, da `@bentopdf/gs-wasm@0.1.1`)
- `vendor-kura/package/` — Kura WASM (AGPL-3.0, da `kura-pdf-wasm@1.2.1`)
- `lib/PDFA_def.ps`, `assets/srgb.icc` — file ufficiali Ghostscript (AGPL)
- `test/` — script Node (stesso engine) e test reali con veraPDF
  - `node make-test-pdf.mjs out` — genera un PDF di input con lo stesso engine WASM
  - `node node-convert.mjs <input.pdf> <outdir>` — converte in 1b e 2b (percorso Ghostscript)
  - `verapdf-report.txt` — report veraPDF sui file convertiti

## Riprodurre la validazione veraPDF

Serve Java (qui: JRE Temurin 21 in `../tools/`) e `../tools/verapdf-cli.jar`:

```cmd
..\tools\jdk-21.0.12.1+1-jre\bin\java.exe -jar ..\tools\verapdf-cli.jar -r --format text test\out
```

## Risultati dei test (2026-10-11)

Validazione veraPDF 1.30.3 (motore indipendente) sui file prodotti in questa sessione:

| File | Percorso | Esito veraPDF |
|---|---|---|
| test-input → 1b / 2b | Ghostscript (Node) | PASS / PASS |
| real-S2.pdf (pdf.js, testo giapponese) → 1b | Ghostscript (Node) | PASS |
| real-S2.pdf → 2b | Ghostscript (Node) | **FAIL** (ISO 19005-2, 6.9-1: OCProperties /D senza `Name`) |
| real-tracemonkey.pdf (14 pagine) → 1b / 2b | Ghostscript (Node) | PASS / PASS |
| byte prodotti dal browser (sample) → 2b | Ghostscript (browser) | PASS |
| output motore Kura dal browser (sample) → 2b | Kura (browser) | PASS |
| controlli negativi (input non convertiti) | — | FAIL (corretto: il validatore discrimina) |

Test funzionali UI (browser, motore Kura): sample.pdf e S2 → badge "Verificato conforme".
Percorso Ghostscript + fallback: S2 → verifica non conforme → riparazione Kura automatica → conforme.

Tempi (desktop): PDF semplice 0,06–0,4 s; S2 0,4–3,7 s (Ghostscript) / ~1 s (Kura);
tracemonkey 1–5,8 s (Ghostscript).

## Limiti noti / mitigazioni

1. **OCProperties senza `Name`** (caso S2 con Ghostscript): il fallback Kura lo ripara
   automaticamente; con il motore Kura default il problema non si presenta.
2. `-dPDFACompatibilityPolicy=1` degrada silenziosamente funzioni non conformi
   (overprint mode, immagini Interpolate, coordinate fuori range): l'output resta
   valido ma il contenuto può variare. Percorso Ghostscript avanzato: valutare policy=2 + retry.
3. PDF criptati o firmati non gestiti nel prototipo.
4. Motori ~16 MB alla prima visita (poi cache del browser); PDF molto grandi
   vincolati dalla memoria WASM.
5. La verifica in-browser è allineata a veraPDF ma non è veraPDF: per certificazioni
   formali serve comunque un validatore indipendente (veraPDF CLI o via CheerpJ).
