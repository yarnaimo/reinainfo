import nock from 'nock'
import { Parts, Schedule } from '../models/Schedule'
import { commandHandler } from '../server/slack'
import { parseDate } from '../utils/day'

jest.setTimeout(10000)

const hookUrl = 'https://hooks.slack.com'

nock(hookUrl)
    .persist()
    .post('/')
    .reply(200, 'ok')

const send = async (text: string) => {
    return (await commandHandler({
        params: { command: '/rin', text, response_url: hookUrl },
    })) as Schedule[]
}

describe('Schedules', () => {
    let docId: string

    test('add schedule', async () => {
        const parts = 'Hiru.1230+.1500.1530+Yoru.1730..1830'

        const [schedule] = await send(
            `s new -c live -t __test_1__ -d 000801 -p ${parts} -u https://google.com`
        )

        expect(schedule).toMatchObject({
            category: 'live',
            date: new Date(2000, 7, 1, 0, 0),
            parts: Parts.parse(parts),
        })
        docId = schedule.id
    })

    test('update schedule', async () => {
        const [schedule] = await send(
            `s update ${docId} -t "__test_1_modified__"`
        )

        expect(schedule.title).toBe('__test_1_modified__')
        expect(schedule.id).toBe(docId)
    })

    test('list schedules', async () => {
        const [doc2] = await send(
            's new -c live -t __test_2__ -d 000801 -u https://google.com'
        )

        const schedules = await send(
            `s ls --since 000801 --until 000801 -t __test_1_m`
        )

        await send(`s delete ${doc2.id}`)

        expect(schedules).toHaveLength(1)
        expect(schedules[0].id).toBe(docId)
    })

    test('delete schedule', async () => {
        const [schedule] = await send(`s delete ${docId}`)
        expect(schedule.id).toBe(docId)
    })
})

describe('Cyclic Schedules', () => {
    // 0730 0813 0827
    const label = 'shigohaji' + new Date().getTime()
    let id: string

    test('add', async () => {
        const schedules = await send(
            `cycle new ${label} mon.1300 itv.2 -t "SHIGOHAJI" -u http://google.com --times 3 --since 180729`
        )
        id = schedules[0].id
        expect(schedules[0].label).toBe(label)
        expect(schedules[0].date).toEqual(parseDate('180730.1300'))
        expect(schedules[1].date).toEqual(parseDate('180827.1300'))
    })

    test('shift', async () => {
        const updated = await send(
            `cycle shift ${label} .1w.-2d.30m --since 180811`
        )
        expect(updated[0].date).toEqual(parseDate('180818.1330'))
    })

    test('delete', async () => {
        const deleted = await send(`cycle delete ${label} --since 180730`)
        expect(deleted[0].id).toBe(id)
    })
})
