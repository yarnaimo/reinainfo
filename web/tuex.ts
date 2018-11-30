const Tuex = require('tuex')
import { MSchedule, Schedule } from '../src/models/Schedule'
import { MTweetLog, TweetLog } from '../src/models/TweetLog'

class Store {
    schedules: MSchedule[] = []

    tweetLogs: MTweetLog[] = []

    initialize() {
        Schedule.query
            .where('date', '>', new Date())
            .orderBy('date', 'asc')
            .listen(tuex.store.schedules.splice.bind(tuex.store.schedules), error =>
                console.error('Failed to fetch schedules: ', error)
            )

        TweetLog.query
            .where('isTopic', '==', true)
            .orderBy('createdAt', 'desc')
            .listen(tuex.store.tweetLogs.splice.bind(tuex.store.tweetLogs), error =>
                console.error('Failed to fetch tweetLogs: ', error)
            )
    }
}

export const tuex: { store: Store } = new Tuex.Store(Store)
