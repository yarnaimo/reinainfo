import { css } from 'emotion'
import { Component, Vue } from 'vue-property-decorator'
import { Schedule } from '../../src/models/Schedule'
import { day } from '../../src/utils/day'
import { CSwitch } from '../components/atoms/CSwitch'
import CSchedule from '../components/molecules/CSchedule'
import { head } from '../utils/vue-tsx'
import { juliusFont } from '../variables/css'
import {
    container,
    mdih,
    pageContent,
    pageTitle,
} from '../variables/directives'

@Component(head('Schedule'))
export default class extends Vue {
    created() {
        this.fetchSchedules()
    }

    schedules: Schedule[] = []

    onlyOneshot = false

    get filteredSchedules() {
        return this.onlyOneshot
            ? this.schedules.filter(s => s.category !== 'up')
            : this.schedules
    }

    async fetchSchedules() {
        try {
            const schedules = await Schedule.query()
                .where('date', '>', day().toDate())
                .orderBy('date')
                .dataSource()
                .get()
            this.schedules = schedules
        } catch (error) {
            console.error('Failed to fetch schedules: ', error)
        }
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
