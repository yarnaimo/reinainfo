import { addDays, endOfDay, startOfDay } from 'date-fns/fp'
import lazy from 'lazy.js'
import { Schedule, scheduleFires } from '../models/Schedule'
import { twitter } from '../services/twitter'
import { getDateString } from '../utils'

export class ScheduleBatch {
    private now: Date
    private today: Date

    constructor(now?: Date) {
        this.now = now || new Date()
        this.today = startOfDay(this.now)
    }

    async schedulesBetween(daySince: number, dayUntil: number) {
        const since = addDays(daySince, this.today)
        const until = endOfDay(addDays(dayUntil, this.today))

        const scheduleDocs = await scheduleFires.withQuery(ref => {
            return ref
                .where('active', '==', true)
                .where('date', '>=', since)
                .where('date', '<=', until)
                .orderBy('date')
        })

        const schedules = lazy(scheduleDocs)
            .map(s => new Schedule(s))
            .sortBy(s => (s.categoryType === 'appearance' ? 0 : 1))
            .toArray()

        let dateString = getDateString(since)
        if (daySince !== dayUntil) {
            dateString += ' 〜 ' + getDateString(until)
        }

        return { schedules, dateString }
    }

    async createTweetTexts(daySince: number, dayUntil: number) {
        const { schedules, dateString } = await this.schedulesBetween(
            daySince,
            dayUntil
        )

        return schedules.map((s, i) => {
            return s.getTextWith(
                `${dateString} の予定 (${i + 1}/${schedules.length})`,
                daySince !== dayUntil
            )
        })
    }

    async run(since: number, until: number) {
        const texts = await this.createTweetTexts(since, until)
        const thread = await twitter.postThread(texts)
        return thread
    }
}
