import {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "next-auth/adapters"
import usersModel from "@/src/db/models/usersModel"
import AppError from "@/src/common/AppError"
import accountsModel, { AccountRow } from "@/src/db/models/accountsModel"
import sessionsModel from "@/src/db/models/sessionsModel"
import verificationTokensModel from "@/src/db/models/verificationTokensModel"

function adapterAccountToRow(account: AdapterAccount): Omit<AccountRow, "id"> {
  const {
    access_token: accessToken,
    expires_at: expiresAt,
    id_token: idToken,
    provider,
    providerAccountId,
    refresh_token: refreshToken,
    scope,
    session_state: sessionState,
    token_type: tokenType,
    type,
    userId,
  } = account

  return {
    accessToken: accessToken ?? null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    idToken: idToken ?? null,
    provider,
    providerAccountId,
    refreshToken: refreshToken ?? null,
    scope: scope ?? null,
    sessionState: sessionState ?? null,
    tokenType: tokenType ?? null,
    type,
    userId,
  }
}

function rowToAdapterAccount(row: AccountRow): AdapterAccount {
  const {
    accessToken,
    expiresAt,
    idToken,
    provider,
    providerAccountId,
    refreshToken,
    scope,
    sessionState,
    tokenType,
    type,
    userId,
  } = row

  return {
    access_token: accessToken ?? undefined,
    expires_at: expiresAt?.getTime() ?? undefined,
    id_token: idToken ?? undefined,
    provider,
    providerAccountId,
    refresh_token: refreshToken ?? undefined,
    scope: scope ?? undefined,
    session_state: sessionState ?? undefined,
    token_type: tokenType ?? undefined,
    type,
    userId,
  }
}

export default function CustomAuthAdapter(): Adapter {
  return {
    // Use Postgres for user management and accounts (persistent data)

    createUser: async (user: Omit<AdapterUser, "id">): Promise<AdapterUser> => {
      const { email } = user
      const existingUser = await usersModel.getBy("email", email)

      // TODO: consider making this atomic by parsing db collision error
      AppError.assertWithCode(
        existingUser == null,
        409,
        "user with 'email' already exists",
      )

      return await usersModel.insert(user)
    },

    getUser: async (id: string): Promise<AdapterUser | null> => {
      return await usersModel.getBy("id", id)
    },

    getUserByEmail: async (email: string): Promise<AdapterUser | null> => {
      return await usersModel.getBy("email", email)
    },

    getUserByAccount: async (
      providerInfo: Pick<AdapterAccount, "provider" | "providerAccountId">,
    ): Promise<AdapterUser | null> => {
      const { provider, providerAccountId } = providerInfo
      const account = await accountsModel.getByProviderAccount(
        provider,
        providerAccountId,
      )

      if (account == null) return null

      return await usersModel.getBy("id", account.userId)
    },

    linkAccount: async (accountInfo: AdapterAccount): Promise<AdapterAccount | null> => {
      const account = await accountsModel.insert(adapterAccountToRow(accountInfo))

      return rowToAdapterAccount(account)
    },

    unlinkAccount: async (
      accountInfo: Pick<AdapterAccount, "provider" | "providerAccountId">,
    ): Promise<AdapterAccount | undefined> => {
      const { provider, providerAccountId } = accountInfo

      const account = await accountsModel.deleteByProviderAccount(
        provider,
        providerAccountId,
      )

      if (account == null) return

      return rowToAdapterAccount(account)
    },

    // Use Redis for session management and verification requests (ephemeral data)

    createSession: async (session: AdapterSession): Promise<AdapterSession> => {
      const ttl = session.expires.getTime() / 1000 // seconds

      return await sessionsModel.upsert(session, { ttl })
    },

    getSessionAndUser: async (
      sessionToken: string,
    ): Promise<{ session: AdapterSession; user: AdapterUser }> => {
      const session = await sessionsModel.getOneById(sessionToken)

      AppError.assertWithCode(session != null, 404, "session not found", { sessionToken })

      const user = await usersModel.getBy("id", session.userId)

      AppError.assertWithCode(user != null, 404, "user not found", {
        userId: session.userId,
      })

      return { session, user }
    },

    // note: not atomic
    updateSession: async (
      data: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">,
    ): Promise<AdapterSession | null | undefined> => {
      const session = await sessionsModel.getOneById(data.sessionToken)

      if (session == null) return null

      return await sessionsModel.upsert({
        ...session,
        ...data,
      })
    },

    // note: not atomic
    deleteSession: async (sessionToken: string): Promise<AdapterSession> => {
      const session = await sessionsModel.getOneById(sessionToken)

      AppError.assertWithCode(session != null, 404, "session not found", {
        sessionToken,
      })

      await sessionsModel.deleteOneById(sessionToken)

      return session
    },

    createVerificationToken: async (
      verificationToken: VerificationToken,
    ): Promise<VerificationToken> => {
      const ttl = verificationToken.expires.getTime() / 1000 // seconds

      return await verificationTokensModel.upsert(verificationToken, { ttl })
    },

    useVerificationToken: async (verificationTokenInfo: {
      identifier: string
      token: string
    }): Promise<VerificationToken | null> => {
      const { identifier, token } = verificationTokenInfo
      const verificationToken = await verificationTokensModel.getOneById(identifier)

      if (verificationToken == null) return null

      await verificationTokensModel.deleteOneById(identifier)

      return verificationToken
    },
  }
}
