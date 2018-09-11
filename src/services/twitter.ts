import { TwimoClient } from '@yarnaimo/twimo'
import { config } from '../config'

export const twitter = new TwimoClient(config.twitter)

const isNotProduction = process.env.NODE_ENV !== 'production'

if (isNotProduction) {
    twitter.post = async (path: string, form?: any) => {
        throw new Error(`${path} is not mocked`)
    }
}

export const mightMockTwitterPost = (
    targetPath: string,
    responseFn: (requestData: any) => any
) => {
    if (isNotProduction) {
        const _post = twitter.post

        twitter.post = async (path: string, form?: any) => {
            if (path === targetPath) {
                return responseFn(form)
            } else {
                return await _post(path, form)
            }
        }
    }
}

mightMockTwitterPost('statuses/retweet', ({ id }) => {
    return {
        id_str: `${id}_RT`,
        full_text: 'RT @{{screen_name}}: {{text}}',
        user: { screen_name: '{{screen_name_RT}}' },

        retweeted_status: {
            id_str: id,
            full_text: '{{text}}',
            user: { screen_name: '{{screen_name}}' },
        },
    }
})
