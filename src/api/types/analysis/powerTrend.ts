/**
 * 发电趋势分析 - 类型定义
 */

// 时间粒度类型
export type TimeType = 'day' | 'month' | 'year' | 'total'

// 图表类型
export type ChartType = 'curve' | 'power'

// 树节点类型
export type TreeNodeType = 'group' | 'station'

// 电站树节点
export interface TreeNode {
  id: string
  label: string
  type: TreeNodeType
  children?: TreeNode[]
}

// 统计信息
export interface SummaryData {
  dailyEnergy: number // 发电量 (kWh)
  dailyHours: number // 等效小时 (h)
  updateTime: string // 更新时间
}

// 发电曲线图表数据
export interface CurveChartData {
  time: string[] // 时间点数组
  power: number[] // 发电功率数组 (kW)
  radiation: number[] // 瞬时辐照数组 (W/m²)
}

// 分时电量图表数据
export interface PowerChartData {
  time: string[] // 时间段数组
  energy: number[] // 分时电量数组 (kWh)
}

// 图表数据（联合类型）
export type ChartData = CurveChartData | PowerChartData

// 表格行数据（根据图表类型不同，字段不同）
export interface TableRow {
  stationName: string // 电站名称
  time: string // 时间
  dailyEnergy?: number // 当日发电量 (kWh) - 仅 type=1
  power?: number // 发电功率 (kW) - 仅 type=1
  radiation?: string | number // 瞬时辐照 (W/m²) - 仅 type=1
  hourlyEnergy?: number // 小时发电量 (kWh) - 仅 type=2
  weather: string // 电站天气
  temperature: string | number // 温度 (°C)
  windSpeed: string | number // 风速 (km/h)
}

// API请求参数
export interface GetTrendDataParams {
  stationIds: string[] // 电站ID数组
  timeType: TimeType // 时间类型
  date: string // 日期
  chartType: ChartType // 图表类型
}

// API响应数据
export interface GetTrendDataResponse {
  summary: SummaryData
  chartData: ChartData
  tableData: TableRow[]
}

// 页面状态
export interface PowerTrendState {
  // 电站树
  treeData: TreeNode[]
  selectedStations: string[]
  treeSearchKeyword: string

  // 控制参数
  timeType: TimeType
  selectedDate: Date | string
  chartType: ChartType

  // 数据
  summary: SummaryData
  chartData: ChartData
  tableData: TableRow[]

  // UI状态
  loading: boolean
  chartLoading: boolean
}

