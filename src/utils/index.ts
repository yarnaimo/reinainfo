import {
    format,
    parse,
    isBefore,
    isAfter,
    setDay,
    addWeeks,
    getDate,
} from 'date-fns/fp'

export const timeStr = format('H:mm')

export const multilineText = Symbol('Array#multilineText')
export const separateWith = Symbol('Array#separatedText')

declare global {
    interface Array<T> {
        [multilineText]: string
        [separateWith](separator: string): string
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
        return (this as any[])
            .filter(e => typeof e === 'string')
            .map(e => e.trim())
            .join(separator)
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
    timeOfDay = '0000',
    weekNumber,
    weekInterval = 1,
    times,
    since = new Date(),
    until,
}: {
    dayOfWeek: number
    timeOfDay?: string
    weekNumber?: number[]
    weekInterval?: number
    times?: number
    since?: Date
    until?: Date
}) => {
    if (!until && !times) {
        throw new Error('"times" or "until" must be specified.')
    }
    until = until || new Date(2024, 0, 1)
    times = times || 100
    const dates = [] as Date[]

    let currentDate = parse(setDay(dayOfWeek, since), 'HHmm', timeOfDay)

    if (currentDate.getTime() < since.getTime()) {
        currentDate = addWeeks(1, currentDate)
    }

    while (dates.length < times && currentDate.getTime() <= until.getTime()) {
        const nthWeek = Math.ceil(getDate(currentDate) / 7)

        if (!weekNumber || weekNumber.includes(nthWeek)) {
            dates.push(currentDate)
        }
        currentDate = addWeeks(weekInterval, currentDate)
    }
    return dates
}
