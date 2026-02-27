/**
 * 发电趋势分析 - Mock数据
 */

import type {
  TreeNode,
  GetTrendDataResponse,
  CurveChartData,
  PowerChartData
} from '@/api/types/analysis/powerTrend'

// Mock电站树数据
export const mockTreeData: TreeNode[] = [
  {
    id: 'root',
    label: '智能运维平台',
    type: 'group',
    children: [
      {
        id: 'province_1',
        label: '安徽省芜湖市',
        type: 'group',
        children: [
          { id: 'station_001', label: '芜湖城南污水厂', type: 'station' },
          { id: 'station_002', label: '芜湖大龙湾污水厂', type: 'station' },
          { id: 'station_003', label: '芜湖城东污水厂', type: 'station' },
          { id: 'station_004', label: '芜湖滨江污水厂', type: 'station' },
          { id: 'station_005', label: '芜湖高安污水厂', type: 'station' },
          { id: 'station_006', label: '芜湖天门山污水厂', type: 'station' },
          { id: 'station_007', label: '繁昌城南污水厂', type: 'station' },
          { id: 'station_008', label: '繁昌第二污水厂', type: 'station' }
        ]
      },
      {
        id: 'province_2',
        label: '安徽省六安市',
        type: 'group',
        children: [
          { id: 'station_009', label: '六安市污水处理厂', type: 'station' }
        ]
      },
      {
        id: 'province_3',
        label: '安徽省亳州市',
        type: 'group',
        children: [
          { id: 'station_010', label: '亳州利辛县城污水厂', type: 'station' }
        ]
      },
      {
        id: 'province_4',
        label: '湖南省岳阳市',
        type: 'group',
        children: [
          { id: 'station_011', label: '岳阳市污水处理厂', type: 'station' }
        ]
      },
      {
        id: 'province_5',
        label: '江西省九江市',
        type: 'group',
        children: [
          { id: 'station_012', label: '九江市污水处理厂', type: 'station' }
        ]
      }
    ]
  }
]

// 生成日发电曲线数据（288个点，每5分钟一个）
function generateDayCurveData(): CurveChartData {
  const time: string[] = []
  const power: number[] = []
  const radiation: number[] = []

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      time.push(timeStr)

      // 模拟发电功率曲线（白天有值，夜晚为0）
      if (hour >= 6 && hour <= 18) {
        const hourFactor = Math.sin(((hour - 6) / 12) * Math.PI)
        const randomFactor = 0.8 + Math.random() * 0.4
        power.push(Number((500 * hourFactor * randomFactor).toFixed(2)))

        // 辐照曲线与功率类似但有波动
        const radiationValue = 1000 * hourFactor * (0.7 + Math.random() * 0.6)
        radiation.push(Number(radiationValue.toFixed(0)))
      } else {
        power.push(0)
        radiation.push(0)
      }
    }
  }

  return { time, power, radiation }
}

// 生成日分时电量数据（24小时）
function generateDayPowerData(): PowerChartData {
  const time: string[] = []
  const energy: number[] = []

  for (let hour = 0; hour < 24; hour++) {
    const startHour = hour.toString().padStart(2, '0')
    const endHour = ((hour + 1) % 24).toString().padStart(2, '0')
    time.push(`${startHour}:00-${endHour}:00`)

    // 白天发电量较高
    if (hour >= 6 && hour <= 18) {
      const hourFactor = Math.sin(((hour - 6) / 12) * Math.PI)
      energy.push(Number((300 * hourFactor).toFixed(2)))
    } else {
      energy.push(0)
    }
  }

  return { time, energy }
}

// 生成月发电曲线数据（31天）
function generateMonthCurveData(): CurveChartData {
  const time: string[] = []
  const power: number[] = []
  const radiation: number[] = []

  for (let day = 1; day <= 31; day++) {
    time.push(`${day.toString().padStart(2, '0')}日`)

    // 模拟月度功率平均值
    const dayFactor = 0.7 + Math.random() * 0.6
    power.push(Number((300 * dayFactor).toFixed(2)))
    radiation.push(Number((600 * dayFactor).toFixed(0)))
  }

  return { time, power, radiation }
}

// 生成月分时电量数据（31天）
function generateMonthPowerData(): PowerChartData {
  const time: string[] = []
  const energy: number[] = []

  for (let day = 1; day <= 31; day++) {
    time.push(`${day.toString().padStart(2, '0')}日`)

    // 模拟每日发电量
    const dayFactor = 0.7 + Math.random() * 0.6
    energy.push(Number((2500 * dayFactor).toFixed(2)))
  }

  return { time, energy }
}

// 生成年发电曲线数据（12个月）
function generateYearCurveData(): CurveChartData {
  const time: string[] = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const power: number[] = []
  const radiation: number[] = []

  time.forEach((_, index) => {
    // 夏季功率较高，冬季较低
    const monthFactor = 0.5 + 0.5 * Math.sin(((index - 2) / 12) * 2 * Math.PI)
    power.push(Number((250 * monthFactor).toFixed(2)))
    radiation.push(Number((500 * monthFactor).toFixed(0)))
  })

  return { time, power, radiation }
}

// 生成年分时电量数据（12个月）
function generateYearPowerData(): PowerChartData {
  const time: string[] = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const energy: number[] = []

  time.forEach((_, index) => {
    // 夏季发电量较高，冬季较低
    const monthFactor = 0.5 + 0.5 * Math.sin(((index - 2) / 12) * 2 * Math.PI)
    energy.push(Number((50000 * monthFactor).toFixed(2)))
  })

  return { time, energy }
}

// 生成总发电数据（按年）
function generateTotalPowerData(): PowerChartData {
  const time: string[] = ['2023年', '2024年', '2025年']
  const energy: number[] = [580000, 620000, 350000] // 2025年未满

  return { time, energy }
}

// 生成表格数据
function generateTableData(
  timeType: string,
  chartType: string
): GetTrendDataResponse['tableData'] {
  const data: GetTrendDataResponse['tableData'] = []

  if (timeType === 'day') {
    if (chartType === 'curve') {
      // 发电曲线：每5分钟一条（取前20条示例）
      for (let hour = 0; hour < 2; hour++) {
        for (let minute = 0; minute < 60; minute += 5) {
          const timeStr = `2025-10-18 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`
          data.push({
            stationName: '芜湖城南污水厂',
            time: timeStr,
            dailyEnergy: hour === 0 ? 0 : Number((10 * hour * Math.random()).toFixed(2)),
            power: hour === 0 ? 0 : Number((50 * Math.random()).toFixed(2)),
            radiation: hour === 0 ? '-' : Math.floor(100 * Math.random()),
            weather: hour === 0 ? '小雨' : '-',
            temperature: hour === 0 ? 22 : '-',
            windSpeed: hour === 0 ? 23 : '-'
          })
        }
      }
    } else {
      // 分时电量：每小时一条（只显示18:00-23:00示例）
      for (let hour = 18; hour <= 23; hour++) {
        const timeStr = `2025-10-18 ${hour.toString().padStart(2, '0')}:00:00`
        data.push({
          stationName: '芜湖城南污水厂',
          time: timeStr,
          hourlyEnergy: hour < 19 ? 0 : Number((100 + Math.random() * 200).toFixed(2)),
          weather: '-',
          temperature: '-',
          windSpeed: '-'
        })
      }
    }
  } else if (timeType === 'month') {
    if (chartType === 'curve') {
      // 月曲线：每天一条
      for (let day = 1; day <= 18; day++) {
        data.push({
          stationName: '芜湖城南污水厂',
          time: `2025-10-${day.toString().padStart(2, '0')}`,
          dailyEnergy: Number((2000 + Math.random() * 1000).toFixed(2)),
          power: Number((200 + Math.random() * 100).toFixed(2)),
          radiation: Math.floor(500 + Math.random() * 200),
          weather: ['晴', '多云', '阴', '小雨'][Math.floor(Math.random() * 4)],
          temperature: Math.floor(18 + Math.random() * 10),
          windSpeed: Math.floor(10 + Math.random() * 20)
        })
      }
    } else {
      // 月电量：每天一条
      for (let day = 26; day <= 31; day++) {
        data.push({
          stationName: '芜湖城南污水厂',
          time: `2025-10-${day}`,
          hourlyEnergy: Number((1500 + Math.random() * 1500).toFixed(2)),
          weather: '-',
          temperature: '-',
          windSpeed: '-'
        })
      }
    }
  }

  return data
}

// Mock API响应
export function getMockTrendData(params: {
  timeType: string
  chartType: string
}): GetTrendDataResponse {
  const { timeType, chartType } = params

  let chartData: CurveChartData | PowerChartData
  let summary: GetTrendDataResponse['summary']

  // 根据时间类型和图表类型生成数据
  if (timeType === 'day') {
    if (chartType === 'curve') {
      chartData = generateDayCurveData()
    } else {
      chartData = generateDayPowerData()
    }
    summary = {
      dailyEnergy: 2870.8,
      dailyHours: 0.48,
      updateTime: '2025-10-18 13:30:00'
    }
  } else if (timeType === 'month') {
    if (chartType === 'curve') {
      chartData = generateMonthCurveData()
    } else {
      chartData = generateMonthPowerData()
    }
    summary = {
      dailyEnergy: 51273.6,
      dailyHours: 8.64,
      updateTime: '2025-10-18 13:30:00'
    }
  } else if (timeType === 'year') {
    if (chartType === 'curve') {
      chartData = generateYearCurveData()
    } else {
      chartData = generateYearPowerData()
    }
    summary = {
      dailyEnergy: 506840.0,
      dailyHours: 85.4,
      updateTime: '2025-10-18 13:30:00'
    }
  } else {
    // total
    chartData = generateTotalPowerData()
    summary = {
      dailyEnergy: 1550000.0,
      dailyHours: 261.2,
      updateTime: '2025-10-18 13:30:00'
    }
  }

  return {
    summary,
    chartData,
    tableData: generateTableData(timeType, chartType)
  }
}

