import { IsBoolean, IsNumberString } from 'class-validator'
import { property } from 'pring'
import { DocBase } from '../services/firebase'

export class TweetLog extends DocBase<TweetLog> {
    @property
    @IsNumberString()
    tweetId!: string

    @property
    @IsBoolean()
    isTopic: boolean = false

    @property
    @IsBoolean()
    isDailyNotification: boolean = false
}
