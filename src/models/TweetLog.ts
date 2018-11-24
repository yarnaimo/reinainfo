import { IsBoolean, IsNumberString } from 'class-validator'
import { Field, TyreCollection, TyreModel } from 'tyrestore'

interface ITweetLog {
    tweetId: string
    isTopic: boolean
    isDailyNotification: boolean
}

export class MTweetLog extends TyreModel<ITweetLog> {
    @Field
    @IsNumberString()
    tweetId!: string

    @Field
    @IsBoolean()
    isTopic: boolean = false

    @Field
    @IsBoolean()
    isDailyNotification: boolean = false
}

export const TweetLog = new TyreCollection('tweetlog', MTweetLog)
