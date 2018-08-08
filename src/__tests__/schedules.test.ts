import { ScheduleBatch } from '../tasks/schedules'
import { scheduleFires } from '../models/Schedule'
import { Timestamp } from '@google-cloud/firestore'
import { parseDate } from '../utils'
import { addDays } from 'date-fns/fp'

describe('Schedule Batch', () => {
    const now = parseDate('000801.2200')
    let ids = [] as string[]

    beforeAll(async () => {
        ids = [
            await scheduleFires.add({
                active: true,
                category: 'event',
                title: 'Release event',
                date: Timestamp.fromDate(addDays(1, now)),
                url: 'https://google.com',
            }),
            await scheduleFires.add({
                active: true,
                category: 'event',
                title: 'Release event',
                date: Timestamp.fromDate(addDays(2, now)),
                url: 'https://google.com',
            }),
        ].map(s => s.id)
    })

    test('tomorrow', async () => {
        const batch = new ScheduleBatch(now)
        const schedules = await batch.schedulesBetween(1, 1)

        expect(schedules.length).toBe(1)
        expect(schedules[0].id).toBe(ids[0])
    })

    afterAll(async () => {
        await scheduleFires.bulkDelete(ids)
    })
})
