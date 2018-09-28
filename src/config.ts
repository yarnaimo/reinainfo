import { config as dotenv } from 'dotenv'
dotenv()

export interface Config {
    twitter: {
        consumerKey: string
        consumerSecret: string
        token: string
        tokenSecret: string
        userId: string
        screenName: string
    }
    slack: {
        bot_token: string
        signing_secret: string
        channel_id: string
    }
    firebase: {
        project_id: string
    }
    hook: {
        token: string
    }
}
export const config: Config = JSON.parse(process.env.CONFIG_MAIN as any)
