import bigInt from 'big-integer'
import { addMinutes, isBefore } from 'date-fns'
import { TweetClassifier } from '../../learn'
import { getCollection } from '../services/firebase'
import { Twitter } from '../services/twitter'
import { ITweet } from '../models/Twitter'

interface ITweetLog {
    prevTweetId: string
}
const tweetLogCollection = getCollection<ITweetLog>('tweetLog')

export class RetweetBatch {
    private tc: TweetClassifier

    constructor(private twitter: Twitter) {
        this.tc = new TweetClassifier()
    }

    async searchTweets(prevTweetId: string, until: Date) {
        const q = '上田麗奈 exclude:retweets -#nowplaying min_retweets:3'
        const matched = await this.twitter.searchTweets({ q })

        return matched.filter(t => {
            return (
                isBefore(new Date(t.created_at), until) &&
                bigInt(t.id_str).greater(bigInt(prevTweetId))
            )
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

        const tasks = officialTweets.map(async ({ id_str: id }) => {
            const { id_str } = await this.twitter
                .post<ITweet>('statuses/retweet', { id })
                .catch(() => ({
                    id_str: null,
                }))
            return id_str
        })
        const ids = await Promise.all(tasks)

        await tweetLogCollection.set({
            id: 'main',
            prevTweetId: tweetsToClassify[0].id_str,
        })
        return ids
    }
}
