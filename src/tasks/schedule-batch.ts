import { Dayjs } from 'dayjs'
import { Schedule } from '../models/Schedule'
import { twitter } from '../services/twitter'
import { day, toDateString } from '../utils/day'

export class ScheduleBatch {
    public now: Dayjs
    public today: Dayjs

    constructor(now?: Dayjs) {
        this.now = day(now)
        this.today = this.now.startOf('day')
    }

    async schedulesBetween(daySince: number, dayUntil: number) {
        const since = this.today.add(daySince, 'day')
        const until = this.today.add(dayUntil, 'day').endOf('day')

        const docs = await Schedule.getByQuery(q => {
            return q
                .where('active', '==', true)
                .where('date', '>=', since.toDate())
                .where('date', '<=', until.toDate())
                .orderBy('date')
        })

        const sorted = docs.sort(
            (a, b) => Number(b.isAppearance) - Number(a.isAppearance)
        )

        let dateString = toDateString(since)
        if (daySince !== dayUntil) {
            dateString += ' 〜 ' + toDateString(until)
        }

        return { schedules: sorted, dateString }
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
