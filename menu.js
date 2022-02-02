const { ipcMain, webContents } = require("electron");
const contextMenu = require("electron-context-menu");

let browserWindow

exports.initMenu = (window) => {
  browserWindow = window
}

const getKeyValue = (link) => {
  const splitted = link.split(':')
  if(splitted.length > 0){
    return {
      key: splitted[0],
      value: splitted[1]
    }
  }
  throw new Error('invalid format')
}

contextMenu({
  showInspectElement: false,
  prepend: (defaultActions, parameters, browserWindow) => [
    {
      label: 'Rename Collection',
      visible: getKeyValue(parameters.linkURL).key === 'coll',
      click: () => {
        browserWindow.webContents.send('renameCollectionAction', getKeyValue(parameters.linkURL).value)
      }
    },
    {
      label: 'Duplicate Collection',
      visible: getKeyValue(parameters.linkURL).key === 'coll',
      click: () => {
        browserWindow.webContents.send('duplicateCollectionAction', getKeyValue(parameters.linkURL).value)
      }
    },
    {
      label: 'Delete Collection',
      visible: getKeyValue(parameters.linkURL).key === 'coll',
      click: () => {
        browserWindow.webContents.send('deleteCollectionAction', getKeyValue(parameters.linkURL).value)
      }
    }
  ]
})