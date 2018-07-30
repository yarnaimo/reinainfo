import { Schedule, Part } from '../models/Schedule'
import { validate } from 'class-validator'

describe('Schedule', () => {
    let s: Schedule
    const date = new Date(2018, 0, 17, 12, 30)
    const date2 = new Date(2018, 0, 17, 17, 30)
    const date3 = new Date(2018, 0, 17, 18, 30)

    beforeEach(() => {
        s = new Schedule()
        s.category = 'event'
        s.title = 'Release event'
        s.date = date
        s.parts = [
            new Part(['Hiru', , , date]),
            new Part(['Yoru', date2, , date3]),
        ]
        s.url = 'https://google.com'
        s.venue = 'Toyama'
    })

    test('pass validation', async () => {
        const errors = await validate(s)
        expect(errors.length).toBe(0)
    })

    test('fail validation', async () => {
        s.title = 's'
        s.url = 'invalid url'

        const errors = await validate(s)
        expect(errors.length).toBe(2)
    })

    test('get text', async () => {
        expect(s.getText('明日の予定')).toBe(
            '明日の予定\n🎤 Release event @Toyama\nHiru » 12:30開演\nYoru » 17:30集合 18:30開演\nhttps://google.com'
        )
    })
})
