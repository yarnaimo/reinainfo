import { format, parse } from 'date-fns/fp'

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
    Object.keys(obj).forEach(key => {
        if (!array.includes(key)) delete obj[key]
    })
    return obj
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
