const tsconfig = require('./tsconfig.json')
const moduleNameMapper = require('tsconfig-paths-jest')(tsconfig)

jest.setTimeout(10000)

require('./src/init-firebase-admin')

const nock = require('nock')
nock('https://slack.com')
    .persist()
    .post(() => true)
    .reply(200, { ok: true })

nock('https://hooks.slack.com')
    .persist()
    .post(() => true)
    .reply(200, 'ok')
