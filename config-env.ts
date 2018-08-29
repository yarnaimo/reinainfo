import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { load } from 'js-yaml'

const stringify = (value: any) =>
    `'${JSON.stringify(value).replace(/'/g, "\\'")}'`

const add = (name: string, value: any) =>
    execSync(
        `echo y | now secret rm ${name}; now secret add ${name} ${stringify(
            value
        )}`
    )

const main = load(readFileSync('config/default.yml', 'utf-8'))
if (process.argv.includes('-u')) add('config-main', main)

const firebase = JSON.parse(
    readFileSync('config/service-account-key.json', 'utf-8')
)
const firebaseDev = JSON.parse(
    readFileSync('config/service-account-key-dev.json', 'utf-8')
)
if (process.argv.includes('-u')) add('config-firebase', firebase)

writeFileSync(
    '.env',
    `CONFIG_MAIN=${stringify(main)}\nCONFIG_FIREBASE=${stringify(firebaseDev)}`
)
