import { ChatPostMessageArguments, WebClient } from '@slack/client'
import { config } from '../config'
import { Omit } from '../utils'

export const slackConfig = config.slack
export const slack = new WebClient(slackConfig.bot_token)

export const postSlackMessage = (
    options: Omit<ChatPostMessageArguments, 'channel'>
) => {
    return slack.chat.postMessage({ channel: 'reina', ...options })
}
