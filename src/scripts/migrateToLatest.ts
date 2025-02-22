/// <reference types="node"
import * as path from "path"
import { promises as fs } from "fs"
import { PostgresDatabase as Database } from "../db/clients/postgres"
import { Kysely, Migrator, PostgresDialect, FileMigrationProvider } from "kysely"
import pg from "pg"
import envvar from "env-var"

const { get } = envvar
const { Pool } = pg
const POSTGRES_DATABASE = get("POSTGRES_DATABASE").required().asString()
const POSTGRES_HOST = get("POSTGRES_HOST").required().asString()
const POSTGRES_USER = get("POSTGRES_USER").required().asString()
const POSTGRES_PASSWORD = get("POSTGRES_PASSWORD").required().asString()

async function migrateToLatest() {
  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        database: POSTGRES_DATABASE,
        host: POSTGRES_HOST,
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        ssl: true,
        // port: 5434,
        // max: 10,
      }),
    }),
  })

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.resolve("src", "db", "migrations"),
    }),
  })

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error("failed to migrate")
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}

migrateToLatest()
