import fs from 'fs'
import { Pool } from 'pg'

export const CONFIG = {
    SCHEMA_DIR: process.env.SCHEMA_DIR,
    EVOLUTION_DIR: process.env.EVOLUTION_DIR,
    DEVOLUTION_DIR: process.env.DEVOLUTION_DIR,
    POSTGRES_PASSWORD_FILE: process.env.POSTGRES_PASSWORD_FILE,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_DB: process.env.POSTGRES_DB,
}

export const readFiles = (dirname: string): string[] =>
    fs
        .readdirSync(dirname)
        .sort()
        .map((filename) => fs.readFileSync(`${dirname}/${filename}`).toString())

export const getPool = (): Pool => {
    const password = fs
        .readFileSync(CONFIG.POSTGRES_PASSWORD_FILE, 'utf8')
        .replace(/[\r\n]/g, '')

    return new Pool({
        user: CONFIG.POSTGRES_USER,
        password: password,
        database: CONFIG.POSTGRES_DB,
        host: CONFIG.POSTGRES_HOST,
    })
}
