require('dotenv').load()
const { initializeAdmin } = require('tyrestore/dist/admin')
const admin = require('firebase-admin')
const firebaseConfig = JSON.parse(process.env.CONFIG_FIREBASE)

const app = admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
})
initializeAdmin(app.firestore())
