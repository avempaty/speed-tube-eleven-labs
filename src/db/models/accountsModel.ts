import { ProviderType } from "next-auth/providers/index"
import PostgresModel, {
  PostgresModelError,
  PostgresModelErrorProps,
  PostgresTable,
} from "../clients/PostgresModel"
import { Generated, Insertable, Selectable, Updateable } from "kysely"

export class AccountsModelError<
  Props extends PostgresModelErrorProps,
> extends PostgresModelError<Props> {}

export interface AccountsTable extends PostgresTable {
  id: Generated<string>
  accessToken: string | null
  expiresAt: Date | null
  idToken: string | null
  provider: string
  providerAccountId: string
  refreshToken: string | null
  scope: string | null
  sessionState: string | null
  tokenType: string | null
  type: ProviderType // string
  userId: string
}
export type AccountRow = Selectable<AccountsTable>
export type InsertableAccountRow = Insertable<AccountsTable>
export type UpdateableAccountRow = Updateable<AccountsTable>
export type AccountIndexes = Partial<
  Pick<AccountsTable, "id" | "userId" | "provider" | "providerAccountId">
>
export type AccountIndex = keyof AccountIndexes

// aliases
type Row = AccountRow
type Indexes = AccountIndexes
type InsertableRow = InsertableAccountRow
type UpdateableRow = UpdateableAccountRow
const ModelError: typeof AccountsModelError = AccountsModelError

export class AccountsModel extends PostgresModel<
  "accounts",
  Row,
  Indexes,
  InsertableRow,
  UpdateableRow
> {
  constructor() {
    super("accounts", ModelError)
  }

  async getByProviderAccount(
    provider: string,
    providerAccountId: string,
  ): Promise<Row | null> {
    return await this.getWhere({
      provider,
      providerAccountId,
    })
  }

  async deleteByProviderAccount(
    provider: string,
    providerAccountId: string,
  ): Promise<Row | null> {
    const row = await this.deleteWhere({
      provider,
      providerAccountId,
    })

    ModelError.assertWithCode(row != null, 404, `${this.rowName} not found`, {
      provider,
      providerAccountId,
    })

    return row
  }
}

const accountsModel = new AccountsModel()

export default accountsModel
