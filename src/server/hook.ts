import { originalTweet } from '@yarnaimo/twimo'
import { json, send } from 'micro'
import { post } from 'microrouter'
import { Status } from 'twitter-d'
import { config } from '~/config'
import { DailyRetweetBatch } from '~/tasks/DailyRetweetBatch'
import { ScheduleBatch } from '~/tasks/ScheduleBatch'
import { SearchBatch } from '~/tasks/SearchBatch'

const compactTweets = (tweets: Status[]) =>
    tweets.map(originalTweet).map(t => ({
        id: t.id_str,
        screen_name: t.user.screen_name,
        text: t.full_text,
    }))

export const hookRoutes = [
    post('/', async (req, res) => {
        const { token, type, ...params } = (await json(req)) as any

        if (token !== config.hook.token) return send(res, 404)

        switch (type) {
            case 'schedule_batch': {
                const batch = new ScheduleBatch()
                const thread = await batch.run(
                    Number(params.since),
                    Number(params.until)
                )
                return send(res, 200, compactTweets(thread))
            }

            case 'search_batch': {
                const batch = new SearchBatch()
                const { retweets } = await batch.run()

                return send(res, 200, compactTweets(retweets))
            }

            case 'daily_retweet_batch': {
                const batch = new DailyRetweetBatch()
                const retweets = await batch.run()

                return send(res, 200, compactTweets(retweets))
            }
        }

        return send(res, 404)
    }),
]
