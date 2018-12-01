import { css } from 'emotion'
import { Component } from 'vue-property-decorator'
import { CSwitch } from '../components/atoms/CSwitch'
import CSchedule from '../components/molecules/CSchedule'
import { head } from '../utils/vue-tsx'
import { VStoreComponent } from '../utils/vuex-simple'
import { juliusFont } from '../variables/css'
import { container, mdih, pageContent, pageTitle } from '../variables/directives'

@Component(head('Schedule'))
export default class extends VStoreComponent {
    onlyOneshot = false

    get filteredSchedules() {
        return this.onlyOneshot
            ? this.firestore.schedules.filter(s => s.label == null)
            : this.firestore.schedules
    }

    render() {
        return (
            <main>
                <div class={pageTitle}>
                    <h1 class={juliusFont}>
                        <i class={mdih.one('calendar')} />
                        Schedules
                    </h1>
                    <span class={css({ flexGrow: 1 })} />
                    <CSwitch
                        checked={this.onlyOneshot}
                        onChange={(v: boolean) => (this.onlyOneshot = v)}
                        label="単発のみ"
                        right
                    />
                </div>

                <div class={pageContent}>
                    {this.filteredSchedules.length > 0 && (
                        <section class={[container]}>
                            <ul>
                                {this.filteredSchedules.map(s => (
                                    <CSchedule schedule={s} key={s.id} />
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </main>
        )
    }
}
