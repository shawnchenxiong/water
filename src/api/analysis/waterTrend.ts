/**
 * 水量趋势分析 API
 */

import { request } from '@/utils/request'
import { generateWaterVolumeTrend, generateHistoryRangeData } from '@/utils/waterTreatmentMockData'
import type {
  TimeType,
  ChartType,
  TrendQueryParams,
  TrendResponse
} from '@/api/types/analysis/waterTrend'
import type { MonitorDataPoint } from '@/api/monitorPointWs'

// ==================== 历史数据接口 ====================

/** 历史数据查询参数 */
export interface HistoryDataParams {
  /** 年份，如 "2026" */
  date: string
  /** 监控点ID（叶子节点 value） */
  pointId: string
  /** 时间区间开始时间，非必传 */
  startTime?: string
  /** 时间区间结束时间，非必传 */
  endTime?: string
}

/**
 * 获取监控点历史数据
 *
 * 接口：GET /api/operation-logs/getData
 * 返回：{ monitorId: "14030", data: { "2026-01-01 00:00:00": 6.0, ... } }
 */
export async function getHistoricalData(params: HistoryDataParams): Promise<MonitorDataPoint[]> {
  const res = await request.get<any>('/api/operation-logs/getData', { params })

  // 兼容响应拦截器返回的不同结构
  const result = res?.result ?? res

  if (!result?.data) {
    console.warn('[waterTrend] 历史数据格式异常:', res)
    return []
  }

  // 1. 如果是数组结构，如 data: [ { time: "2026-03-13", "ATT3": 0.0 } ]
  if (Array.isArray(result.data)) {
    return result.data.map((item: any) => {
      const time = item.time || '';
      let value = 0;
      // 提取除 time 之外的另一个指标字段的值
      for (const key in item) {
        if (key !== 'time' && key !== 'id') { // 规避常用非数值字段
          const val = Number(item[key]);
          if (!isNaN(val)) {
            value = val;
            break;
          }
        }
      }
      return { time, value };
    }).sort((a: any, b: any) => a.time.localeCompare(b.time))
  }

  // 2. 如果是原来的对象结构，如 data: { "2026-01-01": 6.0 }
  if (typeof result.data === 'object') {
    return Object.entries(result.data as Record<string, number>)
      .map(([time, value]) => ({ time, value: Number(value) }))
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  return []
}

/**
 * 获取水量趋势数据
 */
export async function getWaterVolumeTrend(
  params: TrendQueryParams
): Promise<{ code: number; message: string; data: TrendResponse }> {
  if (import.meta.env.VITE_MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const date = new Date(params.date)
    const trendData = generateWaterVolumeTrend(
      params.timeType as 'day' | 'month' | 'year',
      date
    )
    
    const totalVolume = trendData.volume.reduce((a, b) => a + b, 0)
    
    return {
      code: 200,
      message: 'success',
      data: {
        summary: {
          dailyVolume: Number(totalVolume.toFixed(2)),
          updateTime: new Date().toISOString()
        },
        chartData: params.chartType === 'curve' 
          ? { 
              time: trendData.time, 
              inflowRate: trendData.inflowRate, 
              outflowRate: trendData.outflowRate 
            }
          : { 
              time: trendData.time, 
              volume: trendData.volume 
            },
        tableData: trendData.time.map((t, idx) => ({
          stationName: '鹤问湖水质净化厂',
          time: t,
          dailyVolume: trendData.volume[idx],
          inflowRate: trendData.inflowRate[idx],
          outflowRate: trendData.outflowRate[idx],
          hourlyVolume: params.timeType === 'day' ? trendData.volume[idx] : undefined,
          weather: '晴',
          temperature: Number((20 + Math.random() * 10).toFixed(1)),
          windSpeed: Number((5 + Math.random() * 10).toFixed(1))
        }))
      }
    }
  }
  
  return request.get('/api/analysis/water-trend', { params })
}

/**
 * 获取历史范围水量数据
 */
export async function getHistoryRangeData(
  params: TrendQueryParams & { startDate: string; endDate: string }
): Promise<{ code: number; message: string; data: TrendResponse }> {
  if (import.meta.env.VITE_MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const startDate = new Date(params.startDate)
    const endDate = new Date(params.endDate)
    const trendData = generateHistoryRangeData(startDate, endDate)
    
    const totalVolume = trendData.volume.reduce((a, b) => a + b, 0)
    
    return {
      code: 200,
      message: 'success',
      data: {
        summary: {
          dailyVolume: Number(totalVolume.toFixed(2)),
          updateTime: new Date().toISOString()
        },
        chartData: params.chartType === 'curve' 
          ? { 
              time: trendData.time, 
              inflowRate: trendData.inflowRate, 
              outflowRate: trendData.outflowRate 
            }
          : { 
              time: trendData.time, 
              volume: trendData.volume 
            },
        tableData: trendData.time.map((t, idx) => ({
          stationName: '鹤问湖水质净化厂',
          time: t,
          dailyVolume: trendData.volume[idx],
          inflowRate: trendData.inflowRate[idx],
          outflowRate: trendData.outflowRate[idx],
          weather: '晴',
          temperature: Number((20 + Math.random() * 10).toFixed(1)),
          windSpeed: Number((5 + Math.random() * 10).toFixed(1))
        }))
      }
    }
  }
  
  return request.get('/api/analysis/water-trend/history', { params })
}

/**
 * 导出水量趋势数据
 */
export async function exportWaterTrendData(
  params: TrendQueryParams
): Promise<Blob> {
  if (import.meta.env.VITE_MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 生成简单的CSV内容
    const csvContent = [
      '时间,进水流量(m³/h),出水流量(m³/h),处理水量(m³)',
      '2026-03-05 00:00,800.5,784.5,800.5',
      '2026-03-05 01:00,750.2,735.2,750.2',
      '2026-03-05 02:00,720.8,706.4,720.8'
    ].join('\n')
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  }
  
  return request.get('/api/analysis/water-trend/export', {
    params,
    responseType: 'blob'
  })
}
