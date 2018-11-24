const tsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const path = require('path')

const extend = config => {
    config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'google-libphonenumber': path.resolve(
            __dirname,
            'google-libphonenumber'
        ),
    }

    config.resolve.plugins = [new tsconfigPathsPlugin()]
}

module.exports = { extend }
