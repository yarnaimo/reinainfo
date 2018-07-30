import {
    IsBoolean,
    IsIn,
    IsInstance,
    IsOptional,
    IsString,
    IsUrl,
    MinLength,
    MaxLength,
} from 'class-validator'
import { getCollection } from '../services/firebase'
import { timeStr, multilineText, separateWith } from '../utils'

export const scheduleFires = getCollection('schedules')

enum CategoryType {
    appearance,
    release,
}
const c = (type: CategoryType, emoji: string) => ({ type, emoji })

const categories = {
    live: c(0, '🎫'),
    event: c(0, '🎤'),
    streaming: c(0, '🔴'),
    tv: c(0, '📺'),
    radio: c(0, '📻'),
    music: c(1, '🎶'),
    video: c(1, '📼'),
    game: c(1, '🎮'),
    book: c(1, '📗'),
}

type Category = keyof typeof categories

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

export class Schedule implements ISchedule {
    id?: string

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
        if (s) {
            Object.assign(this, s)
            if (s.parts) {
                this.parts = s.parts.map(p => new Part(p))
            }
        }
    }

    getText(header: string) {
        const time =
            this.categoryType === CategoryType.release
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
