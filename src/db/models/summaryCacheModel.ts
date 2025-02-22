import RedisModel from "../clients/RedisModel"

type SummaryCacheModelRecord = {
  videoId: string
  summary: string
}

export class SessionsModel extends RedisModel<SummaryCacheModelRecord> {}

const summaryCacheModel = new SessionsModel("summaryCache", {
  index: "videoId",
  ttl: 60 * 60 * 24, // 1 day
})

export default summaryCacheModel
