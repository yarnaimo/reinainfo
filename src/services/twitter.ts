import {
    getOAuthAuthorizationHeader,
    OAuthOptions,
} from 'oauth-authorization-header'
import axios from 'axios'
import config from 'config'
import { URLSearchParams } from 'url'

interface Token {
    key: string
    secret: string
}

const consumer = config.get<Token>('twitter.consumer')
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

    private formatParams(obj: { [key: string]: any }) {
        obj.tweet_mode = 'extended'

        Object.keys(obj).forEach(key => {
            if (obj[key] == null) delete obj[key]
        })
    }

    private getRequestConfigs(
        path: string,
        method: 'GET' | 'POST',
        queryParams: {},
        formParams: {}
    ) {
        const url = `${baseUrl}/${path}.json`
        const authHeader = getOAuthAuthorizationHeader({
            oAuth: this.oAuth,
            url,
            method,
            queryParams,
            formParams,
        })
        return { url, headers: { Authorization: authHeader } }
    }

    async get(path: string, params: { [key: string]: any } = {}) {
        this.formatParams(params)

        const { url, headers } = this.getRequestConfigs(path, 'GET', params, {})
        const { data } = await axios.get(url, { headers, params })
        return data
    }

    async post(path: string, form: { [key: string]: any } = {}) {
        this.formatParams(form)

        const params = new URLSearchParams()
        Object.entries(form).forEach(([k, v]) => params.append(k, v))

        const { url, headers } = this.getRequestConfigs(path, 'POST', {}, form)
        const { data } = await axios.post(url, params, { headers })
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

const token = config.get<Token>('twitter.accounts.main.token')
export const twitter = new Twitter(token.key, token.secret)
