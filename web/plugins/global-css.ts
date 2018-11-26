import { injectGlobal } from 'emotion'
import {
    defaultFont,
    fontSize,
    margin,
    motion,
    palette,
} from '../variables/css'

injectGlobal({
    'html, body, #__nuxt, #__layout': { height: '100%' },
    body: {
        lineHeight: 1.525,
        fontFamily: defaultFont,
        ...fontSize.base,
        color: palette.black,
        backgroundColor: palette.base,
    },

    '.page-enter-active, .page-leave-active': motion(
        'std',
        ['opacity'],
        [0.15]
    ),
    '.page-enter, .page-leave-to': {
        opacity: 0,
    },

    'twitter-widget': { position: 'static!important' } as any,

    '*': { '-webkit-tap-highlight-color': palette.transparent },
    '[disabled]': { cursor: 'default!important' },

    a: { cursor: 'pointer' },

    button: { outline: 0 },

    // 'h1, h2': {
    //     ...margin('0.8em', 0),
    //     letterSpacing: 1,
    // },
    'h1, h2, h3, h4, h5, h6': {
        ...margin('0.6em', 0),
        letterSpacing: 1,
    },
    'p+h1, p+h2': { marginTop: '1.375em' },
    h1: fontSize.h1,
    h2: fontSize.h2,
    h3: fontSize.h3,
    p: {
        ...margin('0.6em', 0),
    },
    section: { ...margin(16, 'auto') },
    'section + section': { marginTop: 36 },
})

injectGlobal({
    '.SandboxRoot': { fontSize: 15 },
    '.SandboxRoot.env-bp-min': { fontSize: 14 },
})
