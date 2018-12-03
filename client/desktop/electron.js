const {
  app,
  BrowserWindow
} = require('electron');
const path = require('path');

let win;


function createWindow() {
  win = new BrowserWindow({
    width: 1366,
    height: 768,
    center: true,
    icon: `${__dirname}/dist/assets/icons/png/256x256.png`
  });

  win.loadURL(`file://${__dirname}/dist/index.html`);

  win.on('closed', function () {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (win === null) {
    createWindow()
  }
})