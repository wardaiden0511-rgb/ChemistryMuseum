const signed = !!process.env.CSC_LINK;
const path = require('node:path');
module.exports = {
  appId: 'org.everydaychemistry.museum',
  productName: 'The Chemistry Behind Everyday Life',
  directories: { output: 'release', buildResources: 'build' },
  files: ['dist/**/*', 'electron/**/*', 'build/icon.png', 'licenses/**/*', 'package.json'],
  asar: true,
  // Reuse npm's verified Electron distribution on Windows to avoid a second extraction.
  electronDist: process.platform === 'win32' ? path.dirname(require('electron')) : undefined,
  mac: {
    target: [{ target: 'dmg', arch: ['universal'] }],
    category: 'public.app-category.education',
    minimumSystemVersion: '13.0',
    icon: 'build/icon.icns',
    identity: signed ? undefined : '-',
    hardenedRuntime: signed,
    notarize: signed,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
    artifactName: 'The-Chemistry-Behind-Everyday-Life-${version}-${arch}.${ext}',
  },
  dmg: {
    title: 'The Chemistry Behind Everyday Life',
    background: 'build/dmg-background.png',
    window: { width: 660, height: 440 },
    iconSize: 100,
    contents: [
      { x: 180, y: 220, type: 'file' },
      { x: 480, y: 220, type: 'link', path: '/Applications' },
    ],
  },
  win: { icon: 'build/icon.ico', signExecutable: false, target: ['dir'] },
};
