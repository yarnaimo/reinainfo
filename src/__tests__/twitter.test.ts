import { twitter } from '../services/twitter'
import { config } from '../config'
import { ITweet } from '../models/Twitter'

const userId = config.twitter.accounts.reina.user_id

describe('Twitter', () => {
    test('get 3 tweets from home timeline', async () => {
        const tweets = await twitter.get<ITweet[]>('statuses/home_timeline', {
            count: 3,
            a: null,
        })
        expect(tweets.length).toBe(3)
    })

    test('post DM to myself and delete it', async () => {
        const text = 'soko pick up ' + new Date().toISOString()

        const posted = await twitter.post<any>('direct_messages/new', {
            user_id: userId,
            text,
            hoge: undefined,
        })
        expect(posted.text).toBe(text)
        expect(posted.recipient.id_str).toBe(userId)

        const deleted = await twitter.post<any>('direct_messages/destroy', {
            id: posted.id_str,
        })
        expect(deleted.id_str).toBe(posted.id_str)
    })

    test.skip('post thread', async () => {
        const ids = await twitter.postThread(['test', 'test2'])
        expect(ids.length).toBe(2)
    })
})
