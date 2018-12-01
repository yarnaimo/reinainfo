import Vue from 'vue'
import { useStore } from 'vuex-simple'
import { VStore } from '../store'

export class VStoreComponent extends Vue {
    store: VStore = useStore(this.$store)

    get firestore() {
        return this.store.firestore
    }
}
