import { post } from 'microrouter'
import { json, send } from 'micro'
import { config } from '../config'
import { ScheduleBatch } from '../tasks/schedules'
import { twitter } from '../services/twitter'

export const hookHandler = post('/hook', async (req, res) => {
    const { token, type, ...params } = (await json(req)) as any

    if (token !== config.hook.token) return send(res, 404)

    if (type === 'schedule_batch') {
        const batch = new ScheduleBatch()
        const texts = await batch.createTweetTexts(
            Number(params.since),
            Number(params.until)
        )

        const ids = await twitter.postThread(texts)
        return send(res, 200, ids)
    }
})
