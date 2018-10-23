/* eslint-disable import/no-extraneous-dependencies */
import { action } from '@storybook/addon-actions'
import { configure } from '@storybook/vue'
import Vue from 'vue'
import '../web/plugins/css'
import '../web/plugins/firebase'

Vue.component('NuxtLink', {
    props: ['to'],
    methods: {
        log() {
            action('link target')(this.to)
        },
    },
    template: '<a @click="log()"><slot>NuxtLink</slot></a>',
})

const req = require.context('../web/components', true, /.stories.tsx?$/)

function loadStories() {
    req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
