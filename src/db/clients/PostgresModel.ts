import AppError, { AppErrorProps } from "@/src/common/AppError"
import pg, { PostgresDatabase } from "./postgres"
import { singularize } from "inflected"
import { Generated, Selectable, TableExpression } from "kysely"

export interface PostgresModelErrorProps extends AppErrorProps {}

export class PostgresModelError<
  Props extends PostgresModelErrorProps,
> extends AppError<Props> {
  static mapPostgresErrorCodeToHttpStatus(err: any): number {
    switch (err.code) {
      case "23505":
        return 409
      case "23502":
      case "23503":
      case "22001":
      case "22007":
      case "22P02":
      case "42703":
      case "42P01":
      case "23505":
      case "23514":
        return 400
      default:
        return 500
    }
  }

  static wrapPostgresError<
    ExtraProps extends Omit<PostgresModelErrorProps, "status" | "code"> = {},
  >(
    source: any,
    message: string | ((code: number) => string),
    data?: ExtraProps,
  ): AppError {
    const postgresCode = source.code
    const code = this.mapPostgresErrorCodeToHttpStatus(postgresCode)
    const errMessage = typeof message === "function" ? message(code) : message

    return this.wrap(source, errMessage, {
      code,
      status: this.statusFromCode(code),
      ...data,
    })
  }
}

export interface PostgresTable {
  id: Generated<string>
}

type PostgresIndexes = { [index: string]: any }

export type PostgresRow = Selectable<PostgresTable>

export default class PostgresModel<
  TableName extends TableExpression<PostgresDatabase, keyof PostgresDatabase>,
  Row extends PostgresRow,
  RowIndexes extends PostgresIndexes,
  InsertableRow extends Partial<Row>,
  UpdateableRow extends Partial<Row>,
  RowIndex = keyof RowIndexes,
> {
  tableName: TableName
  rowName: string
  ModelError: typeof PostgresModelError

  constructor(tableName: TableName, ModelError: typeof PostgresModelError) {
    this.tableName = tableName
    this.rowName = singularize(this.tableName as string)
    this.ModelError = ModelError
  }

  async insert(data: InsertableRow): Promise<Row> {
    const row = await pg
      // TODO: fix ts
      .insertInto(this.tableName as any)
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow()
      .catch((err) => {
        throw this.ModelError.wrapPostgresError(
          err,
          (code: number) =>
            code === 409
              ? `${this.rowName} already exists`
              : `error creating ${this.rowName}`,
          {
            data,
          },
        )
      })

    // TODO: fix ts
    return (row as any) ?? null
  }

  async getBy(index: RowIndex, indexValue: any): Promise<Row | null> {
    return await this.getWhere({ [index as string]: indexValue } as RowIndexes)
  }

  async getWhere(where: RowIndexes): Promise<Row | null> {
    let query = pg.selectFrom(this.tableName)

    for (let index in where) {
      // TODO: fix ts
      query = query.where(index as any, "=", where[index] as any)
    }

    const row = await query
      // TODO: fix ts
      .selectAll(this.tableName as any)
      .executeTakeFirst()
      .catch((err) => {
        throw this.ModelError.wrapPostgresError(err, `${this.rowName} fetch failed`, {
          where,
        })
      })

    // TODO: fix ts
    return (row as any) ?? null
  }

  async updateBy(index: RowIndex, indexValue: string, data: UpdateableRow): Promise<Row> {
    const row = await this.updateWhere(
      { [index as string]: indexValue } as RowIndexes,
      data,
    )

    this.ModelError.assertWithCode(row != null, 404, `${this.rowName} not found`, {
      index,
      indexValue,
    })

    return row
  }

  async updateWhere(where: RowIndexes, data: UpdateableRow): Promise<Row> {
    // TODO: fix ts
    let query = pg.updateTable(this.tableName as any).set(data as any)

    for (let index in where) {
      query = query.where(index, "=", where[index])
    }

    const row = await query
      .returningAll()
      .executeTakeFirst()
      .catch((err) => {
        throw this.ModelError.wrapPostgresError(err, `${this.rowName} update failed`, {
          where,
        })
      })

    // TODO: fix ts
    return (row as any as Row) ?? null
  }

  async deleteBy(index: RowIndex, indexValue: string): Promise<Row | null> {
    const row = await this.deleteWhere({ [index as string]: indexValue } as RowIndexes)

    this.ModelError.assertWithCode(row != null, 404, `${this.rowName} not found`, {
      index,
      indexValue,
    })

    return row
  }

  async deleteWhere(where: RowIndexes): Promise<Row | null> {
    let query = pg.deleteFrom(this.tableName as any)

    for (let index in where) {
      query = query.where(index, "=", where[index])
    }

    const row = await query
      .returningAll()
      .executeTakeFirst()
      .catch((err) => {
        throw this.ModelError.wrapPostgresError(err, `${this.rowName} delete failed`, {
          where,
        })
      })

    // TODO: fix ts
    return (row as any as Row) ?? null
  }
}
