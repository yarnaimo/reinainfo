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

const respond = (
    response_url: string,
    { data, header = '' }: { data: any; header?: string }
) => {
    const text = typeof data === 'string' ? data : dump(data)

    return axios.post(response_url, {
        response_type: 'in_channel',
        text: header + '\n' + text.replace(/\n/g, '\n        '),
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
    } = getopts(parse(text), { alias })

    try {
        switch (action) {
            case 'new': {
                const schedule = new Schedule(opts as ISchedule)
                await schedule.validate()

                const doc = await scheduleFires.add(schedule)
                return {
                    data: doc,
                    header: ':heavy_plus_sign: Added a schedule',
                }
            }

            case 'update': {
                const [id] = args
                const existing = await scheduleFires.fetchDocument(id)

                const schedule = new Schedule({
                    ...existing,
                    ...opts,
                } as ISchedule)
                await schedule.validate()

                const doc = await scheduleFires.set(schedule)
                return {
                    data: doc,
                    header: ':arrow_clockwise: Updated a schedule',
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
