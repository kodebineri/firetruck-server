const { app, BrowserWindow } = require('electron')
const path = require('path')
const os = require('os')
const {createWindow} = require('./window')
require('./listener')
require('./context-menu')
require('./menu-bar')

const reactDevToolsPath = path.join(
  os.homedir(), 
  '/Library/Application Support/Google/Chrome/Profile 1/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.23.0_0'
)

const recoilDevToolsPath = path.join(
  os.homedir(),
  '/Library/Application Support/Google/Chrome/Profile 1/Extensions/dhjcdlmklldodggmleehadpjephfgflc/1.1.0.0_0'
)
app.enableSandbox()
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