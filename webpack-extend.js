const path = require('path')

const extend = config => {
    config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'google-libphonenumber': path.resolve(__dirname, 'google-libphonenumber'),
    }
}

module.exports = { extend }
