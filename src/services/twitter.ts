import { Twitter } from '@yarnaimo/twimo'
import { config } from '../config'

export const twitter = new Twitter(config.twitter)
