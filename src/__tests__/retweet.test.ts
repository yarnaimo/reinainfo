import { addMinutes, isBefore } from 'date-fns';
import { RetweetBatch } from '../tasks/retweet';

describe('Retweet Batch', () => {
    test('get tweets to classify', async () => {
        const now = new Date()
        const until = addMinutes(now, -10)

        const rb = new RetweetBatch()
        const tweets = await rb.searchTweets('0', until)

        expect(isBefore(new Date(tweets[0].created_at), until)).toBeTruthy()
    })
})
