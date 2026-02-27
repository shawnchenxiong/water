/**
 * 积尘清洗建议类型定义
 */

import type { ApiResponse } from '@/types/api'

/**
 * 获取清洗建议请求参数
 */
export interface GetCleaningAdviceParams {
  stationId: string  // 电站ID
  date: string       // 分析日期 YYYY-MM-DD
}

/**
 * 电站清洗建议信息
 */
export interface StationAdvice {
  dustLossRate: number           // 电站积尘损失率 (%)
  predictedLossRevenue: number   // 预测未来1个月积尘损失收益 (元)
  cleaningCost: number          // 电站清洗成本 (元)
  recommendedDate: string       // 推荐清洗日期
}

/**
 * 积尘损失率统计
 */
export interface DustStatistics {
  level1: {
    count: number      // 积尘损失率≤5%的设备数量
    percentage: number // 百分比
  }
  level2: {
    count: number      // 5%<积尘损失率≤10%的设备数量
    percentage: number // 百分比
  }
  level3: {
    count: number      // 积尘损失率>10%的设备数量
    percentage: number // 百分比
  }
}

/**
 * 积尘趋势数据
 */
export interface TrendData {
  dates: string[]                 // 日期数组
  dustLossRate: number[]         // 电站积尘损失率数据
  dustLossGeneration: number[]   // 电站积尘损失电量数据
  weather: string[]              // 天气状况数组
}

/**
 * 设备积尘明细
 */
export interface DeviceDetail {
  stationName: string           // 电站名称
  deviceName: string           // 设备名称
  installedCapacity: number    // 装机容量 (kWp)
  dailyGeneration: number      // 当日发电量 (kWh)
  equivalentHours: number      // 等价发电量 (h)
  dustLossGeneration: number | null   // 积尘损失电量 (kWh)
  dustLossRate: number | null        // 积尘损失率 (%)
  cleaningAdvice: string | null      // 清洗建议
}

/**
 * 清洗建议响应数据
 */
export interface CleaningAdviceData {
  stationAdvice: StationAdvice     // 电站清洗建议
  dustStatistics: DustStatistics   // 积尘统计
  trendData: TrendData             // 趋势数据
  deviceDetails: DeviceDetail[]    // 设备明细
}

/**
 * 获取清洗建议响应
 */
export interface GetCleaningAdviceResponse extends ApiResponse<CleaningAdviceData> {}

/**
 * 天气预报信息
 */
export interface WeatherForecast {
  date: string        // 日期 (MM-DD)
  weather: string     // 天气描述
  icon: string        // 天气图标
  temperature: string // 温度范围
  humidity?: number   // 湿度 (%)
  windSpeed?: string  // 风速
}

/**
 * 获取天气预报请求参数
 */
export interface GetWeatherForecastParams {
  stationId: string  // 电站ID
  days?: number      // 预报天数，默认7天
}

/**
 * 天气预报响应数据
 */
export interface WeatherForecastData {
  forecast: WeatherForecast[]  // 天气预报数组
}

/**
 * 获取天气预报响应
 */
export interface GetWeatherForecastResponse extends ApiResponse<WeatherForecastData> {}

/**
 * 设备历史趋势查询参数
 */
export interface GetDeviceHistoryTrendParams {
  stationId: string    // 电站ID
  deviceName: string   // 设备名称
  startDate: string    // 开始日期
  endDate: string      // 结束日期
}

/**
 * 设备历史趋势数据
 */
export interface DeviceHistoryTrend {
  dates: string[]                // 日期数组
  dustLossRate: number[]        // 积尘损失率数组
  dustLossGeneration: number[]  // 积尘损失电量数组
  dailyGeneration: number[]     // 日发电量数组
}

/**
 * 设备历史趋势响应
 */
export interface GetDeviceHistoryTrendResponse extends ApiResponse<DeviceHistoryTrend> {}
