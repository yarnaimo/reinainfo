import { plusOne } from '@yarnaimo/twimo'
import { addMinutes, isBefore } from 'date-fns'
import { TweetClassifier } from '../../learn'
import { getCollection } from '../services/firebase'
import { retweetWithNotification } from '../services/integrated'
import { twitter } from '../services/twitter'

interface ITweetLog {
    prevTweetId: string
}
const tweetLogCollection = getCollection<ITweetLog>('tweetLog')

export class RetweetBatch {
    private tc: TweetClassifier

    constructor() {
        this.tc = new TweetClassifier()
    }

    async searchTweets(prevTweetId: string, until: Date) {
        const q =
            '上田麗奈 OR #上田麗奈 exclude:retweets -#nowplaying min_retweets:3'
        const matched = await twitter.searchTweets({
            q,
            sinceId: plusOne(prevTweetId),
        })

        return matched.filter(t => {
            return isBefore(new Date(t.created_at), until)
        })
    }

    async run() {
        const now = new Date()
        const until = addMinutes(now, -10)

        const { prevTweetId } = await tweetLogCollection
            .fetchDocument('main')
            .catch(() => ({ prevTweetId: '0' } as ITweetLog))

        const tweetsToClassify = await this.searchTweets(prevTweetId, until)

        const officialTweets = tweetsToClassify.filter(t => {
            return this.tc.isOfficialTweet(t)
        })

        const retweets = await retweetWithNotification(
            twitter,
            officialTweets.map(t => t.id_str)
        )

        await tweetLogCollection.set({
            id: 'main',
            prevTweetId: tweetsToClassify.length
                ? tweetsToClassify[0].id_str
                : prevTweetId,
        })

        return retweets
    }
}
