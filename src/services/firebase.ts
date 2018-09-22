import { validate, ValidationError } from 'class-validator'
import admin from 'firebase-admin'
import { Base, initialize } from 'pring'
import { Query } from 'pring/lib/query'
import { firebaseConfig } from '../config'
import { day, parseDate } from '../utils/day'

const app = admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
})
export const firestore = app.firestore()

initialize(firestore, admin.firestore.FieldValue.serverTimestamp())

class ValidationErrors {
    constructor(public errors: ValidationError[]) {}

    toString() {
        return [
            '🚫 Validation Error',
            '',
            ...this.errors.map(e => e.toString()),
        ].join('\n')
    }
}

export abstract class DocBase<T extends Base> extends Base {
    constructor(id?: string, data?: Partial<T>) {
        super(id, data)
    }

    static async getByQuery<T extends typeof Base>(
        this: T,
        fn: (q: Query<InstanceType<T>>) => Query<InstanceType<T>>
    ) {
        const q = new Query<InstanceType<T>>(this.getReference())
        const docs = await fn(q)
            .dataSource(this as InstanceType<T>)
            .get()

        return docs
    }

    setData(data: Partial<T>) {
        super.setData(data)
    }

    async validate() {
        const errors = await validate(this)
        if (errors.length) {
            throw new ValidationErrors(errors)
        }
    }
}

export const dateRangeQuery = <T extends Base>(
    q: Query<T>,
    { since, until }: { since?: string; until?: string }
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
