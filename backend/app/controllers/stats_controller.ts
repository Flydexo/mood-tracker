import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'

const dateRangeValidator = vine.compile(
  vine.object({
    from: vine.string(),
    to: vine.string(),
  })
)

const hourlyValidator = vine.compile(
  vine.object({
    from: vine.string(),
    to: vine.string(),
    period: vine.enum(['daily', 'weekly', 'monthly', 'yearly']),
  })
)

export default class StatsController {
  /**
   * GET /api/stats/summary?from=ISO&to=ISO
   * Returns mood trend + top domains for the date range.
   */
  async summary({ request, response }: HttpContext) {
    const { from, to } = await request.validateUsing(dateRangeValidator)

    // Mood: one data point per log entry, ordered by timestamp
    const moodTrend = await db
      .query()
      .from('mood_logs')
      .select('mood', 'timestamp')
      .where('timestamp', '>=', from)
      .where('timestamp', '<=', to)
      .orderBy('timestamp', 'asc')

    // Mood average over the period
    const moodAvgRow = await db
      .query()
      .from('mood_logs')
      .avg('mood as avg_mood')
      .where('timestamp', '>=', from)
      .where('timestamp', '<=', to)
      .first()

    // Top domains by total active + audio/video time, descending
    const topDomains = await db
      .query()
      .from('website_visits')
      .select('domain')
      .sum('active_duration as total_active')
      .sum('audio_video_duration as total_media')
      .where('start_time', '>=', from)
      .where('start_time', '<=', to)
      .groupBy('domain')
      .orderByRaw('SUM(active_duration + audio_video_duration) DESC')
      .limit(50)

    return response.ok({
      moodAvg: moodAvgRow ? Number(moodAvgRow.avg_mood) || null : null,
      moodTrend: moodTrend.map((r) => ({
        mood: r.mood,
        timestamp: r.timestamp,
      })),
      topDomains: topDomains.map((r) => ({
        domain: r.domain,
        totalActive: Number(r.total_active) || 0,
        totalMedia: Number(r.total_media) || 0,
      })),
    })
  }

  /**
   * GET /api/stats/hourly?from=ISO&to=ISO&period=daily|weekly|monthly|yearly
   * Returns avg mood and avg website usage broken down by hour-of-day (0-23).
   */
  async hourly({ request, response }: HttpContext) {
    const { from, to } = await request.validateUsing(hourlyValidator)

    // Mood averaged by hour-of-day
    const moodByHour = await db.rawQuery<{ hour: string; avg_mood: string }[]>(
      `SELECT EXTRACT(HOUR FROM timestamp AT TIME ZONE 'UTC')::int AS hour,
              AVG(mood) AS avg_mood
       FROM mood_logs
       WHERE timestamp >= ? AND timestamp <= ?
       GROUP BY hour
       ORDER BY hour`,
      [from, to]
    )

    // Active duration averaged by hour-of-day
    const usageByHour = await db.rawQuery<{ hour: string; avg_active: string; avg_media: string }[]>(
      `SELECT EXTRACT(HOUR FROM start_time AT TIME ZONE 'UTC')::int AS hour,
              AVG(active_duration) AS avg_active,
              AVG(audio_video_duration) AS avg_media
       FROM website_visits
       WHERE start_time >= ? AND start_time <= ?
       GROUP BY hour
       ORDER BY hour`,
      [from, to]
    )

    // Build 0-23 maps
    const hourlyMood: Record<number, number | null> = {}
    const hourlyActive: Record<number, number> = {}
    const hourlyMedia: Record<number, number> = {}

    for (let h = 0; h < 24; h++) {
      hourlyMood[h] = null
      hourlyActive[h] = 0
      hourlyMedia[h] = 0
    }

    for (const row of moodByHour.rows) {
      hourlyMood[Number(row.hour)] = Number(row.avg_mood) || null
    }
    for (const row of usageByHour.rows) {
      hourlyActive[Number(row.hour)] = Number(row.avg_active) || 0
      hourlyMedia[Number(row.hour)] = Number(row.avg_media) || 0
    }

    return response.ok({ hourlyMood, hourlyActive, hourlyMedia })
  }

  /**
   * GET /api/stats/domain/:domain?from=ISO&to=ISO
   * Returns hourly usage breakdown for a specific domain.
   */
  async domain({ request, response, params }: HttpContext) {
    const { from, to } = await request.validateUsing(dateRangeValidator)
    const { domain } = params

    const rows = await db.rawQuery<{ hour: string; total_active: string; total_media: string }[]>(
      `SELECT EXTRACT(HOUR FROM start_time AT TIME ZONE 'UTC')::int AS hour,
              AVG(active_duration) AS total_active,
              AVG(audio_video_duration) AS total_media
       FROM website_visits
       WHERE domain = ? AND start_time >= ? AND start_time <= ?
       GROUP BY hour
       ORDER BY hour`,
      [domain, from, to]
    )

    const hourlyActive: Record<number, number> = {}
    const hourlyMedia: Record<number, number> = {}

    for (let h = 0; h < 24; h++) {
      hourlyActive[h] = 0
      hourlyMedia[h] = 0
    }

    for (const row of rows.rows) {
      hourlyActive[Number(row.hour)] = Number(row.total_active) || 0
      hourlyMedia[Number(row.hour)] = Number(row.total_media) || 0
    }

    return response.ok({ domain, hourlyActive, hourlyMedia })
  }
}
