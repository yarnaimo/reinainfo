import { Timestamp } from '@google-cloud/firestore'
import { validate } from 'class-validator'
import { Part, Schedule } from '../models/Schedule'
import { parseDate } from '../utils'

describe('Schedule', () => {
    let s: Schedule
    const date = new Date(2018, 0, 17, 12, 30)
    const date2 = new Date(2018, 0, 17, 17, 30)
    const date3 = new Date(2018, 0, 17, 18, 30)

    beforeEach(() => {
        s = new Schedule()
        s.category = 'event'
        s.title = 'Release event'
        s.date = Timestamp.fromDate(parseDate('180117.1230'))
        s.parts = Part.parseMultiple('Hiru.1230+Yoru.1730..1830')
        s.url = 'https://google.com'
        s.venue = 'Toyama'
    })

    test('to attachment', () => {
        const attachment = Schedule.toAttachment(s)

        expect(attachment).toEqual({
            color: '#ef9a9a',
            author_name: s.category,
            title: s.title,
            text: '2018/01/17 12:30',
            fields: [
                {
                    title: 'parts',
                    value: s.parts!.map(Part.getText).join('\n'),
                },
                {
                    title: 'url',
                    value: s.url,
                },
                {
                    title: 'venue',
                    value: s.venue,
                },
            ],
        })
    })

    test('category type', () => {
        expect(s.categoryType).toBe('appearance')
    })

    test('date', () => {
        expect(s.date).toEqual(Timestamp.fromDate(date))
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

    test('get text', () => {
        expect(s.getTextWith('明日の予定', false)).toBe(
            '明日の予定\n\n🎤 Release event @Toyama\nHiru » 12:30開演\nYoru » 17:30集合 18:30開演\nhttps://google.com'
        )
    })

    test('get text with date', () => {
        expect(s.getTextWith('来週の予定', true)).toBe(
            '来週の予定\n\n1/17(水) 🎤 Release event @Toyama\nHiru » 12:30開演\nYoru » 17:30集合 18:30開演\nhttps://google.com'
        )
    })
})
