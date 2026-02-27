// 操作日志记录（历史告警）
export interface OperationLogItem {
  id?: number // 告警ID
  deviceId?: string // 设备ID（如果API返回）
  deviceType: string
  isConfirm: number // 0-未确认, 1-已确认, 2-已消除
  level: string // "1" | "2" | "3" - 告警等级
  factoryName: string
  time: string // 格式: "2025-04-01 14:22:17"
  eliminationTime?: string | null // 告警消除时间
  suggest: string
  deviceName: string
  content: string
}

// 实时数据点（包含告警状态）
export interface RealDataPoint {
  isAlarm: number // 0-正常, 1-告警
  time: string // 时间 "2025-11-19 08:00:04.68"
  value: number // 数值
}

// 告警详情响应数据
export interface AlarmDetailData {
  deviceId: number // 设备ID
  deviceName: string // 告警设备
  content: string // 告警内容
  impactRange: string // 影响范围
  source: string // 告警来源
  position: string // 告警位置
  operationalInformation: string // 告警对象
  alarmValues: string // 告警值
  time: string // 产生时间
  eliminationTime: string // 消除时间
  isConfirm: number // 确认状态 (0-未确认, 1-已确认, 2-已消除)
  confirmUser: string // 确认人
  isReport: number // 告警误报 (0-否, 1-是)
  confirmOpinions: string // 确认意见
  reason: string // 可能原因
  suggest: string // 处理建议
  realList: Record<string, RealDataPoint[]> // 设备实时数据，key为参数名，value为数据点数组
}

// 告警详情响应
export interface AlarmDetailResponse {
  success: boolean
  message: string
  code: number
  result: AlarmDetailData
  timestamp: number
}

// 消除告警请求参数
export interface EliminateAlarmRequest {
  id: number
}

// 确认告警请求参数
export interface ConfirmAlarmRequest {
  id: number
  confirmOpinions: string
}

// 历史告警查询参数
export interface HistoryAlarmQueryParams {
  pageNum: number
  pageSize: number
  startTime?: string // 格式: "2025-04-01 00:00:00"（可选）
  endTime?: string // 格式: "2025-04-30 23:59:59"（可选）
  eliminationStartTime?: string // 消除开始时间（可选）
  eliminationEndTime?: string // 消除结束时间（可选）
  factoryId?: number
  alarmLevel?: string
  deviceType?: string
  confirmStatus?: string
  deviceName?: string
  alarmName?: string
  isReal?: number
}

// 历史告警API响应
export interface HistoryAlarmResponse {
  success: boolean
  message: string
  code: number
  result: {
    total: number
    data: OperationLogItem[]
  }
  timestamp: number
}

// 设备告警项（用于设备详情弹窗）
export interface DeviceAlarmItem {
  id?: number // 告警ID（可选，用于详情查询）
  level: string // "1" | "2" | "3" - 告警等级
  content: string // 告警内容
  position: string // 位置
  deviceName: string | null // 设备名称（可能为null）
  time: string // 时间
  eliminationTime: string | null // 消除时间（可能为null）
  suggest: string // 建议
  isConfirm: number // 确认状态 0-未确认, 1-已确认
}

// 设备告警查询参数
export interface DeviceAlarmQueryParams {
  deviceId: string // 设备ID（必传）
  page: number // 页码
  pageSize: number // 每页数量
  startTime?: string // 开始时间（可选）
  endTime?: string // 结束时间（可选）
  eliminationStartTime?: string // 消除开始时间（可选）
  eliminationEndTime?: string // 消除结束时间（可选）
  isConfirm?: number // 确认状态（可选）0-未确认, 1-已确认
  level?: string // 告警级别（可选）"1" | "2" | "3"
  isReal?: number // 是否实时告警（可选）0-历史告警, 1-实时告警
}

// 设备告警响应
export interface DeviceAlarmResponse {
  success: boolean
  message: string
  code: number
  result: {
    total: number
    data: DeviceAlarmItem[]
  }
  timestamp: number
}

// 设备基础信息
export interface DeviceBasicInfo {
  deviceName: string // 设备名称
  deviceCode: string // 设备编码
  sn: string // 序列号
  deviceType: string // 设备类型
  offlineTime: string // 离线时间
  offlineDuration: string // 离线时长
  deviceLocation: string // 设备位置
  connectionStatus: number // 连接状态 0-离线 1-在线
}

// 设备基础信息响应
export interface DeviceBasicInfoResponse {
  success: boolean
  message: string
  code: number
  result: DeviceBasicInfo
  timestamp: number
}

// 监控信息项
export interface MonitoringInfoItem {
  name: string // 监控项名称
  value: string // 监控项值
}

// 监控信息响应
export interface MonitoringInfoResponse {
  success: boolean
  message: string
  code: number
  result: MonitoringInfoItem[]
  timestamp: number
}

// 历史数据参数选项
export interface HistoryDataParameter {
  name: string // 参数名称
  value: string // 参数ID（用于查询）
}

// 历史数据参数选择响应
export interface HistoryDataParameterResponse {
  success: boolean
  message: string
  code: number
  result: HistoryDataParameter[]
  timestamp: number
}

// 历史数据项
export interface HistoryDataItem {
  [key: string]: number | string // 动态字段：参数名 -> 数值，time -> 时间字符串
  time: string // 时间 "2025-11-12 10:15:19"
}

// 历史数据查询参数
export interface HistoryDataQueryParams {
  deviceId: string // 设备ID
  startDate: string // 开始时间 ISO格式 "2025-11-12T02:15:18.426Z"
  endDate: string // 结束时间 ISO格式 "2025-11-19T02:15:18.426Z"
  parameters: string // 参数ID列表，逗号分隔 "11746,11747"
}

// 历史数据响应
export interface HistoryDataResponse {
  success: boolean
  message: string
  code: number
  result: HistoryDataItem[]
  timestamp: number
}

