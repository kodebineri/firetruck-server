const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const { initMenu } = require('./context-menu')
const { initListener } = require('./listener')

exports.getWindows = () => {
  return windows
}

exports.createWindow = () => {
  let mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  mainWindow.loadURL('file://' + __dirname + '/client/index.html')
  // mainWindow.loadURL('http://localhost:3000/')
  initMenu(mainWindow)
  initListener(mainWindow)
  generateDockMenu()
}

const generateDockMenu = () => {
  if(process.platform === 'darwin'){
    const menu = generateTemplate()
    app.dock.setMenu(this.generateMenu(menu))
  }
}

const generateTemplate = () => {
  let menu = [
    {
      label: `New Window`,
      click: () => {
        this.createWindow()
      }
    },
    { type: 'separator' }
  ]
  return menu
}

exports.generateMenu = (template) => {
  if(template){
    return Menu.buildFromTemplate(template)  
  }
  return Menu.buildFromTemplate(generateTemplate())
}