import { IDocObject } from 'firestore-simple'
import { ISchedule } from '../models/Schedule'
import { commandHandler } from '../server/slack'
import { parseDate } from '../utils'

const h = (text: string) =>
    new Promise<(ISchedule & IDocObject)[]>(resolve => {
        commandHandler(async (message, schedules) => resolve(schedules), text)
    })

jest.setTimeout(10000)

describe('Slack Schedules', () => {
    let docId: string

    test('add schedule', async () => {
        const [schedule] = await h(
            'new -c live -t __test_1__ -d 000801 -u https://google.com'
        )

        expect(schedule.category).toBe('live')
        docId = schedule.id
    })

    test('update schedule', async () => {
        const [schedule] = await h(`update ${docId} -t "__test_1_modified__"`)

        expect(schedule.title).toBe('__test_1_modified__')
        expect(schedule.id).toBe(docId)
    })

    test('list schedules', async () => {
        const [doc2] = await h(
            'new -c live -t __test_2__ -d 000801 -u https://google.com'
        )

        const schedules = await h(
            `ls --since 000801 --until 000801 -t __test_1_m`
        )

        await h(`delete ${doc2.id}`)

        expect(schedules.length).toBe(1)
        expect(schedules[0].id).toBe(docId)
    })

    test('delete schedule', async () => {
        const [schedule] = await h(`delete ${docId}`)
        expect(schedule.id).toBe(docId)
    })
})

describe('Slack Cyclic Schedules', () => {
    // 0730 0813 0827
    const label = 'shigohaji' + new Date().getTime()
    let id: string

    test('add', async () => {
        const schedules = await h(
            `cycle new ${label} mon.1300 itv.2 -t "SHIGOHAJI" -u http://google.com --times 3 --since 180729`
        )
        id = schedules[0].id
        expect(schedules[0].label).toBe(label)
        expect(schedules[0].date.toDate()).toEqual(parseDate('180730.1300'))
        expect(schedules[1].date.toDate()).toEqual(parseDate('180827.1300'))
    })

    test('shift', async () => {
        const updated = await h(
            `cycle shift ${label} .1w.-2d.30m --since 180811`
        )
        expect(updated[0].date.toDate()).toEqual(parseDate('180818.1330'))
    })

    test('delete', async () => {
        const deleted = await h(`cycle delete ${label} --since 180730`)
        expect(deleted[0].id).toBe(id)
    })
})
