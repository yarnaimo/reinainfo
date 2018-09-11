import { ITweet } from '@yarnaimo/twimo'

export const tweetToUrl = (t: ITweet) => {
    const {
        id_str,
        user: { screen_name },
    } = originalTweet(t)
    return `https://twitter.com/${screen_name}/status/${id_str}`
}

export const originalTweet = (t: ITweet) => t.retweeted_status || t

export const urlToTweetId = (url: string) => {
    const m = url.match(/(?:twitter.com\/\w+\/status\/)?(\d+)$/)
    return m ? m[1] : null
}
