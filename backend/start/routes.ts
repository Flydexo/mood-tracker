import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', () => {
  return { status: 'ok', service: 'mood-tracker-api' }
})

router
  .group(() => {
    router.post('/mood-logs/batch', [controllers.MoodLogs, 'batch'])
    router.post('/website-visits/batch', [controllers.WebsiteVisits, 'batch'])

    router.get('/stats/summary', [controllers.Stats, 'summary'])
    router.get('/stats/hourly', [controllers.Stats, 'hourly'])
    router.get('/stats/domain/:domain', [controllers.Stats, 'domain'])
  })
  .prefix('/api')
  .use(middleware.apiKey())
