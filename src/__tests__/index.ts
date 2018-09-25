import { Schedule } from '../models/Schedule'
import { commandHandler } from '../server/slack'

export const slackDomain = 'https://slack.com'
export const slackHooksDomain = 'https://hooks.slack.com'

export const cmd = async (text: string) => {
    return (await commandHandler({
        params: { command: '/rin', text, response_url: slackHooksDomain },
    })) as Schedule[]
}
