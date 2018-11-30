import { css } from 'emotion'
import { Component, Vue } from 'vue-property-decorator'
import { CSwitch } from '../components/atoms/CSwitch'
import CSchedule from '../components/molecules/CSchedule'
import { tuex } from '../tuex'
import { head } from '../utils/vue-tsx'
import { juliusFont } from '../variables/css'
import { container, mdih, pageContent, pageTitle } from '../variables/directives'

@Component(head('Schedule'))
export default class extends Vue {
    // schedules: MSchedule[] = Schedule.query
    //     .where('date', '>', day().toDate())
    //     .orderBy('date')
    //     .listen(error => console.error('Failed to fetch schedules: ', error))
    //     .docs
    // schedules: MSchedule[] = tuex.schedules

    get schedules() {
        const now = new Date()
        return tuex.store.schedules.filter(s => s.date > now)
    }

    onlyOneshot = false

    get filteredSchedules() {
        return this.onlyOneshot ? this.schedules.filter(s => s.label == null) : this.schedules
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
