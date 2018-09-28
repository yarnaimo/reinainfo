import { Base } from 'pring'
import { Query } from 'pring/lib/query'
import { day, parseDate } from '../utils/day'

export const dateRangeQuery = <T extends Base>(
    q: Query<T>,
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
    return q.orderBy('date')
}
