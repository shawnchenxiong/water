import type {
  ESStationReportRecord,
  StatisticsReportBasicData,
  ReportType,
  StatisticsReportQueryParams
} from '@/api/types/statistics-report'

/**
 * 生成模拟储能电站报表数据
 */
export const mockESStationReports = (reportType: ReportType): ESStationReportRecord[] => {
  const stations = [
    { name: '清源储能电站', location: '安徽省 芜湖市' },
    { name: '华能储能电站', location: '江苏省 南京市' },
    { name: '国网储能电站', location: '浙江省 杭州市' },
    { name: '中电投储能电站', location: '山东省 济南市' },
    { name: '大唐储能电站', location: '河北省 石家庄市' }
  ]

  return Array.from({ length: 15 }, (_, i) => {
    const station = stations[i % stations.length]
    const baseDate = new Date('2025-11-01')
    
    // 根据报表类型生成不同的日期格式
    let reportDate = ''
    switch (reportType) {
      case 'daily':
        baseDate.setDate(baseDate.getDate() - i)
        reportDate = baseDate.toISOString().split('T')[0]
        break
      case 'weekly':
        baseDate.setDate(baseDate.getDate() - i * 7)
        reportDate = baseDate.toISOString().split('T')[0]
        break
      case 'monthly':
        baseDate.setMonth(baseDate.getMonth() - i)
        reportDate = baseDate.toISOString().split('T')[0].substring(0, 7)
        break
      case 'yearly':
        baseDate.setFullYear(baseDate.getFullYear() - i)
        reportDate = String(baseDate.getFullYear())
        break
    }

    // 生成随机数据
    const installedPower = (200 + Math.random() * 100).toFixed(2)
    const installedEnergy = (1000 + Math.random() * 500).toFixed(2)
    const stationSOH = (85 + Math.random() * 15).toFixed(2)
    const dailyCharge = (500 + Math.random() * 300).toFixed(2)
    const dailyDischarge = (450 + Math.random() * 250).toFixed(2)

    return {
      reportDate,
      stationName: station.name,
      location: station.location,
      installedPower,
      installedEnergy,
      stationSOH,
      dailyCharge,
      dailyDischarge
    }
  })
}

/**
 * 生成统计报表基础数据
 */
export const mockStatisticsReportBasicData = (): StatisticsReportBasicData => {
  return {
    stations: [
      { label: '智能运维平台', value: 'all' },
      { label: '清源储能电站', value: 'qingyuan' },
      { label: '华能储能电站', value: 'huaneng' },
      { label: '国网储能电站', value: 'guowang' },
      { label: '中电投储能电站', value: 'cpi' },
      { label: '大唐储能电站', value: 'datang' }
    ]
  }
}

/**
 * 筛选统计报表数据
 */
export const filterStatisticsReports = (
  data: ESStationReportRecord[],
  filters: {
    stationId?: string
    reportTime?: string
  }
): ESStationReportRecord[] => {
  return data.filter(item => {
    // 电站筛选
    if (filters.stationId && filters.stationId !== 'all') {
      const stationKeywords = {
        'qingyuan': '清源',
        'huaneng': '华能', 
        'guowang': '国网',
        'cpi': '中电投',
        'datang': '大唐'
      }
      
      const keyword = stationKeywords[filters.stationId as keyof typeof stationKeywords]
      if (keyword && !item.stationName.includes(keyword)) {
        return false
      }
    }

    // 时间筛选
    if (filters.reportTime) {
      if (!item.reportDate.includes(filters.reportTime)) {
        return false
      }
    }

    return true
  })
}
