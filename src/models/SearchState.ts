import { DocBase } from '@yarnaimo/pring'
import { IsString } from 'class-validator'
import { property } from 'pring'

export class SearchState extends DocBase<SearchState> {
    @property
    @IsString()
    prevTweetId!: string
}
