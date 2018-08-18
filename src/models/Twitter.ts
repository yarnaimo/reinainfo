import { Tweet } from 'ts-twitter'

export type ITweet = Tweet & { full_text: string }
