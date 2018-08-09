import { Query, Timestamp } from '@google-cloud/firestore'
import { WebClient } from '@slack/client'
import axios from 'axios'
import { config } from '../config'
import crypto from 'crypto'
import { endOfDay, addMinutes } from 'date-fns/fp'
import getopts from 'getopts'
import { parse as parseArgs } from 'shell-quote'
import { send, text } from 'micro'
import { AugmentedRequestHandler, post } from 'microrouter'
import qs from 'qs'
import { ISchedule, Part, Schedule, scheduleFires } from '../models/Schedule'
import {
    createCyclicDates,
    parseDate,
    durationStringToMinutes,
    pick,
} from '../utils'
const slackConfig = config.slack
const slack = new WebClient(slackConfig.bot_token)

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

export const commandHandler = async (text: string) => {
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

    try {
        if (action === 'cycle') {
            return await cyclicScheduleCommandHandler(args, opts)
        }

        return await scheduleCommandHandler(action, args, opts)
    } catch (e) {
        console.error(e)
        return { data: (e as Error).toString() }
    }
}

type Result = {
    data?: string
    header?: string
    schedule?: ISchedule | ISchedule[]
}

const scheduleCommandHandler = async (
    action: string,
    args: string[],
    opts: { [key: string]: any }
): Promise<Result> => {
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

    switch (action) {
        case 'new': {
            const schedule = new Schedule(picked as ISchedule)
            await schedule.validate()

            const doc = await scheduleFires.add(schedule)
            return {
                schedule: doc,
                header: ':heavy_plus_sign: Added a schedule',
            }
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
            return {
                schedule: doc,
                header: ':arrows_clockwise: Updated a schedule',
            }
        }

        case 'delete': {
            const [id] = args
            const deleted = await scheduleFires.delete(id)
            return {
                data: deleted,
                header: ':x: Deleted a schedule',
            }
        }

        case 'ls': {
            const { since, until, id, title } = opts
            const docs = await scheduleFires.withQuery(ref => {
                let q: Query = ref

                if (id) {
                    q = q.where('id', '==', id)
                    return q
                }
                q = dateRangeQuery(q, { since, until })

                return q
            })

            const filtered = title
                ? docs.filter(s => s.title.includes(title))
                : docs

            return {
                schedule: filtered,
                header: ':spiral_calendar_pad: Schedule list',
            }
        }

        default: {
            return { data: 'Action not found' }
        }
    }
}

const cyclicScheduleCommandHandler = async (
    args: string[],
    opts: { [key: string]: any }
): Promise<Result> => {
    // 'new shigohaji mon.1300 itv.2 --times 2 --since 180811'
    // 'new fri.0605 num.2+4 --until 180824.0605'
    // 'shift shigohaji 1w.-2d.30m --since 180811'

    const [type, label, ..._args] = args
    const { since, until, times, title, url } = opts

    if (!label) throw new Error('"label" is required')

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

            return {
                header: `:heavy_plus_sign: Added ${
                    docs.length
                } cyclic schedules (Showing first and last item)`,
                schedule: [docs[0], docs[docs.length - 1]],
            }
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

            return {
                header: `:arrows_clockwise: Updated ${
                    schedulesToUpdate.length
                } cyclic schedules (Showing first and last item)`,
                schedule: [
                    schedulesToUpdate[0],
                    schedulesToUpdate[schedulesToUpdate.length - 1],
                ],
            }
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

            return {
                header: `:arrows_clockwise: Deleted ${
                    existings.length
                } cyclic schedules (Showing first and last item)`,
                schedule: [existings[0], existings[existings.length - 1]],
            }
        }

        default: {
            return { data: 'Action of cycle not found' }
        }
    }
}

export const slackHandler = post(
    '/',
    withVerification(async (req, res) => {
        send(res, 200, { response_type: 'in_channel' })

        const { command, text, response_url } = req.params
        if (command !== '/rin' && command !== '/rind') return

        const { data, header, schedule } = await commandHandler(text)
        const body = schedule ? Schedule.toString(schedule) : data

        await axios.post(response_url, {
            response_type: 'in_channel',
            text: header + '\n' + body,
        })
    })
)
