/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  moodLogs: {
    batch: typeof routes['mood_logs.batch']
  }
  websiteVisits: {
    batch: typeof routes['website_visits.batch']
  }
  stats: {
    summary: typeof routes['stats.summary']
    hourly: typeof routes['stats.hourly']
    domain: typeof routes['stats.domain']
  }
}
