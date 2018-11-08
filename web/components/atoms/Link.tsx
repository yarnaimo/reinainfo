import { css } from 'emotion'
import { Component, Prop } from 'vue-property-decorator'
import { VueT } from '../../utils/vue-tsx'
import { palette } from '../../variables/css'
import { clickable, mdi } from '../../variables/directives'

interface Props {
    external?: boolean
    to: string
    icon?: string
}

@Component
export class Link extends VueT<Props> implements Props {
    @Prop()
    external?: boolean

    @Prop()
    to!: string

    @Prop()
    icon?: string

    get _icon() {
        if (!this.external) return this.icon
        return this.icon === undefined ? 'open-in-new' : undefined
    }

    get iconElement() {
        return (
            this._icon && [
                <i
                    class={[
                        mdi(this._icon),
                        css({
                            fontSize: '0.8em',
                            '::before': {
                                display: 'inline',
                            },
                        }),
                    ]}
                />,
            ]
        )
    }

    render() {
        return this.external ? (
            <a
                class={link}
                target="_blank"
                rel="noopener noreferrer"
                href={this.to}
            >
                {this.$slots.default}
                {this.iconElement}
            </a>
        ) : (
            <nuxt-link class={link} to={this.to}>
                {this.$slots.default}
                {this.iconElement}
            </nuxt-link>
        )
    }
}

const link = [
    clickable,
    css({
        color: palette.brown,
        textDecoration: 'none',
        ':hover': { textDecoration: 'underline' },
    }),
]
