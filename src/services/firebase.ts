import { initialize } from '@yarnaimo/pring'
import admin from 'firebase-admin'
import { Base } from 'pring'
import { Query } from 'pring/lib/query'
import { firebaseConfig } from '../config'
import { day, parseDate } from '../utils/day'

const { app, DocBase } = initialize({
    admin,
    options: {
        credential: admin.credential.cert(firebaseConfig),
    },
})

export { app, DocBase }

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
