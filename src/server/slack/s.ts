import { MSchedule } from '~/models/Schedule'
import { dateRangeQuery } from '~/services/firebase'
import { twitter } from '~/services/twitter'
import { ProcessedOpts, respondToSlack } from '.'
import { ScheduleAdmin } from '../../models/admin'

const getByIdInArgs = async ([id]: string[]) => {
    const doc = await ScheduleAdmin.doc(id)
    if (!doc) throw new Error('Schedule not found')
    return doc
}

export const sCommandHandler = async (
    { args: [type, ...args], opts }: ProcessedOpts,
    responseUrl: string
) => {
    const done = async (docs: MSchedule[], text?: string) => {
        await respondToSlack(responseUrl, {
            attachments: docs.map(d => d.toAttachment()),
            text: text || '',
        })
        return docs
    }

    switch (type) {
        case 'new': {
            const doc = ScheduleAdmin.create()
            doc.set(opts)
            await doc.save()

            await twitter.createTweet(
                doc.getTextWith('🎉 スケジュールが追加されました', true)
            )
            return await done([doc], ':tada: Added a schedule')
        }

        case 'update': {
            const doc = await getByIdInArgs(args)
            doc.set(opts)
            await doc.save()

            await twitter.createTweet(
                doc.getTextWith('✏️ スケジュールが編集されました', true)
            )
            return await done([doc], ':pencil2: Updated a schedule')
        }

        case 'delete': {
            const doc = await getByIdInArgs(args)
            await doc.delete()

            return await done([doc], ':wastebasket: Deleted a schedule')
        }

        case 'show': {
            const doc = await getByIdInArgs(args)
            return await done([doc])
        }

        case 'ls': {
            const { since, until, title, nc } = opts

            const docs = await dateRangeQuery(ScheduleAdmin.query, {
                since,
                until,
            })

            const filtered = docs
                .filter(s => !title || s.title.includes(title))
                .filter(s => !nc || s.label == null)

            return await done(filtered, ':calendar: Schedule list')
        }

        default: {
            return await done([], 'Action not found')
        }
    }
}
