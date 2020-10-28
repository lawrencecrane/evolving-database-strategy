import fs from 'fs'
import { Pool } from 'pg'
import mutate, { Nature } from 'ts-nature'
import * as io from './io'

if (!Object.keys(io.CONFIG).every((k) => (io.CONFIG as any)[k])) {
    console.error(
        'Invalid config, missing environment variables:',
        JSON.stringify(io.CONFIG)
    )

    process.exit(1)
}

const CREATE_VERSION_TABLE = `
create table if not exists evolution_version as
  select 0 as id
`

const GET_VERSION_NUMBER = `
select max(id) as id from evolution_version
`

const UPDATE_VERSION_NUMBER = `
update evolution_version set id = $1
`

const query = <T extends {}>(
    pool: Pool,
    sql: string,
    ...args: any[]
): Promise<T[]> =>
    pool.connect().then((client) =>
        client
            .query<T>(sql, args)
            .then((res) => res.rows)
            .finally(() => client.release())
    )

const POOL = io.getPool()

const nature: Nature<string> = {
    schema: io.readFiles(io.CONFIG.SCHEMA_DIR)[0],
    evolutions: io.readFiles(io.CONFIG.EVOLUTION_DIR),
    devolutions: io.readFiles(io.CONFIG.DEVOLUTION_DIR),
    execute: (sql) => query(POOL, sql),
    getVersion: () =>
        query<{ id: number }>(POOL, GET_VERSION_NUMBER).then(
            (rows) => rows[0].id
        ),
    updateVersion: (version) => query(POOL, UPDATE_VERSION_NUMBER, version),
}

query(POOL, CREATE_VERSION_TABLE)
    .then(() => mutate(nature))
    .catch(() => process.exit(1))
