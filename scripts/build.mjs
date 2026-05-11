import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

await mkdir('dist/assets', { recursive: true });
await cp('public', 'dist', { recursive: true });
await cp('src/styles.css', 'dist/assets/styles.css');
await writeFile('dist/index.html', await readFile('index.html', 'utf8'));

console.log('Built dist/ for static hosting.');
