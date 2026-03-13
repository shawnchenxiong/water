/**
 * 水量趋势分析相关类型定义
 */

export type TimeType = 'day' | 'month' | 'year' | 'total'
export type ChartType = 'curve' | 'volume'

/**
 * 统计摘要数据
 */
export interface SummaryData {
  dailyVolume: number      // 处理水量 m³
  dailyHours?: number      // 可选，净水厂不需要等效小时
  updateTime: string
}

/**
 * 曲线图表数据（流量曲线）
 */
export interface CurveChartData {
  time: string[]
  inflowRate: number[]     // 进水流量 m³/h
  outflowRate: number[]    // 出水流量 m³/h
}

/**
 * 柱状图表数据（分时水量）
 */
export interface VolumeChartData {
  time: string[]
  volume: number[]         // 处理水量 m³
}

export type ChartData = CurveChartData | VolumeChartData

/**
 * 表格行数据
 */
export interface TableRow {
  stationName: string      // 工艺段名称
  time: string             // 时间
  dailyVolume: number      // 累计水量 m³
  inflowRate: number       // 进水流量 m³/h
  outflowRate: number      // 出水流量 m³/h
  hourlyVolume?: number    // 小时水量 m³
  weather: string          // 天气
  temperature: number      // 温度 ℃
  windSpeed: number        // 风速 km/h
}

/**
 * API请求参数
 */
export interface TrendQueryParams {
  stationIds: string[]
  timeType: TimeType
  date: string
  chartType: ChartType
}

/**
 * API响应数据
 */
export interface TrendResponse {
  summary: SummaryData
  chartData: ChartData
  tableData: TableRow[]
}
