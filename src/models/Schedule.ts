import { MessageAttachment } from '@slack/client'
import { Rstring } from '@yarnaimo/rain'
import {
    IsBoolean,
    IsDate,
    IsIn,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
} from 'class-validator'
import { Field, TyreCollection, TyreModel } from 'tyrestore'
import { day, timeStr, toDateString } from '../utils/day'
import { FormattedParts, Parts } from './Parts'

type CategoryType = 'appearance' | 'release'

const c = (isAppearance: boolean, emoji: string, name: string, icon: string) => ({
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

// export class __Parts {
//     static parse(str: string) {
//         const matches = globalMatch(str, partPattern)

//         const parts = matches.map(([, name = null, ...times]) => {
//             const [gatherAt, opensAt, startsAt] = times.map(str => {
//                 return str
//                     ? `${Number(str.slice(-4, -2))}:${str.slice(-2)}`
//                     : null
//             })
//             return {
//                 name: name,
//                 gatherAt,
//                 opensAt,
//                 startsAt: startsAt!,
//             } as IPart
//         })
//         return parts
//     }

//     static toArray(parts: IPart[]): FormattedParts['array'] {
//         const withSuffix = (time: string | null, suffix: string) => {
//             return time ? time + suffix : null
//         }

//         return parts.map((p, i) => {
//             const timesStr = unite(' ', [
//                 withSuffix(p.gatherAt, '集合'),
//                 withSuffix(p.opensAt, '開場'),
//                 withSuffix(p.startsAt, '開始'),
//             ])

//             return { name: p.name || String(i + 1), time: timesStr! }
//         })
//     }

//     static format(parts: IPart[]): FormattedParts {
//         const array = this.toArray(parts)

//         return {
//             array,
//             text: array.map(({ name, time }) => `${name} » ${time}`).join('\n'),
//         }
//     }
// }

interface ISchedule {
    label?: string
    active: boolean
    category: Category
    title: string
    url: string
    date: Date
    parts: Parts
    venue?: string
    way?: string
}

export class MSchedule extends TyreModel<ISchedule> implements ISchedule {
    @Field
    @IsString()
    @IsOptional()
    label?: string

    @Field
    @IsBoolean()
    active: boolean = true

    @Field
    @IsIn(Object.keys(categories))
    category!: Category

    get categoryObj() {
        return categories[this.category]
    }

    get isAppearance() {
        return this.categoryObj.type === 'appearance'
    }

    @Field
    @IsString()
    @MinLength(4)
    @MaxLength(64)
    title!: string

    @Field
    @IsUrl()
    url!: string

    @Field
    @IsDate()
    date!: Date

    @Field(Parts) parts: Parts = new Parts()

    @Field
    @IsString()
    @IsOptional()
    venue?: string

    @Field
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
                toField('parts', this.parts.format().text),
                toField('url'),
                toField('venue'),
                toField('way'),
            ],
        } as MessageAttachment
    }

    get dateString() {
        return toDateString(this.date)
    }

    get fDate(): { date: string; time?: string; parts?: FormattedParts } {
        if (this.isAppearance && day(this.date).format('HHmm') !== '0000') {
            if (this.parts.array.length) {
                return {
                    date: this.dateString,
                    parts: this.parts.format(),
                }
            } else {
                const time = timeStr(this.date) + (this.category === 'up' ? '' : '〜')
                return {
                    date: this.dateString,
                    time,
                }
            }
        }
        return { date: this.dateString }
    }

    getTextWith(header: string, withDate: boolean) {
        const { date, time, parts } = this.fDate

        return Rstring.union([
            header,
            '',
            Rstring.union(' ', [withDate && date, time]),
            Rstring.union(' ', [
                this.categoryObj.emoji,
                this.title,
                this.venue && `@ ${this.venue}`,
            ]),
            parts && parts.text,
            '',
            this.way && `参加方法 » ${this.way}`,
            this.url,
        ])!
    }
}

export const Schedule = new TyreCollection('schedule', MSchedule)
