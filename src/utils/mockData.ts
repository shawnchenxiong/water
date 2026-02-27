// 模拟数据生成工具

import type { StationData, StationStats } from '@/types/station'

// 生成随机数
const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 生成随机浮点数
const randomFloat = (min: number, max: number, decimals: number = 2) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

// 生成时间数组（5分钟间隔，全天288个点）
const generateTimeArray = () => {
  const times: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      times.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
    }
  }
  return times
}

// 生成功率趋势数据（模拟真实波动）
const generatePowerTrend = (maxPower: number) => {
  const timeList = generateTimeArray()
  const powerGenerationList: (number | string)[] = []
  const irradiationList: (number | string)[] = []
  
  // 总共288个点（24小时 * 12个点/小时）
  for (let i = 0; i < timeList.length; i++) {
    // 将索引转换为小时（带小数）
    const hourFloat = i / 12 // 每12个点是1小时
    
    // 模拟日出日落的功率曲线
    let powerValue: number | string = '-'
    let irradiationValue: number | string = '-'
    
    if (hourFloat >= 6 && hourFloat <= 18) {
      // 6:00-18:00 有发电
      const hour = hourFloat - 12
      
      // 基础功率曲线（高斯分布）
      const basePower = maxPower * Math.exp(-(hour * hour) / 20)
      
      // 添加随机波动（±15%）和云层影响
      const cloudFactor = Math.random() < 0.3 ? randomFloat(0.5, 0.8) : randomFloat(0.85, 1.15)
      const fluctuation = randomFloat(0.85, 1.15)
      
      powerValue = parseFloat((basePower * cloudFactor * fluctuation).toFixed(2))
      
      // 辐射数据与功率相关，但有独立的波动
      // 辐射范围：20-340 W/m²
      const baseIrradiation = (powerValue / maxPower) * 300
      irradiationValue = parseFloat((baseIrradiation * randomFloat(0.7, 1.3)).toFixed(2))
      
      // 限制辐射范围
      if (typeof irradiationValue === 'number') {
        irradiationValue = Math.max(20, Math.min(340, irradiationValue))
        irradiationValue = parseFloat(irradiationValue.toFixed(2))
      }
    }
    
    powerGenerationList.push(powerValue)
    irradiationList.push(irradiationValue)
  }
  
  return { timeList, powerGenerationList, irradiationList }
}

// 电站名称列表
const stationNames = [
  '亳州利辛县经开区污水厂',
  '亳州利辛县城污水厂',
  '六安凤凰桥二期污水厂',
  '六安东部新城污水厂',
  '六安凤凰桥一期污水厂',
  '六安河西污水厂',
  '六安东城污水厂',
  '芜湖城南污水厂',
  '芜湖大龙湾污水厂',
  '岳阳临港污水厂',
  '岳阳东风湖污水厂',
  '九江八里湖污水厂',
  '九江城西污水厂',
  '合肥王小郢污水厂',
  '合肥南淝河污水厂',
  '马鞍山慈湖污水厂',
  '马鞍山采石污水厂',
  '铜陵狮子山污水厂',
  '铜陵西湖污水厂',
  '安庆石化污水厂',
  '安庆城东污水厂',
  '黄山屯溪污水厂',
  '黄山徽州污水厂',
  '宣城宛陵污水厂',
]

// 生成单个电站数据（匹配真实API结构）
export const generateStationData = (index: number): StationData => {
  const capacity = randomFloat(500, 6000, 2)
  const commStatusList = ['normal', 'partial_offline', 'all_offline', 'connecting'] as const
  const commStatus = commStatusList[random(0, 3)]
  const alarmStatus = random(0, 10) > 7 ? 'has_alarm' : 'none'
  
  const dailyEnergy = randomFloat(50, 1500, 2)
  const dailyHours = randomFloat(0.05, 1.5, 2)
  const realPower = randomFloat(10, capacity * 0.8, 2)
  const powerNormalized = random(1, 100)
  const monthElectric = randomFloat(1000, 20000, 2)
  
  const totalDevices = random(5, 50)
  const offlineDevices = commStatus === 'all_offline' ? totalDevices : 
                         commStatus === 'partial_offline' ? random(1, totalDevices - 1) : 0
  
  const powerTrendData = generatePowerTrend(realPower)
  
  // 当前时间
  const now = new Date()
  const createdate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  
  // 转换数据格式用于兼容
  const powerArray = powerTrendData.powerGenerationList.map(v => 
    typeof v === 'number' ? v : 0
  )
  const radiationArray = powerTrendData.irradiationList.map(v => 
    typeof v === 'number' ? v : 0
  )
  
  return {
    // 真实API字段
    regionName: stationNames[index % stationNames.length],
    monthElectric: monthElectric.toFixed(2),
    nowTemp: String(random(10, 30)),
    createdate,
    alarmData: {
      list: [],
      total: alarmStatus === 'has_alarm' ? random(1, 5) : 0
    },
    curveData: {
      timeList: powerTrendData.timeList,
      powerGenerationList: powerTrendData.powerGenerationList,
      irradiationList: powerTrendData.irradiationList,
      isShowIrradiation: '1'
    },
    
    // 兼容旧代码的字段
    id: `station_${index}`,
    name: stationNames[index % stationNames.length],
    capacity,
    commStatus,
    alarmStatus,
    dailyEnergy,
    dailyHours,
    realPower,
    powerNormalized,
    powerSource: '逆变器',
    deviceCount: {
      total: totalDevices,
      offline: offlineDevices,
    },
    latestAlarm: alarmStatus === 'has_alarm' ? '设备通讯中断' : undefined,
    powerTrend: {
      time: powerTrendData.timeList,
      power: powerArray,
      radiation: radiationArray
    },
  }
}

// 生成电站列表
export const generateStationList = (count: number = 24): StationData[] => {
  const stations: StationData[] = []
  for (let i = 0; i < count; i++) {
    stations.push(generateStationData(i))
  }
  return stations
}

// 计算统计数据
export const calculateStationStats = (stations: StationData[]): StationStats => {
  return {
    total: stations.length,
    commNormal: stations.filter(s => s.commStatus === 'normal').length,
    allOffline: stations.filter(s => s.commStatus === 'all_offline').length,
    partialOffline: stations.filter(s => s.commStatus === 'partial_offline').length,
    connecting: stations.filter(s => s.commStatus === 'connecting').length,
    noAlarm: stations.filter(s => s.alarmStatus === 'none').length,
    hasAlarm: stations.filter(s => s.alarmStatus === 'has_alarm').length,
  }
}

/**
 * 生成日期范围数组
 * @param days 生成的天数
 * @param startDate 开始日期，默认为当前日期的前N天
 * @returns 日期字符串数组，格式：YYYY-MM-DD
 */
export const generateDateRange = (days: number, startDate?: Date): string[] => {
  const dates: string[] = []
  const start = startDate || new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000)
  
  for (let i = 0; i < days; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    dates.push(`${year}-${month}-${day}`)
  }
  
  return dates
}

