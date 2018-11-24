import { Parts } from '~/models/Parts'
import { cmd } from '.'

let docId: string

test('add schedule', async () => {
    const parts = 'Hiru.1230+.1500.1530+Yoru.1730..1830'

    const [schedule] = await cmd(
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
    const [schedule] = await cmd(`s update ${docId} -t "__test_1_modified__"`)

    expect(schedule.title).toBe('__test_1_modified__')
    expect(schedule.id).toBe(docId)
})

test('list schedules', async () => {
    const [doc2] = await cmd(
        's new -c live -t __test_2__ -d 000801 -u https://google.com'
    )

    const schedules = await cmd(
        `s ls --since 000801 --until 000801 -t __test_1_m`
    )

    await cmd(`s delete ${doc2.id}`)

    expect(schedules).toHaveLength(1)
    expect(schedules[0].id).toBe(docId)
})

test('delete schedule', async () => {
    const [schedule] = await cmd(`s delete ${docId}`)
    expect(schedule.id).toBe(docId)
})
