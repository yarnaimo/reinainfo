import { css, cx } from 'emotion'
import { Component, Prop } from 'vue-property-decorator'
import { VueT } from '../../utils/vue-tsx'
import {
    margin,
    media,
    motion,
    palette,
    position,
    shape,
} from '../../variables/css'
import { clickable, fadeMotion } from '../../variables/directives'
import { Link } from './Link'

interface Props {
    label: string
    icon: string
    external?: boolean
    to: string
    size?: number
    color?: string
    borderless?: boolean
}

@Component
export class RoundedLink extends VueT<Props> implements Props {
    @Prop()
    label!: string

    @Prop()
    icon!: string

    @Prop()
    external?: boolean

    @Prop()
    to!: string

    @Prop()
    size?: number

    @Prop()
    color?: string

    @Prop()
    borderless?: boolean

    render() {
        return (
            <Link
                aria-label={this.label}
                class={roundedLink(this)}
                external={this.external}
                to={this.to}
                icon={''}
            >
                {this.borderless || (
                    <svg
                        class={css({
                            ...position.absolute,
                            top: 1,
                            left: 1,
                            ...shape.size('calc(100% - 2px)'),
                            overflow: 'visible!important',
                            zIndex: 2,
                        })}
                    >
                        <circle
                            class={cx(
                                circle,
                                css({
                                    strokeDashoffset: circumference,
                                    stroke: palette.base,
                                    '.nuxt-link-active &': {
                                        transform: 'scaleX(1) rotate(-90deg)',
                                        strokeDashoffset: 0,
                                    },
                                })
                            )}
                            cx="50%"
                            cy="50%"
                            r="50%"
                        />
                    </svg>
                )}
                <i class={`mdi mdi-${this.icon}`} />
            </Link>
        )
    }
}

const circumference = `${Math.PI * 100}%`

const circle = css({
    ...position.absoluteFit,
    strokeWidth: 2,
    stroke: palette.brown,
    fill: palette.transparent,
    transform: 'scaleX(-1) rotate(-90deg)',
    transformOrigin: 'center',
    strokeDasharray: circumference,
    strokeDashoffset: 0,
    ...motion('std', ['strokeDashoffset'], [0.5]),
})

const low = 0.9
const high = 1.1

const _margin = 12
const withMargin = (size: number) => size + _margin * 2

export const withNavbar = (size = 40) => [
    css(
        media.portrait({
            paddingBottom: withMargin(size),
            ...media.low({ paddingBottom: withMargin(size * low) }),
            ...media.high({ paddingBottom: withMargin(size * high) }),
        }),
        media.landscape({
            paddingLeft: withMargin(size),
            ...media.low({ paddingLeft: withMargin(size * low) }),
            ...media.high({ paddingLeft: withMargin(size * high) }),
        })
    ),
]

const roundedLink = ({ size = 40, color }: RoundedLink) => {
    return [
        clickable,
        css(margin(_margin), {
            ...media.landscape(margin(16, 12)),

            display: 'flex',
            ...position.relative,
            overflow: 'hidden',
            opacity: 0.925,

            ...shape.rounded,
            ...shape.size(size),
            fontSize: size / 2,

            ...media.low({
                ...shape.size(size * low),
                fontSize: (size * low) / 2,
            }),

            ...media.high({
                ...shape.size(size * high),
                fontSize: (size * high) / 2,
            }),

            alignItems: 'center',
            justifyContent: 'center',
            color: `${palette.whiteGrey}!important`,

            backgroundColor: color || 'transparent',

            '::after': {
                ...position.absoluteFit,
                content: '""',
                backgroundColor: palette.white,
                opacity: 0,
                ...fadeMotion,
            },
            ':hover::after': { opacity: 0.2 },
        }),
    ]
}
