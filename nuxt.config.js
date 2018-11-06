const { extend } = require('./webpack-extend')

const meta = (name, content, options = {}) => ({
    ...(name.startsWith('og:') ? { property: name } : { name }),
    content,
    ...options,
})

const description = '上田麗奈さん非公式Info'

module.exports = {
    mode: 'spa',
    head: {
        titleTemplate: '%s | ReinaInfo',
        meta: [
            { charset: 'utf-8' },
            meta('viewport', 'width=device-width, initial-scale=1'),
            meta('description', description, { hid: 'description' }),
            // meta('og:url', 'https://domain.com' + this.$route.path),
            // meta('og:title', ''),
            meta('og:description', description),
            // meta('og:image', ''),
            meta('og:type', 'website'),
            meta('twitter:card', 'summary'),
            meta('twitter:site', '@Unoffishama'),
            meta('twitter:creator', '@Unoffishama'),
        ],
        link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
        script: [{ src: 'https://cdn.polyfill.io/v2/polyfill.min.js' }],
    },
    loading: { color: '#A18C7E' },

    generate: { dir: 'public' },
    srcDir: 'web',

    modules: ['nuxt-typescript', 'nuxt-babel'],
    typescript: { tsconfig: './tsconfig.web.json' },
    plugins: [
        '~/plugins/global-css',
        { ssr: false, src: '~/plugins/firebase' },
    ],
    build: {
        extend,
    },
}
