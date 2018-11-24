import { plusOne } from '@yarnaimo/twimo'
import { Dayjs } from 'dayjs'
import { TweetClassifier } from '~/../learn'
import { SearchStateAdmin } from '~/models/admin'
import { retweetWithNotification } from '~/services/integrated'
import { twitter } from '~/services/twitter'
import { day } from '~/utils/day'
import { Batch } from './Batch'

export class SearchBatch extends Batch {
    private tc: TweetClassifier
    public q =
        '上田麗奈 OR #上田麗奈 exclude:retweets -#nowplaying min_retweets:3'

    constructor(now?: Dayjs) {
        super(now)
        this.tc = new TweetClassifier()
    }

    async searchTweets(prevTweetId: string, until: Dayjs) {
        const matched = await twitter.searchTweets({
            q: this.q,
            sinceId: plusOne(prevTweetId),
        })

        return matched.filter(t => {
            return day(t.created_at).isBefore(until)
        })
    }

    async run() {
        const until = this.now.subtract(10, 'minute')

        const doc = await SearchStateAdmin.doc('main')

        const tweetsToClassify = await this.searchTweets(doc.prevTweetId, until)

        const officialTweets = tweetsToClassify.filter(t => {
            return this.tc.isOfficialTweet(t)
        })

        const { retweets, docs } = await retweetWithNotification(
            twitter,
            officialTweets.map(t => t.id_str)
        )

        if (tweetsToClassify.length) {
            doc.prevTweetId = tweetsToClassify[0].id_str
        }
        await doc.save()

        return { retweets, docs, tweetsToClassify }
    }
}
