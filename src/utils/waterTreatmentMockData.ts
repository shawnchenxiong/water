/**
 * 净水厂Mock数据生成工具
 */

import type { WaterQualityData, FlowData, DeviceStatus, ProcessData, PlantStatistics } from '@/api/types/water-treatment'

/**
 * 生成水质数据
 * @param type 'inflow' | 'outflow' | 'process'
 */
export function generateWaterQuality(type: 'inflow' | 'outflow' | 'process' = 'process'): WaterQualityData {
  if (type === 'inflow') {
    // 进水水质（较差）
    return {
      cod: 250 + Math.random() * 150,      // 250-400 mg/L
      nh3n: 30 + Math.random() * 15,       // 30-45 mg/L
      tn: 35 + Math.random() * 15,         // 35-50 mg/L
      tp: 3 + Math.random() * 2,           // 3-5 mg/L
      ss: 150 + Math.random() * 100,       // 150-250 mg/L
      ph: 7.0 + Math.random() * 0.8,       // 7.0-7.8
      do: 0.5 + Math.random() * 1.5,       // 0.5-2.0 mg/L
      turbidity: 80 + Math.random() * 40,  // 80-120 NTU
      temperature: 15 + Math.random() * 10 // 15-25 ℃
    }
  } else if (type === 'outflow') {
    // 出水水质（一级A标准）
    return {
      cod: 30 + Math.random() * 15,        // 30-45 mg/L
      nh3n: 2 + Math.random() * 2,         // 2-4 mg/L
      tn: 8 + Math.random() * 5,           // 8-13 mg/L
      tp: 0.2 + Math.random() * 0.2,       // 0.2-0.4 mg/L
      ss: 5 + Math.random() * 5,           // 5-10 mg/L
      ph: 6.8 + Math.random() * 0.9,       // 6.8-7.7
      do: 5 + Math.random() * 2,           // 5-7 mg/L
      turbidity: 2 + Math.random() * 3,    // 2-5 NTU
      temperature: 15 + Math.random() * 10 // 15-25 ℃
    }
  } else {
    // 工艺过程水质
    return {
      cod: 80 + Math.random() * 120,       // 80-200 mg/L
      nh3n: 10 + Math.random() * 15,       // 10-25 mg/L
      tn: 15 + Math.random() * 20,         // 15-35 mg/L
      tp: 1 + Math.random() * 2,           // 1-3 mg/L
      ss: 50 + Math.random() * 100,        // 50-150 mg/L
      ph: 6.8 + Math.random() * 1.0,       // 6.8-7.8
      do: 2 + Math.random() * 2,           // 2-4 mg/L (好氧池)
      turbidity: 20 + Math.random() * 30,  // 20-50 NTU
      temperature: 15 + Math.random() * 10,// 15-25 ℃
      mlss: 3000 + Math.random() * 2000,   // 3000-5000 mg/L
      orp: -100 + Math.random() * 300      // -100 to 200 mV
    }
  }
}

/**
 * 生成流量数据（考虑昼夜变化）
 */
export function generateFlowData(hour: number = new Date().getHours()): FlowData {
  // 昼夜变化系数：白天(6-22点)流量高，夜间流量低
  const dayFactor = hour >= 6 && hour <= 22 ? 1.0 : 0.6
  const peakFactor = (hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 20) ? 1.2 : 1.0
  const factor = dayFactor * peakFactor
  
  const baseFlow = 800 // 基础流量 m³/h
  const inflowRate = baseFlow * factor * (0.9 + Math.random() * 0.2)
  
  return {
    inflowRate: Number(inflowRate.toFixed(2)),
    outflowRate: Number((inflowRate * 0.98).toFixed(2)), // 出水略小于进水
    returnFlowRate: Number((inflowRate * 0.5).toFixed(2)), // 回流比50%
    sludgeFlowRate: Number((inflowRate * 0.02).toFixed(2)) // 污泥流量约2%
  }
}

/**
 * 生成设备状态
 */
export function generateDeviceStatus(
  deviceId: string,
  deviceName: string,
  deviceType: string
): DeviceStatus {
  const statusOptions: DeviceStatus['status'][] = ['running', 'stopped', 'fault', 'maintenance']
  const weights = [0.85, 0.10, 0.03, 0.02] // 85%运行，10%停止，3%故障，2%维护
  
  let random = Math.random()
  let status: DeviceStatus['status'] = 'running'
  let cumulative = 0
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i]
    if (random < cumulative) {
      status = statusOptions[i]
      break
    }
  }
  
  const baseDevice: DeviceStatus = {
    deviceId,
    deviceName,
    deviceType,
    status
  }
  
  // 根据设备类型添加特定参数
  if (deviceType.includes('泵')) {
    return {
      ...baseDevice,
      frequency: status === 'running' ? 35 + Math.random() * 15 : 0, // 35-50 Hz
      current: status === 'running' ? 20 + Math.random() * 30 : 0,   // 20-50 A
      power: status === 'running' ? 15 + Math.random() * 20 : 0,     // 15-35 kW
      flowRate: status === 'running' ? 100 + Math.random() * 200 : 0, // 100-300 m³/h
      runningHours: Math.floor(Math.random() * 50000)
    }
  } else if (deviceType.includes('鼓风机')) {
    return {
      ...baseDevice,
      frequency: status === 'running' ? 40 + Math.random() * 10 : 0, // 40-50 Hz
      current: status === 'running' ? 80 + Math.random() * 40 : 0,   // 80-120 A
      power: status === 'running' ? 60 + Math.random() * 40 : 0,     // 60-100 kW
      pressure: status === 'running' ? 50 + Math.random() * 30 : 0,  // 50-80 kPa
      temperature: status === 'running' ? 40 + Math.random() * 20 : 25, // 40-60 ℃
      flowRate: status === 'running' ? 3000 + Math.random() * 2000 : 0, // 3000-5000 m³/h
      runningHours: Math.floor(Math.random() * 40000)
    }
  } else if (deviceType.includes('搅拌')) {
    return {
      ...baseDevice,
      current: status === 'running' ? 5 + Math.random() * 10 : 0,    // 5-15 A
      power: status === 'running' ? 3 + Math.random() * 7 : 0,       // 3-10 kW
      runningHours: Math.floor(Math.random() * 60000)
    }
  }
  
  return baseDevice
}

/**
 * 生成工艺段数据
 */
export function generateProcessData(processId: string, processName: string): ProcessData {
  const devices: DeviceStatus[] = []
  
  // 根据不同工艺段生成对应设备
  if (processId === 'pre-treatment') {
    devices.push(
      generateDeviceStatus('pump-001', '1#提升泵', '提升泵'),
      generateDeviceStatus('pump-002', '2#提升泵', '提升泵'),
      generateDeviceStatus('grid-001', '粗格栅', '格栅'),
      generateDeviceStatus('grid-002', '细格栅', '格栅')
    )
  } else if (processId === 'stage1-aao' || processId === 'stage2-aao') {
    devices.push(
      generateDeviceStatus('mixer-001', '1#搅拌器', '潜水搅拌器'),
      generateDeviceStatus('mixer-002', '2#搅拌器', '潜水搅拌器'),
      generateDeviceStatus('pump-return', '回流泵', '回流泵')
    )
  } else if (processId === 'blower-room') {
    devices.push(
      generateDeviceStatus('blower-001', '1#鼓风机', '罗茨鼓风机'),
      generateDeviceStatus('blower-002', '2#鼓风机', '罗茨鼓风机'),
      generateDeviceStatus('blower-003', '3#鼓风机', '离心鼓风机')
    )
  }
  
  return {
    processId,
    processName,
    waterQuality: generateWaterQuality('process'),
    flow: generateFlowData(),
    devices,
    timestamp: new Date().toISOString()
  }
}

/**
 * 生成污水厂统计数据
 */
export function generatePlantStatistics(plantName: string): PlantStatistics {
  const designCapacity = 20000 // 设计处理能力 20000 m³/d
  const currentHour = new Date().getHours()
  const flowData = generateFlowData(currentHour)
  
  // 今日处理水量（累计到当前小时）
  const todayVolume = flowData.inflowRate * currentHour * (0.9 + Math.random() * 0.2)
  
  return {
    plantId: 'plant-001',
    plantName,
    designCapacity,
    todayVolume: Number(todayVolume.toFixed(2)),
    monthVolume: Number((todayVolume * 25).toFixed(2)), // 假设本月已运行25天
    yearVolume: Number((todayVolume * 300).toFixed(2)), // 假设本年已运行300天
    loadRate: Number(((todayVolume / designCapacity) * 100).toFixed(2)),
    complianceRate: 98.5 + Math.random() * 1.5, // 98.5-100%
    energyConsumption: Number((todayVolume * 0.35).toFixed(2)), // 单位能耗0.35 kWh/m³
    unitEnergyConsumption: 0.35,
    deviceCount: 48,
    runningDeviceCount: 42 + Math.floor(Math.random() * 4),
    alarmCount: Math.floor(Math.random() * 5)
  }
}

/**
 * 生成24小时流量曲线数据
 */
export function generate24HourFlowCurve(): { time: string; flow: number }[] {
  const data: { time: string; flow: number }[] = []
  
  for (let hour = 0; hour < 24; hour++) {
    const flowData = generateFlowData(hour)
    data.push({
      time: `${String(hour).padStart(2, '0')}:00`,
      flow: flowData.inflowRate
    })
  }
  
  return data
}

/**
 * 生成水质趋势数据
 */
export function generateWaterQualityTrend(days: number = 7): {
  dates: string[]
  cod: number[]
  nh3n: number[]
  tn: number[]
  tp: number[]
} {
  const dates: string[] = []
  const cod: number[] = []
  const nh3n: number[] = []
  const tn: number[] = []
  const tp: number[] = []
  
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
    
    const outflow = generateWaterQuality('outflow')
    cod.push(Number(outflow.cod.toFixed(2)))
    nh3n.push(Number(outflow.nh3n.toFixed(2)))
    tn.push(Number(outflow.tn.toFixed(2)))
    tp.push(Number(outflow.tp.toFixed(2)))
  }
  
  return { dates, cod, nh3n, tn, tp }
}

/**
 * 生成处理水量趋势数据（替代发电量趋势）
 * @param timeType 时间类型
 * @param date 日期
 */
export function generateWaterVolumeTrend(
  timeType: 'day' | 'month' | 'year' = 'day',
  date: Date = new Date()
): {
  time: string[]
  volume: number[]      // 处理水量 m³
  inflowRate: number[]  // 进水流量 m³/h
  outflowRate: number[] // 出水流量 m³/h
} {
  const time: string[] = []
  const volume: number[] = []
  const inflowRate: number[] = []
  const outflowRate: number[] = []
  
  if (timeType === 'day') {
    // 24小时数据
    for (let hour = 0; hour < 24; hour++) {
      time.push(`${String(hour).padStart(2, '0')}:00`)
      const flow = generateFlowData(hour)
      inflowRate.push(flow.inflowRate)
      outflowRate.push(flow.outflowRate)
      volume.push(Number((flow.inflowRate * 1).toFixed(2))) // 1小时的水量
    }
  } else if (timeType === 'month') {
    // 当月每天数据
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      time.push(`${date.getMonth() + 1}-${String(day).padStart(2, '0')}`)
      // 每天的平均流量
      const avgFlow = 800 * (0.9 + Math.random() * 0.2)
      inflowRate.push(Number(avgFlow.toFixed(2)))
      outflowRate.push(Number((avgFlow * 0.98).toFixed(2)))
      volume.push(Number((avgFlow * 24).toFixed(2))) // 一天的水量
    }
  } else {
    // 12个月数据
    for (let month = 1; month <= 12; month++) {
      time.push(`${date.getFullYear()}-${String(month).padStart(2, '0')}`)
      const avgFlow = 800 * (0.9 + Math.random() * 0.2)
      const daysInMonth = new Date(date.getFullYear(), month, 0).getDate()
      inflowRate.push(Number(avgFlow.toFixed(2)))
      outflowRate.push(Number((avgFlow * 0.98).toFixed(2)))
      volume.push(Number((avgFlow * 24 * daysInMonth).toFixed(2))) // 一个月的水量
    }
  }
  
  return { time, volume, inflowRate, outflowRate }
}

/**
 * 生成能耗数据（电、水、药剂）
 */
export function generateEnergyConsumption(): {
  electricity: {
    yesterday: number
    today: number
    dayYoy: number
    month: number
    lastMonth: number
    monthYoy: number
    year: number
    lastYear: number
  }
  water: {
    yesterday: number
    today: number
    dayYoy: number
    month: number
    lastMonth: number
    monthYoy: number
    year: number
    lastYear: number
  }
  chemicals: {
    yesterday: number
    today: number
    dayYoy: number
    month: number
    lastMonth: number
    monthYoy: number
    year: number
    lastYear: number
  }
} {
  // 电耗数据（kWh）
  const electricityYesterday = 8000 + Math.random() * 2000
  const electricityToday = electricityYesterday * (0.95 + Math.random() * 0.1)
  const electricityMonth = electricityToday * 25
  const electricityLastMonth = electricityMonth * (0.8 + Math.random() * 0.4)
  
  // 水耗数据（m³）- 自用水
  const waterYesterday = 100 + Math.random() * 50
  const waterToday = waterYesterday * (0.9 + Math.random() * 0.2)
  const waterMonth = waterToday * 25
  const waterLastMonth = waterMonth * (0.8 + Math.random() * 0.4)
  
  // 药剂消耗（kg）
  const chemicalsYesterday = 200 + Math.random() * 100
  const chemicalsToday = chemicalsYesterday * (0.9 + Math.random() * 0.2)
  const chemicalsMonth = chemicalsToday * 25
  const chemicalsLastMonth = chemicalsMonth * (0.8 + Math.random() * 0.4)
  
  return {
    electricity: {
      yesterday: Number(electricityYesterday.toFixed(2)),
      today: Number(electricityToday.toFixed(2)),
      dayYoy: Number((((electricityToday - electricityYesterday) / electricityYesterday) * 100).toFixed(2)),
      month: Number(electricityMonth.toFixed(2)),
      lastMonth: Number(electricityLastMonth.toFixed(2)),
      monthYoy: Number((((electricityMonth - electricityLastMonth) / electricityLastMonth) * 100).toFixed(2)),
      year: Number((electricityMonth * 12).toFixed(2)),
      lastYear: Number((electricityLastMonth * 12).toFixed(2))
    },
    water: {
      yesterday: Number(waterYesterday.toFixed(2)),
      today: Number(waterToday.toFixed(2)),
      dayYoy: Number((((waterToday - waterYesterday) / waterYesterday) * 100).toFixed(2)),
      month: Number(waterMonth.toFixed(2)),
      lastMonth: Number(waterLastMonth.toFixed(2)),
      monthYoy: Number((((waterMonth - waterLastMonth) / waterLastMonth) * 100).toFixed(2)),
      year: Number((waterMonth * 12).toFixed(2)),
      lastYear: Number((waterLastMonth * 12).toFixed(2))
    },
    chemicals: {
      yesterday: Number(chemicalsYesterday.toFixed(2)),
      today: Number(chemicalsToday.toFixed(2)),
      dayYoy: Number((((chemicalsToday - chemicalsYesterday) / chemicalsYesterday) * 100).toFixed(2)),
      month: Number(chemicalsMonth.toFixed(2)),
      lastMonth: Number(chemicalsLastMonth.toFixed(2)),
      monthYoy: Number((((chemicalsMonth - chemicalsLastMonth) / chemicalsLastMonth) * 100).toFixed(2)),
      year: Number((chemicalsMonth * 12).toFixed(2)),
      lastYear: Number((chemicalsLastMonth * 12).toFixed(2))
    }
  }
}

/**
 * 生成历史范围数据
 */
export function generateHistoryRangeData(
  startDate: Date,
  endDate: Date
): {
  time: string[]
  volume: number[]
  inflowRate: number[]
  outflowRate: number[]
} {
  const time: string[] = []
  const volume: string[] = []
  const inflowRate: number[] = []
  const outflowRate: number[] = []
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  const hoursDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60))
  
  for (let i = 0; i <= hoursDiff; i++) {
    const currentDate = new Date(start.getTime() + i * 60 * 60 * 1000)
    const hour = currentDate.getHours()
    
    if (hoursDiff > 48) {
      // 超过2天，按天显示
      if (hour === 0 || i === 0) {
        time.push(currentDate.toISOString().split('T')[0])
        const flow = generateFlowData(12) // 使用中午的平均值
        inflowRate.push(flow.inflowRate)
        outflowRate.push(flow.outflowRate)
        volume.push(Number((flow.inflowRate * 24).toFixed(2)))
      }
    } else {
      // 2天内，按小时显示
      time.push(currentDate.toISOString().slice(0, 13) + ':00')
      const flow = generateFlowData(hour)
      inflowRate.push(flow.inflowRate)
      outflowRate.push(flow.outflowRate)
      volume.push(Number((flow.inflowRate * 1).toFixed(2)))
    }
  }
  
  return { time, volume, inflowRate, outflowRate }
}
