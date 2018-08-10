import micro from 'micro'
import { router } from 'microrouter'
import { hookHandler } from './hook'
import { slackHandler } from './slack'

const server = micro(router(slackHandler, hookHandler))
server.listen(3017)
