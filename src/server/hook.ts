import { json, send } from 'micro'
import { post } from 'microrouter'
import { config } from '../config'
import { twitter } from '../services/twitter'
import { RetweetBatch } from '../tasks/retweet'
import { ScheduleBatch } from '../tasks/schedules'

export const hookHandler = post('/hook', async (req, res) => {
    const { token, type, ...params } = (await json(req)) as any

    if (token !== config.hook.token) return send(res, 404)

    switch (type) {
        case 'schedule_batch': {
            const batch = new ScheduleBatch(twitter)
            const thread = await batch.run(
                Number(params.since),
                Number(params.until)
            )
            return send(res, 200, thread)
        }

        case 'retweet_batch': {
            if (process.env.NODE_ENV !== 'production') {
                const _post = twitter.post

                twitter.post = async (path: string, form?: any) => {
                    if (path === 'statuses/retweet') {
                        return { id_str: form.id } as any
                    } else {
                        return await _post(path, form)
                    }
                }
            }

            const batch = new RetweetBatch(twitter)
            const ids = await batch.run()

            return send(res, 200, ids)
        }
    }
})
