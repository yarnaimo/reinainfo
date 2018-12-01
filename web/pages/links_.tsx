import { Component } from 'vue-property-decorator'
import { EmptyState } from '../components/organisms/EmptyState'
import { head } from '../utils/vue-tsx'
import { VStoreComponent } from '../utils/vuex-simple'

@Component(head('Links'))
export default class extends VStoreComponent {
    render() {
        return (
            <main>
                <EmptyState icon="shovel" text="Coming Soon" />
            </main>
        )
    }
}
