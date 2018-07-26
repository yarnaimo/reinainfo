import {
    IsString,
    IsNumberString,
    IsDate,
    IsBoolean,
    IsUrl,
    ValidateNested,
} from 'class-validator'

export class Account {
    @IsNumberString() id!: string
    @IsString() username!: string
    @IsString() displayName!: string
    @IsUrl() avatar!: string
    @IsBoolean() private!: boolean
    @IsUrl() url!: string

    constructor(service: 'twitter', a: any) {
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
    @IsNumberString() id!: string
    @IsDate() date!: Date
    @IsString() text!: string
    @IsString() source!: string
    @ValidateNested() account!: Account

    constructor(service: 'twitter', s: any) {
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
