import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'

const batchValidator = vine.compile(
  vine.object({
    visits: vine
      .array(
        vine.object({
          url: vine.string().maxLength(2048),
          domain: vine.string().maxLength(253),
          activeDuration: vine.number().min(0),
          audioVideoDuration: vine.number().min(0),
          startTime: vine.string(), // ISO 8601
          endTime: vine.string(), // ISO 8601
          clientId: vine.string().minLength(1).maxLength(128),
        })
      )
      .minLength(1)
      .maxLength(500),
  })
)

export default class WebsiteVisitsController {
  async batch({ request, response }: HttpContext) {
    const { visits } = await request.validateUsing(batchValidator)

    const synced: string[] = []
    const failed: { clientId: string; reason: string }[] = []

    for (const visit of visits) {
      try {
        await db
          .insertQuery()
          .table('website_visits')
          .insert({
            url: visit.url,
            domain: visit.domain,
            active_duration: visit.activeDuration,
            audio_video_duration: visit.audioVideoDuration,
            start_time: visit.startTime,
            end_time: visit.endTime,
            client_id: visit.clientId,
          })
          .onConflict('client_id')
          .ignore()

        synced.push(visit.clientId)
      } catch (err) {
        failed.push({ clientId: visit.clientId, reason: String(err.message) })
      }
    }

    return response.ok({ synced: synced.length, failed })
  }
}
