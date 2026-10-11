// Generates a real PDF (text + RGB graphics) using the same Ghostscript WASM engine,
// to be used as conversion input for the PDF/A tests.
import { loadGhostscriptWASM } from '../vendor/wrapper.js';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const vendorUrl = pathToFileURL(path.join(here, '..', 'vendor', '')).href;
const outDir = process.argv[2] || 'out';
mkdirSync(outDir, { recursive: true });

const gs = await loadGhostscriptWASM({ baseUrl: vendorUrl });
FS_SETUP(gs);

function FS_SETUP(m) {
  const ps = `%
/Helvetica findfont 24 scalefont setfont
0 0.3 0.9 setrgbcolor
72 700 moveto (Test document - conversione PDF/A) show
/Helvetica findfont 12 scalefont setfont
0 0 0 setrgbcolor
72 660 moveto (Generated inside Ghostscript WASM as conversion test input.) show
72 640 moveto (Seconda riga di prova: accento, per i font.) show
0.9 0.2 0.1 setrgbcolor
72 600 200 100 rectfill
0 0.8 0.3 setrgbcolor
300 600 100 100 rectfill
showpage
`;
  m.FS.writeFile('/test.ps', ps);
  m.callMain([
    '-dBATCH', '-dNOPAUSE',
    '-sDEVICE=pdfwrite',
    '-sOutputFile=/test.pdf',
    '/test.ps',
  ]);
  try {
    const out = m.FS.readFile('/test.pdf');
    const dest = path.join(outDir, 'test-input.pdf');
    writeFileSync(dest, out);
    console.log(`OK -> ${dest} (${out.length} bytes)`);
  } catch {
    console.log('FAILED: no output');
  }
}
