import micro from 'micro'
import { slackHandler } from './slack'
import { router } from 'microrouter'

const server = micro(router(slackHandler))
server.listen(3017)
