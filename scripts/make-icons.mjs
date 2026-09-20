import sharp from 'sharp';
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
await mkdir('build', { recursive: true });
await mkdir('licenses', { recursive: true });
await copyFile('node_modules/@fontsource/dm-sans/LICENSE', 'licenses/DM-Sans-OFL.txt');
await copyFile('node_modules/@fontsource/manrope/LICENSE', 'licenses/Manrope-OFL.txt');
const icon = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#243b2d"/><stop offset="1" stop-color="#0b1516"/></linearGradient><radialGradient id="atom" cx=".32" cy=".25"><stop stop-color="#e9f8c5"/><stop offset=".55" stop-color="#bddb88"/><stop offset="1" stop-color="#66844a"/></radialGradient></defs><rect x="60" y="60" width="904" height="904" rx="208" fill="url(#bg)"/><rect x="79" y="79" width="866" height="866" rx="191" stroke="#bbd797" stroke-opacity=".2" stroke-width="3" fill="none"/><g stroke="#a4bf85" stroke-width="18"><path d="m334 286 344 153-163 305-247-192Z" fill="none"/></g><g fill="url(#atom)"><circle cx="334" cy="286" r="79"/><circle cx="678" cy="439" r="112"/><circle cx="515" cy="744" r="66"/><circle cx="268" cy="552" r="66"/></g><circle cx="444" cy="437" r="6" fill="#d3edb2"/><circle cx="733" cy="700" r="5" fill="#d3edb2" opacity=".5"/><circle cx="649" cy="223" r="5" fill="#d3edb2" opacity=".5"/></svg>`;
await writeFile('build/icon.svg', icon);
await sharp(Buffer.from(icon)).png().toFile('build/icon.png');
// Both icon containers embed PNG data; no platform-specific icon tooling is needed.
const icoPng = await sharp(Buffer.from(icon)).resize(256, 256).png().toBuffer();
const ico = Buffer.alloc(22);
ico.writeUInt16LE(1, 2);
ico.writeUInt16LE(1, 4);
ico.writeUInt16LE(1, 10);
ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(icoPng.length, 14);
ico.writeUInt32LE(22, 18);
await writeFile('build/icon.ico', Buffer.concat([ico, icoPng]));
const chunks = [];
for (const [tag, size] of [
  ['ic07', 128],
  ['ic08', 256],
  ['ic09', 512],
  ['ic10', 1024],
]) {
  const png = await sharp(Buffer.from(icon)).resize(size, size).png().toBuffer();
  const head = Buffer.alloc(8);
  head.write(tag);
  head.writeUInt32BE(png.length + 8, 4);
  chunks.push(head, png);
}
const icns = Buffer.alloc(8);
icns.write('icns');
icns.writeUInt32BE(8 + chunks.reduce((sum, b) => sum + b.length, 0), 4);
await writeFile('build/icon.icns', Buffer.concat([icns, ...chunks]));
const background = `<svg width="1320" height="880" viewBox="0 0 660 440" xmlns="http://www.w3.org/2000/svg"><rect width="660" height="440" fill="#111d19"/><text x="330" y="54" font-family="Arial,sans-serif" font-size="22" text-anchor="middle" fill="#e7ecde">The Chemistry Behind Everyday Life</text><text x="330" y="85" font-family="Arial,sans-serif" font-size="13" text-anchor="middle" fill="#a5b39d">A little curiosity. A whole new perspective.</text><path d="M285 214h86m-14-14 15 14-15 14" stroke="#bed98b" stroke-width="2" fill="none"/><text x="330" y="363" font-family="Arial,sans-serif" font-size="14" text-anchor="middle" fill="#c5d4b6">Drag the museum into Applications to install.</text><text x="330" y="390" font-family="Arial,sans-serif" font-size="11" text-anchor="middle" fill="#85967c">Then open it from Applications. Explore entirely offline.</text></svg>`;
await sharp(Buffer.from(background)).resize(660, 440).png().toFile('build/dmg-background.png');
console.log('Generated app icons and drag-to-Applications installer artwork.');
