// 时间粒度
export type TimeGranularity = 'week' | 'month' | 'year' // 近7天/月/年

// 告警趋势数据
export interface AlarmTrendData {
  confirmAlarmSum: number
  confirmAlarmList: number[]
  timeList: string[]
  newAlarmList: number[]
  falseAlarmSum: number
  alarmSum: number
  accuracy: string
}

// 设备告警排名项
export interface AlarmRankItem {
  deviceType: string
  regionId: string
  alarmcount: number
  deviceId: string
  deviceName: string
}

// API请求参数
export interface AlarmQueryParams {
  regionId: string
  dateType: number // 0/4-近7天、1-月、2-年
  dateTime?: string
}

// API响应
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

