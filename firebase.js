const admin = require('firebase-admin')
const { cert, getApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { FireSQL } = require('firesql');
const config = {}

const deleteCollectionFirebase = async (collId, batchSize) => {
  const db = admin.firestore()
  const collectionRef = db.collection(collId);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

const deleteQueryBatch = async (query, resolve) => {
  const snapshot = await query.get();
  const db = admin.firestore()

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

exports.initFirebase = ({ path, sessionId }) => {
  const serviceAccount = require(path)
  if(Object.keys(config).length < 1){
    config[sessionId] = {
      credential: cert(serviceAccount),
    }
    admin.initializeApp(config[sessionId])
  }
  config[sessionId] = {
    credential: cert(serviceAccount),
  }
  admin.initializeApp(config[sessionId], sessionId)
}

exports.getAllCollections = async ({ sessionId }) => {
  const app = admin.app(sessionId)
  const db = getFirestore(app)
  const colls = await db.listCollections()
  return colls.map((item) => {
    const decoded = JSON.parse(JSON.stringify(item))
    return {
      _id: decoded._queryOptions.collectionId
    }
  })
}

exports.getDocuments = async (collId, query, sessionId) => {
  const app = admin.app(sessionId)
  const db = getFirestore(app)
  let snapshot = []
  if(query != undefined){
    const fireSQL = new FireSQL(db)
    res = await fireSQL.query(query, {includeId: '_id'})
    return res
  }else{
    snapshot = await db.collection(collId).get()
    const res = []
    if(snapshot.empty){
      return res
    }else{
      snapshot.forEach((item) => {
        res.push({
          _id: item.id,
          ...item.data()
        })
      })
      return res
    }
  }
}

exports.getDocumentById = async (collId, docId, sessionId) => {
  const app = admin.app(sessionId)
  const db = getFirestore(app)
  const snapshot = await db.collection(collId).doc(docId).get()
  if(snapshot.empty){
    return null
  }else{
    return {
      _id: snapshot.id,
      ...snapshot.data()
    }
  }
}

exports.deleteCollection = async (collId, sessionId) => {
  // await deleteCollectionFirebase(collId, 10)
  const app = admin.app(sessionId)
  const db = getFirestore(app)
  const docs = await this.getDocuments(collId, undefined, sessionId)
  try{
    docs.forEach( async (doc) => {
      await db.collection(collId).doc(doc._id).delete()
    })
  }catch(e){
    console.log(e)
  }
  return true
}

exports.deleteDocumentById = async (collId, docId, sessionId) => {
  const app = admin.app(sessionId)
  const db = getFirestore(app)
  await db.collection(collId).doc(docId).delete()
  return true
}

exports.addCollection = async (collId, docId, data, sessionId) => {
  try{
    const app = admin.app(sessionId)
    const db = getFirestore(app)
    if (docId == null) {
      await db.collection(collId).add(data)
    } else {
      await db.collection(collId).doc(docId).set(data)
    }
    return true
  }catch(e){
    console.log(e)
    return false
  }
}

exports.addDocument = async (collId, docId, data, sessionId) => {
  try{
    const app = admin.app(sessionId)
    const db = getFirestore(app)
    if (docId == null) {
      await db.collection(collId).add(data)
    } else {
      await db.collection(collId).doc(docId).set(data)
    }
    return true
  }catch(e){
    console.log(e)
    return false
  }
}

exports.updateDocument = async (collId, docId, data, sessionId) => {
  try{
    const app = admin.app(sessionId)
    const db = getFirestore(app)
    await db.collection(collId).doc(docId).update(data)
    return true
  }catch(e){
    console.log(e)
    return false
  }
}

exports.duplicateCollection = async (collId, newName, sessionId) => {
  const app = admin.app(sessionId)
  const db = getFirestore(app)
  const old = await this.getDocuments(collId, undefined, sessionId)
  old.forEach(async (doc) => {
    delete doc._id
    await db.collection(newName).add(doc)
  })
}

exports.duplicateDocument = async (collId, docId, newDocId, sessionId) => {
  const app = admin.app(sessionId)
  const db = getFirestore(app)
  const old = await db.collection(collId).doc(docId).get()
  if(old.empty){
    return false
  }
  if(newDocId == null){
    await db.collection(collId).add(old.data())
  }else{
    await db.collection(collId).doc(newDocId).set(old.data())
  }
  return true
}

exports.renameCollection = async (collId, newName, sessionId) => {
  const app = admin.app(sessionId)
  const db = getFirestore(app)
  const old = await this.getDocuments(collId, undefined, sessionId)
  old.forEach(async (doc) => {
    delete doc._id
    await db.collection(newName).add(doc)
  })
  await this.deleteCollection(collId, sessionId)
}

exports.importData = async (collId, data) => {
  const db = admin.firestore()
  data.forEach(async (doc) => {
    await db.collection(collId).add(doc)
  })
}

exports.replaceImportData = async (collId, data, sessionId) => {
  await this.deleteCollection(collId)
  const app = admin.app(sessionId)
  const db = getFirestore(app)
  data.forEach(async (doc) => {
    await db.collection(collId).add(doc)
  })
}