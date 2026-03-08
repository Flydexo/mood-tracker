import type { HttpContext } from '@adonisjs/core/http'

export default class StatsController {
  async summary({ response }: HttpContext) {
    return response.ok({ message: 'stub' })
  }

  async hourly({ response }: HttpContext) {
    return response.ok({ message: 'stub' })
  }

  async domain({ response }: HttpContext) {
    return response.ok({ message: 'stub' })
  }
}
