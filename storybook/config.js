/* eslint-disable import/no-extraneous-dependencies */
import { action } from '@storybook/addon-actions'
import { configure } from '@storybook/vue'
import Vue from 'vue'
import '../web/plugins/firebase'
import '../web/plugins/global-css'

const activeLinkClass = 'nuxt-link-active'

Vue.component('NuxtLink', {
    props: ['to'],
    methods: {
        click() {
            const prev = document.getElementsByClassName(activeLinkClass)[0]
            prev && prev.classList.remove(activeLinkClass)
            this.$el.classList.add(activeLinkClass)

            action('link target')(this.to)
        },
    },
    template: '<a @click="click()"><slot>NuxtLink</slot></a>',
})

const req = require.context('../web/components', true, /.stories.tsx?$/)

function loadStories() {
    req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
