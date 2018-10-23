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
import { day, timeStr, toDateString } from '~/utils/day'

type CategoryType = 'appearance' | 'release'

const c = (
    isAppearance: boolean,
    emoji: string,
    name: string,
    icon: string
) => ({
    type: (isAppearance ? 'appearance' : 'release') as CategoryType,
    emoji,
    name,
    icon,
})

export const categories = {
    live: c(true, '🎫', 'ライブ', 'ticket'),
    event: c(true, '🎤', 'イベント', 'microphone-variant'),
    streaming: c(true, '🔴', '配信', 'record'),
    tv: c(true, '📺', 'テレビ', 'television-classic'),
    radio: c(true, '📻', 'ラジオ', 'radio'),
    up: c(true, '🆙', '更新', 'update'),

    music: c(false, '🎶', 'CD/音楽配信', 'library-music'),
    video: c(false, '📼', 'BD/DVD', 'video'),
    game: c(false, '🎮', 'ゲーム', 'gamepad-variant'),
    book: c(false, '📗', '書籍/雑誌', 'book-open-variant'),
}

export type Category = keyof typeof categories

export interface IPart {
    name: string | null
    gatherAt: string | null
    opensAt: string | null
    startsAt: string
}

export interface FormattedParts {
    text: string
    array: ({ name: string; time: string })[]
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

    static toArray(parts: IPart[]): FormattedParts['array'] {
        const withSuffix = (time: string | null, suffix: string) => {
            return time ? time + suffix : null
        }

        return parts.map((p, i) => {
            const timesStr = unite(' ', [
                withSuffix(p.gatherAt, '集合'),
                withSuffix(p.opensAt, '開場'),
                withSuffix(p.startsAt, '開始'),
            ])

            return { name: p.name || String(i + 1), time: timesStr! }
        })
    }

    static format(parts: IPart[]): FormattedParts {
        const array = this.toArray(parts)

        return {
            array,
            text: array.map(({ name, time }) => `${name} » ${time}`).join('\n'),
        }
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

    get categoryObj() {
        return categories[this.category]
    }

    get isAppearance() {
        return this.categoryObj.type === 'appearance'
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
                toField('parts', Parts.format(this.parts).text),
                toField('url'),
                toField('venue'),
                toField('way'),
            ],
        } as MessageAttachment
    }

    get dateString() {
        return toDateString(this.date)
    }

    get fDate(): { date: string; parts?: FormattedParts } {
        if (this.isAppearance && day(this.date).format('HHmm') !== '0000') {
            if (this.parts.length) {
                return {
                    date: this.dateString,
                    parts: Parts.format(this.parts),
                }
            } else {
                const time =
                    timeStr(this.date) + (this.category === 'up' ? '' : '〜')
                return {
                    date: `${this.dateString} ${time}`,
                }
            }
        }
        return { date: this.dateString }
    }

    getTextWith(header: string, withDate: boolean) {
        const { date, parts } = this.fDate

        return unite([
            header,
            '',
            withDate ? date : null,
            unite(' ', [
                this.categoryObj.emoji,
                this.title,
                this.venue && `@${this.venue}`,
            ]),
            parts && parts.text,
            '',
            this.way && `参加方法 » ${this.way}`,
            this.url,
        ])!
    }
}
