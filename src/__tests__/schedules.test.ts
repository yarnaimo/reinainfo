import { ScheduleBatch } from '../tasks/schedules'
import { scheduleFires } from '../models/Schedule'
import { Timestamp } from '@google-cloud/firestore'
import { parseDate, getDateString, timeStr } from '../utils'
import { addDays } from 'date-fns/fp'
import { multilineText } from '../utils/index'

describe('Schedule Batch', () => {
    const now = parseDate('000801.2200')
    const day1 = addDays(1, now)
    const day2 = addDays(2, now)
    const day7 = addDays(7, now)
    let ids = [] as string[]

    beforeAll(async () => {
        ids = [
            await scheduleFires.add({
                active: true,
                category: 'event',
                title: 'EVENT1',
                date: Timestamp.fromDate(day1),
                url: 'URL',
            }),
            await scheduleFires.add({
                active: true,
                category: 'event',
                title: 'EVENT2',
                date: Timestamp.fromDate(day2),
                url: 'URL',
            }),
        ].map(s => s.id)
    })

    test('tomorrow', async () => {
        const batch = new ScheduleBatch(now)
        const texts = await batch.createTweetTexts(1, 1)

        expect(texts).toEqual([
            [
                `${getDateString(day1)} の予定 (1/1)`,
                '',
                '🎤 EVENT1',
                `${timeStr(day1)}〜`,
                'URL',
            ][multilineText],
        ])
    })

    test('next week', async () => {
        const batch = new ScheduleBatch(now)
        const texts = await batch.createTweetTexts(1, 7)

        expect(texts).toEqual([
            [
                `${getDateString(day1)} 〜 ${getDateString(day7)} の予定 (1/2)`,
                '',
                `${getDateString(day1)} 🎤 EVENT1`,
                `${timeStr(day1)}〜`,
                'URL',
            ][multilineText],
            [
                `${getDateString(day1)} 〜 ${getDateString(day7)} の予定 (2/2)`,
                '',
                `${getDateString(day2)} 🎤 EVENT2`,
                `${timeStr(day2)}〜`,
                'URL',
            ][multilineText],
        ])
    })

    afterAll(async () => {
        await scheduleFires.bulkDelete(ids)
    })
})
