import { post } from 'microrouter'
import { json, send } from 'micro'
import { config } from '../config'
import { ScheduleBatch } from '../tasks/schedules'
import { twitter } from '../services/twitter'
import { RetweetBatch } from '../tasks/retweet'

export const hookHandler = post('/hook', async (req, res) => {
    const { token, type, ...params } = (await json(req)) as any

    if (token !== config.hook.token) return send(res, 404)

    switch (type) {
        case 'schedule_batch': {
            const batch = new ScheduleBatch()
            const texts = await batch.createTweetTexts(
                Number(params.since),
                Number(params.until)
            )
            const ids = await twitter.postThread(texts)

            return send(res, 200, ids)
        }

        case 'retweet_batch': {
            if (process.env.NODE_ENV === 'development') {
                const _post = twitter.post
                
                twitter.post = async <ITweet>(path: string, form?: any) => {
                    if (path === 'statuses/retweet') {
                        return ({ id_str: form.id } as any) as ITweet
                    } else {
                        return await _post<ITweet>(path, form)
                    }
                }
            }

            const batch = new RetweetBatch(twitter)
            const ids = await batch.run()

            return send(res, 200, ids)
        }
    }
})
