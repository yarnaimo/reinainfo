require('./src/init-firebase-admin')
const tsconfig = require('./tsconfig.json')
const moduleNameMapper = require('tsconfig-paths-jest')(tsconfig)
const nock = require('nock')

jest.setTimeout(10000)

nock('https://slack.com')
    .persist()
    .post(() => true)
    .reply(200, { ok: true })

nock('https://hooks.slack.com')
    .persist()
    .post(() => true)
    .reply(200, 'ok')
