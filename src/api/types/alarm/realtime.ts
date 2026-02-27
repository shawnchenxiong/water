// 告警等级
export type AlarmLevel = 'severe' | 'warning' | 'normal' | 'info'

// 确认状态
export type ConfirmStatus = 'unconfirmed' | 'confirmed' | 'cleared'

// 聚合类型
export type CollectType = 0 | 1 | 2 // 0-不聚合 1-按设备 2-按告警名称

// 告警记录 - 使用原始 API 字段名
export interface AlarmRecord {
  id: string
  deviceId?: string
  level: number // 1-一般, 2-重要, 3-紧急
  content: string // 告警内容
  factoryName: string // 厂站名称
  deviceName: string
  deviceType: string
  time: string // 告警产生时间
  eliminationTime?: string | null // 告警消除时间
  suggest: string // 处理建议
  isConfirm: number // 0-未确认, 1-已确认, 2-已消除
}

// 查询参数
export interface AlarmQueryParams {
  collectType: CollectType
  type: 'real' | 'history'
  beginTime: string
  endTime: string
  regionId: string
  pageNum: number
  pageSize: number
  alarmLevel?: string
  deviceType?: string
  confirmStatus?: string
  deviceName?: string
  alarmName?: string
}

// API响应
export interface AlarmListResponse {
  code: number
  message: string
  data: {
    list: AlarmRecord[]
    total: number
  }
}
