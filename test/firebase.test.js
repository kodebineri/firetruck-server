const { ipcRenderer, ipcMain } = require('electron')

require('../listener')

// test('init', () => {
//   ipcRenderer.send('init')
// })

test('addCollection', async () => {
  await ipcMain.sendSync('init', '/Users/zamahsyari/Downloads/kamus-quran-mudah-dev-firebase-adminsdk-5ru3a-9653c12ff2.json')
  ipcMain.send('addCollection', {
    collId: 'hello world',
    docId: '123',
    data: 'testing'
  })
})