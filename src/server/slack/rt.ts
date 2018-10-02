import { notNull } from '@yarnaimo/arraymo'
import { urlToTweetId } from '@yarnaimo/twimo'
import { retweetWithNotification } from '~/services/integrated'
import { twitter } from '~/services/twitter'
import { ProcessedOpts } from '.'

export const rtCommandHandler = async ({ args: urls }: ProcessedOpts) => {
    const ids = urls.map(urlToTweetId).filter(notNull)
    await retweetWithNotification(twitter, ids)
    return ids
}
