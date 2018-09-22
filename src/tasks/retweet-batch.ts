import { plusOne } from '@yarnaimo/twimo'
import { Dayjs } from 'dayjs'
import { TweetClassifier } from '../../learn'
import { retweetWithNotification } from '../services/integrated'
import { twitter } from '../services/twitter'
import { day } from '../utils/day'
import { SearchState } from './../models/SearchState'

export class RetweetBatch {
    private tc: TweetClassifier
    public now: Dayjs
    public q =
        '上田麗奈 OR #上田麗奈 exclude:retweets -#nowplaying min_retweets:3'

    constructor() {
        this.tc = new TweetClassifier()
        this.now = day()
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

        const doc =
            (await SearchState.get('main')) ||
            new SearchState('main', { prevTweetId: '0' })

        const tweetsToClassify = await this.searchTweets(doc.prevTweetId, until)

        const officialTweets = tweetsToClassify.filter(t => {
            return this.tc.isOfficialTweet(t)
        })

        const retweets = await retweetWithNotification(
            twitter,
            officialTweets.map(t => t.id_str)
        )

        if (tweetsToClassify.length) {
            doc.prevTweetId = tweetsToClassify[0].id_str
        }
        await doc.save()

        return { retweets, tweetsToClassify }
    }
}
