/**
 * 光伏综合信息页面 Mock 数据
 */

import type {
  PowerGenerationStats,
  PowerTrendDataPoint,
  FullHourData,
  MapRegionData,
  StationConstructionStats,
  PowerGenerationTop20,
  PowerCurveDataPoint,
  AlarmData,
  TimeRange,
  CityStationData,
  DistrictStationData
} from '@/api/types/es-dashboard'

/**
 * Mock - 发电量统计数据
 */
export const mockPowerGenerationStats = (): PowerGenerationStats => {
  return {
    realtimePower: 125.8,
    todayGeneration: 2847.5,
    monthlyGeneration: 59000,
    yearlyGeneration: 487400,
    totalGeneration: 1658700
  }
}

/**
 * Mock - 发电量趋势数据
 * @param timeRange 时间范围
 */
export const mockPowerTrend = (timeRange: TimeRange = 'month'): PowerTrendDataPoint[] => {
  const dataMap: Record<TimeRange, PowerTrendDataPoint[]> = {
    day: Array.from({ length: 24 }, (_, i) => ({
      date: `${i.toString().padStart(2, '0')}:00`,
      generation: Math.random() * 5000 + 2000
    })),
    month: Array.from({ length: 10 }, (_, i) => ({
      date: (i + 1).toString().padStart(2, '0'),
      generation: Math.random() * 8000 + 28000
    })),
    year: Array.from({ length: 12 }, (_, i) => ({
      date: `${i + 1}月`,
      generation: Math.random() * 100000 + 450000
    }))
  }
  
  return dataMap[timeRange]
}

/**
 * Mock - 满发小时TOP20
 * @param timeRange 时间范围
 */
export const mockFullHourTop20 = (timeRange: TimeRange = 'month'): FullHourData[] => {
  const stations = [
    '阳光电站A', '绿能电站B', '华能电站C', '中电电站D', '新能源E站',
    '光伏电站F', '太阳能G站', '清洁能源H'
  ]
  
  return stations.map((name, index) => ({
    stationName: name,
    fullHours: Number((1.43 - index * 0.01).toFixed(2)),
    unit: 'h'
  }))
}

/**
 * Mock - 地图区域数据
 */
export const mockMapRegions = (): MapRegionData[] => {
  return [
    {
      regionId: '340000',
      regionName: '安徽省',
      stationCount: 18,
      alarmCount: 0,
      position: { lng: 117.2264, lat: 31.8617 }
    },
    {
      regionId: '430000',
      regionName: '湖南省',
      stationCount: 5,
      alarmCount: 1,
      position: { lng: 112.9388, lat: 28.2282 }
    }
  ]
}

/**
 * Mock - 电站建设统计
 */
export const mockConstructionStats = (): StationConstructionStats => {
  return {
    gridConnected: {
      count: 15,
      capacity: 285.6
    },
    underConstruction: {
      count: 3,
      capacity: 125.8
    },
    planned: {
      count: 2,
      capacity: 89.5
    }
  }
}

/**
 * Mock - 发电量TOP20
 * @param timeRange 时间范围
 */
export const mockGenerationTop20 = (timeRange: TimeRange = 'month'): PowerGenerationTop20[] => {
  const stations = [
    '华能光伏A站', '中电新能源B站', '国电投C站', '华电光伏D站',
    '大唐新能源E站', '三峡能源F站', '华润电力G站', '中广核H站'
  ]
  
  return stations.map((name, index) => ({
    stationName: name,
    generation: 6850 - index * 230,
    unit: 'kWh'
  }))
}

/**
 * Mock - 功率曲线数据
 * @param date 日期
 */
export const mockPowerCurve = (date: string = ''): PowerCurveDataPoint[] => {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    const minute = '00'
    // 模拟太阳能发电曲线（白天高，早晚低）
    let power = 0
    if (i >= 6 && i <= 18) {
      // 白天时段，模拟一个抛物线
      const t = (i - 12) / 6 // 标准化到 [-1, 1]
      power = 120 * (1 - t * t) + Math.random() * 20
    }
    
    return {
      time: `${hour}:${minute}`,
      power: Math.max(0, power)
    }
  })
}

/**
 * Mock - 告警列表数据
 */
export const mockAlarmList = (): AlarmData[] => {
  return [
    {
      id: '1',
      level: 'error',
      levelText: '严重',
      alarmName: '逆变器离线',
      location: '1#逆变器',
      alarmTime: '2024-01-15 14:30:25',
      status: 'pending',
      statusText: '待确认'
    },
    {
      id: '2',
      level: 'warning',
      levelText: '警告',
      alarmName: '功率异常',
      location: '2#逆变器',
      alarmTime: '2024-01-15 14:25:10',
      status: 'confirmed',
      statusText: '已确认'
    },
    {
      id: '3',
      level: 'info',
      levelText: '信息',
      alarmName: '通讯恢复',
      location: '3#逆变器',
      alarmTime: '2024-01-15 14:20:05',
      status: 'resolved',
      statusText: '已处理'
    },
    {
      id: '4',
      level: 'warning',
      levelText: '警告',
      alarmName: '温度过高',
      location: '汇流箱A',
      alarmTime: '2024-01-15 14:15:30',
      status: 'pending',
      statusText: '待确认'
    },
    {
      id: '5',
      level: 'error',
      levelText: '严重',
      alarmName: '电压异常',
      location: '变压器1',
      alarmTime: '2024-01-15 14:10:15',
      status: 'confirmed',
      statusText: '已确认'
    }
  ]
}

/**
 * Mock - 城市电站数据
 */
export const mockCityStationsData = (): CityStationData[] => {
  return [
    // 安徽省（340000）的市（18个电站分布在8个市）
    { cityAdcode: 340100, cityName: '合肥市', provinceAdcode: 340000, provinceName: '安徽省', stationCount: 5, alarmCount: 0 },
    { cityAdcode: 340200, cityName: '芜湖市', provinceAdcode: 340000, provinceName: '安徽省', stationCount: 3, alarmCount: 0 },
    { cityAdcode: 340300, cityName: '蚌埠市', provinceAdcode: 340000, provinceName: '安徽省', stationCount: 2, alarmCount: 0 },
    { cityAdcode: 340400, cityName: '淮南市', provinceAdcode: 340000, provinceName: '安徽省', stationCount: 2, alarmCount: 0 },
    { cityAdcode: 340500, cityName: '马鞍山市', provinceAdcode: 340000, provinceName: '安徽省', stationCount: 2, alarmCount: 0 },
    { cityAdcode: 340600, cityName: '淮北市', provinceAdcode: 340000, provinceName: '安徽省', stationCount: 1, alarmCount: 0 },
    { cityAdcode: 340700, cityName: '铜陵市', provinceAdcode: 340000, provinceName: '安徽省', stationCount: 2, alarmCount: 0 },
    { cityAdcode: 340800, cityName: '安庆市', provinceAdcode: 340000, provinceName: '安徽省', stationCount: 1, alarmCount: 0 },
    
    // 湖南省（430000）的市（5个电站，1个告警）
    { cityAdcode: 430100, cityName: '长沙市', provinceAdcode: 430000, provinceName: '湖南省', stationCount: 2, alarmCount: 1 },
    { cityAdcode: 430200, cityName: '株洲市', provinceAdcode: 430000, provinceName: '湖南省', stationCount: 1, alarmCount: 0 },
    { cityAdcode: 430300, cityName: '湘潭市', provinceAdcode: 430000, provinceName: '湖南省', stationCount: 1, alarmCount: 0 },
    { cityAdcode: 430400, cityName: '衡阳市', provinceAdcode: 430000, provinceName: '湖南省', stationCount: 1, alarmCount: 0 },
    
    // 江苏省（320000）的市（13个电站分布在6个市）
    { cityAdcode: 320100, cityName: '南京市', provinceAdcode: 320000, provinceName: '江苏省', stationCount: 4, alarmCount: 0 },
    { cityAdcode: 320200, cityName: '无锡市', provinceAdcode: 320000, provinceName: '江苏省', stationCount: 3, alarmCount: 1 },
    { cityAdcode: 320300, cityName: '徐州市', provinceAdcode: 320000, provinceName: '江苏省', stationCount: 2, alarmCount: 0 },
    { cityAdcode: 320400, cityName: '常州市', provinceAdcode: 320000, provinceName: '江苏省', stationCount: 2, alarmCount: 0 },
    { cityAdcode: 320500, cityName: '苏州市', provinceAdcode: 320000, provinceName: '江苏省', stationCount: 1, alarmCount: 0 },
    { cityAdcode: 320600, cityName: '南通市', provinceAdcode: 320000, provinceName: '江苏省', stationCount: 1, alarmCount: 0 },
    
    // 浙江省（330000）的市（11个电站分布在5个市）
    { cityAdcode: 330100, cityName: '杭州市', provinceAdcode: 330000, provinceName: '浙江省', stationCount: 4, alarmCount: 0 },
    { cityAdcode: 330200, cityName: '宁波市', provinceAdcode: 330000, provinceName: '浙江省', stationCount: 3, alarmCount: 0 },
    { cityAdcode: 330300, cityName: '温州市', provinceAdcode: 330000, provinceName: '浙江省', stationCount: 2, alarmCount: 0 },
    { cityAdcode: 330400, cityName: '嘉兴市', provinceAdcode: 330000, provinceName: '浙江省', stationCount: 1, alarmCount: 1 },
    { cityAdcode: 330500, cityName: '湖州市', provinceAdcode: 330000, provinceName: '浙江省', stationCount: 1, alarmCount: 0 },
    
    // 广东省（440000）的市（12个电站分布在7个市）
    { cityAdcode: 440100, cityName: '广州市', provinceAdcode: 440000, provinceName: '广东省', stationCount: 3, alarmCount: 0 },
    { cityAdcode: 440300, cityName: '深圳市', provinceAdcode: 440000, provinceName: '广东省', stationCount: 2, alarmCount: 0 },
    { cityAdcode: 440400, cityName: '珠海市', provinceAdcode: 440000, provinceName: '广东省', stationCount: 2, alarmCount: 1 },
    { cityAdcode: 440500, cityName: '汕头市', provinceAdcode: 440000, provinceName: '广东省', stationCount: 2, alarmCount: 0 },
    { cityAdcode: 440600, cityName: '佛山市', provinceAdcode: 440000, provinceName: '广东省', stationCount: 2, alarmCount: 0 },
    { cityAdcode: 440700, cityName: '江门市', provinceAdcode: 440000, provinceName: '广东省', stationCount: 1, alarmCount: 0 },
    { cityAdcode: 441200, cityName: '肇庆市', provinceAdcode: 440000, provinceName: '广东省', stationCount: 1, alarmCount: 0 }
  ]
}

/**
 * Mock - 区/县电站数据
 * 为每个城市生成3-5个区的电站数据
 */
export const mockDistrictStationsData = (): DistrictStationData[] => {
  const districts: DistrictStationData[] = []
  
  // 定义主要城市的区级数据
  const cityDistrictMap: Record<number, Array<{ name: string; count: number; alarms: number }>> = {
    // 广州市 (440100)
    440100: [
      { name: '天河区', count: 5, alarms: 2 },
      { name: '海珠区', count: 3, alarms: 1 },
      { name: '越秀区', count: 2, alarms: 0 },
      { name: '荔湾区', count: 4, alarms: 1 },
      { name: '白云区', count: 6, alarms: 3 }
    ],
    // 深圳市 (440300)
    440300: [
      { name: '南山区', count: 8, alarms: 2 },
      { name: '福田区', count: 6, alarms: 1 },
      { name: '罗湖区', count: 4, alarms: 1 },
      { name: '宝安区', count: 10, alarms: 4 },
      { name: '龙岗区', count: 7, alarms: 2 }
    ],
    // 长沙市 (430100)
    430100: [
      { name: '岳麓区', count: 6, alarms: 2 },
      { name: '芙蓉区', count: 4, alarms: 1 },
      { name: '天心区', count: 3, alarms: 0 },
      { name: '开福区', count: 5, alarms: 2 },
      { name: '雨花区', count: 4, alarms: 1 }
    ],
    // 南京市 (320100)
    320100: [
      { name: '玄武区', count: 5, alarms: 1 },
      { name: '秦淮区', count: 4, alarms: 0 },
      { name: '建邺区', count: 6, alarms: 2 },
      { name: '鼓楼区', count: 3, alarms: 1 }
    ],
    // 杭州市 (330100)
    330100: [
      { name: '西湖区', count: 7, alarms: 2 },
      { name: '上城区', count: 5, alarms: 1 },
      { name: '下城区', count: 4, alarms: 0 },
      { name: '拱墅区', count: 6, alarms: 2 }
    ]
  }
  
  // 为定义了区级数据的城市生成数据
  Object.entries(cityDistrictMap).forEach(([cityAdcodeStr, districtList]) => {
    const cityAdcode = parseInt(cityAdcodeStr)
    // 从 mockCityStationsData 中查找城市信息
    const cityInfo = mockCityStationsData().find(c => c.cityAdcode === cityAdcode)
    
    if (cityInfo) {
      districtList.forEach((district, index) => {
        districts.push({
          districtAdcode: cityAdcode * 100 + (index + 1), // 模拟区编码
          districtName: district.name,
          cityAdcode: cityAdcode,
          cityName: cityInfo.cityName,
          stationCount: district.count,
          alarmCount: district.alarms
        })
      })
    }
  })
  
  // 为其他城市生成通用区级数据
  const allCities = mockCityStationsData()
  allCities.forEach(city => {
    // 跳过已经定义的城市
    if (cityDistrictMap[city.cityAdcode]) {
      return
    }
    
    // 生成3-5个区
    const districtCount = Math.floor(Math.random() * 3) + 3
    for (let i = 0; i < districtCount; i++) {
      const directions = ['中心', '东部', '西部', '南部', '北部', '新区', '开发区']
      districts.push({
        districtAdcode: city.cityAdcode * 100 + (i + 1),
        districtName: `${city.cityName.replace('市', '')}${directions[i % directions.length]}区`,
        cityAdcode: city.cityAdcode,
        cityName: city.cityName,
        stationCount: Math.floor(Math.random() * 5) + 2,
        alarmCount: Math.floor(Math.random() * 3)
      })
    }
  })
  
  return districts
}
