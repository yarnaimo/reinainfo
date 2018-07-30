import { format } from 'date-fns/fp'

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
