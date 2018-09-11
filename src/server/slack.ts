import { Query, Timestamp } from '@google-cloud/firestore'
import { ChatPostMessageArguments } from '@slack/client'
import crypto from 'crypto'
import { addMinutes, endOfDay } from 'date-fns/fp'
import { IDocObject } from 'firestore-simple'
import getopts from 'getopts'
import got from 'got'
import { send, text } from 'micro'
import { AugmentedRequestHandler, post } from 'microrouter'
import qs from 'qs'
import { parse as parseArgs } from 'shell-quote'
import { ISchedule, Part, Schedule, scheduleFires } from '../models/Schedule'
import { retweetWithNotification } from '../services/integrated'
import { slackConfig } from '../services/slack'
import { twitter } from '../services/twitter'
import {
    createCyclicDates,
    durationStringToMinutes,
    notNull,
    Omit,
    parseDate,
    pick,
} from '../utils'
import { urlToTweetId } from '../utils/twitter'

const getSignature = (data: string) => {
    return (
        'v0=' +
        crypto
            .createHmac('sha256', slackConfig.signing_secret)
            .update(data)
            .digest('hex')
    )
}

const withVerification = (
    handler: AugmentedRequestHandler
): AugmentedRequestHandler => {
    return async (req, res) => {
        const body = await text(req)
        req.params = qs.parse(body)

        const timestamp = Number(req.headers['x-slack-request-timestamp'])

        const now = Math.floor(new Date().getTime() / 1000)
        if (now - timestamp > 60 * 5) {
            return send(res, 404)
        }
        const mySignature = getSignature('v0:' + timestamp + ':' + body)

        if (req.headers['x-slack-signature'] !== mySignature) {
            return send(res, 404)
        }
        await handler(req, res)
    }
}

const dateRangeQuery = (
    q: Query,
    { since, until }: { since?: string; until?: string }
) => {
    q = q.where('date', '>=', since ? parseDate(since) : new Date())
    if (until) {
        q = q.where('date', '<=', endOfDay(parseDate(until)))
    }
    return q.orderBy('date')
}

export type ResponseHandler = (
    message: Omit<ChatPostMessageArguments, 'channel'>,
    schedules?: (ISchedule & IDocObject)[]
) => Promise<any>

export const commandHandler = async (done: ResponseHandler, text: string) => {
    try {
        const alias = {
            a: 'active',
            c: 'category',
            t: 'title',
            u: 'url',
            d: 'date',
            p: 'parts',
            v: 'venue',
            w: 'way',
        }
        const {
            _: [action, ...args],
            ...opts
        } = getopts(parseArgs(text), { alias })

        if (opts.date) {
            opts.date = Timestamp.fromDate(parseDate(opts.date))
        }
        if (opts.parts) {
            opts.parts = Part.parseMultiple(opts.parts)
        }

        switch (action) {
            case 'cycle':
                return await cyclicScheduleCommandHandler(done, args, opts)

            case 'rt':
                return await retweetCommandHandler(done, args)

            default:
                return await scheduleCommandHandler(done, action, args, opts)
        }
    } catch (e) {
        console.error(e)
        return done({ text: (e as Error).toString() })
    }
}

const retweetCommandHandler = async (done: ResponseHandler, urls: string[]) => {
    const ids = urls.map(urlToTweetId).filter(notNull)
    await retweetWithNotification(twitter, ids)
}

const scheduleCommandHandler = async (
    done: ResponseHandler,
    action: string,
    args: string[],
    opts: { [key: string]: any }
) => {
    const picked = pick(opts, [
        'active',
        'category',
        'title',
        'url',
        'date',
        'parts',
        'venue',
        'way',
    ])

    const doneWithDocs = (
        emoji: string,
        text: string,
        docs: (ISchedule & IDocObject)[]
    ) => {
        return done({ text: `:${emoji}: ${text}` }, docs)
    }

    switch (action) {
        case 'new': {
            const schedule = new Schedule(picked as ISchedule)
            await schedule.validate()
            const doc = await scheduleFires.add(schedule)

            return doneWithDocs('tada', 'Added a schedule', [doc])
        }

        case 'update': {
            const [id] = args
            const existing = await scheduleFires.fetchDocument(id)

            const schedule = new Schedule({
                ...existing,
                ...picked,
            })
            await schedule.validate()
            const doc = await scheduleFires.set(schedule)

            return doneWithDocs('pencil2', 'Updated a schedule', [doc])
        }

        case 'delete': {
            const [id] = args
            const existing = await scheduleFires.fetchDocument(id)
            await scheduleFires.delete(id)

            return doneWithDocs('wastebasket', 'Deleted a schedule', [existing])
        }

        case 'ls': {
            const { since, until, id, title, nc } = opts
            let docs = await scheduleFires.withQuery(ref => {
                let q: Query = ref

                if (id) {
                    q = q.where('id', '==', id)
                    return q
                }
                q = dateRangeQuery(q, { since, until })

                return q
            })

            if (title) docs = docs.filter(s => s.title.includes(title))
            if (nc) docs = docs.filter(s => s.label == null)

            return doneWithDocs('calendar', 'Schedule list', docs)
        }

        default: {
            return done({ text: 'Action not found' })
        }
    }
}

const cyclicScheduleCommandHandler = async (
    done: ResponseHandler,
    args: string[],
    opts: { [key: string]: any }
) => {
    // 'new shigohaji mon.1300 itv.2 --times 2 --since 180811'
    // 'new fri.0605 num.2+4 --until 180824.0605'
    // 'shift shigohaji 1w.-2d.30m --since 180811'

    const [type, label, ..._args] = args
    const { since, until, times, title, url } = opts

    if (!label) throw new Error('"label" is required')

    const doneWithDocs = (
        emoji: string,
        type: string,
        docs: (ISchedule & IDocObject)[]
    ) => {
        return done(
            {
                text: `:${emoji}: ${type} ${
                    docs.length
                } cyclic schedules (Showing first and last item)`,
            },
            [docs[0], docs[docs.length - 1]]
        )
    }

    switch (type) {
        case 'new': {
            const [timing, cycle] = _args.map(a => a.split('.'))
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
                times,
            })

            const tasks = dates.map(async date => {
                const schedule = new Schedule({
                    category: 'up',
                    label,
                    date: Timestamp.fromDate(date),
                    title,
                    url,
                })
                await schedule.validate()

                return await scheduleFires.add(schedule)
            })

            const docs = await Promise.all(tasks)

            return doneWithDocs('tada', 'Added', docs)
        }

        case 'shift': {
            const [duration] = _args
            const min = durationStringToMinutes(duration)

            const existings = await scheduleFires.withQuery(ref => {
                return dateRangeQuery(ref, { since, until }).where(
                    'label',
                    '==',
                    label
                )
            })

            const schedulesToUpdate = await Promise.all(
                existings.map(async s => {
                    const date = addMinutes(min, s.date.toDate())
                    const schedule = new Schedule({
                        ...s,
                        date: Timestamp.fromDate(date),
                    })
                    await schedule.validate()
                    return schedule
                })
            )
            await scheduleFires.bulkSet(schedulesToUpdate)

            return doneWithDocs('pencil2', 'Updated', schedulesToUpdate)
        }

        case 'delete': {
            const existings = await scheduleFires.withQuery(ref => {
                return dateRangeQuery(ref, { since, until }).where(
                    'label',
                    '==',
                    label
                )
            })
            const ids = existings.map(s => s.id)
            await scheduleFires.bulkDelete(ids)

            return doneWithDocs('wastebasket', 'Deleted', existings)
        }

        default: {
            return done({ text: 'Action for cyclic schedule not found' })
        }
    }
}

export const slackHandler = post(
    '/',
    withVerification(async (req, res) => {
        send(res, 200, { response_type: 'in_channel' })

        const { command, text, response_url } = req.params
        if (command !== '/rin' && command !== '/rind') return

        await commandHandler((message, schedules) => {
            const attachments =
                schedules && schedules.map(Schedule.toAttachment)

            return got.post(response_url, {
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    response_type: 'in_channel',
                    ...message,
                    attachments,
                }),
            })
        }, text)
    })
)
