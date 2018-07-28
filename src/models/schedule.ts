import {
    IsBoolean,
    IsIn,
    IsInstance,
    IsOptional,
    IsString,
    IsUrl,
    MinLength,
} from 'class-validator'
import { getCollection } from '../services/firebase'

export const scheduleFires = getCollection('schedules')

const categories = {
    live: 0,
    event: 0,
    streaming: 0,
    tv: 0,
    radio: 0,
    music: 1,
    video: 1,
    game: 1,
    book: 1,
}
type Category = keyof typeof categories

export class Part {
    gatherAt?: Date
    opensAt?: Date
    startsAt: Date

    constructor(
        public name: string,
        times: [Date | undefined, Date | undefined, Date]
    ) {
        this.gatherAt = times[0]
        this.opensAt = times[1]
        this.startsAt = times[2]
    }
}

export class Schedule {
    @IsBoolean() active: boolean = true

    @IsIn(Object.keys(categories))
    category!: Category

    get categoryType() {
        return categories[this.category] === 0 ? 'appearance' : 'release'
    }

    @IsString()
    @MinLength(8)
    title!: string

    @IsUrl() url!: string

    @IsInstance(Date) date!: Date

    parts: Part[] = []

    @IsString()
    @IsOptional()
    venue?: string

    @IsString()
    @IsOptional()
    way?: string
}
