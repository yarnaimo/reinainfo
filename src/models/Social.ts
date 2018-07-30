type Service = 'twitter'

export class Account {
    id!: string
    username!: string
    displayName!: string
    avatar!: string
    private!: boolean
    url!: string

    constructor(service: Service, a: any) {
        if (service === 'twitter') {
            Object.assign(this, {
                id: a.id_str,
                username: a.screen_name,
                displayName: a.name,
                avatar: a.profile_image_url_https,
                private: a.protected,
                url: `https://twitter.com/${a.screen_name}`,
            })
        }
    }
}

export class Status {
    id!: string
    date!: Date
    text!: string
    source!: string
    account!: Account

    constructor(service: Service, s: any) {
        if (service === 'twitter') {
            const account = new Account('twitter', s.user)

            Object.assign(this, {
                id: s.id_str,
                date: new Date(s.created_at),
                text: s.full_text,
                source: s.source,
                account,
            })
        }
    }
}
