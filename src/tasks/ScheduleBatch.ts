import { waitAll } from '@yarnaimo/arraymo'
import { Dayjs } from 'dayjs'
import { BatchAdmin } from 'tyrestore/dist/admin'
import { TweetLogAdmin } from '~/models/admin'
import { twitter } from '~/services/twitter'
import { toDateString } from '~/utils/day'
import { ScheduleAdmin } from '../models/admin'
import { Batch } from './Batch'

export class ScheduleBatch extends Batch {
    public today: Dayjs

    constructor(now?: Dayjs) {
        super(now)
        this.today = this.now.startOf('day')
    }

    async schedulesBetween(daySince: number, dayUntil: number) {
        const since = this.today.add(daySince, 'day')
        const until = this.today.add(dayUntil, 'day').endOf('day')

        const docs = await ScheduleAdmin.query
            .where('active', '==', true)
            .where('date', '>=', since.toDate())
            .where('date', '<=', until.toDate())
            .orderBy('date')
            .once()

        const sorted = docs.sort((a, b) => Number(b.isAppearance) - Number(a.isAppearance))

        let dateString = toDateString(since)
        if (daySince !== dayUntil) {
            dateString += ' 〜 ' + toDateString(until)
        }

        return { schedules: sorted, dateString }
    }

    async createTweetTexts(daySince: number, dayUntil: number) {
        const { schedules, dateString } = await this.schedulesBetween(daySince, dayUntil)

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

        if (since === 1 && until === 1) {
            const batch = new BatchAdmin()
            await waitAll(thread, async ({ id_str }) => {
                const log = TweetLogAdmin.create()
                log.set({
                    isDailyNotification: true,
                    tweetId: id_str,
                })
                await log.save(batch)
            })

            await batch.commit()
        }
        return thread
    }
}
