import { Component, Vue } from 'vue-property-decorator'
import { EmptyState } from '../components/organisms/EmptyState'
import { head } from '../utils/vue-tsx'

@Component(head('Links'))
export default class extends Vue {
    render() {
        return (
            <main>
                <EmptyState icon="shovel" text="Coming Soon" />
            </main>
        )
    }
}
