import { FlexDirectionProperty } from 'csstype'
import { css } from 'emotion'
import { media, Motion, palette, shadow } from '../variables/css'

export const block = css({ display: 'block' })
export const inlineBlock = css({ display: 'inline-block' })
export const inline = css({ display: 'inline' })
export const noDisplay = css({ display: 'none' })

export const only = {
    landscape: css({
        ...media.portrait({
            display: 'none!important',
        }),
    }),
    portrait: css({
        ...media.landscape({
            display: 'none!important',
        }),
    }),
}

export const clickable = css({
    cursor: 'pointer',
    '-webkit-user-select': 'none',
})

export const _fadeMotion = new Motion().add('std', ['opacity'])

export const fadeMotion = _fadeMotion.toCss()

const _mdi = (isClickable = false, smaller = false) => (
    name: string,
    marginLeft: number | string = 0,
    marginRight: number | string = 0
) => [
    isClickable && clickable,
    'mdi',
    `mdi-${name}`,
    css(
        _fadeMotion.add('std', ['color']).toCss(),
        {
            lineHeight: 'normal',
            marginLeft,
            marginRight,
            '&[disabled]': { opacity: 0.5 },
        },
        smaller && { '::before': { fontSize: '90%' } }
    ),
]

export const mdi = _mdi(false, false)
export const smdi = _mdi(false, true)
export const cmdi = _mdi(true, false)
export const csmdi = _mdi(true, true)
export const mdih = {
    one: (name: string) => mdi(name, -1, 10),
    two: (name: string) => mdi(name, 0, 10),
}

export const flex = (() => {
    type FlexAlignment = 'start' | 'end' | 'center'
    type Space = 'space-between' | 'space-around' | 'space-evenly'

    const withDirectionSuffix = (value: string, reverse: boolean) =>
        `${value}${reverse ? '-reverse' : ''}` as FlexDirectionProperty

    const withAlignmentPrefix = (value: string) =>
        value === 'start' || value === 'end' ? `flex-${value}` : value

    return (
        {
            inline = false,
            vertical = false,
            reverse = false,
            wrap = false,
        } = {},
        justifyContent: FlexAlignment | Space = 'start',
        alignItems: FlexAlignment | 'baseline' | 'stretch' = 'stretch',
        alignContent: FlexAlignment | Space | 'stretch' = 'start'
    ) =>
        css({
            display: inline ? 'flex-inline' : 'flex',
            flexDirection: withDirectionSuffix(
                vertical ? 'column' : 'row',
                reverse
            ),
            flexWrap: wrap ? 'wrap' : 'nowrap',
            justifyContent: withAlignmentPrefix(justifyContent),
            alignItems: withAlignmentPrefix(alignItems),
            alignContent: withAlignmentPrefix(alignContent),
        })
})()

export const container = css({
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 520,

    width: '80%',
    ...media.narrow({ width: 'calc(100% - 20px)' }),
    ...media.wider({ width: '60%' }),
})

export const wideContainer = css({
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 780,

    width: '85%',
    ...media.narrow({ width: 'calc(100% - 32px)' }),
    ...media.wider({ width: '70%' }),
})

export const pageTitle = [container, flex({}, 'start', 'baseline')]

export const pageContent = css({
    backgroundColor: palette.white,
    ...shadow.three.box,
    flexGrow: 1,
})
