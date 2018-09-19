import { parse } from 'date-fns/fp'
import dayjs, { Dayjs } from 'dayjs'

export const day = dayjs

export const timeStr = (date: Date | Dayjs) => day(date).format('H:mm')

export const parseDate = (str: string) => {
    const contextDateStr = day().format('YYMMDD')
    const [strDate, strTime] = [...str.split('.'), '']
    const paddedDate = contextDateStr.slice(0, -strDate.length) + strDate
    const paddedTime = strTime.padEnd(4, '0')
    return parse(new Date(), 'yyMMdd.HHmm', `${paddedDate}.${paddedTime}`)
}

export const toDateString = (date: Date | Dayjs) => {
    const _date = day(date)
    const dateString = _date.format(
        day().month() === _date.month() ? 'd' : 'M/d'
    )
    return `${dateString}(${'日月火水木金土'[_date.day()]})`
}

export const createCyclicDates = ({
    dayOfWeek,
    timeOfDay,
    weekNumbers,
    weekInterval = 1,
    times,
    since,
    until,
}: {
    dayOfWeek: string
    timeOfDay?: string
    weekNumbers?: number[]
    weekInterval?: number
    times?: number
    since?: string
    until?: string
}) => {
    if (!dayOfWeek && !until && !times) {
        throw new Error('Invalid parameters')
    }
    const sinceDate = day(since ? parseDate(since) : undefined)
    const untilDate = day(until ? parseDate(until) : new Date(2021, 0, 1))
    times = times || 50
    const dates = [] as Dayjs[]

    let currentDate = day(
        parse(
            parse(sinceDate.toDate(), 'E', dayOfWeek),
            'HHmm',
            timeOfDay || '0000'
        )
    )

    if (currentDate.unix() < sinceDate.unix()) {
        currentDate = currentDate.add(1, 'week')
    }

    while (dates.length < times && currentDate.unix() <= untilDate.unix()) {
        const nthWeek = Math.ceil(day(currentDate).date() / 7)

        if (!weekNumbers || weekNumbers.includes(nthWeek)) {
            dates.push(currentDate)
        }
        currentDate = currentDate.add(weekInterval, 'week')
    }
    return dates.map(d => d.toDate())
}

export const durationStringToMinutes = (str: string) => {
    let min = 0
    str.split('.').forEach(str => {
        const n = Number(str.slice(0, -1))

        const unit = ({
            m: 1,
            h: 60,
            d: 24 * 60,
            w: 7 * 24 * 60,
        } as any)[str.slice(-1)]

        if (!unit) return

        min += n * unit
    })
    return min
}
