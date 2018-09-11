import { TwimoClient } from '@yarnaimo/twimo'
import { tweetToUrl } from '../utils/twitter'
import { postSlackMessage } from './slack'

export const retweetWithNotification = async (
    twitter: TwimoClient,
    ids: string[]
) => {
    const retweets = await twitter.retweet(ids)

    if (retweets.length) {
        await postSlackMessage({
            text: [
                `:loudspeaker: Retweeted ${retweets.length} tweets`,
                ...retweets.map(tweetToUrl),
            ].join('\n'),
        })
    }
    return retweets
}
