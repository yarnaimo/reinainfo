import { createVuexStore, Module } from 'vuex-simple'
import { FirestoreModule } from './firestore'

export class VStore {
    @Module() firestore = new FirestoreModule()
}

const store = new VStore()

const createStore = () => {
    const isDev = process.env.NODE_ENV === 'development'

    return createVuexStore(store, {
        strict: false,
        modules: {},
        plugins: [],
    })
}

export default createStore
