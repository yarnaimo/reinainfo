import { IsString } from 'class-validator'
import { property } from 'pring'
import { DocBase } from '../services/firebase'

export class SearchState extends DocBase<SearchState> {
    @property
    @IsString()
    prevTweetId!: string
}
