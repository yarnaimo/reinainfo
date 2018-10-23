const { createExtendFn } = require('./webpack-extend')

module.exports = {
    mode: 'spa',
    head: {
        title: 'ReinaInfo',
        meta: [
            { charset: 'utf-8' },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            {
                hid: 'description',
                name: 'description',
                content: '{{ escape description }}',
            },
        ],
        link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
    loading: { color: '#3B8070' },

    generate: { dir: 'public' },
    srcDir: 'web',

    // css: ['ress', '@mdi/font/css/materialdesignicons.min.css'],
    modules: ['nuxt-typescript', 'nuxt-babel'],
    plugins: ['~/plugins/css', { ssr: false, src: '~/plugins/firebase' }],
    build: {
        extend: createExtendFn(true),
    },
}
