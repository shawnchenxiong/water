/**
 * 损失诊断类型定义
 */

/**
 * 图表数据
 */
export interface LossDiagnosisChartData {
  /** 日期数组 */
  dates: string[]
  /** 实际发电量数组 (kWh) */
  actualGeneration: number[]
  /** 理论损失电量数组 (kWh) */
  theoreticalLoss: number[]
  /** 损失百分比数组 (%) */
  lossPercentage: number[]
  /** 天气状况数组 */
  weather: string[]
}

/**
 * 表格数据项
 */
export interface LossDiagnosisTableData {
  /** 统计日期 */
  date: string
  /** 电站名称 */
  stationName: string
  /** 所在地区 */
  location: string
  /** 电站容量 (kWp) */
  capacity: number
  /** 标准辐照度测算发电量 (kWh) */
  theoreticalGeneration: number | null
  /** 实际发电量 (kWh) */
  actualGeneration: number
  /** 测算损失电量 (kWh) */
  lossGeneration: number | null
  /** 测算损失百分比 (%) */
  lossPercentage: number | null
}

/**
 * 损失诊断统计摘要
 */
export interface LossDiagnosisSummary {
  /** 总实际发电量 (kWh) */
  totalActualGeneration: number
  /** 总理论发电量 (kWh) */
  totalTheoreticalGeneration: number
  /** 总损失电量 (kWh) */
  totalLoss: number
  /** 平均损失百分比 (%) */
  averageLossPercentage: number
}

/**
 * 损失诊断数据响应
 */
export interface LossDiagnosisData {
  /** 图表数据 */
  chartData: LossDiagnosisChartData
  /** 表格数据 */
  tableData: LossDiagnosisTableData[]
  /** 统计摘要 */
  summary: LossDiagnosisSummary
}

/**
 * 天气数据项
 */
export interface WeatherData {
  /** 日期 */
  date: string
  /** 天气状况 */
  weather: string
  /** 温度 */
  temperature: number
  /** 湿度 (%) */
  humidity: number
  /** 辐照度 (W/m²) */
  radiation: number
}

/**
 * 损失诊断查询参数
 */
export interface LossDiagnosisQueryParams {
  /** 电站ID */
  stationId: string
  /** 查询月份 (格式: YYYY-MM) */
  month: string
}

/**
 * 导出请求参数
 */
export interface LossDiagnosisExportRequest {
  /** 电站ID */
  stationId: string
  /** 查询月份 (格式: YYYY-MM) */
  month: string
  /** 导出类型 */
  exportType: 'excel' | 'csv'
}

/**
 * 导出响应
 */
export interface LossDiagnosisExportResponse {
  /** 下载链接 */
  downloadUrl: string
  /** 文件名 */
  fileName: string
}

