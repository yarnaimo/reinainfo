import { ITweet } from '@yarnaimo/twimo'
import { readFileSync, writeFileSync } from 'fs'
import { extractTweetId, tmpPath, tweetToVectorWithLabel, utf8 } from '.'

const csvPath = tmpPath('tweets.csv')
const jsonPath = tmpPath('tweets.json')
const csvData = readFileSync(csvPath, utf8)
const jsonData = readFileSync(jsonPath, utf8)

const officialTweetIds = process.argv.slice(2).map(extractTweetId)

const toVector = tweetToVectorWithLabel(
    officialTweetIds.length ? officialTweetIds : undefined
)

const data = (JSON.parse(jsonData) as ITweet[])
    .map(toVector)
    .map(arr => arr.join(','))
    .join('\n')

writeFileSync(csvPath, csvData + '\n' + data)
