const alias = require('pring/webpack-alias')
const tsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const createExtendFn = (withAnalyzer = false) => config => {
    if (withAnalyzer)
        config.plugins.push(new BundleAnalyzerPlugin({ openAnalyzer: false }))

    if (!config.resolve.alias) config.resolve.alias = {}
    config.resolve.alias = { ...config.resolve.alias, ...alias }

    config.resolve.plugins = [new tsconfigPathsPlugin()]
}

module.exports = { createExtendFn }
