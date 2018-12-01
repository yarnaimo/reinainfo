import { parse } from 'date-fns/fp'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ja'

dayjs.locale('ja')
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
    const dateString = _date.format(day().month() === _date.month() ? 'D' : 'M/D')
    return `${dateString}(${_date.format('ddd').slice(0, 1)})`
}

export const createCyclicDates = ({
    dayOfWeek,
    timeOfDay,
    weekNumbers,
    weekInterval = 1,
    times = 50,
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
    if (!dayOfWeek) throw new Error('Invalid parameters')

    const sinceDate = day(since ? parseDate(since) : undefined)
    const untilDate = day(until ? parseDate(until) : new Date(2021, 0, 1))

    const mightAddOneWeek = (d: Dayjs) => (d.isBefore(sinceDate) ? d.add(1, 'week') : d)

    const currentDate = mightAddOneWeek(
        day(parse(parse(sinceDate.toDate(), 'E', dayOfWeek), 'HHmm', timeOfDay || '0000'))
    )

    const { dates } = [...Array(times).keys()].reduce(
        ({ dates, currentDate }) => {
            if (currentDate.isAfter(untilDate)) return { dates, currentDate }

            const nthWeek = Math.ceil(day(currentDate).date() / 7)
            return {
                dates:
                    weekNumbers && !weekNumbers.includes(nthWeek) ? dates : [...dates, currentDate],
                currentDate: currentDate.add(weekInterval, 'week'),
            }
        },
        { dates: [] as Dayjs[], currentDate }
    )
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
