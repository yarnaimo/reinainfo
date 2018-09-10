import { Timestamp } from '@google-cloud/firestore'
import { MessageAttachment } from '@slack/client'
import {
    IsBoolean,
    IsIn,
    IsInstance,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
    validate,
} from 'class-validator'
import { format, parse } from 'date-fns/fp'
import { IDocObject } from 'firestore-simple'
import { getCollection } from '../services/firebase'
import {
    getDateString,
    multilineText,
    separateWith,
    stringify,
    timeStr,
} from '../utils'

export const scheduleFires = getCollection<ISchedule>('schedules')

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
        game: '🎮 ',
        book: '📗',
    },
}
type Category =
    | keyof typeof cTypes['appearance']
    | keyof typeof cTypes['release']

type CategoryType = keyof typeof cTypes

const categories = Object.entries(cTypes).reduce(
    (obj, [type, categories]) => {
        Object.entries(categories).forEach(([category, emoji]) => {
            obj[category as Category] = {
                type: type as CategoryType,
                emoji,
            }
        })
        return obj
    },
    {} as { [C in Category]: { type: CategoryType; emoji: string } }
)

export interface IPart {
    name: string
    gatherAt?: string
    opensAt?: string
    startsAt: string
}

export class Part {
    name!: string
    gatherAt?: string
    opensAt?: string
    startsAt!: string

    static parse(str: string) {
        const getTime = (str: string) => {
            return format('H:mm', parse(new Date(), 'HHmm', str))
        }

        const [name, ...times] = str.split('.')
        if (!times.length) throw new Error('Invalid part string')

        while (times.length < 3) {
            times.unshift(undefined as any)
        }
        const part: any = { name }
        if (times[0]) part.gatherAt = getTime(times[0])
        if (times[1]) part.opensAt = getTime(times[1])
        if (times[2]) part.startsAt = getTime(times[2]) as string

        return part as IPart
    }

    static parseMultiple(str: string) {
        return str.split('+').map((str: string) => Part.parse(str))
    }

    static getText(p: IPart) {
        const withSuffix = (time: string | undefined, suffix: string) => {
            return time ? time + suffix : undefined
        }
        const timesStr = [
            withSuffix(p.gatherAt, '集合'),
            withSuffix(p.opensAt, '開場'),
            withSuffix(p.startsAt, '開演'),
        ][separateWith](' ')
        return `${p.name} » ${timesStr}`
    }
}

export interface ISchedule {
    id?: string
    label?: string
    active?: boolean
    category: Category
    title: string
    url: string
    date: Timestamp
    parts?: IPart[]
    venue?: string
    way?: string
}

class ClassValidator {
    async validate() {
        const errors = await validate(this)
        if (errors.length) {
            const e = new Error(errors.toString())
            e.name = 'Validation Error'
            throw e
        }
    }
}

export class Schedule extends ClassValidator implements ISchedule {
    id!: string

    label?: string

    @IsBoolean()
    active: boolean = true

    @IsIn(Object.keys(categories))
    category!: Category

    get categoryType() {
        return categories[this.category].type
    }
    get emoji() {
        return categories[this.category].emoji
    }

    @IsString()
    @MinLength(4)
    @MaxLength(64)
    title!: string

    @IsUrl()
    url!: string

    @IsInstance(Timestamp)
    date!: Timestamp

    parts?: IPart[]

    @IsString()
    @IsOptional()
    venue?: string

    @IsString()
    @IsOptional()
    way?: string

    constructor(s?: ISchedule) {
        super()
        s && Object.assign(this, s)
    }

    static toString(s: ISchedule | ISchedule[] | string) {
        if (typeof s === 'string') return s

        const stringifySchedule = (s: ISchedule) => {
            return (
                '```' +
                stringify(s, {
                    date: date =>
                        format(
                            'yyyy/MM/dd HH:mm',
                            (date as Timestamp).toDate()
                        ),
                    parts: parts => parts.map(Part.getText),
                }) +
                '```'
            )
        }

        return Array.isArray(s)
            ? s.map(stringifySchedule)[multilineText]
            : stringifySchedule(s)
    }

    static toAttachment(s: ISchedule & IDocObject) {
        const target = Object.assign({}, s, {
            date: format('yyyy/MM/dd HH:mm', s.date.toDate()),
            ...(s.parts ? { parts: s.parts.map(Part.getText) } : {}),
        })
        const { title } = target
        delete target.title

        return {
            title,
            fields: Object.keys(s)
                .sort()
                .map(key => ({
                    short: true,
                    title: key,
                    value: s[key],
                })),
        } as MessageAttachment
    }

    getTextWith(header: string, withDate: boolean) {
        const date = this.date.toDate()

        const dateString = withDate ? getDateString(date) : null

        let time = null
        if (
            this.categoryType === 'appearance' &&
            format('HHmm', date) !== '0000'
        ) {
            if (this.parts) {
                time = this.parts.map(p => Part.getText(p)).join('\n')
            } else {
                time =
                    timeStr(this.date.toDate()) +
                    (this.category === 'up' ? '' : '〜')
            }
        }

        const venue = this.venue ? `@${this.venue}` : ''

        return [
            header,
            '',
            [dateString, this.emoji, this.title, venue][separateWith](' '),
            time,
            this.url,
        ][multilineText]
    }
}
