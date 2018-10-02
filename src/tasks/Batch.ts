import { Dayjs } from 'dayjs'
import { day } from '~/utils/day'

export abstract class Batch {
    public now: Dayjs

    constructor(now?: Dayjs) {
        this.now = day(now)
    }
}
