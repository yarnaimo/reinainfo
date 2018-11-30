import { initializeApp } from 'firebase/app'
import { initializeWeb } from 'tyrestore'
import { config } from '../firebase-config'

const app = initializeApp(config)
initializeWeb(app.firestore())
