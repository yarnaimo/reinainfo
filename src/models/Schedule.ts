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
import { assignMembers, multilineText, separateWith, timeStr } from '../utils'

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
    gatherAt?: Date
    opensAt?: Date
    startsAt: Date
}

export class Part implements IPart {
    name!: string
    gatherAt?: Date
    opensAt?: Date
    startsAt!: Date

    constructor(partArray: [string, Date | undefined, Date | undefined, Date])
    constructor(part: IPart)
    constructor(p: any) {
        if (Array.isArray(p)) {
            this.name = p[0]
            this.gatherAt = p[1]
            this.opensAt = p[2]
            this.startsAt = p[3]
        } else {
            Object.assign(this, p)
        }
    }

    timeWithLabel(time: Date | undefined, label: string) {
        return time && `${timeStr(time)}${label}`
    }

    get text() {
        const timesStr = [
            this.timeWithLabel(this.gatherAt, '集合'),
            this.timeWithLabel(this.opensAt, '開場'),
            this.timeWithLabel(this.startsAt, '開演'),
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

    @IsInstance(Date) date!: Date

    @IsOptional() parts?: Part[]

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
                    ? this.parts.map(p => p.text).join('\n')
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
