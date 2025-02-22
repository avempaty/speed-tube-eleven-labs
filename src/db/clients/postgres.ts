import { createKysely } from "@vercel/postgres-kysely"
import { UsersTable } from "../models/usersModel"
import { AccountsTable } from "../models/accountsModel"

export interface PostgresDatabase {
  accounts: AccountsTable
  users: UsersTable
}

const pg = createKysely<PostgresDatabase>()

export default pg
