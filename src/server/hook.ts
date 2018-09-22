import { json, send } from 'micro'
import { post } from 'microrouter'
import { config } from '../config'
import { RetweetBatch } from '../tasks/retweet-batch'
import { ScheduleBatch } from '../tasks/schedule-batch'

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
                return send(res, 200, thread)
            }

            case 'retweet_batch': {
                const batch = new RetweetBatch()
                const { retweets } = await batch.run()

                return send(res, 200, retweets)
            }
        }
    }),
]
