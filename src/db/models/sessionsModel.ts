import RedisModel from "../clients/RedisModel"

type SessionModelRecord = {
  sessionToken: string
  userId: string
  expires: Date
}

export class SessionsModel extends RedisModel<SessionModelRecord> {
  async getOneById(id: string): Promise<SessionModelRecord | null> {
    const data = await super.getOneById(id)

    if (data == null) return null

    return {
      ...data,
      expires: new Date(data.expires),
    }
  }
}

const sessionsModel = new SessionsModel("sessions", {
  index: "sessionToken",
})

export default sessionsModel
