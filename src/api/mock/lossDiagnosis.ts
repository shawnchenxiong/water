/**
 * 损失诊断Mock数据
 */

import type {
  LossDiagnosisData,
  LossDiagnosisExportResponse,
  WeatherData
} from '@/api/types/diagnosis/lossDiagnosis'

/**
 * 生成随机发电量数据
 */
function generateActualGeneration(seed: number, index: number): number {
  const base = 15000
  const variance = 10000
  return Math.floor(base + Math.sin(seed + index) * variance + Math.random() * 3000)
}

/**
 * 生成天气数据
 */
function generateWeather(index: number): string {
  const weatherTypes = ['sunny', 'cloudy', 'rainy']
  const weights = [0.6, 0.3, 0.1] // 晴天60%, 多云30%, 雨天10%
  
  const random = Math.random()
  if (random < weights[0]) return 'sunny'
  if (random < weights[0] + weights[1]) return 'cloudy'
  return 'rainy'
}

/**
 * 根据stationId生成损失诊断数据
 */
export function generateMockLossDiagnosisData(stationId: string, month: string): LossDiagnosisData {
  const seed = stationId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  // 获取该月的天数
  const year = parseInt(month.split('-')[0])
  const monthNum = parseInt(month.split('-')[1])
  const daysInMonth = new Date(year, monthNum, 0).getDate()
  
  // 生成日期数组
  const dates = Array.from({ length: daysInMonth }, (_, i) => 
    `${month}-${String(i + 1).padStart(2, '0')}`
  )
  
  // 生成实际发电量数据
  const actualGeneration = dates.map((_, i) => generateActualGeneration(seed, i))
  
  // 生成理论损失数据（部分为0，部分有损失）
  const theoreticalLoss = dates.map((_, i) => {
    // 有20%的天数有损失
    if (Math.random() < 0.2) {
      return Math.floor(actualGeneration[i] * 0.05) // 损失5%
    }
    return 0
  })
  
  // 计算损失百分比
  const lossPercentage = dates.map((_, i) => {
    const theoretical = actualGeneration[i] + theoreticalLoss[i]
    return theoretical > 0 ? Math.round((theoreticalLoss[i] / theoretical) * 100 * 100) / 100 : 0
  })
  
  // 生成天气数据
  const weather = dates.map((_, i) => generateWeather(i))
  
  // 生成表格数据
  const tableData = dates.map((date, i) => ({
    date,
    stationName: '芜湖城南污水厂', // 可以根据stationId动态生成
    location: '安徽省 芜湖市 弋江区',
    capacity: 5919.34,
    theoreticalGeneration: theoreticalLoss[i] > 0 ? actualGeneration[i] + theoreticalLoss[i] : null,
    actualGeneration: actualGeneration[i],
    lossGeneration: theoreticalLoss[i] > 0 ? theoreticalLoss[i] : null,
    lossPercentage: lossPercentage[i] > 0 ? lossPercentage[i] : null
  }))
  
  // 计算统计摘要
  const totalActualGeneration = actualGeneration.reduce((sum, val) => sum + val, 0)
  const totalLoss = theoreticalLoss.reduce((sum, val) => sum + val, 0)
  const totalTheoreticalGeneration = totalActualGeneration + totalLoss
  const averageLossPercentage = totalTheoreticalGeneration > 0 
    ? Math.round((totalLoss / totalTheoreticalGeneration) * 100 * 100) / 100 
    : 0
  
  return {
    chartData: {
      dates,
      actualGeneration,
      theoreticalLoss,
      lossPercentage,
      weather
    },
    tableData,
    summary: {
      totalActualGeneration: Math.round(totalActualGeneration * 100) / 100,
      totalTheoreticalGeneration: Math.round(totalTheoreticalGeneration * 100) / 100,
      totalLoss: Math.round(totalLoss * 100) / 100,
      averageLossPercentage
    }
  }
}

/**
 * Mock导出响应
 */
export const mockLossDiagnosisExport: LossDiagnosisExportResponse = {
  downloadUrl: 'https://example.com/reports/loss-diagnosis-202510.xlsx',
  fileName: '损失诊断报告-202510.xlsx'
}

/**
 * Mock天气数据
 */
export function generateMockWeatherData(
  stationId: string, 
  startDate: string, 
  endDate: string
): WeatherData[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    
    return {
      date: dateStr,
      weather: generateWeather(i),
      temperature: Math.floor(15 + Math.random() * 15), // 15-30度
      humidity: Math.floor(40 + Math.random() * 40), // 40-80%
      radiation: Math.round((600 + Math.random() * 400) * 100) / 100 // 600-1000 W/m²
    }
  })
}

