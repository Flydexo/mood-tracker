import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'mood_logs.batch': { paramsTuple?: []; params?: {} }
    'website_visits.batch': { paramsTuple?: []; params?: {} }
    'stats.summary': { paramsTuple?: []; params?: {} }
    'stats.hourly': { paramsTuple?: []; params?: {} }
    'stats.domain': { paramsTuple: [ParamValue]; params: {'domain': ParamValue} }
  }
  GET: {
    'stats.summary': { paramsTuple?: []; params?: {} }
    'stats.hourly': { paramsTuple?: []; params?: {} }
    'stats.domain': { paramsTuple: [ParamValue]; params: {'domain': ParamValue} }
  }
  HEAD: {
    'stats.summary': { paramsTuple?: []; params?: {} }
    'stats.hourly': { paramsTuple?: []; params?: {} }
    'stats.domain': { paramsTuple: [ParamValue]; params: {'domain': ParamValue} }
  }
  POST: {
    'mood_logs.batch': { paramsTuple?: []; params?: {} }
    'website_visits.batch': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}