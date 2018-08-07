import { CollectionReference, Query, Firestore } from '@google-cloud/firestore'
import admin from 'firebase-admin'
import {
    FirestoreSimple,
    IMapping,
    IDocObject,
    IDocData,
} from 'firestore-simple'
const key =
    process.env.NODE_ENV === 'production'
        ? require('../../config/service-account-key.json')
        : require('../../config/service-account-key-dev.json')

admin.initializeApp({
    credential: admin.credential.cert(key),
})

export const firestore = admin.firestore()
firestore.settings({ timestampsInSnapshots: true })

export const getCollection = <T>(path: string) => {
    return new Fires<T>(firestore, path)
}

export class Fires<T> extends FirestoreSimple {
    _toDoc(object: T & IDocObject | T & IDocData) {
        return super._toDoc(object) as T & IDocData
    }

    _toObject(docId: string, docData: T & IDocData) {
        return super._toObject(docId, docData) as T & IDocObject
    }

    fetchCollection(): Promise<(T & IDocObject)[]> {
        return super.fetchCollection() as Promise<(T & IDocObject)[]>
    }

    fetchByQuery(query: Query) {
        return super.fetchByQuery(query) as Promise<(T & IDocObject)[]>
    }

    fetchDocument(id: string): Promise<T & IDocObject> {
        return super.fetchDocument(id) as Promise<T & IDocObject>
    }

    add(object: T): Promise<T & IDocObject> {
        return super.add(object) as Promise<T & IDocObject>
    }

    set(object: T & IDocObject): Promise<T & IDocObject> {
        return super.set(object) as Promise<T & IDocObject>
    }

    addOrSet(object: T & IDocObject | T & IDocData): Promise<T & IDocObject> {
        return super.addOrSet(object) as Promise<T & IDocObject>
    }

    delete(docId: string): Promise<string> {
        return super.delete(docId) as Promise<string>
    }

    bulkSet(objects: (T & IDocObject)[]) {
        return super.bulkSet(objects) as Promise<
            FirebaseFirestore.WriteResult[]
        >
    }

    bulkDelete(docIds: string[]) {
        return super.bulkDelete(docIds) as Promise<
            FirebaseFirestore.WriteResult[]
        >
    }

    withQuery(fn: (ref: CollectionReference) => Query) {
        return this.fetchByQuery(fn(this.collectionRef))
    }
}
