const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  const iconPath = path.join(__dirname, 'icon.png');
  const opts = {
    width: 420,
    height: 780,
    minWidth: 360,
    minHeight: 560,
    title: 'TellMe — Anonymous Questions',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  };
  if (fs.existsSync(iconPath)) opts.icon = iconPath;
  mainWindow = new BrowserWindow(opts);

  // Load tellme.html (bundled alongside main.js in asar)
  const htmlPath = path.join(__dirname, 'tellme.html');
  mainWindow.loadFile(htmlPath);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
