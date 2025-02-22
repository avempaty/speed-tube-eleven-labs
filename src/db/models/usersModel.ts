import pg from "../clients/postgres"
import PostgresModel, {
  PostgresModelError,
  PostgresModelErrorProps,
  PostgresTable,
} from "../clients/PostgresModel"
import AppError from "@/src/common/AppError"
import { Generated, Insertable, Selectable, Updateable } from "kysely"

export class UsersModelError<
  Props extends PostgresModelErrorProps,
> extends PostgresModelError<Props> {}

export interface UsersTable extends PostgresTable {
  id: Generated<string>
  name: string | null
  email: string // TOOD: unique, indexed..
  image: string | null
  emailVerified: Date | null
}
export type UserRow = Selectable<UsersTable>
export type InsertableUserRow = Insertable<UsersTable>
export type UpdateableUserRow = Updateable<UsersTable>
export type UserIndexes = Partial<Pick<UsersTable, "id" | "email">>

// aliases
type Row = UserRow
type Indexes = UserIndexes
type InsertableRow = InsertableUserRow
type UpdateableRow = UpdateableUserRow
const ModelError: typeof UsersModelError = UsersModelError

export class UsersModel extends PostgresModel<
  "users",
  Row,
  Indexes,
  InsertableRow,
  UpdateableRow
> {
  constructor() {
    super("users", ModelError)
  }
}

const usersModel = new UsersModel()

export default usersModel
