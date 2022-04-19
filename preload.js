const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system')
})

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data)
  },
  sendSync: (channel, data) => {
   return ipcRenderer.sendSync(channel, data)
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, func)
  }
})