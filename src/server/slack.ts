import { Query, Timestamp } from '@google-cloud/firestore'
import { WebClient } from '@slack/client'
import axios from 'axios'
import config from 'config'
import crypto from 'crypto'
import { endOfDay } from 'date-fns/fp'
import getopts from 'getopts'
import { send, text } from 'micro'
import { AugmentedRequestHandler, post } from 'microrouter'
import qs from 'qs'
import { parse as parseArgs } from 'shell-quote'
import { ISchedule, Part, Schedule, scheduleFires } from '../models/Schedule'
import { createCyclicDates, parseDate, durationStringToMinutes } from '../utils'
const slackConfig = config.get<any>('slack')
const slack = new WebClient(slackConfig.bot_token)

const getSignature = (data: string) =>
    'v0=' +
    crypto
        .createHmac('sha256', slackConfig.signing_secret)
        .update(data)
        .digest('hex')

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

const respond = (
    response_url: string,
    { data, header = '' }: { data: any; header?: string }
) => {
    return axios.post(response_url, {
        response_type: 'in_channel',
        text: header + '\n' + Schedule.toString(data),
    })
}

export const perform = async (text: string) => {
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
        switch (action) {
            case 'new': {
                const schedule = new Schedule(opts as ISchedule)
                await schedule.validate()

                const doc = (await scheduleFires.add(schedule)) as ISchedule
                return {
                    data: doc,
                    header: ':heavy_plus_sign: Added a schedule',
                }
            }

            case 'update': {
                const [id] = args
                const existing = (await scheduleFires.fetchDocument(
                    id
                )) as ISchedule

                const schedule = new Schedule({
                    ...existing,
                    ...opts,
                })
                await schedule.validate()

                const doc = (await scheduleFires.set(schedule)) as ISchedule
                return {
                    data: doc,
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
                const docs = (await scheduleFires.withQuery(ref => {
                    let q: Query = ref

                    if (id) {
                        q = q.where('id', '==', id)
                        return q
                    }
                    q = q.where(
                        'date',
                        '>=',
                        since ? parseDate(since) : new Date()
                    )
                    if (until) {
                        q = q.where('date', '<=', endOfDay(parseDate(until)))
                    }

                    return q.orderBy('date')
                })) as ISchedule[]

                const filtered = title
                    ? docs.filter(s => s.title.includes(title))
                    : docs

                return {
                    data: filtered,
                    header: ':spiral_calendar_pad: Schedule list',
                }
            }

            case 'reg': {
                // 'new shigohaji mon.1300 itv.2 --times 2 --since 180811'
                // 'new fri.0605 num.2+4 --until 180824.0605'
                // 'shift shigohaji 1w.-2d.30m --since 180811'

                const [type, label, ..._args] = args
                const { since, until, times } = opts

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
                            weekInterval:
                                cycle[0] === 'itv'
                                    ? Number(cycle[1])
                                    : undefined,
                            since,
                            until,
                            times,
                        })
                        break
                    }

                    case 'shift': {
                        const [duration] = _args
                        const min = durationStringToMinutes(duration)
                        break
                    }

                    default:
                        break
                }
            }

            default:
                return { data: 'Action not found' }
        }
    } catch (e) {
        console.error(e)
        return { data: e.toString() }
    }
}

export const slackHandler = post(
    '/',
    withVerification(async (req, res) => {
        send(res, 200, { response_type: 'in_channel' })

        const { command, text, response_url } = req.params
        if (command !== '/rin') return

        await respond(response_url, await perform(text))
    })
)
