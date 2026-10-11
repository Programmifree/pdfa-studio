// Ghostscript WASM worker: runs PDF/A conversion entirely client-side.
let gsModule = null;

async function getModule() {
  if (gsModule) return gsModule;
  const baseUrl = new URL('./vendor/', import.meta.url).href;
  const logs = [];
  gsModule = await import('./vendor/wrapper.js').then((m) =>
    m.loadGhostscriptWASM({
      baseUrl,
      print: (s) => logs.push(s),
      printErr: (s) => logs.push('[gs] ' + s),
    })
  );
  gsModule._logs = logs;
  return gsModule;
}

async function ensureAssets(FS) {
  if (ensureAssets.done) return;
  const def = await fetch(new URL('./lib/PDFA_def.ps', import.meta.url)).then((r) => r.text());
  const icc = await fetch(new URL('./assets/srgb.icc', import.meta.url)).then((r) => r.arrayBuffer());
  FS.writeFile('/PDFA_def.ps', def);
  FS.writeFile('/srgb.icc', new Uint8Array(icc));
  ensureAssets.done = true;
}

self.onmessage = async (e) => {
  const { id, pdfBytes, level } = e.data;
  const t0 = performance.now();
  try {
    const gs = await getModule();
    const FS = gs.FS;
    await ensureAssets(FS);
    FS.writeFile('/input-' + id + '.pdf', new Uint8Array(pdfBytes));
    const outFile = '/out-' + id + '.pdf';
    gs._logs.length = 0;
    const pdfaNum = level === '1b' ? 1 : level === '3b' ? 3 : 2;
    gs.callMain([
      '-dPDFA=' + pdfaNum,
      '-dBATCH', '-dNOPAUSE', '-dNOOUTERSAVE',
      '-sColorConversionStrategy=RGB',
      '-sDEVICE=pdfwrite',
      '-dPDFACompatibilityPolicy=1',
      '--permit-file-read=srgb.icc',
      '-sOutputFile=' + outFile,
      '/PDFA_def.ps',
      '/input-' + id + '.pdf',
    ]);
    const logs = gs._logs.slice();
    let out = null;
    try {
      out = FS.readFile(outFile).slice().buffer;
    } catch {
      /* conversion produced no output */
    }
    try { FS.unlink('/input-' + id + '.pdf'); } catch {}
    try { FS.unlink(outFile); } catch {}
    self.postMessage({ id, ok: !!out, pdf: out, logs, ms: Math.round(performance.now() - t0) });
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err && err.stack || err), ms: Math.round(performance.now() - t0) });
  }
};
