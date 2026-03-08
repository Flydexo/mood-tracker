import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const MoodLogsController = () => import('#controllers/mood_logs_controller')
const WebsiteVisitsController = () => import('#controllers/website_visits_controller')
const StatsController = () => import('#controllers/stats_controller')

router.get('/', () => {
  return { status: 'ok', service: 'mood-tracker-api' }
})

router
  .group(() => {
    router.post('/mood-logs/batch', [MoodLogsController, 'batch'])
    router.post('/website-visits/batch', [WebsiteVisitsController, 'batch'])

    router.get('/stats/summary', [StatsController, 'summary'])
    router.get('/stats/hourly', [StatsController, 'hourly'])
    router.get('/stats/domain/:domain', [StatsController, 'domain'])
  })
  .prefix('/api')
  .use(middleware.apiKey())
