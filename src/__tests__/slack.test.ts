import { perform } from '../server/slack'

describe('Slack', () => {
    let docId: string

    test('add schedule', async () => {
        const { data } = await perform(
            'new -c live -t million -d 180808 -u https://google.com'
        )
        expect(data.category).toBe('live')
        docId = data.id
    })

    test('update schedule', async () => {
        const { data } = await perform(`update ${docId} -t "million live"`)

        expect(data.title).toBe('million live')
        expect(data.id).toBe(docId)
    })

    test('delete schedule', async () => {
        const { data } = await perform(`delete ${docId}`)
        expect(data).toBe(docId)
    })
})
