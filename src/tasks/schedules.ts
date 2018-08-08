import { scheduleFires, Schedule, ISchedule } from '../models/Schedule'
import { startOfDay, addDays, endOfDay } from 'date-fns/fp'
import lazy from 'lazy.js'

export class ScheduleBatch {
    private now: Date
    private today: Date

    constructor(now?: Date) {
        this.now = now || new Date()
        this.today = startOfDay(now)
    }

    async schedulesBetween(daySince: number, dayUntil: number) {
        const schedules = await scheduleFires.withQuery(ref => {
            return ref
                .where('active', '==', true)
                .where('date', '>=', addDays(daySince, this.today))
                .where('date', '<=', endOfDay(addDays(dayUntil, this.today)))
                .orderBy('date')
        })

        return lazy(schedules)
            .map(s => new Schedule(s))
            .sortBy(s => (s.categoryType === 'appearance' ? 0 : 1))
            .toArray()
    }

    async tomorrow() {
        const schedules = await this.schedulesBetween(1, 1)

        schedules.map((s, i) => {
            return s.getText(`明日の予定 (${i + 1}/${schedules.length})`)
        })
    }
}
