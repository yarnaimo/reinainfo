import { PBatch } from '@yarnaimo/pring'
import { tweetToUrl, TwimoClient } from '@yarnaimo/twimo'
import { TweetLog } from '~/models/TweetLog'
import { postSlackMessage } from './slack'

export const retweetWithNotification = async (
    twitter: TwimoClient,
    ids: string[]
) => {
    const retweets = await twitter.retweet(ids)
    if (!retweets.length) return { retweets, docs: [] }

    const batch = retweets.reduce((batch, { retweeted_status }) => {
        const log = new TweetLog().setData({
            isTopic: true,
            tweetId: retweeted_status!.id_str,
        })

        return batch.setDoc(log)
    }, new PBatch())

    await batch.commit()

    await postSlackMessage({
        text: [
            `:loudspeaker: Retweeted ${retweets.length} tweets`,
            ...retweets.map(tweetToUrl),
        ].join('\n'),
    })
    return { retweets, docs: batch.docs }
}
