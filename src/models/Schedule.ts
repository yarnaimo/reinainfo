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
import { getCollection } from '../services/firebase'
import {
    assignMembers,
    multilineText,
    separateWith,
    timeStr,
    parseDate,
} from '../utils'
import { parse, format } from 'date-fns/fp'
import { Timestamp } from '@google-cloud/firestore'

export const scheduleFires = getCollection('schedules')

export const cTypes = {
    appearance: {
        live: '🎫',
        event: '🎤',
        streaming: '🔴',
        tv: '📺',
        radio: '📻',
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

export class Part implements IPart {
    name!: string
    gatherAt?: string
    opensAt?: string
    startsAt!: string

    constructor(str: string)
    constructor(part: IPart)
    constructor(init: any) {
        if (typeof init === 'string') {
            const getTime = (str?: string) => {
                if (!str) return
                return format('H:mm', parse(new Date(), 'HHmm', str))
            }
            const [name, ...times] = init.split('.')
            if (!times.length) throw new Error('Invalid part string')

            this.name = name
            this.gatherAt = getTime(times[times.length - 3])
            this.opensAt = getTime(times[times.length - 2])
            this.startsAt = getTime(times[times.length - 1]) as string
        } else {
            Object.assign(this, init)
        }
    }

    get text() {
        const withSuffix = (time: string | undefined, suffix: string) => {
            return time ? time + suffix : undefined
        }
        const timesStr = [
            withSuffix(this.gatherAt, '集合'),
            withSuffix(this.opensAt, '開場'),
            withSuffix(this.startsAt, '開演'),
        ][separateWith](' ')
        return `${this.name} » ${timesStr}`
    }
}

export interface ISchedule {
    id?: string
    active: boolean
    category: Category
    title: string
    url: string
    date: Date
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
    static members = [
        'id',
        'active',
        'category',
        'title',
        'url',
        'date',
        'parts',
        'venue',
        'way',
    ]

    id!: string

    @IsBoolean() active: boolean = true

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

    @IsUrl() url!: string

    private _date!: Date
    get date(): Date | any {
        return this._date
    }
    set date(d: any) {
        if (d instanceof Date) this._date = d
        else if (typeof d === 'string') this._date = parseDate(d)
        else if (d instanceof Timestamp) this._date = d.toDate()
    }

    private _parts?: Part[]
    get parts(): any {
        return this._parts
    }
    set parts(str: any) {
        this._parts = (str as string).split('#').map(p => new Part(p))
    }

    @IsString()
    @IsOptional()
    venue?: string

    @IsString()
    @IsOptional()
    way?: string

    constructor(s?: ISchedule) {
        super()
        if (s) {
            assignMembers(this, s, Schedule.members)
            if (s.parts) {
                this.parts = s.parts.map(p => new Part(p))
            }
        }
    }

    getText(header: string) {
        const time =
            this.categoryType === 'release'
                ? null
                : this.parts
                    ? this.parts.map((p: any) => p.text).join('\n')
                    : timeStr(this.date) + '〜'

        const venue = this.venue ? `@${this.venue}` : ''

        // prettier-ignore
        return [
            header,
            `${this.emoji} ${this.title} ${venue}`,
            time,
            this.url,
        ][multilineText]
    }
}
