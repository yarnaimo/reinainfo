import { ChatPostMessageArguments } from '@slack/client'
import { Omit } from '@yarnaimo/rain'
import crypto from 'crypto'
import got from 'got'
import { send, text } from 'micro'
import { AugmentedRequestHandler, post, ServerRequest } from 'microrouter'
import qs from 'qs'
import { parse as stringToArgv } from 'shell-quote'
import { Parts } from '../../models/Parts'
import { slackConfig } from '../../services/slack'
import { parseDate } from '../../utils/day'
import { getopts, ParsedOptions } from '../../utils/getopts'
import { refrainCommandHandler } from './refrain'
import { rtCommandHandler } from './rt'
import { sCommandHandler } from './s'

const getSignature = (data: string) => {
    return (
        'v0=' +
        crypto
            .createHmac('sha256', slackConfig.signing_secret)
            .update(data)
            .digest('hex')
    )
}

export const respondToSlack = (
    response_url: string,
    messageArgs: Omit<ChatPostMessageArguments, 'channel'>
) => {
    return got.post(response_url, {
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            response_type: 'in_channel',
            ...messageArgs,
        }),
    })
}

const withAuth = (handler: AugmentedRequestHandler): AugmentedRequestHandler => {
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

export type ProcessedOpts = {
    action: string
    args: string[]
    opts: ParsedOptions & { date?: Date; parts?: Parts }
}

export const processOpts = (text: string): ProcessedOpts => {
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
    const string = ['date', 'since', 'until', 'parts']
    const argv = stringToArgv(text)

    const {
        _: [action, ...args],
        date,
        parts,
        ...rawOpts
    } = getopts(argv, { alias, string } as any)

    const opts = {
        date: date !== '' ? parseDate(date) : undefined,
        parts: parts !== '' ? Parts.parse(parts) : undefined,
        ...rawOpts,
    } as ProcessedOpts['opts']

    return { action, args, opts }
}

export const commandHandler = async ({ params }: Pick<ServerRequest, 'params'>) => {
    const { command, text, response_url } = params
    if (command !== '/rin' && command !== '/rind') return

    const processed = processOpts(text)

    switch (processed.action) {
        case 's':
            return await sCommandHandler(processed, response_url)

        case 'refrain':
            return await refrainCommandHandler(processed, response_url)

        case 'rt':
            return await rtCommandHandler(processed)
    }
}

export const slackRoutes = [
    post(
        '/',
        withAuth(async (req, res) => {
            send(res, 200, { response_type: 'in_channel' })

            await commandHandler(req).catch((e: Error) => {
                console.error(e)
                respondToSlack(req.params.response_url, { text: e.toString() })
            })
        })
    ),
]
