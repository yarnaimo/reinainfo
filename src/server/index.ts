import micro from 'micro'
import { router, withNamespace } from 'microrouter'
import { hookRoutes } from './hook'
import { slackRoutes } from './slack'
require('../init-firebase-admin')

const server = micro(
    router(withNamespace('/slack')(...slackRoutes), withNamespace('/hook')(...hookRoutes))
)
server.listen(3017)
