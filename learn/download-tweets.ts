import { twitter } from '../src/services/twitter'
import lazy from 'lazy.js'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { tmpPath } from '.'
import { extractTweetId } from '.'
import { ITweet } from '../src/models/Twitter';

if (!existsSync(tmpPath())) {
    mkdirSync(tmpPath())
}

const tweetIds = process.argv.slice(2).map(extractTweetId)

const main = async () => {
    const q = '上田麗奈 exclude:retweets -#nowplaying'

    const tweets = [] as ITweet[]

    if (tweetIds.length) {
        const statuses = await twitter.get<ITweet[]>('statuses/lookup', {
            id: tweetIds.join(','),
        })
        tweets.push(...statuses)
    } else {
        for (const _ of lazy.range(20).toArray()) {
            const lastTweet = tweets[tweets.length - 1]

            const matchedTweets = await twitter.searchTweets({
                q,
                maxId: lastTweet && lastTweet.id_str,
            })
            tweets.push(...matchedTweets)
            if (matchedTweets.length < 100) break
        }
    }

    writeFileSync(tmpPath('tweets.json'), JSON.stringify(tweets, undefined, 2))
}

main().catch(console.error)
