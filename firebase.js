const admin = require('firebase-admin')
const { cert } = require('firebase-admin/app');
const { FireSQL } = require('firesql');

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

exports.initFirebase = (path) => {
  const serviceAccount = require(path)
  if(!admin.apps.length){
    admin.initializeApp({
      credential: cert(serviceAccount)
    })
  }
}

exports.getAllCollections = async () => {
  const db = admin.firestore()
  const colls = await db.listCollections()
  return colls.map((item) => {
    const decoded = JSON.parse(JSON.stringify(item))
    return {
      _id: decoded._queryOptions.collectionId
    }
  })
}

exports.getDocuments = async (collId, query) => {
  const db = admin.firestore()
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

exports.getDocumentById = async (collId, docId) => {
  const db = admin.firestore()
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

exports.deleteCollection = async (collId) => {
  // await deleteCollectionFirebase(collId, 10)
  const db = admin.firestore()
  const docs = await this.getDocuments(collId)
  try{
    docs.forEach( async (doc) => {
      await db.collection(collId).doc(doc._id).delete()
    })
  }catch(e){
    console.log(e)
  }
  return true
}

exports.deleteDocumentById = async (collId, docId) => {
  const db = admin.firestore()
  await db.collection(collId).doc(docId).delete()
  return true
}

exports.addCollection = async (collId, docId, data) => {
  try{
    const db = admin.firestore()
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

exports.addDocument = async (collId, docId, data) => {
  try{
    const db = admin.firestore()
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

exports.updateDocument = async (collId, docId, data) => {
  try{
    const db = admin.firestore()
    await db.collection(collId).doc(docId).update(data)
    return true
  }catch(e){
    console.log(e)
    return false
  }
}

exports.duplicateCollection = async (collId, newName) => {
  const db = admin.firestore()
  const old = await this.getDocuments(collId)
  old.forEach(async (doc) => {
    delete doc._id
    await db.collection(newName).add(doc)
  })
}

exports.duplicateDocument = async (collId, docId, newDocId) => {
  const db = admin.firestore()
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

exports.renameCollection = async (collId, newName) => {
  const db = admin.firestore()
  const old = await this.getDocuments(collId)
  old.forEach(async (doc) => {
    delete doc._id
    await db.collection(newName).add(doc)
  })
  await this.deleteCollection(collId)
}

exports.importData = async (collId, data) => {
  const db = admin.firestore()
  data.forEach(async (doc) => {
    await db.collection(collId).add(doc)
  })
}

exports.replaceImportData = async (collId, data) => {
  this.deleteCollection(collId)
  const db = admin.firestore()
  data.forEach(async (doc) => {
    await db.collection(collId).add(doc)
  })
}