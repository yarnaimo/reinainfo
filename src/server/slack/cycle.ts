import { firstAndLast, waitAll } from '@yarnaimo/arraymo'
import { PBatch } from '@yarnaimo/pring'
import { Schedule } from '~/models/Schedule'
import { dateRangeQuery } from '~/services/firebase'
import { createCyclicDates, day, durationStringToMinutes } from '~/utils/day'
import { ProcessedOpts, respondToSlack } from '.'

export const cycleCommandHandler = async (
    { args: [type, label, ...args], opts }: ProcessedOpts,
    responseUrl: string
) => {
    // 'new shigohaji mon.1300 itv.2 --times 2 --since 180811'
    // 'new fri.0605 num.2+4 --until 180824.0605'
    // 'shift shigohaji 1w.-2d.30m --since 180811'

    const done = async (docs: Schedule[], text: string) => {
        const _docs = firstAndLast(docs)

        await respondToSlack(responseUrl, {
            attachments: _docs.map(d => d.toAttachment()),
            text: `${text} ${
                docs.length
            } cyclic schedules (Showing first and last item)`,
        })
        return _docs
    }

    const { since, until, times, title, url } = opts

    if (!label) throw new Error('"label" is required')

    const batch = new PBatch()

    switch (type) {
        case 'new': {
            const [timing, cycle] = args.map(a => a.split('.'))
            const dates = createCyclicDates({
                dayOfWeek: timing[0],
                timeOfDay: timing[1],
                weekNumbers:
                    cycle[0] === 'num'
                        ? cycle[1].split('+').map(Number)
                        : undefined,
                weekInterval: cycle[0] === 'itv' ? Number(cycle[1]) : undefined,
                since,
                until,
                times: Number(times),
            })

            const schedules = await waitAll(dates, async date => {
                const s = new Schedule().setData({
                    category: 'up',
                    label,
                    date,
                    title,
                    url,
                })
                batch.setDoc(s)

                return s
            })
            await batch.commit()

            return await done(schedules, ':tada: Added')
        }

        case 'shift': {
            const [duration] = args
            const min = durationStringToMinutes(duration)

            const ssDocs = await dateRangeQuery(
                Schedule.query().where('label', '==', label),
                {
                    since,
                    until,
                }
            )

            const schedules = await waitAll(ssDocs, async s => {
                const date = day(s.date).add(min, 'minute')
                s.setData({ date: date.toDate() })

                batch.setDoc(s)
                return s
            })
            await batch.commit()

            return await done(schedules, ':pencil2: Updated')
        }

        case 'delete': {
            const ssDocs = await dateRangeQuery(
                Schedule.query().where('label', '==', label),
                {
                    since,
                    until,
                }
            )

            ssDocs.forEach(s => batch.delete(s.reference))

            await batch.commit()

            return await done(ssDocs, ':wastebasket: Deleted')
        }

        default: {
            return await done([], 'Action for cyclic schedule not found')
        }
    }
}
