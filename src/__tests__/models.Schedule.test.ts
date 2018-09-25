import { trimTemplateString } from '@yarnaimo/arraymo'
import { Parts, Schedule } from '../models/Schedule'
import { parseDate } from '../utils/day'

let s: Schedule
const date = new Date(2018, 0, 17, 12, 30)
const date2 = new Date(2018, 0, 17, 17, 30)
const date3 = new Date(2018, 0, 17, 18, 30)

beforeEach(() => {
    s = new Schedule().setData({
        category: 'event',
        title: 'Release event',
        date: parseDate('180117.1230'),
        parts: Parts.parse('Hiru.1230+.1500.1530+Yoru.1730..1830'),
        url: 'https://google.com',
        venue: 'Toyama',
    })
})

test('to attachment', () => {
    const attachment = s.toAttachment()

    expect(attachment).toEqual({
        color: '#ef9a9a',
        author_name: s.category,
        title: s.title,
        text: '2018/01/17 12:30',
        fields: [
            ['id', s.id],
            ['label', undefined],
            ['parts', Parts.getText(s.parts)],
            ['url', s.url],
            ['venue', s.venue],
            ['way', undefined],
        ].map(([title, value]) => ({ title, value })),
    })
})

test('category type', () => {
    expect(s.isAppearance).toBeTruthy()
})

test('date', () => {
    expect(s.date).toEqual(date)
})

test('pass validation', async () => {
    expect.assertions(1)
    expect(await s.validate()).toBeInstanceOf(Schedule)
})

test('fail validation', async () => {
    expect.assertions(1)
    s.title = 's'
    s.url = 'invalid url'

    await s.validate().catch(e => expect(e.errors).toHaveLength(2))
})

test('get text', () => {
    expect(s.getTextWith('明日の予定', false)).toBe(
        trimTemplateString(`
            明日の予定
            
            🎤 Release event @Toyama
            Hiru » 12:30開演
            2 » 15:00開場 15:30開演
            Yoru » 17:30集合 18:30開演
            https://google.com
        `)
    )
})

test('get text with date', () => {
    expect(s.getTextWith('来週の予定', true)).toBe(
        trimTemplateString(`
            来週の予定
            
            1/17(水) 🎤 Release event @Toyama
            Hiru » 12:30開演
            2 » 15:00開場 15:30開演
            Yoru » 17:30集合 18:30開演
            https://google.com
        `)
    )
})
