import { onlyResolved, trimTemplateString, waitAll } from '@yarnaimo/arraymo'
import { Category, Schedule } from '~/models/Schedule'
import { ScheduleBatch } from '~/tasks/ScheduleBatch'
import { day, parseDate, timeStr, toDateString } from '~/utils/day'

const now = day(parseDate('000801.2200'))
const day1 = now.add(1, 'day')
const day2 = now.add(2, 'day')
const day7 = now.add(7, 'day')

const refs = [
    {
        active: true,
        category: 'event' as Category,
        title: 'EVENT1',
        date: day1.toDate(),
        url: 'https://t.co',
    },
    {
        active: true,
        category: 'event' as Category,
        title: 'EVENT2',
        date: day2.toDate(),
        url: 'https://t.co',
    },
].map(data => new Schedule().setData(data))

beforeAll(async () => {
    await waitAll(refs, s => s.save())
})

test('tomorrow', async () => {
    const batch = new ScheduleBatch(now)
    const texts = await batch.createTweetTexts(1, 1)

    expect(texts).toEqual([
        trimTemplateString(`
            ${toDateString(day1)} の予定 (1/1)
            
            ${timeStr(day1)}〜
            🎤 EVENT1

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
            
            ${toDateString(day1)} ${timeStr(day1)}〜
            🎤 EVENT1
            
            https://t.co
        `),
        trimTemplateString(`
            ${toDateString(day1)} 〜 ${toDateString(day7)} の予定 (2/2)
            
            ${toDateString(day2)} ${timeStr(day2)}〜
            🎤 EVENT2
            
            https://t.co
        `),
    ])
})

afterAll(async () => {
    await onlyResolved(refs, async s => {
        await s.delete()
    })
})
