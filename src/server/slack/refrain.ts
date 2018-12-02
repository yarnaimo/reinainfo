import { firstAndLast, waitAll } from '@yarnaimo/arraymo'
import { BatchAdmin } from 'tyrestore/dist/admin'
import { ScheduleAdmin } from '~/models/admin'
import { dateRangeQuery } from '~/services/firebase'
import { createCyclicDates, day, durationStringToMinutes } from '~/utils/day'
import { ProcessedOpts, respondToSlack } from '.'
import { MSchedule } from '../../models/Schedule'

export const refrainCommandHandler = async (
    { args: [action, label, ...args], opts }: ProcessedOpts,
    responseUrl: string
) => {
    // 'new shigohaji mon.1300 itv.2 --times 2 --since 180811'
    // 'new [label] fri.0605 num.2+4 --until 180824.0605'
    // 'shift shigohaji 1w.-2d.30m --since 180811'

    const done = async (docs: MSchedule[], text: string) => {
        const _docs = firstAndLast(docs)

        await respondToSlack(responseUrl, {
            attachments: _docs.map(d => d.toAttachment()),
            text: `${text} ${docs.length} refrain schedules (Showing first and last item)`,
        })
        return _docs
    }

    const { since, until, times, title, url } = opts

    if (!label) throw new Error('"label" is required')

    const batch = new BatchAdmin()

    switch (action) {
        case 'new': {
            const [timing, cycle] = args.map(a => a.split('.'))
            const dates = createCyclicDates({
                dayOfWeek: timing[0],
                timeOfDay: timing[1],
                weekNumbers: cycle[0] === 'num' ? cycle[1].split('+').map(Number) : undefined,
                weekInterval: cycle[0] === 'itv' ? Number(cycle[1]) : undefined,
                since,
                until,
                times: Number(times),
            })

            const schedules = await waitAll(dates, async date => {
                const doc = ScheduleAdmin.create()
                doc.set({
                    category: 'up',
                    label,
                    date,
                    title,
                    url,
                })
                await doc.save(batch)

                return doc
            })
            await batch.commit()

            return await done(schedules, ':tada: Added')
        }

        case 'shift': {
            const [duration] = args
            const min = durationStringToMinutes(duration)

            const docs = await dateRangeQuery(ScheduleAdmin.query.where('label', '==', label), {
                since,
                until,
            })

            const schedules = await waitAll(docs, async doc => {
                const date = day(doc.date).add(min, 'minute')
                doc.set({ date: date.toDate() })

                await doc.save(batch)
                return doc
            })
            await batch.commit()

            return await done(schedules, ':pencil2: Updated')
        }

        case 'delete': {
            const docs = await dateRangeQuery(ScheduleAdmin.query.where('label', '==', label), {
                since,
                until,
            })
            await waitAll(docs, doc => doc.delete())
            await batch.commit()

            return await done(docs, ':wastebasket: Deleted')
        }

        default: {
            return await done([], 'Action for refrain schedule not found')
        }
    }
}
