/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'mood_logs.batch': {
    methods: ["POST"]
    pattern: '/api/mood-logs/batch'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mood_logs_controller').default['batch']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mood_logs_controller').default['batch']>>>
    }
  }
  'website_visits.batch': {
    methods: ["POST"]
    pattern: '/api/website-visits/batch'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/website_visits_controller').default['batch']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/website_visits_controller').default['batch']>>>
    }
  }
  'stats.summary': {
    methods: ["GET","HEAD"]
    pattern: '/api/stats/summary'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stats_controller').default['summary']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stats_controller').default['summary']>>>
    }
  }
  'stats.hourly': {
    methods: ["GET","HEAD"]
    pattern: '/api/stats/hourly'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stats_controller').default['hourly']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stats_controller').default['hourly']>>>
    }
  }
  'stats.domain': {
    methods: ["GET","HEAD"]
    pattern: '/api/stats/domain/:domain'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { domain: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stats_controller').default['domain']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stats_controller').default['domain']>>>
    }
  }
}
