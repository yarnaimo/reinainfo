import { Twitter } from '@yarnaimo/twimo'
import { config } from '../config'

export const twitter = new Twitter(config.twitter)

export const mightMockTwitterPost = (
    targetPath: string,
    responseFn: (requestData: any) => any
) => {
    if (process.env.NODE_ENV !== 'production') {
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
