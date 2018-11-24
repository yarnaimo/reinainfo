import { IsNumberString } from 'class-validator'
import { Field, TyreCollection, TyreModel } from 'tyrestore'

interface ISearchState {
    prevTweetId: string
}

export class MSearchState extends TyreModel<ISearchState> {
    @Field
    @IsNumberString()
    prevTweetId: string = '0'
}

export const SearchState = new TyreCollection('searchstate', MSearchState)
