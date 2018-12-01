import { SplicePayload } from 'tyrestore/dist/core/Query'
import { Action, Mutation, State } from 'vuex-simple'
import { MSchedule, Schedule } from '../../src/models/Schedule'
import { MTweetLog, TweetLog } from '../../src/models/TweetLog'

export class FirestoreModule {
    @State() schedules: MSchedule[] = []

    @Mutation()
    spliceSchedules({ start, count, items }: SplicePayload<MSchedule>) {
        this.schedules.splice(start, count!, ...items)
    }

    @State() tweetLogs: MTweetLog[] = []

    @Mutation()
    spliceTweetLogs({ start, count, items }: SplicePayload<MTweetLog>) {
        this.tweetLogs.splice(start, count!, ...items)
    }

    @Action()
    async initialize() {
        Schedule.query
            .where('date', '>', new Date())
            .orderBy('date', 'asc')
            .listen(this.spliceSchedules, error =>
                console.error('Failed to fetch schedules: ', error)
            )

        TweetLog.query
            .where('isTopic', '==', true)
            .orderBy('createdAt', 'desc')
            .listen(this.spliceTweetLogs, error =>
                console.error('Failed to fetch tweetLogs: ', error)
            )
    }
}
