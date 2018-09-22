import { onlyResolved, trimTemplateString } from '@yarnaimo/arraymo'
import { Status } from 'twitter-d'
import { Schedule } from '../models/Schedule'
import { SearchState } from '../models/SearchState'
import { RetweetBatch } from '../tasks/retweet-batch'
import { ScheduleBatch } from '../tasks/schedule-batch'
import { day, parseDate, timeStr, toDateString } from '../utils/day'

describe('Schedule Batch', () => {
    const now = day(parseDate('000801.2200'))
    const day1 = now.add(1, 'day')
    const day2 = now.add(2, 'day')
    const day7 = now.add(7, 'day')
    let refs = [] as Schedule[]

    beforeAll(async () => {
        refs = [
            new Schedule(undefined, {
                active: true,
                category: 'event',
                title: 'EVENT1',
                date: day1.toDate(),
                url: 'https://t.co',
            }),
            new Schedule(undefined, {
                active: true,
                category: 'event',
                title: 'EVENT2',
                date: day2.toDate(),
                url: 'https://t.co',
            }),
        ]
        await onlyResolved(refs, async s => {
            await s.save().catch(console.error)
        })
    })

    test('tomorrow', async () => {
        const batch = new ScheduleBatch(now)
        const texts = await batch.createTweetTexts(1, 1)

        expect(texts).toEqual([
            trimTemplateString(`
                ${toDateString(day1)} の予定 (1/1)
                
                🎤 EVENT1
                ${timeStr(day1)}〜
                https://t.co
            `),
        ])
    })

    test('next week', async () => {
        const batch = new ScheduleBatch(now)
        const texts = await batch.createTweetTexts(1, 7)

        expect(texts).toEqual([
            trimTemplateString(`
                ${toDateString(day1)} 〜 ${toDateString(day7)} の予定 (1/2)
                
                ${toDateString(day1)} 🎤 EVENT1
                ${timeStr(day1)}〜
                https://t.co
            `),
            trimTemplateString(`
                ${toDateString(day1)} 〜 ${toDateString(day7)} の予定 (2/2)
                
                ${toDateString(day2)} 🎤 EVENT2
                ${timeStr(day2)}〜
                https://t.co
            `),
        ])
    })

    afterAll(async () => {
        await onlyResolved(refs, async s => {
            await s.delete()
        })
    })
})

describe('Retweet Batch', () => {
    let batch = new RetweetBatch()
    let _tweets: Status[] = []

    test('get tweets to classify', async () => {
        const until = batch.now.subtract(10, 'minute')

        _tweets = await batch.searchTweets('0', until)

        const state = new SearchState('main', {
            prevTweetId: _tweets[5].id_str,
        })
        await state.save()

        expect(day(_tweets[0].created_at).isBefore(until)).toBeTruthy()
    })

    test('run', async () => {
        const { tweetsToClassify } = await batch.run()
        expect(tweetsToClassify).toHaveLength(5)

        const state = await SearchState.get('main')
        expect(state!.prevTweetId).toBe(_tweets[0].id_str)
    })
})
