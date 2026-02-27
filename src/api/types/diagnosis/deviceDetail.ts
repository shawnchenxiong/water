import type { ApiResponse } from '@/types/api'

/**
 * 设备基础信息
 */
export interface DeviceBasicInfo {
  deviceName: string           // 设备名称
  deviceNumber: string         // 设备编号
  deviceType: string           // 设备类型
  manufacturer: string         // 设备厂家
  uptime: string              // 高级时长
  location: string            // 设备位置
  parentDeviceName: string    // 上级设备名称
  parentDeviceStatus: string  // 上级设备状态
  productType: string         // 产品类型
  apiInfo: string             // 阳光云API
  connectionStatus: string    // 连接状态
}

/**
 * 设备属性信息
 */
export interface DeviceAttribute {
  attributeId: number         // 属性ID
  attributeName: string       // 属性名称
  attributeType: string       // 属性类型
  attributeValue: string      // 属性值
}

/**
 * PV组串信息
 */
export interface PVStringInfo {
  stringId: string           // 组串ID
  stringName: string         // 组串名称
  configStatus: string       // 配置启用状态
  realTimeCurrent: number    // 实时电流(A)
  stringCapacity: number     // 组串容量(Wp)
}

/**
 * 基础信息响应
 */
export interface DeviceBasicInfoResponse extends ApiResponse<{
  deviceInfo: DeviceBasicInfo
  attributes: DeviceAttribute[]
  stringInfo: PVStringInfo[]
}> {}

/**
 * 设备总览数据
 */
export interface DeviceTotalData {
  totalGeneration: number     // 累计发电量(kWh)
  totalActivePower: number    // 总有功功率(kW)
  totalReactivePower: number  // 总无功功率(kVar)
  dailyGeneration: number     // 当日发电量(kWh)
  dailyActivePower: number    // 当日有功功率(kW)
  dailyReactivePower: number  // 当日无功功率(kVar)
  avgGeneration: number       // 平均发电量(kWh)
  avgActivePower: number      // 平均有功功率(kW)
  powerFactor: number         // 功率因数
}

/**
 * 设备状态信息
 */
export interface DeviceStatusInfo {
  deviceCommStatus: string    // 设备通讯状态
  commStatusColor: string     // 通讯状态颜色
  runStatus: string          // 运行状态
  runStatusColor: string     // 运行状态颜色
}

/**
 * PV组串数据
 */
export interface PVData {
  pvId: number               // PV组串ID
  pvVoltage: number          // PV电压(V)
  pvCurrent: number          // PV电流(A)
  pvPower: number            // PV功率(W)
}

/**
 * 系统信息
 */
export interface SystemInfo {
  aPhaseVoltage: number      // A相电压(V)
  bPhaseVoltage: number      // B相电压(V)
  cPhaseVoltage: number      // C相电压(V)
  aPhaseCurrent: number      // A相电流(A)
  bPhaseCurrent: number      // B相电流(A)
  cPhaseCurrent: number      // C相电流(A)
  gridFrequency: number      // 电网频率(Hz)
  inverterTemp: number       // 逆变器内温度(℃)
  workStatus: string         // 工作状态
}

/**
 * 监控信息响应
 */
export interface DeviceMonitorResponse extends ApiResponse<{
  totalData: DeviceTotalData
  statusInfo: DeviceStatusInfo
  pvData: PVData[]
  systemInfo: SystemInfo
}> {}

/**
 * 告警信息
 */
export interface AlarmInfo {
  alarmId: string            // 告警ID
  alarmLevel: string         // 告警等级
  alarmName: string          // 告警名称
  alarmLocation: string      // 告警位置
  alarmDevice: string        // 告警设备
  alarmTime: string          // 告警产生时间
  clearTime?: string         // 告警消除时间
  suggestion: string         // 处理建议
  confirmStatus: string      // 确认状态
  confirmStatusColor: string // 确认状态颜色
}

/**
 * 告警筛选参数
 */
export interface AlarmFilterParams {
  deviceId: string           // 设备ID
  alarmType?: 'realtime' | 'history'  // 告警类型
  alarmLevel?: string        // 告警等级
  confirmStatus?: string     // 确认状态
  startTime?: string         // 开始时间
  endTime?: string           // 结束时间
  page?: number              // 页码
  pageSize?: number          // 每页数量
}

/**
 * 告警响应
 */
export interface DeviceAlarmsResponse extends ApiResponse<{
  alarms: AlarmInfo[]
  pagination: {
    current: number
    pageSize: number
    total: number
    totalPages: number
  }
}> {}

/**
 * 历史数据时间类型
 */
export type HistoryTimeType = 'day' | 'month' | 'year' | 'total' | 'custom'

/**
 * 历史数据参数
 */
export interface HistoryDataParams {
  deviceId: string           // 设备ID
  timeType: HistoryTimeType  // 时间类型
  startDate: string          // 开始日期
  endDate?: string           // 结束日期(自定义时需要)
  dataTypes?: string[]       // 数据类型
  interval?: string          // 数据间隔
}

/**
 * 图表数据系列
 */
export interface ChartSeries {
  name: string               // 系列名称
  data: number[]             // 数据数组
  yAxisIndex: number         // Y轴索引
  color: string              // 颜色
}

/**
 * Y轴配置
 */
export interface ChartYAxis {
  name: string               // Y轴名称
  position: 'left' | 'right' // Y轴位置
}

/**
 * 图表数据
 */
export interface ChartData {
  timeAxis: string[]         // 时间轴
  series: ChartSeries[]      // 数据系列
  yAxis: ChartYAxis[]        // Y轴配置
}

/**
 * 历史数据总结
 */
export interface HistoryDataSummary {
  maxPower: number           // 最大功率(kW)
  totalGeneration: number    // 总发电量(kWh)
  avgEfficiency: number      // 平均效率(%)
}

/**
 * 历史数据响应
 */
export interface DeviceHistoryDataResponse extends ApiResponse<{
  chartData: ChartData
  summary: HistoryDataSummary
}> {}

/**
 * 告警详情基础信息
 */
export interface AlarmDetailInfo {
  alarmId: string            // 告警ID
  stationName: string        // 台架名称
  stationLocation: string    // 影响范围
  alarmSource: string        // 告警来源
  alarmObject: string        // 告警对象
  alarmLevel: string         // 告警等级
  alarmName: string          // 告警名称
  alarmCount: number         // 告警次数
  alarmTime: string          // 告警产生时间
  clearTime?: string         // 告警消除时间
  autoCleared: boolean       // 自动消除
  confirmer?: string         // 确认人
  confirmTime?: string       // 确认时间
  confirmComment?: string    // 确认意见
  deviceType?: string        // 设备类型
  confirmStatus?: string     // 确认状态
  alarmType?: string         // 告警类型
  affectedScope?: string     // 影响范围
  deviceValue?: string       // 设备值
}

/**
 * 告警时段
 */
export interface AlarmPeriod {
  startTime: string          // 开始时间
  endTime: string            // 结束时间
  duration: string           // 持续时间
}

/**
 * 告警设备数据
 */
export interface AlarmDeviceData {
  timeAxis: string[]         // 时间轴
  series: ChartSeries[]      // 数据系列
  alarmPeriod: AlarmPeriod   // 告警时段
}

/**
 * 告警详情响应
 */
export interface AlarmDetailResponse extends ApiResponse<{
  alarmInfo: AlarmDetailInfo
  deviceData: AlarmDeviceData
  possibleCauses: string[]   // 可能原因
  suggestions: string[]      // 处理建议
}> {}

/**
 * 告警处理请求
 */
export interface AlarmHandleRequest {
  action: 'confirm' | 'reply' | 'create_workorder'  // 操作类型
  comment: string            // 处理意见
  handler: string            // 处理人
  workOrderInfo?: {          // 工单信息(转工单时需要)
    title: string
    priority: string
    assignee: string
  }
}

/**
 * 告警处理响应
 */
export interface AlarmHandleResponse extends ApiResponse<{
  alarmId: string
  newStatus: string
  workOrderId?: string       // 工单ID(如果转工单)
}> {}

/**
 * Tab页面类型
 */
export type DeviceDetailTab = 'basic' | 'monitor' | 'realtime_alarm' | 'history_alarm' | 'history_data'

/**
 * 设备详情弹窗Props
 */
export interface DeviceDetailDialogProps {
  visible: boolean           // 是否显示
  deviceId: string          // 设备ID
  deviceName?: string       // 设备名称(可选，用于显示)
  initialTab?: DeviceDetailTab  // 初始Tab页
}
