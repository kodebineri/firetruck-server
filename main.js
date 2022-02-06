const { app, BrowserWindow } = require('electron')
const { initMenu } = require('./menu')
const path = require('path')
require('./listener')
require('./menu')

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: true
    }
  })
  // mainWindow.loadURL('file://' + __dirname + '/client/index.html')
  mainWindow.loadURL('http://localhost:3000/')
  initMenu(mainWindow)
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})