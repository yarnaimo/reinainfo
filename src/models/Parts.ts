import { globalMatch, unite } from '@yarnaimo/arraymo'
import { FieldArray } from 'tyrestore/dist/core/FieldArray'

export interface IPart {
    name: string | null
    gatherAt: string | null
    opensAt: string | null
    startsAt: string
}

export interface FormattedParts {
    text: string
    array: ({
        name: string
        time: string
    })[]
}

export const partPattern = (() => {
    const T = '(?:\\d{3,4})?'
    const TD = `?:\\.(${T})`
    const S = '(?:^|\\+)'
    const E = '(?=$|\\+)'
    return new RegExp(
        `${S}([^.+]*)(${TD}(?!\\.${T}${E}))?(${TD})?(${TD})${E}`,
        'g'
    )
})()

export class Parts extends FieldArray<IPart> {
    static parse(str: string) {
        const matches = globalMatch(str, partPattern)
        const parts = matches.map(([, name = null, ...times]) => {
            const [gatherAt, opensAt, startsAt] = times.map(str => {
                return str
                    ? `${Number(str.slice(-4, -2))}:${str.slice(-2)}`
                    : null
            })
            return {
                name: name,
                gatherAt,
                opensAt,
                startsAt: startsAt!,
            } as IPart
        })
        return new Parts().set(parts)
    }

    toArray(): FormattedParts['array'] {
        const withSuffix = (time: string | null, suffix: string) => {
            return time ? time + suffix : null
        }
        return this.array.map((p, i) => {
            const timesStr = unite(' ', [
                withSuffix(p.gatherAt, '集合'),
                withSuffix(p.opensAt, '開場'),
                withSuffix(p.startsAt, '開始'),
            ])
            return { name: p.name || String(i + 1), time: timesStr! }
        })
    }

    format(): FormattedParts {
        const array = this.toArray()
        return {
            array,
            text: array.map(({ name, time }) => `${name} » ${time}`).join('\n'),
        }
    }
}
