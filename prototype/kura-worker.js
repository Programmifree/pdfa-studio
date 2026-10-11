// Kura WASM worker: independent PDF/A check (veraPDF-aligned rules) + fallback conversion.
import { convert, check, load } from './vendor-kura/package/index.js';

self.onmessage = async (e) => {
  const { id, mode, pdfBytes, level } = e.data;
  const t0 = performance.now();
  try {
    if (mode === 'load') {
      await load();
      self.postMessage({ id, ok: true, ms: Math.round(performance.now() - t0) });
      return;
    }
    if (mode === 'check') {
      const r = await check(new Uint8Array(pdfBytes), level);
      self.postMessage({
        id, ok: true, ms: Math.round(performance.now() - t0),
        compliant: r.compliant, findings: r.findings, engine: r.engine,
        issues: r.issues, analysis: r.analysis,
      });
      return;
    }
    if (mode === 'convert') {
      const r = await convert(new Uint8Array(pdfBytes), level);
      self.postMessage({
        id, ok: true, ms: Math.round(performance.now() - t0),
        pdf: r.pdf.buffer.slice(r.pdf.byteOffset, r.pdf.byteOffset + r.pdf.byteLength),
        engine: r.engine, issues: r.issues,
      });
      return;
    }
    self.postMessage({ id, ok: false, error: 'unknown mode: ' + mode });
  } catch (err) {
    self.postMessage({
      id, ok: false, ms: Math.round(performance.now() - t0),
      error: String(err && err.message || err),
      code: err && err.code || null,
    });
  }
};
