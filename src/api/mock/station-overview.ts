import type {
  StationOverviewStatistics,
  StationOverviewRecord,
  StationOverviewBasicData,
  StationOverviewQueryParams
} from '@/api/types/station-overview'
import dayjs from 'dayjs'

/**
 * 生成电站概览统计Mock数据
 */
export const mockStationOverviewStatistics = (): StationOverviewStatistics => {
  return {
    total: 15,
    communicationNormal: 12,
    allDeviceOffline: 1,
    partialDeviceOffline: 2,
    connecting: 0,
    noAlarm: 13,
    hasAlarm: 2
  }
}

/**
 * 生成电站概览记录Mock数据
 */
export const mockStationOverviewRecords = (): StationOverviewRecord[] => {
  const stations = [
    {
      id: '1',
      stationName: '清源储能电站',
      communication: 'online' as const,
      alarm: false,
      location: '安徽省 芜湖市 鸠江区',
      installedPower: 0.25,
      installedEnergy: 1.11,
      weather: 'sunny' as const,
      realtimePower: 0,
      dailyCharging: 0,
      dailyDischarging: 0,
      monthlyCharging: 12500.8,
      monthlyDischarging: 11800.6,
      yearlyCharging: 156800.5,
      yearlyDischarging: 148200.3,
      cumulativeCharging: 985600.7,
      cumulativeDischarging: 920400.2,
      gridConnectionDate: '2023-05-15',
      contactPerson: '张三',
      contactPhone: '13800138000',
      updateTime: dayjs().subtract(5, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      position: '华东地区',
      constructionStatus: 'operational' as const,
      gridConnectionTime: '2023-05-15'
    },
    {
      id: '2',
      stationName: '华能储能电站',
      communication: 'online' as const,
      alarm: false,
      location: '江苏省 南京市 江宁区',
      installedPower: 0.5,
      installedEnergy: 2.2,
      weather: 'cloudy' as const,
      realtimePower: 125.8,
      dailyCharging: 1250.5,
      dailyDischarging: 980.2,
      monthlyCharging: 35200.8,
      monthlyDischarging: 32100.6,
      yearlyCharging: 456800.5,
      yearlyDischarging: 425200.3,
      cumulativeCharging: 1985600.7,
      cumulativeDischarging: 1820400.2,
      gridConnectionDate: '2023-08-20',
      contactPerson: '李四',
      contactPhone: '13900139000',
      updateTime: dayjs().subtract(12, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      position: '华东地区',
      constructionStatus: 'operational' as const,
      gridConnectionTime: '2023-08-20'
    },
    {
      id: '3',
      stationName: '国网储能电站',
      communication: 'offline' as const,
      alarm: true,
      location: '浙江省 杭州市 西湖区',
      installedPower: 1.0,
      installedEnergy: 4.4,
      weather: 'rainy' as const,
      realtimePower: 0,
      dailyCharging: 0,
      dailyDischarging: 0,
      monthlyCharging: 0,
      monthlyDischarging: 0,
      yearlyCharging: 850600.5,
      yearlyDischarging: 798200.3,
      cumulativeCharging: 3265800.7,
      cumulativeDischarging: 3020400.2,
      gridConnectionDate: '2023-03-10',
      contactPerson: '王五',
      contactPhone: '13700137000',
      updateTime: dayjs().subtract(45, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      position: '华东地区',
      constructionStatus: 'operational' as const,
      gridConnectionTime: '2023-03-10'
    },
    {
      id: '4',
      stationName: '中电建储能电站',
      communication: 'online' as const,
      alarm: false,
      location: '山东省 济南市 历下区',
      installedPower: 0.75,
      installedEnergy: 3.3,
      weather: 'sunny' as const,
      realtimePower: 256.4,
      dailyCharging: 2100.8,
      dailyDischarging: 1850.6,
      monthlyCharging: 62400.8,
      monthlyDischarging: 58100.6,
      yearlyCharging: 756800.5,
      yearlyDischarging: 705200.3,
      cumulativeCharging: 2485600.7,
      cumulativeDischarging: 2320400.2,
      gridConnectionDate: '2023-06-25',
      contactPerson: '赵六',
      contactPhone: '13600136000',
      updateTime: dayjs().subtract(8, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      position: '华北地区',
      constructionStatus: 'operational' as const,
      gridConnectionTime: '2023-06-25'
    },
    {
      id: '5',
      stationName: '南方电网储能电站',
      communication: 'online' as const,
      alarm: true,
      location: '广东省 深圳市 南山区',
      installedPower: 2.0,
      installedEnergy: 8.8,
      weather: 'cloudy' as const,
      realtimePower: 1580.2,
      dailyCharging: 15200.5,
      dailyDischarging: 14800.3,
      monthlyCharging: 456000.8,
      monthlyDischarging: 444100.6,
      yearlyCharging: 5556800.5,
      yearlyDischarging: 5405200.3,
      cumulativeCharging: 18485600.7,
      cumulativeDischarging: 17920400.2,
      gridConnectionDate: '2023-01-15',
      contactPerson: '孙七',
      contactPhone: '13500135000',
      updateTime: dayjs().subtract(3, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      position: '华南地区',
      constructionStatus: 'operational' as const,
      gridConnectionTime: '2023-01-15'
    },
    {
      id: '6',
      stationName: '三峡储能电站',
      communication: 'online' as const,
      alarm: false,
      location: '湖北省 宜昌市 西陵区',
      installedPower: 1.5,
      installedEnergy: 6.6,
      weather: 'sunny' as const,
      realtimePower: 845.7,
      dailyCharging: 8500.2,
      dailyDischarging: 7980.9,
      monthlyCharging: 255000.8,
      monthlyDischarging: 239400.6,
      yearlyCharging: 3106800.5,
      yearlyDischarging: 2915200.3,
      cumulativeCharging: 4685600.7,
      cumulativeDischarging: 4420400.2,
      gridConnectionDate: '2023-09-10',
      contactPerson: '周八',
      contactPhone: '13400134000',
      updateTime: dayjs().subtract(15, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      position: '华中地区',
      constructionStatus: 'operational' as const,
      gridConnectionTime: '2023-09-10'
    },
    {
      id: '7',
      stationName: '比亚迪储能电站',
      communication: 'online' as const,
      alarm: false,
      location: '陕西省 西安市 雁塔区',
      installedPower: 0.8,
      installedEnergy: 3.52,
      weather: 'cloudy' as const,
      realtimePower: 320.5,
      dailyCharging: 3200.8,
      dailyDischarging: 2980.4,
      monthlyCharging: 96000.8,
      monthlyDischarging: 89400.6,
      yearlyCharging: 1168800.5,
      yearlyDischarging: 1088200.3,
      cumulativeCharging: 2985600.7,
      cumulativeDischarging: 2820400.2,
      gridConnectionDate: '2023-07-30',
      contactPerson: '吴九',
      contactPhone: '13300133000',
      updateTime: dayjs().subtract(22, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      position: '西北地区',
      constructionStatus: 'operational' as const,
      gridConnectionTime: '2023-07-30'
    },
    {
      id: '8',
      stationName: '宁德时代储能电站',
      communication: 'online' as const,
      alarm: false,
      location: '福建省 宁德市 蕉城区',
      installedPower: 3.0,
      installedEnergy: 13.2,
      weather: 'rainy' as const,
      realtimePower: 2250.8,
      dailyCharging: 25800.5,
      dailyDischarging: 23600.2,
      monthlyCharging: 774000.8,
      monthlyDischarging: 708000.6,
      yearlyCharging: 9416800.5,
      yearlyDischarging: 8615200.3,
      cumulativeCharging: 25485600.7,
      cumulativeDischarging: 23320400.2,
      gridConnectionDate: '2022-12-05',
      contactPerson: '郑十',
      contactPhone: '13200132000',
      updateTime: dayjs().subtract(7, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      position: '华南地区',
      constructionStatus: 'operational' as const,
      gridConnectionTime: '2022-12-05'
    },
    {
      id: '9',
      stationName: '阳光电源储能电站',
      communication: 'online' as const,
      alarm: false,
      location: '安徽省 合肥市 高新区',
      installedPower: 1.2,
      installedEnergy: 5.28,
      weather: 'sunny' as const,
      realtimePower: 680.3,
      dailyCharging: 6800.2,
      dailyDischarging: 6200.8,
      monthlyCharging: 204000.8,
      monthlyDischarging: 186000.6,
      yearlyCharging: 2484800.5,
      yearlyDischarging: 2265200.3,
      cumulativeCharging: 6985600.7,
      cumulativeDischarging: 6420400.2,
      gridConnectionDate: '2023-04-18',
      contactPerson: '钱十一',
      contactPhone: '13100131000',
      updateTime: dayjs().subtract(18, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      position: '华东地区',
      constructionStatus: 'operational' as const,
      gridConnectionTime: '2023-04-18'
    },
    {
      id: '10',
      stationName: '远景储能电站',
      communication: 'online' as const,
      alarm: false,
      location: '江苏省 无锡市 新吴区',
      installedPower: 0.6,
      installedEnergy: 2.64,
      weather: 'cloudy' as const,
      realtimePower: 180.6,
      dailyCharging: 1800.5,
      dailyDischarging: 1650.3,
      monthlyCharging: 54000.8,
      monthlyDischarging: 49500.6,
      yearlyCharging: 657600.5,
      yearlyDischarging: 602300.3,
      cumulativeCharging: 1485600.7,
      cumulativeDischarging: 1320400.2,
      gridConnectionDate: '2023-10-22',
      contactPerson: '孔十二',
      contactPhone: '13000130000',
      updateTime: dayjs().subtract(28, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      position: '华东地区',
      constructionStatus: 'operational' as const,
      gridConnectionTime: '2023-10-22'
    }
  ]
  
  return stations
}

/**
 * 生成电站概览基础数据Mock
 */
export const mockStationOverviewBasicData = (): StationOverviewBasicData => {
  return {
    locationOptions: [
      { label: '华东地区', value: 'east' },
      { label: '华北地区', value: 'north' },
      { label: '华南地区', value: 'south' },
      { label: '华中地区', value: 'central' },
      { label: '西北地区', value: 'northwest' },
      { label: '西南地区', value: 'southwest' },
      { label: '东北地区', value: 'northeast' }
    ],
    regionOptions: [
      { label: '安徽省', value: 'anhui' },
      { label: '江苏省', value: 'jiangsu' },
      { label: '浙江省', value: 'zhejiang' },
      { label: '山东省', value: 'shandong' },
      { label: '广东省', value: 'guangdong' },
      { label: '湖北省', value: 'hubei' },
      { label: '陕西省', value: 'shaanxi' },
      { label: '福建省', value: 'fujian' }
    ],
    constructionStatusOptions: [
      { label: '已投产', value: 'operational' },
      { label: '建设中', value: 'construction' },
      { label: '规划中', value: 'planning' }
    ]
  }
}

/**
 * 过滤电站概览记录
 */
export const filterStationOverviewRecords = (
  data: StationOverviewRecord[],
  params: StationOverviewQueryParams
): StationOverviewRecord[] => {
  let filteredData = [...data]

  // 关键字搜索
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filteredData = filteredData.filter(item =>
      item.stationName.toLowerCase().includes(keyword) ||
      item.location.toLowerCase().includes(keyword)
    )
  }

  // 所在位置过滤
  if (params.location) {
    filteredData = filteredData.filter(item =>
      item.position === params.location
    )
  }

  // 所在地区过滤
  if (params.region) {
    const regionMap: Record<string, string> = {
      'anhui': '安徽省',
      'jiangsu': '江苏省',
      'zhejiang': '浙江省',
      'shandong': '山东省',
      'guangdong': '广东省',
      'hubei': '湖北省',
      'shaanxi': '陕西省',
      'fujian': '福建省'
    }
    const regionName = regionMap[params.region]
    if (regionName) {
      filteredData = filteredData.filter(item =>
        item.location.includes(regionName)
      )
    }
  }

  // 建设状态过滤
  if (params.constructionStatus) {
    filteredData = filteredData.filter(item =>
      item.constructionStatus === params.constructionStatus
    )
  }

  // 装机功率范围过滤
  if (params.minPower !== undefined && params.minPower !== null) {
    filteredData = filteredData.filter(item =>
      item.installedPower >= params.minPower!
    )
  }
  if (params.maxPower !== undefined && params.maxPower !== null) {
    filteredData = filteredData.filter(item =>
      item.installedPower <= params.maxPower!
    )
  }

  // 装机能量范围过滤
  if (params.minEnergy !== undefined && params.minEnergy !== null) {
    filteredData = filteredData.filter(item =>
      item.installedEnergy >= params.minEnergy!
    )
  }
  if (params.maxEnergy !== undefined && params.maxEnergy !== null) {
    filteredData = filteredData.filter(item =>
      item.installedEnergy <= params.maxEnergy!
    )
  }

  // 并网时间过滤
  if (params.gridConnectionTime) {
    filteredData = filteredData.filter(item =>
      item.gridConnectionTime === params.gridConnectionTime
    )
  }

  // 联系人过滤
  if (params.contactPerson) {
    filteredData = filteredData.filter(item =>
      item.contactPerson?.includes(params.contactPerson!) || false
    )
  }

  // 联系电话过滤
  if (params.contactPhone) {
    filteredData = filteredData.filter(item =>
      item.contactPhone?.includes(params.contactPhone!) || false
    )
  }

  return filteredData
}
