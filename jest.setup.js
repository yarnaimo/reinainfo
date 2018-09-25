jest.setTimeout(10000)

const nock = require('nock')

nock('https://slack.com')
    .persist()
    .post(() => true)
    .reply(200, { ok: true })

nock('https://hooks.slack.com')
    .persist()
    .post(() => true)
    .reply(200, 'ok')
