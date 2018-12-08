import { Query } from 'tyrestore'
import { MSchedule } from '../models/Schedule'
import { day, parseDate } from '../utils/day'

export const dateRangeQuery = (
    q: Query<typeof MSchedule>,
    {
        since,
        until,
    }: {
        since?: string
        until?: string
    }
) => {
    q = q.where('date', '>=', since ? parseDate(since) : new Date())
    if (until) {
        q = q.where(
            'date',
            '<=',
            day(parseDate(until))
                .endOf('day')
                .toDate()
        )
    }
    return q.orderBy('date').once()
}
