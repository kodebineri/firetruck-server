const { app, BrowserWindow, session } = require('electron')
const { initMenu } = require('./menu')
const path = require('path')
const os = require('os')
const { initListener } = require('./listener')
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
  mainWindow.loadURL('file://' + __dirname + '/client/index.html')
  // mainWindow.loadURL('http://localhost:3000/')
  initMenu(mainWindow)
  initListener(mainWindow)
}

const reactDevToolsPath = path.join(
  os.homedir(), 
  '/Library/Application Support/Google/Chrome/Profile 1/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.23.0_0'
)

const recoilDevToolsPath = path.join(
  os.homedir(),
  '/Library/Application Support/Google/Chrome/Profile 1/Extensions/dhjcdlmklldodggmleehadpjephfgflc/1.1.0.0_0'
)

app.whenReady().then(async () => {
  // await session.defaultSession.loadExtension(reactDevToolsPath)
  // await session.defaultSession.loadExtension(recoilDevToolsPath)
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})