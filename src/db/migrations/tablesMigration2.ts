import { Kysely, sql } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db)
  await db.schema.dropTable("accounts").execute()
  await db.schema.dropTable("users").execute()
  await db.schema
    .createTable("users")
    .addColumn("id", "varchar(36)", (col) =>
      col
        .primaryKey()
        .defaultTo(sql`(uuid_generate_v4())`)
        .notNull(),
    )
    .addColumn("email", "varchar", (col) => col.notNull())
    .addColumn("name", "varchar")
    .addColumn("image", "varchar")
    .addColumn("emailVerified", "timestamp")
    .execute()

  // await db.schema.createIndex("users_id_index").on("users").column("id").execute()
  await db.schema.createIndex("users_email_index").on("users").column("email").execute()

  await db.schema
    .createTable("accounts")
    .addColumn("id", "varchar(36)", (col) =>
      col
        .primaryKey()
        .defaultTo(sql`(uuid_generate_v4())`)
        .notNull(),
    )
    .addColumn("accessToken", "varchar")
    .addColumn("expiresAt", "timestamp")
    .addColumn("idToken", "varchar")
    .addColumn("provider", "varchar", (col) => col.notNull())
    .addColumn("providerAccountId", "varchar", (col) => col.notNull())
    .addColumn("refreshToken", "varchar")
    .addColumn("scope", "varchar")
    .addColumn("sessionState", "varchar")
    .addColumn("tokenType", "varchar")
    .addColumn("type", "varchar", (col) => col.notNull())
    .addColumn("userId", "uuid", (col) => col.notNull())
    .execute()

  // await db.schema.createIndex("accounts_id_index").on("accounts").column("id").execute()
  await db.schema
    .createIndex("accounts_userId_index")
    .on("accounts")
    .column("userId")
    .execute()
  await db.schema
    .createIndex("accounts_provider_index")
    .on("accounts")
    .column("provider")
    .execute()
  await db.schema
    .createIndex("accounts_providerAccountId_index")
    .on("accounts")
    .column("providerAccountId")
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("accounts").execute()
  await db.schema.dropTable("users").execute()
}
