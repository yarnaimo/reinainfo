import { parseDate } from '~/utils/day'
import { cmd } from '.'

// 0730 0813 0827
const label = 'shigohaji' + new Date().getTime()
let id: string

test('add', async () => {
    const schedules = await cmd(
        `refrain new ${label} mon.1300 itv.2 -t "SHIGOHAJI" -u http://google.com --times 3 --since 180729`
    )
    id = schedules[0].id
    expect(schedules[0].label).toBe(label)
    expect(schedules[0].date).toEqual(parseDate('180730.1300'))
    expect(schedules[1].date).toEqual(parseDate('180827.1300'))
})

test('shift', async () => {
    const updated = await cmd(`refrain shift ${label} .1w.-2d.30m --since 180811`)
    expect(updated[0].date).toEqual(parseDate('180818.1330'))
})

test('delete', async () => {
    const deleted = await cmd(`refrain delete ${label} --since 180730`)
    expect(deleted[0].id).toBe(id)
})
