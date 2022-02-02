const { ipcMain, dialog } = require("electron")
const firebase = require('./firebase')
const fs = require('fs')
const csvtojsonV2=require("csvtojson/v2")

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

ipcMain.on('getDocuments', async (event, arg) => {
  console.log('call getDocuments', arg)
  if(arg != undefined){
    const data = await firebase.getDocuments(arg)
    event.returnValue = data
  }else{
    event.returnValue = []
  }
})

ipcMain.on('browseServiceAccount', (event, arg) => {
  console.log('call browseServiceAccount')
  const path = dialog.showOpenDialogSync({
    properties: ['openFile'],
    filters: [{name: 'Service Account Key', extensions: ['json']}]
  })
  if(path !== undefined){
    event.returnValue = path[0]
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
  console.log('call importCSV')
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