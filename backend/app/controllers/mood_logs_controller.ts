import type { HttpContext } from '@adonisjs/core/http'

export default class MoodLogsController {
  async batch({ response }: HttpContext) {
    return response.ok({ message: 'stub' })
  }
}
