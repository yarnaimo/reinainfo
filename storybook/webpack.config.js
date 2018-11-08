const NuxtTypeScript = require('nuxt-typescript')
const { extend } = require('../webpack-extend')

module.exports = (baseConfig, env, config) => {
    const _this = {
        nuxt: { options: { extensions: [] } },
        options: {},
        extendBuild: fn => fn(config),
    }
    NuxtTypeScript.call(_this)
    extend(config)

    return config
}
