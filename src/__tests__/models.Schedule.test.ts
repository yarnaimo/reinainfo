import { Rstring } from '@yarnaimo/rain'
import { ModelType } from 'tyrestore/dist/utils'
import { ScheduleAdmin } from '../models/admin'
import { scheduleFixture } from '../__fixtures__/models.Schedule'

let s: ModelType<typeof ScheduleAdmin>
const date = new Date(2018, 0, 17, 12, 30)

beforeEach(() => {
    s = scheduleFixture()
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
            ['parts', s.parts.format().text],
            ['url', s.url],
            ['venue', s.venue],
            ['way', s.way],
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
    await expect(s.validate()).resolves.toBeTruthy()
})

test('fail validation', async () => {
    s.title = 's'
    s.url = 'invalid url'

    await expect(s.validate()).rejects.toHaveProperty('errors.length', 2)
})

test('get text', () => {
    expect(s.getTextWith('明日の予定', false)).toBe(
        Rstring.trimTemplateString(`
            明日の予定
            
            🎤 「Caligula-カリギュラ-」スペシャルイベント第65536弾 Girl’s Party @ サイエンスホール
            昼の部 » 12:30開始
            2 » 15:00開場 15:30開始
            夜の部 » 17:30集合 18:30開始

            参加方法 » 抽選
            https://t.co
        `)
    )
})

test('get text with date', () => {
    expect(s.getTextWith('来週の予定', true)).toBe(
        Rstring.trimTemplateString(`
            来週の予定
            
            1/17(水)
            🎤 「Caligula-カリギュラ-」スペシャルイベント第65536弾 Girl’s Party @ サイエンスホール
            昼の部 » 12:30開始
            2 » 15:00開場 15:30開始
            夜の部 » 17:30集合 18:30開始

            参加方法 » 抽選
            https://t.co
        `)
    )
})

test('get text with date (-parts)', () => {
    s = scheduleFixture('up')

    expect(s.getTextWith('来週の予定', true)).toBe(
        Rstring.trimTemplateString(`
            来週の予定
            
            1/17(水) 18:00
            🆙 FFFFFF

            https://t.co
        `)
    )
})

test('get text with date (-appearance)', () => {
    s = scheduleFixture('release')

    expect(s.getTextWith('来週の予定', true)).toBe(
        Rstring.trimTemplateString(`
            来週の予定
            
            1/17(水)
            📗 Voice Actress

            https://t.co
        `)
    )
})
