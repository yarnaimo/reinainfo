import {
    getOAuthAuthorizationHeader,
    OAuthOptions,
} from 'oauth-authorization-header'
import axios from 'axios'
import { config } from '../config'
import { URLSearchParams } from 'url'
import lazy from 'lazy.js'

interface Token {
    key: string
    secret: string
}

const consumer = config.twitter.consumer
const baseUrl = 'https://api.twitter.com/1.1'

export class Twitter {
    oAuth: OAuthOptions

    constructor(token: string, tokenSecret: string) {
        this.oAuth = {
            consumerKey: consumer.key,
            consumerSecret: consumer.secret,
            token,
            tokenSecret,
        }
    }

    private buildRequestConfig(
        method: 'GET' | 'POST',
        path: string,
        params: { [key: string]: string }
    ) {
        const isGET = method === 'GET'
        const url = `${baseUrl}/${path}.json`

        params.tweet_mode = 'extended'
        const compacted = lazy(params)
            .pairs()
            .filter(([k, v]: any) => v != null)
            .toObject() as { [key: string]: string }

        const authHeader = getOAuthAuthorizationHeader({
            oAuth: this.oAuth,
            url,
            method,
            [isGET ? 'queryParams' : 'formParams']: compacted,
        } as any)

        return {
            url,
            searchParams: new URLSearchParams(compacted),
            headers: { Authorization: authHeader },
        }
    }

    async get(path: string, params: { [key: string]: any } = {}) {
        const { url, searchParams, headers } = this.buildRequestConfig(
            'GET',
            path,
            params
        )
        const { data } = await axios.get(url, { headers, params: searchParams })
        return data
    }

    async post(path: string, form: { [key: string]: any } = {}) {
        const { url, searchParams, headers } = this.buildRequestConfig(
            'POST',
            path,
            form
        )
        const { data } = await axios.post(url, searchParams, { headers })
        return data
    }

    async postThread(texts: string[]) {
        return await texts.reduce(async (prevPromise, text) => {
            const prevIds = await prevPromise

            const { id_str } = await this.post('statuses/update', {
                in_reply_to_status_id: prevIds[prevIds.length - 1],
                status: text,
            })
            return [...prevIds, id_str as string]
        }, Promise.resolve([] as string[]))
    }
}

const token = config.twitter.accounts.reina.token
export const twitter = new Twitter(token.key, token.secret)
