import { post } from 'microrouter'
import { json } from 'micro'

export const hookHandler = post('/hook', async (req, res) => {
    const { token } = (await json(req)) as any
})
