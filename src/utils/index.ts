import { addWeeks, format, getDate, parse, getDay } from 'date-fns/fp'

export const timeStr = format('H:mm')

export const multilineText = Symbol('Array#multilineText')
export const separateWith = Symbol('Array#separatedText')

declare global {
    interface Array<T> {
        [multilineText]: string
        [separateWith](separator: string): string | undefined
    }
}

Object.defineProperty(Array.prototype, multilineText, {
    get() {
        return (this as any[])
            .filter(e => typeof e === 'string')
            .map(e => e.trim())
            .join('\n')
    },
})
Object.defineProperty(Array.prototype, separateWith, {
    value: function(separator: string) {
        const filtered = (this as any[])
            .filter(e => typeof e === 'string')
            .map(e => e.trim())
        return filtered.length ? filtered.join(separator) : undefined
    },
})

export const pick = (obj: { [key: string]: any }, array: any[]) => {
    const target = {} as { [key: string]: any }
    Object.keys(obj).forEach(key => {
        if (array.includes(key)) target[key] = obj[key]
    })
    return target
}

export const assignMembers = (
    instance: any,
    obj: { [key: string]: any },
    array: any[]
) => {
    Object.assign(instance, pick(obj, array))
}

export const parseDate = (str: string) => {
    if (str.length === 6) str += '.0000'
    return parse(new Date(), 'yyMMdd.HHmm', str)
}

export const getDateString = (date: Date) => {
    return `${format('M/d', date)}(${'日月火水木金土'[getDay(date)]})`
}

export const stringify = (
    data: any,
    replace: { [key: string]: (value: any) => any }
) => {
    const target = {} as { [key: string]: any }
    Object.keys(data)
        .sort()
        .forEach(key => {
            const fn = replace[key]
            target[key] = fn ? fn(data[key]) : data[key]
        })
    return JSON.stringify(target, undefined, 2)
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
    const sinceDate = since ? parseDate(since) : new Date()
    const untilDate = until ? parseDate(until) : new Date(2021, 0, 1)
    times = times || 50
    const dates = [] as Date[]

    let currentDate = parse(
        parse(sinceDate, 'E', dayOfWeek),
        'HHmm',
        timeOfDay || '0000'
    )

    if (currentDate.getTime() < sinceDate.getTime()) {
        currentDate = addWeeks(1, currentDate)
    }

    while (
        dates.length < times &&
        currentDate.getTime() <= untilDate.getTime()
    ) {
        const nthWeek = Math.ceil(getDate(currentDate) / 7)

        if (!weekNumbers || weekNumbers.includes(nthWeek)) {
            dates.push(currentDate)
        }
        currentDate = addWeeks(weekInterval, currentDate)
    }
    return dates
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
