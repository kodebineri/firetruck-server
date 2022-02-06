const { ipcMain, dialog } = require("electron")
const firebase = require('./firebase')
const fs = require('fs')
const csvtojsonV2 = require("csvtojson/v2")
const ApiResponse = require('./response')

ipcMain.on('init', (event, arg) => {
  console.log('call init')
  // const dummy = '/Users/zamahsyari/Downloads/kamus-quran-mudah-dev-firebase-adminsdk-5ru3a-9653c12ff2.json'
  firebase.initFirebase(arg)
})

ipcMain.on('getCollections', async (event, arg) => {
  console.log('call getCollections')
  const data = await firebase.getAllCollections()
  event.returnValue = data
})

ipcMain.on('getDocuments', async (event, {collId, query}) => {
  console.log('call getDocuments', collId, query)
  try{
    if(collId != undefined){
      const data = await firebase.getDocuments(collId, query)
      event.returnValue = new ApiResponse(true, data)
    }else{
      event.returnValue = new ApiResponse(true, [])
    }
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, [], e)
  }
})

ipcMain.on('getDocumentById', async (event, {collId, docId}) => {
  console.log('call getDocumentById', collId, docId)
  try{
    const data = await firebase.getDocumentById(collId, docId)
    event.returnValue = new ApiResponse(true, data)
  }catch(e){
    console.log(e)
    event.returnValue = new ApiResponse(false, {}, e)
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
      event.returnValue = path[0]
    }
  }catch(e){
    console.log(e)
  }
})

ipcMain.on('browseOutputDirectory', (event, arg) => {
  console.log('call browseOutputDirectory')
  const path = dialog.showOpenDialogSync({
    properties: ['openDirectory']
  })
  if(path !== undefined){
    event.returnValue = path[0]
  }
})

ipcMain.on('browseInputDirectory', (event, arg) => {
  console.log('call browseInputDirectory')
  const path = dialog.showOpenDialogSync({
    properties: ['openFile']
  })
  if(path !== undefined){
    event.returnValue = path[0]
  }
})

ipcMain.on('exportJson', async (event, { filename, path, collId }) => {
  console.log('call exportJson')
  let data = []
  if(collId != undefined){
    data = await firebase.getDocuments(collId)
  }
  fs.writeFile(path + '/' + filename + '.json', JSON.stringify(data, null, '\t'), (err) => {
    console.log(err)
  })
})

ipcMain.on('importJson', async (event, { path, collId }) => {
  console.log('call importJson')
  const raw = await fs.openSync(path)
  const data = JSON.parse(raw)
  if(collId != undefined){
    await firebase.replaceImportData(collId, data)
  }
})

ipcMain.on('addJson', async (event, { path, collId }) => {
  console.log('call addJson')
  const raw = await fs.openSync(path)
  const data = JSON.parse(raw)
  if(collId != undefined){
    await firebase.importData(collId, data)
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

ipcMain.on('exportCSV', async (event, { filename, path, collId }) => {
  console.log('call exportCSV')
  let data = []
  let header = []
  if(collId != undefined){
    data = await firebase.getDocuments(collId)
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
})

ipcMain.on('importCSV', async (event, { path, collId, options }) => {
  console.log('call importCSV', path, collId, options)
  const data = await csvtojsonV2(options).fromFile(path)
  if(collId != undefined){
    await firebase.replaceImportData(collId, data)
  }
})

ipcMain.on('addCSV', async (event, { path, collId }) => {
  console.log('call addCSV')
  const data = await csvtojsonV2({
    quote: 'off'
  }).fromFile(path)
  if(collId != undefined){
    await firebase.importData(collId, data)
  }
})

ipcMain.on('addCollection', async (event, {collId, docId, data}) => {
  console.log('call addCollection', collId, docId, data)
  event.returnValue = await firebase.addCollection(collId, docId, data)
})

ipcMain.on('deleteCollection', async (event, collId) => {
  console.log('call deleteCollection', collId)
  event.returnValue = await firebase.deleteCollection(collId)
})

ipcMain.on('renameCollection', async (event, {collId, newName}) => {
  console.log('call renameCollection', collId, newName)
  event.returnValue = await firebase.renameCollection(collId, newName)
})

ipcMain.on('duplicateCollection', async (event, {collId, newName}) => {
  console.log('call duplicateCollection', collId, newName)
  event.returnValue = await firebase.duplicateCollection(collId, newName)
})

ipcMain.on('addDocument', async (event, {collId, docId, data}) => {
  console.log('call addDocument', collId, docId, data)
  event.returnValue = await firebase.addDocument(collId, docId, data)
})

ipcMain.on('editDocument', async (event, {collId, docId, data}) => {
  console.log('call editDocument', collId, docId, data)
  event.returnValue = await firebase.updateDocument(collId, docId, data)
})

ipcMain.on('deleteDocument', async (event, {collId, docId}) => {
  console.log('call deleteDocument', docId)
  event.returnValue = await firebase.deleteDocumentById(collId, docId)
})

ipcMain.on('duplicateDocument', async (event, {collId, docId, newDocId}) => {
  console.log('call duplicateDocument', collId, docId, newDocId)
  event.returnValue = await firebase.duplicateDocument(collId, docId, newDocId)
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