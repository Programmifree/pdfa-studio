// Downloads Fraunces (roman + italic, variable, latin subset) for self-hosting (offline PWA).
import { writeFile, mkdir } from 'node:fs/promises';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const cssUrl = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&display=swap';

const css = await (await fetch(cssUrl, { headers: { 'User-Agent': UA } })).text();
const blocks = [...css.matchAll(/\/\*\s*(\w[\w-]*)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g)];
const wanted = blocks.filter(([, subset]) => subset === 'latin');

await mkdir(new URL('./fonts/', import.meta.url), { recursive: true });
for (const [, subset, body] of wanted) {
  const ital = /font-style:\s*italic/.test(body) ? 'italic' : 'roman';
  const url = body.match(/url\((https:[^)]+\.woff2)\)/)[1];
  const buf = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer());
  const file = new URL(`./fonts/fraunces-${ital}.woff2`, import.meta.url);
  await writeFile(file, buf);
  console.log(ital, url.split('/').pop(), buf.length, 'bytes');
}
