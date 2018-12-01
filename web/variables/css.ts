import { CSSObject } from 'create-emotion'
import { Properties } from 'csstype'
import { css, keyframes } from 'emotion'

export const palette = {
    get primary() {
        return this.pink
    },
    get accent() {
        return this.cyan
    },
    get secondary() {
        return this.yellow
    },
    get base() {
        return this.whiteGrey
    },
    get link() {
        return this.bluegrey
    },
    pink: '#E1B29C',
    hamEar: '#CCA17F',
    violet: '#CEB7BD',
    yellow: '#E4C17E',
    lime: '#DEE090',
    cyan: '#AEC7C4',
    blue: '#73BAD5',
    teal: '#ADC9BF',
    white: '#FFFFFF',
    black: '#606060',
    whiteGrey: '#FAF8F5',
    bluegrey: '#90A4AE',
    grey: '#B0AFAC',
    greyLight: '#BDBCB9',

    brown: '#A69281',
    transparent: 'transparent',
}

export const shadow = (() => {
    const f = (...strs: string[]) => ({
        drop: strs.map(s => `drop-shadow(${s})`).join(' '),
        box: { boxShadow: strs.join(', ') },
    })

    return {
        zero: f('0 1px 2px rgba(0, 0, 0, 0.16)'),
        zeroPale: f('0 1px 4px rgba(161, 140, 126, 0.24)'),
        one: f('0 1px 4px rgba(0, 0, 0, 0.12)', '0 1px 3px rgba(0, 0, 0, 0.24)'),
        two: f('0 2px 6px rgba(0, 0, 0, 0.16)', '0 2px 6px rgba(0, 0, 0, 0.22)'),
        three: f('0 6px 20px rgba(0, 0, 0, 0.18)', '0 4px 6px rgba(0, 0, 0, 0.22)'),
    }
})()

export const fontSize = (() => {
    const f = (size: number | string) => ({ fontSize: size })

    return { base: f(15), h1: f('1.5em'), h2: f('1.3em'), h3: f('1.15em') }
})()

export const defaultFont =
    "Ubuntu, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'メイリオ', Meiryo, sans-serif"

export const juliusFont = css({
    fontFamily: `'Julius Sans One', ${defaultFont}`,
})

const spacing = (prop: string) => (...values: (string | number)[]): CSSObject => {
    const toObject = (...indexes: number[]) => ({
        [`${prop}Top`]: values[indexes[0]],
        [`${prop}Bottom`]: values[indexes[1]],
        [`${prop}Left`]: values[indexes[2]],
        [`${prop}Right`]: values[indexes[3]],
    })

    switch (values.length) {
        case 1:
            return toObject(0, 0, 0, 0)
        case 2:
            return toObject(0, 0, 1, 1)
        case 4:
            return toObject(0, 1, 2, 3)
        default:
            return {}
    }
}

export const margin = spacing('margin')
export const padding = spacing('padding')

export const media = (() => {
    const f = (query: string) => (rules: CSSObject) => ({
        [`@media ${query}`]: rules,
    })

    return {
        portrait: f('(orientation: portrait)'),
        landscape: f('(orientation: landscape)'),
        low: f('(max-height: 480px)'),
        high: f('(min-height: 640px)'),
        narrow2: f('(max-width: 400px)'),
        narrow: f('(max-width: 448px)'),
        wide: f('(min-width: 640px)'),
        wider: f('(min-width: 960px)'),
    }
})()

export const shape = {
    size: (width: CSSObject['width'], height: CSSObject['height'] = width) => ({
        width,
        height,
    }),
    rounded: { borderRadius: '50%' },
}

export const position = {
    fixed: { position: 'fixed' } as CSSObject,
    relative: { position: 'relative' } as CSSObject,
    absolute: { position: 'absolute' } as CSSObject,
    absoluteFit: {
        position: 'absolute',
        top: 0,
        left: 0,
        ...shape.size('100%'),
    } as CSSObject,
}

export const pseudo = {
    init: {
        ...position.absoluteFit,
        content: '""',
    },
}

export const curve = {
    std: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    acc: 'cubic-bezier(0.4, 0.0, 1, 1)',
    dec: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
}

export class Motion {
    hyphenateRegex = /[A-Z]|^ms/g

    join(array: any[]) {
        return array.join(', ')
    }

    processSeconds(seconds: number[]) {
        return this.join(seconds.map(time => `${time}s`))
    }

    repeat<T>(length: number, array: T[]) {
        return Array(length)
            .fill(null)
            .map((_, i) => array[i % array.length])
    }

    easingType: string[] = []
    properties: string[] = []
    durations: number[] = []
    delays: number[] = []

    add(
        easingType: keyof typeof curve,
        properties: (keyof Properties)[],
        durations: number[] = [0.3],
        delays: number[] = [0]
    ) {
        const { length } = properties
        const clone = new Motion()
        clone.easingType = [...this.easingType, ...clone.repeat(length, [curve[easingType]])]
        clone.properties = [
            ...this.properties,
            ...properties.map((styleName: string) =>
                styleName.replace(clone.hyphenateRegex, '-$&').toLowerCase()
            ),
        ]
        clone.durations = [...this.durations, ...clone.repeat(length, durations)]
        clone.delays = [...this.delays, ...clone.repeat(length, delays)]

        return clone
    }

    toCss(): CSSObject {
        const propertyString = this.join(this.properties)
        return {
            transitionTimingFunction: this.join(this.easingType),
            transitionProperty: propertyString,
            transitionDuration: this.processSeconds(this.durations),
            transitionDelay: this.processSeconds(this.delays),
            willChange: propertyString,
        }
    }
}

export const motion = (
    easingType: keyof typeof curve,
    properties: (keyof Properties)[],
    durations?: number[],
    delays: number[] = [0]
) => {
    const _motion = new Motion()
    return _motion.add(easingType, properties, durations, delays).toCss()
}

export const transitionProps = ({
    enter,
    leave,
    enterActive,
    leaveActive,
}: {
    enter: CSSObject
    leave?: CSSObject
    enterActive: CSSObject
    leaveActive?: CSSObject
}) => {
    return {
        props: {
            enterClass: css(enter),
            leaveClass: css(leave || enter),
            enterActiveClass: css(enterActive),
            leaveActiveClass: css(leaveActive || enterActive),
        },
    }
}

export const show = keyframes({
    from: {
        transform: 'translateY(-1px)',
        opacity: 0.25,
    },
    to: {
        opacity: 1,
    },
})
