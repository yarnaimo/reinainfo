import { minusOne } from '@yarnaimo/twimo'
import { ITweet } from '@yarnaimo/twimo/dist/Tweet'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import lazy from 'lazy.js'
import { extractTweetId, tmpPath } from '.'
import { twitter } from '../src/services/twitter'

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
                maxId: lastTweet && minusOne(lastTweet.id_str),
            })
            tweets.push(...matchedTweets)
            if (matchedTweets.length < 100) break
        }
    }

    writeFileSync(tmpPath('tweets.json'), JSON.stringify(tweets, undefined, 2))
}

main().catch(console.error)
