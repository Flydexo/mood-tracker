import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'

export default class ApiKeyMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const authHeader = request.header('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.unauthorized({ error: 'Missing API key' })
    }

    const providedKey = authHeader.slice(7)
    const validKey = env.get('API_KEY')

    if (providedKey !== validKey) {
      return response.unauthorized({ error: 'Invalid API key' })
    }

    await next()
  }
}
