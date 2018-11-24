import { convertToAdmin } from 'tyrestore/dist/core/TyreCollectionAdmin'
import { Schedule } from './Schedule'
import { SearchState } from './SearchState'
import { TweetLog } from './TweetLog'

export const ScheduleAdmin = convertToAdmin(Schedule)
export const SearchStateAdmin = convertToAdmin(SearchState)
export const TweetLogAdmin = convertToAdmin(TweetLog)
