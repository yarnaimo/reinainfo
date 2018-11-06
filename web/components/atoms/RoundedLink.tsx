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
import { clickable } from '../../variables/directives'
import { Link } from './Link'

interface Props {
    icon: string
    external?: boolean
    to: string
    size?: number
    color?: string
    borderlessOnPortrait?: boolean
}

@Component
export class RoundedLink extends VueT<Props> implements Props {
    @Prop()
    icon!: string

    @Prop()
    external!: boolean

    @Prop()
    to!: string

    @Prop()
    size!: number

    @Prop()
    color!: string

    @Prop()
    borderlessOnPortrait!: boolean

    render() {
        return (
            <Link
                class={roundedLink(this)}
                external={this.external}
                to={this.to}
            >
                <svg class={css({ ...position.absoluteFit, zIndex: 2 })}>
                    {/* <circle
                        class={cx(
                            this.borderlessOnPortrait && only.landscape,
                            circle
                        )}
                    /> */}
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
                    />
                </svg>
                <i class={`mdi mdi-${this.icon}`} />
            </Link>
        )
    }
}

const circumference = `calc((100% - 2px) * ${Math.PI})`

const circle = css({
    ...position.absoluteFit,
    strokeWidth: 2,
    stroke: palette.brown,
    fill: palette.transparent,
    transform: 'scaleX(-1) rotate(-90deg)',
    transformOrigin: 'center',
    cx: '50%',
    cy: '50%',
    r: 'calc(50% - 1px)',
    strokeDasharray: circumference,
    strokeDashoffset: 0,
    ...motion('std', ['strokeDashoffset'], [0.5]),
})

const roundedLink = ({ size = 40, color = palette.yellow }: RoundedLink) => {
    return [
        clickable,
        css(margin(12), {
            ...media.landscape(margin(16, 12)),

            display: 'flex',
            ...position.relative,
            overflow: 'hidden',
            opacity: 0.925,

            ...shape.rounded,
            ...shape.size(size),
            fontSize: size / 2,

            ...media.low({
                ...shape.size(size * 0.9),
                fontSize: (size * 0.9) / 2,
            }),

            ...media.high({
                ...shape.size(size * 1.1),
                fontSize: (size * 1.1) / 2,
            }),

            // backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center',
            color: `${palette.whiteGrey}!important`,

            // ...media.portrait({
            backgroundColor: 'transparent',
            // }),

            '::after': {
                ...position.absoluteFit,
                content: '""',
                backgroundColor: palette.white,
                opacity: 0,
                ...motion('std', ['opacity'], [0.2]),
            },
            ':hover::after': { opacity: 0.2 },
        }),
    ]
}
