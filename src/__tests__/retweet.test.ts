import bigInt from 'big-integer'
import { addMinutes, isBefore } from 'date-fns'
import { RetweetBatch } from '../tasks/retweet'

describe('Retweet Batch', () => {
    test('get tweets to classify', async () => {
        const now = new Date()
        const until = addMinutes(now, -10)

        const rb = new RetweetBatch()
        const tweets = await rb.searchTweets('0', until)

        expect(isBefore(new Date(tweets[0].created_at), until)).toBeTruthy()

        const prevId = tweets[1].id_str
        const tweets2 = await rb.searchTweets(prevId, until)
        expect(
            bigInt(tweets2[tweets2.length - 1].id_str).greater(bigInt(prevId))
        )
    })
})
