import { VueT } from '../utils/vue-tsx'

declare module 'vue-tweet-embed' {
    export declare class Tweet extends VueT<{
        id: string
        sourceType?: string
        options?: Object
    }> {}
}
