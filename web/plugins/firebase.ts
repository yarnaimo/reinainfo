import { initialize } from '@yarnaimo/pring'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { config } from '../firebase-config'

export const app = initialize({
    web: firebase,
    options: config,
})
