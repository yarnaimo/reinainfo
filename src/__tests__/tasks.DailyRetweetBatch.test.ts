import { waitAll } from '@yarnaimo/arraymo'
import { TweetLog } from '~/models/TweetLog'
import { DailyRetweetBatch } from '~/tasks/DailyRetweetBatch'
import { day } from '~/utils/day'

const batch = new DailyRetweetBatch(day('2018-08-03T09:00'))

const logs = [
    {
        createdAt: new Date('2018-08-01T22:00'),
        isDailyNotification: true,
        tweetId: '81',
    },
    {
        createdAt: new Date('2018-08-02T22:00'),
        isDailyNotification: false,
        tweetId: '117',
    },
    {
        createdAt: new Date('2018-08-02T22:00'),
        isDailyNotification: true,
        tweetId: '1080',
    },
].map(data => new TweetLog().setData(data))

describe('Name of the group', () => {
    beforeAll(async () => {
        await waitAll(logs, log => log.save())
    })

    test('run', async () => {
        const retweets = await batch.run()
        expect(retweets).toHaveLength(1)
        expect(retweets[0].retweeted_status!.id_str).toBe('1080')
    })

    afterAll(async () => {
        await waitAll(logs, log => log.delete())
    })
})
