// Technical feasibility test: run Ghostscript WASM in Node (same engine as browser)
// Usage: node test/node-convert.mjs <input.pdf> <outdir>
import { loadGhostscriptWASM } from '../vendor/wrapper.js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const vendorUrl = pathToFileURL(path.join(here, '..', 'vendor', '')).href;

const inputPath = process.argv[2];
const outDir = process.argv[3] || 'out';
if (!inputPath) {
  console.error('usage: node node-convert.mjs <input.pdf> [outdir]');
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const logs = [];
const gs = await loadGhostscriptWASM({
  baseUrl: vendorUrl,
  print: (s) => logs.push(s),
  printErr: (s) => logs.push('[gs-err] ' + s),
});
const FS = gs.FS;

const pdfBytes = readFileSync(inputPath);
FS.writeFile('/input.pdf', pdfBytes);
FS.writeFile('/PDFA_def.ps', readFileSync(path.join(here, '..', 'lib', 'PDFA_def.ps')));
FS.writeFile('/srgb.icc', readFileSync(path.join(here, '..', 'assets', 'srgb.icc')));

function convert(level) {
  logs.length = 0;
  const base = path.basename(inputPath, path.extname(inputPath));
  const outFile = '/out-' + base + '-' + level + '.pdf';
  const t0 = performance.now();
  gs.callMain([
    '-dPDFA=' + (level === '1b' ? 1 : 2),
    '-dBATCH', '-dNOPAUSE', '-dNOOUTERSAVE',
    '-sColorConversionStrategy=RGB',
    '-sDEVICE=pdfwrite',
    '-dPDFACompatibilityPolicy=1',
    '--permit-file-read=srgb.icc',
    '-sOutputFile=' + outFile,
    '/PDFA_def.ps',
    '/input.pdf',
  ]);
  const ms = Math.round(performance.now() - t0);
  let out = null;
  try {
    out = FS.readFile(outFile);
  } catch {
    /* no output produced */
  }
  console.log(`--- PDF/A-${level} --- (${ms} ms)`);
  for (const l of logs) console.log('  ' + l);
  if (out) {
    const dest = path.join(outDir, `conv-${base}-${level}.pdf`);
    writeFileSync(dest, out);
    console.log(`  OK -> ${dest} (${out.length} bytes)`);
  } else {
    console.log('  FAILED: no output file');
  }
  return out;
}

convert('1b');
convert('2b');
