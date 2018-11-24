import { Dayjs } from 'dayjs'
import { TweetLogAdmin } from '~/models/admin'
import { twitter } from '~/services/twitter'
import { Batch } from './Batch'

export class DailyRetweetBatch extends Batch {
    public oneDayAgo: Dayjs

    constructor(now?: Dayjs) {
        super(now)
        this.oneDayAgo = this.now.subtract(1, 'day')
    }

    async run() {
        const logs = await TweetLogAdmin.query
            .where('isDailyNotification', '==', true)
            .where('createdAt', '>=', this.oneDayAgo.toDate())
            .orderBy('createdAt')
            .once()
        const ids = logs.map(l => l.tweetId)

        const retweets = await twitter.retweet(ids)
        return retweets
    }
}
