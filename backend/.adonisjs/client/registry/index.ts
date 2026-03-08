/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'mood_logs.batch': {
    methods: ["POST"],
    pattern: '/api/mood-logs/batch',
    tokens: [{"old":"/api/mood-logs/batch","type":0,"val":"api","end":""},{"old":"/api/mood-logs/batch","type":0,"val":"mood-logs","end":""},{"old":"/api/mood-logs/batch","type":0,"val":"batch","end":""}],
    types: placeholder as Registry['mood_logs.batch']['types'],
  },
  'website_visits.batch': {
    methods: ["POST"],
    pattern: '/api/website-visits/batch',
    tokens: [{"old":"/api/website-visits/batch","type":0,"val":"api","end":""},{"old":"/api/website-visits/batch","type":0,"val":"website-visits","end":""},{"old":"/api/website-visits/batch","type":0,"val":"batch","end":""}],
    types: placeholder as Registry['website_visits.batch']['types'],
  },
  'stats.summary': {
    methods: ["GET","HEAD"],
    pattern: '/api/stats/summary',
    tokens: [{"old":"/api/stats/summary","type":0,"val":"api","end":""},{"old":"/api/stats/summary","type":0,"val":"stats","end":""},{"old":"/api/stats/summary","type":0,"val":"summary","end":""}],
    types: placeholder as Registry['stats.summary']['types'],
  },
  'stats.hourly': {
    methods: ["GET","HEAD"],
    pattern: '/api/stats/hourly',
    tokens: [{"old":"/api/stats/hourly","type":0,"val":"api","end":""},{"old":"/api/stats/hourly","type":0,"val":"stats","end":""},{"old":"/api/stats/hourly","type":0,"val":"hourly","end":""}],
    types: placeholder as Registry['stats.hourly']['types'],
  },
  'stats.domain': {
    methods: ["GET","HEAD"],
    pattern: '/api/stats/domain/:domain',
    tokens: [{"old":"/api/stats/domain/:domain","type":0,"val":"api","end":""},{"old":"/api/stats/domain/:domain","type":0,"val":"stats","end":""},{"old":"/api/stats/domain/:domain","type":0,"val":"domain","end":""},{"old":"/api/stats/domain/:domain","type":1,"val":"domain","end":""}],
    types: placeholder as Registry['stats.domain']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
