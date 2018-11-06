import { DocBase } from '@yarnaimo/pring'
import { IsBoolean, IsNumberString } from 'class-validator'
import { property } from 'pring'

export class TweetLog extends DocBase<TweetLog> {
    @property
    @IsNumberString()
    tweetId!: string

    @property
    @IsBoolean()
    isTopic!: boolean

    @property
    @IsBoolean()
    isDailyNotification!: boolean

    constructor(id?: string, data?: Partial<TweetLog>) {
        super(id, data)
        if (data) {
            this.isTopic == null && (this.isTopic = false)
            this.isDailyNotification == null &&
                (this.isDailyNotification = false)
        }
    }
}
