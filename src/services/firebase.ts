import { CollectionReference, Query } from '@google-cloud/firestore'
import admin from 'firebase-admin'
import { FirestoreSimple, IDocData, IDocObject } from 'firestore-simple'
import { firebaseConfig } from '../config'

admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
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
