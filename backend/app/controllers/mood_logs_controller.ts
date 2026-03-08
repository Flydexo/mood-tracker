import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'

const batchValidator = vine.compile(
  vine.object({
    logs: vine
      .array(
        vine.object({
          mood: vine.number().min(1).max(7),
          timestamp: vine.string(), // ISO 8601
          clientId: vine.string().minLength(1).maxLength(128),
        })
      )
      .minLength(1)
      .maxLength(500),
  })
)

export default class MoodLogsController {
  async batch({ request, response }: HttpContext) {
    const { logs } = await request.validateUsing(batchValidator)

    const synced: string[] = []
    const failed: { clientId: string; reason: string }[] = []

    for (const log of logs) {
      try {
        await db
          .insertQuery()
          .table('mood_logs')
          .insert({
            mood: log.mood,
            timestamp: log.timestamp,
            client_id: log.clientId,
          })
          .onConflict('client_id')
          .ignore()

        synced.push(log.clientId)
      } catch (err) {
        failed.push({ clientId: log.clientId, reason: String(err.message) })
      }
    }

    return response.ok({ synced: synced.length, failed })
  }
}
