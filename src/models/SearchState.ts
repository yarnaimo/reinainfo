import { DocBase } from '@yarnaimo/pring'
import { IsString } from 'class-validator'
import { property } from 'pring'

export class SearchState extends DocBase<SearchState> {
    public static getModelName() {
        return 'searchstate'
    }

    @property
    @IsString()
    prevTweetId!: string
}
