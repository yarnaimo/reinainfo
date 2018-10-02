import { waitAll } from '@yarnaimo/arraymo'
import { Status } from 'twitter-d'
import { SearchState } from '~/models/SearchState'
import { SearchBatch } from '~/tasks/SearchBatch'
import { day } from '~/utils/day'

const batch = new SearchBatch()
let _tweets: Status[] = []

test('get tweets to classify', async () => {
    const until = batch.now.subtract(10, 'minute')

    _tweets = await batch.searchTweets('0', until)

    const state = new SearchState('main', {
        prevTweetId: _tweets[5].id_str,
    })
    await state.save()

    expect(day(_tweets[0].created_at).isBefore(until)).toBeTruthy()
})

test('run', async () => {
    const { tweetsToClassify, docs } = await batch.run()
    expect(tweetsToClassify).toHaveLength(5)

    const state = await SearchState.get('main')
    expect(state!.prevTweetId).toBe(_tweets[0].id_str)

    await waitAll(docs, d => d.delete())
})
