import { Schedule } from '~/models/Schedule'
import { dateRangeQuery } from '~/services/firebase'
import { twitter } from '~/services/twitter'
import { ProcessedOpts, respondToSlack } from '.'

const getByIdInArgs = async ([id]: string[]) => {
    const doc = await Schedule.get(id)
    if (!doc) throw new Error('Schedule not found')
    return doc
}

export const sCommandHandler = async (
    { args: [type, ...args], opts }: ProcessedOpts,
    responseUrl: string
) => {
    const done = async (docs: Schedule[], text?: string) => {
        await respondToSlack(responseUrl, {
            attachments: docs.map(d => d.toAttachment()),
            text: text || '',
        })
        return docs
    }

    switch (type) {
        case 'new': {
            const s = new Schedule().setData(opts)
            await s.save()

            await twitter.createTweet(
                s.getTextWith('🎉 スケジュールが追加されました', true)
            )
            return await done([s], ':tada: Added a schedule')
        }

        case 'update': {
            const ssDoc = await getByIdInArgs(args)
            ssDoc.setData(opts)
            await ssDoc.save()

            await twitter.createTweet(
                ssDoc.getTextWith('✏️ スケジュールが編集されました', true)
            )
            return await done([ssDoc], ':pencil2: Updated a schedule')
        }

        case 'delete': {
            const ssDoc = await getByIdInArgs(args)
            await ssDoc.delete()

            return await done([ssDoc], ':wastebasket: Deleted a schedule')
        }

        case 'show': {
            const ssDoc = await getByIdInArgs(args)
            return await done([ssDoc])
        }

        case 'ls': {
            const { since, until, title, nc } = opts

            const ssDocs = await dateRangeQuery(Schedule.query(), {
                since,
                until,
            })

            const filtered = ssDocs
                .filter(s => !title || s.title.includes(title))
                .filter(s => !nc || s.label == null)

            return await done(filtered, ':calendar: Schedule list')
        }

        default: {
            return await done([], 'Action not found')
        }
    }
}
