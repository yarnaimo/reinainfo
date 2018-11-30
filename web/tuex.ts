import Tuex from 'tuex'
import { MSchedule, Schedule } from '../src/models/Schedule'
import { MTweetLog, TweetLog } from '../src/models/TweetLog'

export const tuex = new Tuex.Store({
    schedules: [] as MSchedule[],
    // get schedulesSortedByCreatedAt() {
    //     return (this.schedules as MSchedule[]).sort(
    //         (a, b) => b.createdAt!.valueOf() - a.createdAt!.valueOf()
    //     )
    // },

    tweetLogs: [] as MTweetLog[],

    initialize() {
        Schedule.query
            .where('date', '>', new Date())
            .orderBy('date', 'asc')
            .listen(
                (start, deleteCount, ...items) => {
                    tuex.store.schedules.splice(start, deleteCount!, ...items)
                },
                error => console.error('Failed to fetch schedules: ', error)
            )

        TweetLog.query
            .where('isTopic', '==', true)
            .orderBy('createdAt', 'desc')
            .listen(
                (start, deleteCount, ...items) => {
                    tuex.store.tweetLogs.splice(start, deleteCount!, ...items)
                },
                error => console.error('Failed to fetch tweetLogs: ', error)
            )
    },
})
