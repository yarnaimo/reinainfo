const alias = require('pring/webpack-alias')
const tsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const extend = config => {
    if (!config.resolve.alias) config.resolve.alias = {}
    config.resolve.alias = { ...config.resolve.alias, ...alias }

    config.resolve.plugins = [new tsconfigPathsPlugin()]
}

module.exports = { extend }
