const { app, BrowserWindow, Menu, session } = require('electron');
const path = require('node:path');
app.setName('The Chemistry Behind Everyday Life');

function openMuseum() {
  const window = new BrowserWindow({
    title: 'The Chemistry Behind Everyday Life',
    width: 1440,
    height: 960,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: '#0c1414',
    show: false,
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event) => event.preventDefault());
  window.once('ready-to-show', () => window.show());
  window.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(() => {
  // The installed museum is entirely local, with no remote requests or permissions.
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) =>
    callback(false),
  );
  session.defaultSession.webRequest.onBeforeRequest(
    { urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*'] },
    (_details, callback) => callback({ cancel: true }),
  );
  Menu.setApplicationMenu(
    process.platform === 'darwin'
      ? Menu.buildFromTemplate([
          {
            label: app.name,
            submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'hide' }, { role: 'quit' }],
          },
          { label: 'Edit', submenu: [{ role: 'copy' }, { role: 'selectAll' }] },
          {
            label: 'Window',
            submenu: [{ role: 'minimize' }, { role: 'zoom' }, { role: 'togglefullscreen' }],
          },
        ])
      : null,
  );
  openMuseum();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) openMuseum();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
