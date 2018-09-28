require('dotenv').load()
const { initialize } = require('@yarnaimo/pring')
const admin = require('firebase-admin')
const firebaseConfig = JSON.parse(process.env.CONFIG_FIREBASE)

initialize({
    admin,
    options: {
        credential: admin.credential.cert(firebaseConfig),
    },
})
