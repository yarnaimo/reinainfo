import { CollectionReference, Query } from '@google-cloud/firestore'
import admin from 'firebase-admin'
import { FirestoreSimple } from 'firestore-simple'
const key =
    process.env.NODE_ENV === 'production'
        ? require('../../config/service-account-key.json')
        : require('../../config/service-account-key-dev.json')

admin.initializeApp({
    credential: admin.credential.cert(key),
})

export const firestore = admin.firestore()
firestore.settings({ timestampsInSnapshots: true })

export const getCollection = (path: string) => {
    return new Fires(firestore, path)
}

export class Fires extends FirestoreSimple {
    withQuery(fn: (ref: CollectionReference) => Query) {
        return this.fetchByQuery(fn(this.collectionRef))
    }
}
