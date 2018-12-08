import { minusOne } from '@yarnaimo/twimo'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import lazy from 'lazy.js'
import { Status } from 'twitter-d'
import { extractTweetId, tmpPath } from '.'
import { twitter } from '../src/services/twitter'

if (!existsSync(tmpPath())) {
    mkdirSync(tmpPath())
}

const tweetIds = process.argv.slice(2).map(extractTweetId)

const main = async () => {
    const q = '上田麗奈 exclude:retweets -#nowplaying'

    const tweets = [] as Status[]

    if (tweetIds.length) {
        const statuses = await twitter.get<Status[]>('statuses/lookup', {
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
