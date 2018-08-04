import { perform } from '../server/slack'

describe('Slack', () => {
    let docId: string

    test('add schedule', async () => {
        const { data } = await perform(
            'new -c live -t __test_1__ -d 000801 -u https://google.com'
        )
        expect(data.category).toBe('live')
        docId = data.id
    })

    test('update schedule', async () => {
        const { data } = await perform(
            `update ${docId} -t "__test_1_modified__"`
        )
        expect(data.title).toBe('__test_1_modified__')
        expect(data.id).toBe(docId)
    })

    test('list schedules', async () => {
        const { data: doc2 } = await perform(
            'new -c live -t __test_2__ -d 000801 -u https://google.com'
        )
        const { data: docs } = await perform(
            `ls --since 000801 --until 000801 -t __test_1_m`
        )
        await perform(`delete ${doc2.id}`)

        expect(docs.length).toBe(1)
        expect(docs[0].id).toBe(docId)
    })

    test('delete schedule', async () => {
        const { data } = await perform(`delete ${docId}`)
        expect(data).toBe(docId)
    })
})
