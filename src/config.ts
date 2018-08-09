import { config as dotenv } from 'dotenv'
dotenv()

export const firebaseConfig = JSON.parse(process.env.CONFIG_FIREBASE as any)
export const config = JSON.parse(process.env.CONFIG_MAIN as any)
