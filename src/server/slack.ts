import config from 'config'
import crypto from 'crypto'
import getopts from 'getopts'
import { dump } from 'js-yaml'
import { send, text } from 'micro'
import { AugmentedRequestHandler, post } from 'microrouter'
import qs from 'qs'
import { ISchedule, Schedule, scheduleFires } from '../models/Schedule'
import { parseDate } from '../utils'
import { parse } from 'shell-quote'
import { WebClient } from '@slack/client'
import axios from 'axios'
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

const respond = (response_url: string, data: any, header: string = '') => {
    return axios.post(response_url, {
        response_type: 'in_channel',
        text:
            typeof data === 'string'
                ? data
                : header + dump({ _: data }, { indent: 8 }).slice(1),
    })
}

export const slackHandler = post(
    '/',
    withVerification(async (req, res) => {
        send(res, 200, { response_type: 'in_channel' })

        const { command, text, response_url } = req.params
        if (command !== '/rin') return

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
            } = getopts(parse(text), { alias })

            if (opts.date) opts.date = parseDate(opts.date)
            // if (opts.parts) opts.parts =

            switch (action) {
                case 'new': {
                    const schedule = new Schedule(opts as ISchedule)
                    await schedule.validate()

                    const doc = await scheduleFires.add(schedule)
                    await respond(
                        response_url,
                        doc,
                        ':heavy_plus_sign: Added a new schedule'
                    )
                    break
                }

                case 'update': {
                    const [id] = args
                    const existing = await scheduleFires.fetchDocument(id)
                    existing.date = existing.date.toDate()

                    const schedule = new Schedule({
                        ...existing,
                        ...opts,
                    } as ISchedule)
                    await schedule.validate()

                    const doc = await scheduleFires.set(schedule)
                    await respond(
                        response_url,
                        doc,
                        ':arrow_clockwise: Updated schedule'
                    )
                    break
                }

                case 'ls': {
                }

                default:
                    break
            }
        } catch (e) {
            console.error(e)
            await respond(response_url, e.toString())
        }
    })
)
