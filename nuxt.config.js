const { extend } = require('./webpack-extend')
const path = require('path')

const meta = (name, content, options = {}) => ({
    ...(name.startsWith('og:') ? { property: name } : { name }),
    content,
    ...options,
})

const title = 'ReinaInfo'
const shortDescription = '上田麗奈さん非公式Info'
const description = '声優・上田麗奈さんに関する情報を共有する非公式Webサイトです。'
const screenName = '@Unoffishama'

const iconSrc = path.resolve('web/static/icon.svg')

module.exports = {
    mode: 'spa',
    icon: false,
    manifest: {
        name: title,
        short_name: title,
        description: shortDescription,
        lang: 'ja',
        icons: [
            {
                src: '/icons/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    },
    head: {
        titleTemplate: `%s | ${title}`,
        meta: [
            { charset: 'utf-8' },
            meta('viewport', 'width=device-width, initial-scale=1'),
            meta('description', description, { hid: 'description' }),
            // meta('og:url', 'https://domain.com' + this.$route.path),
            // meta('og:title', ''),
            meta('og:description', shortDescription),
            // meta('og:image', ''),
            meta('og:type', 'website'),
            meta('twitter:card', 'summary'),
            meta('twitter:site', screenName),
            meta('twitter:creator', screenName),
        ],
        link: [
            // ...icons,
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css?family=Ubuntu:400,700|Julius+Sans+One',
            },
        ],
        // script: [{ src: 'https://cdn.polyfill.io/v2/polyfill.min.js' }],
    },
    loading: { color: '#A18C7E' },

    router: {
        extendRoutes(routes, resolve) {
            routes.push({
                path: '/',
                redirect: '/topic',
            })
        },
    },

    generate: { dir: 'public' },
    srcDir: 'web',

    css: ['ress', '@mdi/font/css/materialdesignicons.min.css'],
    modules: [
        ['@nuxtjs/google-analytics', { id: 'UA-129712263-1' }],
        ['nuxt-rfg-icon', { masterPicture: iconSrc }],
        // '@nuxtjs/manifest',
        '@nuxtjs/pwa',
        'nuxt-typescript',
        'nuxt-babel',
    ],
    typescript: { tsconfig: './tsconfig.web.json' },
    plugins: ['~/plugins/firebase', '~/plugins/global-css'],
    build: {
        extend,
    },
}
