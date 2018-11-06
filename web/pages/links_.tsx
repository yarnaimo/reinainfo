import { Component, Vue } from 'vue-property-decorator'
import { ComingSoon } from '../components/organisms/ComingSoon'
import { head } from '../utils/vue-tsx'

@Component(head('Links'))
export default class extends Vue {
    render() {
        return (
            <main>
                <ComingSoon />
            </main>
        )
    }
}
