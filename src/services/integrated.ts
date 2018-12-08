import { Rarray } from '@yarnaimo/rain'
import { tweetToUrl, TwimoClient } from '@yarnaimo/twimo'
import { BatchAdmin } from 'tyrestore/dist/admin'
import { TweetLogAdmin } from '../models/admin'
import { postSlackMessage } from './slack'

export const retweetWithNotification = async (twitter: TwimoClient, ids: string[]) => {
    const retweets = await twitter.retweet(ids)
    if (!retweets.length) return { retweets, docs: [] }

    const docs = retweets.map(({ retweeted_status }) => {
        const log = TweetLogAdmin.create()
        log.set({
            isTopic: true,
            tweetId: retweeted_status!.id_str,
        })
        return log
    })
    const batch = new BatchAdmin()
    await Rarray.waitAll(docs, doc => doc.save(batch))

    await batch.commit()

    await postSlackMessage({
        text: [
            `:loudspeaker: Retweeted ${retweets.length} tweets`,
            ...retweets.map(tweetToUrl),
        ].join('\n'),
    })
    return { retweets, docs }
}
