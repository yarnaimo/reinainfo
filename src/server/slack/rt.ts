import { notNull } from '@yarnaimo/arraymo'
import { urlToTweetId } from '@yarnaimo/twimo'
import { ProcessedOpts } from '.'
import { retweetWithNotification } from '../../services/integrated'
import { twitter } from '../../services/twitter'

export const rtCommandHandler = async ({ args: urls }: ProcessedOpts) => {
    const ids = urls.map(urlToTweetId).filter(notNull)
    await retweetWithNotification(twitter, ids)
    return ids
}
