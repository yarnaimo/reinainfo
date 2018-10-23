const NuxtTypeScript = require('nuxt-typescript')
const { createExtendFn } = require('../webpack-extend')

module.exports = (baseConfig, env, config) => {
    const _this = {
        nuxt: { options: { extensions: [] } },
        options: {},
        extendBuild: fn => fn(config),
    }
    NuxtTypeScript.call(_this)

    createExtendFn()(config)
    // config.plugins.push(new webpack.HotModuleReplacementPlugin())

    console.log(config.module.rules[0].use)
    return config
}
