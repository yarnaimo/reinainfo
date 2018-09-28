import { MessageAttachment } from '@slack/client'
import { globalMatch, unite } from '@yarnaimo/arraymo'
import { DocBase } from '@yarnaimo/pring'
import {
    IsBoolean,
    IsIn,
    IsInstance,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
} from 'class-validator'
import { property } from 'pring'
import { day, timeStr, toDateString } from '../utils/day'

export const cTypes = {
    appearance: {
        live: '🎫',
        event: '🎤',
        streaming: '🔴',
        tv: '📺',
        radio: '📻',
        up: '🆙',
    },
    release: {
        music: '🎶',
        video: '📼',
        game: '🎮',
        book: '📗',
    },
}
export type Category =
    | keyof typeof cTypes['appearance']
    | keyof typeof cTypes['release']

type CategoryType = keyof typeof cTypes

const categories = (() => {
    const obj = {} as { [C in Category]: { type: CategoryType; emoji: string } }

    for (const [type, catsInType] of Object.entries(cTypes)) {
        for (const [cat, emoji] of Object.entries(catsInType)) {
            obj[cat as Category] = { type: type as CategoryType, emoji }
        }
    }
    return obj
})()

export interface IPart {
    name: string | null
    gatherAt: string | null
    opensAt: string | null
    startsAt: string
}

const partPattern = (() => {
    const T = '(?:\\d{3,4})?'
    const TD = `?:\\.(${T})`
    const S = '(?:^|\\+)'
    const E = '(?=$|\\+)'
    return new RegExp(
        `${S}([^.+]*)(${TD}(?!\\.${T}${E}))?(${TD})?(${TD})${E}`,
        'g'
    )
})()

export class Parts {
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
        return parts
    }

    static getText(parts?: IPart[]) {
        if (!parts) return null

        const withSuffix = (time: string | null, suffix: string) => {
            return time ? time + suffix : null
        }

        return parts
            .map((p, i) => {
                const timesStr = unite(' ', [
                    withSuffix(p.gatherAt, '集合'),
                    withSuffix(p.opensAt, '開場'),
                    withSuffix(p.startsAt, '開始'),
                ])

                return `${p.name || i + 1} » ${timesStr}`
            })
            .join('\n')
    }
}

export class Schedule extends DocBase<Schedule> {
    @property
    @IsString()
    @IsOptional()
    label?: string

    @property
    @IsBoolean()
    active: boolean = true

    @property
    @IsIn(Object.keys(categories))
    category!: Category

    get isAppearance() {
        return categories[this.category].type === 'appearance'
    }
    get emoji() {
        return categories[this.category].emoji
    }

    @property
    @IsString()
    @MinLength(4)
    @MaxLength(64)
    title!: string

    @property
    @IsUrl()
    url!: string

    @property
    @IsInstance(Date)
    date!: Date

    @property
    parts: IPart[] = []

    @property
    @IsString()
    @IsOptional()
    venue?: string

    @property
    @IsString()
    @IsOptional()
    way?: string

    toAttachment() {
        const toField = (key: keyof this, value?: any) => {
            return { title: key, value: value || this[key] }
        }

        return {
            color: this.active ? '#ef9a9a' : '#E0E0E0',
            author_name: this.category,
            title: this.title,
            text: day(this.date).format('YYYY/MM/DD HH:mm'),
            fields: [
                toField('id'),
                toField('label'),
                toField('parts', Parts.getText(this.parts)),
                toField('url'),
                toField('venue'),
                toField('way'),
            ],
        } as MessageAttachment
    }

    getTextWith(header: string, withDate: boolean) {
        const date = this.date

        const dateString = withDate ? toDateString(date) : null

        const time = (() => {
            if (this.isAppearance && day(date).format('HHmm') !== '0000') {
                if (this.parts.length) {
                    return Parts.getText(this.parts)
                } else {
                    return (
                        timeStr(this.date) +
                        (this.category === 'up' ? '' : '〜')
                    )
                }
            }
            return null
        })()

        return unite([
            header,
            '',
            unite(' ', [
                dateString,
                this.emoji,
                this.title,
                this.venue && `@${this.venue}`,
            ]),
            time,
            '',
            this.way && `参加方法 » ${this.way}`,
            this.url,
        ])!
    }
}
