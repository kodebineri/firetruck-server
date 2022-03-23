const { ipcMain, dialog } = require("electron")
const firebase = require('./firebase')
const fs = require('fs')
const csvtojsonV2 = require("csvtojson/v2")
const ApiResponse = require('./response')

let browserWindow

exports.initListener = (window) => {
  browserWindow = window
}

ipcMain.on('init', (event, arg) => {
  console.log('call init')
  try{
    // const dummy = '/Users/zamahsyari/Downloads/kamus-quran-mudah-dev-firebase-adminsdk-5ru3a-9653c12ff2.json'
    firebase.initFirebase({ path: arg.path, sessionId: arg.sessionId })
    event.returnValue = new ApiResponse(true, [])
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, [], e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('getCollections', async (event, arg) => {
  console.log('call getCollections')
  try{
    const data = await firebase.getAllCollections({ sessionId: arg.sessionId })
    event.returnValue = new ApiResponse(true, data)
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, [], e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('getDocuments', async (event, {collId, query, sessionId}) => {
  console.log('call getDocuments', collId, query)
  try{
    if(collId != undefined){
      const data = await firebase.getDocuments(collId, query, sessionId)
      event.returnValue = new ApiResponse(true, data)
    }else{
      event.returnValue = new ApiResponse(true, [])
    }
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, [], e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('getDocumentById', async (event, {collId, docId, sessionId}) => {
  console.log('call getDocumentById', collId, docId)
  try{
    const data = await firebase.getDocumentById(collId, docId, sessionId)
    event.returnValue = new ApiResponse(true, data)
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, {}, e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('browseServiceAccount', (event, arg) => {
  console.log('call browseServiceAccount')
  try{
    const path = dialog.showOpenDialogSync({
      properties: ['openFile'],
      filters: [{name: 'Service Account Key', extensions: ['json']}]
    })
    if(path !== undefined){
      event.returnValue = new ApiResponse(true, path[0])
    }else{
      event.returnValue = new ApiResponse(false, '', e)
    }
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, '', e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('browseOutputDirectory', (event, arg) => {
  console.log('call browseOutputDirectory')
  try{
    const path = dialog.showOpenDialogSync({
      properties: ['openDirectory']
    })
    if(path !== undefined){
      event.returnValue = new ApiResponse(true, path[0])
    }else{
      event.returnValue = new ApiResponse(false, '', e)
    }
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, '', e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('browseInputDirectory', (event, arg) => {
  console.log('call browseInputDirectory')
  try{
    const path = dialog.showOpenDialogSync({
      properties: ['openFile']
    })
    if(path !== undefined){
      event.returnValue = new ApiResponse(true, path[0])
    }else{
      event.returnValue = new ApiResponse(false, '', e)
    }
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, '', e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('exportJson', async (event, { filename, path, collId, sessionId }) => {
  console.log('call exportJson')
  try{
    let data = []
    if(collId != undefined){
      data = await firebase.getDocuments({ collId, undefined, sessionId })
    }
    fs.writeFile(path + '/' + filename + '.json', JSON.stringify(data, null, '\t'), (err) => {
      console.log(err)
    })
  }catch(e){
    console.log(e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('importJson', async (event, { path, collId, sessionId }) => {
  console.log('call importJson')
  try{
    const raw = await fs.openSync(path)
    const data = JSON.parse(raw)
    if(collId != undefined){
      await firebase.replaceImportData(collId, data, sessionId)
      event.returnValue = new ApiResponse(true, 'ok')
    }else{
      throw new Error('collId is undefined')
    }
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, '', e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('addJson', async (event, { path, collId }) => {
  console.log('call addJson')
  try{
    const raw = await fs.openSync(path)
    const data = JSON.parse(raw)
    if(collId != undefined){
      await firebase.importData(collId, data)
      event.returnValue = new ApiResponse(true, 'ok')
    }else{
      throw new Error('collId is undefined')
    }
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, '', e)
    browserWindow.webContents.send('error', e)
  }
})

const getHeader = (docs) => {
  const header = {}
  docs.forEach((doc) => {
    const keys = Object.keys(doc)
    keys.forEach((key) => {
      if(key !== '_id'){
        header[key] = true
      }
    })
  })
  return ['_id'].concat(Object.keys(header).sort())
}

ipcMain.on('exportCSV', async (event, { filename, path, collId, sessionId }) => {
  console.log('call exportCSV')
  try{
    let data = []
    let header = []
    if(collId != undefined){
      data = await firebase.getDocuments(collId, undefined, sessionId)
      header = getHeader(data)
    }
    let content = ''
    const headerRow = []
    header.forEach((head) => {
      headerRow.push(JSON.stringify(head))
    })
    content += headerRow.join(';') + '\n'
    data.forEach((doc) => {
      const dataRow = []
      Object.keys(doc).forEach((key) => {
        dataRow.push(JSON.stringify(doc[key]))
      })
      content += dataRow.join(';') + '\n'
    })
    fs.writeFile(path + '/' + filename + '.csv', content, (err) => {
      console.log(err)
    })
  }catch(e){
    console.log(e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('importCSV', async (event, { path, collId, options, sessionId }) => {
  console.log('call importCSV', path, collId, options)
  try{
    const data = await csvtojsonV2(options).fromFile(path)
    if(collId != undefined){
      await firebase.replaceImportData(collId, data, sessionId)
      event.returnValue = new ApiResponse(true, 'ok')
    }else{
      throw new Error('collId is undefined')
    }
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, '', e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('addCSV', async (event, { path, collId }) => {
  console.log('call addCSV')
  try{
    const data = await csvtojsonV2({
      quote: 'off'
    }).fromFile(path)
    if(collId != undefined){
      await firebase.importData(collId, data)
      event.returnValue = new ApiResponse(true, 'ok')
    }else{
      throw new Error('collId is undefined')
    }
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, '', e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('addCollection', async (event, {collId, docId, data, sessionId}) => {
  console.log('call addCollection', collId, docId, data)
  try{
    await firebase.addCollection(collId, docId, data, sessionId)
    event.returnValue = new ApiResponse(true, 'ok')
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, '', e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('deleteCollection', async (event, {collId, sessionId}) => {
  console.log('call deleteCollection', collId)
  try{
    await firebase.deleteCollection(collId, sessionId)
    event.returnValue = new ApiResponse(true, 'ok')
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, '', e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('renameCollection', async (event, {collId, newName, sessionId}) => {
  console.log('call renameCollection', collId, newName)
  try{
    await firebase.renameCollection(collId, newName, sessionId)
    event.returnValue = new ApiResponse(true, 'ok')
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, '', e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('duplicateCollection', async (event, {collId, newName, sessionId}) => {
  console.log('call duplicateCollection', collId, newName)
  try{
    await firebase.duplicateCollection(collId, newName, sessionId)
    event.returnValue = new ApiResponse(true, 'ok')
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, '', e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('addDocument', async (event, {collId, docId, data, sessionId}) => {
  console.log('call addDocument', collId, docId, data)
  try{
    await firebase.addDocument(collId, docId, data, sessionId)
    event.returnValue = new ApiResponse(true, 'ok')
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, '', e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('editDocument', async (event, {collId, docId, data, sessionId}) => {
  console.log('call editDocument', collId, docId, data)
  try{
    await firebase.updateDocument(collId, docId, data, sessionId)
    event.returnValue = new ApiResponse(true, 'ok')
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, '', e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('deleteDocument', async (event, {collId, docId, sessionId}) => {
  console.log('call deleteDocument', docId)
  try{
    await firebase.deleteDocumentById(collId, docId, sessionId)
    event.returnValue = new ApiResponse(true, 'ok')
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, '', e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.on('duplicateDocument', async (event, {collId, docId, newDocId, sessionId}) => {
  console.log('call duplicateDocument', collId, docId, newDocId)
  try{
    await firebase.duplicateDocument(collId, docId, newDocId, sessionId)
    event.returnValue = new ApiResponse(true, 'ok')
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, '', e)
    browserWindow.webContents.send('error', e)
  }
})

ipcMain.handle('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light'
  } else {
    nativeTheme.themeSource = 'dark'
  }
  return nativeTheme.shouldUseDarkColors
})

ipcMain.handle('dark-mode:system', () => {
  nativeTheme.themeSource = 'system'
})