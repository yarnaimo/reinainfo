import admin from 'firebase-admin'
const key = require('../../config/service-account-key.json')

admin.initializeApp({
    credential: admin.credential.cert(key),
})

export const db = admin.firestore()
