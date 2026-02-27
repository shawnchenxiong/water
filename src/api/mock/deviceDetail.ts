import type {
  DeviceBasicInfoResponse,
  DeviceMonitorResponse,
  DeviceAlarmsResponse,
  DeviceHistoryDataResponse,
  AlarmDetailResponse,
  AlarmHandleResponse,
  DeviceBasicInfo,
  DeviceAttribute,
  PVStringInfo,
  DeviceTotalData,
  DeviceStatusInfo,
  PVData,
  SystemInfo,
  AlarmInfo,
  HistoryTimeType,
  ChartSeries,
  AlarmDetailInfo,
  AlarmDeviceData
} from '@/api/types/diagnosis/deviceDetail'

/**
 * 生成设备基础信息Mock数据
 */
export const getMockDeviceBasicInfo = (deviceId: string): DeviceBasicInfoResponse => {
  const deviceInfo: DeviceBasicInfo = {
    deviceName: 'CN-N0101',
    deviceNumber: '091501170031306711173',
    deviceType: '逆变器',
    manufacturer: '阳光',
    uptime: '2年3个月15天',
    location: '1号方阵A区',
    parentDeviceName: '汇流箱-001',
    parentDeviceStatus: '正常运行',
    productType: 'SG110CX',
    apiInfo: '阳光云API',
    connectionStatus: '在线'
  }

  const attributes: DeviceAttribute[] = [
    {
      attributeId: 31,
      attributeName: '安装位置',
      attributeType: '文本类型',
      attributeValue: '-'
    },
    {
      attributeId: 25,
      attributeName: '坐标-X轴',
      attributeType: '数值类型',
      attributeValue: '-'
    },
    {
      attributeId: 26,
      attributeName: '坐标-Y轴',
      attributeType: '数值类型',
      attributeValue: '-'
    },
    {
      attributeId: 107,
      attributeName: '坐标-经度',
      attributeType: '文本类型',
      attributeValue: '-'
    },
    {
      attributeId: 108,
      attributeName: '坐标-纬度',
      attributeType: '文本类型',
      attributeValue: '-'
    }
  ]

  const stringInfo: PVStringInfo[] = [
    {
      stringId: 'pv1',
      stringName: 'PV组流_1',
      configStatus: '已启用',
      realTimeCurrent: 1.5,
      stringCapacity: 9810.00
    },
    {
      stringId: 'pv2',
      stringName: 'PV组流_2',
      configStatus: '已启用',
      realTimeCurrent: 1.36,
      stringCapacity: 9810.00
    },
    {
      stringId: 'pv3',
      stringName: 'PV组流_3',
      configStatus: '已启用',
      realTimeCurrent: 1.52,
      stringCapacity: 9810.00
    },
    {
      stringId: 'pv4',
      stringName: 'PV组流_4',
      configStatus: '已启用',
      realTimeCurrent: 1.43,
      stringCapacity: 9810.00
    }
  ]

  return {
    success: true,
    code: 200,
    message: 'success',
    data: {
      deviceInfo,
      attributes,
      stringInfo
    }
  }
}

/**
 * 生成设备监控信息Mock数据
 */
export const getMockDeviceMonitorInfo = (deviceId: string): DeviceMonitorResponse => {
  const totalData: DeviceTotalData = {
    totalGeneration: 128.7,
    totalActivePower: 35219.04,
    totalReactivePower: 0,
    dailyGeneration: 7922.5,
    dailyActivePower: 14.24,
    dailyReactivePower: 0.65,
    avgGeneration: 88877.8,
    avgActivePower: 14.6,
    powerFactor: 1
  }

  const statusInfo: DeviceStatusInfo = {
    deviceCommStatus: '正常运行',
    commStatusColor: 'green',
    runStatus: '启动运行',
    runStatusColor: 'green'
  }

  const pvData: PVData[] = [
    { pvId: 1, pvVoltage: 756.5, pvCurrent: 1.5, pvPower: 1285.71 },
    { pvId: 2, pvVoltage: 756.5, pvCurrent: 1.36, pvPower: 1240.33 },
    { pvId: 3, pvVoltage: 761.9, pvCurrent: 1.52, pvPower: 1320.83 },
    { pvId: 4, pvVoltage: 761.9, pvCurrent: 1.43, pvPower: 1282.88 },
    { pvId: 5, pvVoltage: 189.7, pvCurrent: 0, pvPower: 0 },
    { pvId: 6, pvVoltage: 189.7, pvCurrent: 0, pvPower: 0 },
    { pvId: 7, pvVoltage: 191.2, pvCurrent: 0, pvPower: 0 },
    { pvId: 8, pvVoltage: 191.2, pvCurrent: 0, pvPower: 0 },
    { pvId: 9, pvVoltage: 751.4, pvCurrent: 1.56, pvPower: 1333.9 },
    { pvId: 10, pvVoltage: 751.4, pvCurrent: 1.68, pvPower: 1311.17 }
  ]

  const systemInfo: SystemInfo = {
    aPhaseVoltage: 228.8,
    bPhaseVoltage: 228.8,
    cPhaseVoltage: 228.6,
    aPhaseCurrent: 21,
    bPhaseCurrent: 20.7,
    cPhaseCurrent: 20.9,
    gridFrequency: 50.01,
    inverterTemp: 35.5,
    workStatus: '正常'
  }

  return {
    success: true,
    code: 200,
    message: 'success',
    data: {
      totalData,
      statusInfo,
      pvData,
      systemInfo
    }
  }
}

/**
 * 生成告警信息Mock数据
 */
export const getMockDeviceAlarms = (
  deviceId: string,
  alarmType: 'realtime' | 'history' = 'realtime',
  page: number = 1,
  pageSize: number = 20
): DeviceAlarmsResponse => {
  const mockAlarms: AlarmInfo[] = [
    {
      alarmId: 'alarm001',
      alarmLevel: '警告',
      alarmName: 'PV接地告警',
      alarmLocation: '智能运维平台/安徽省芜湖市/芜湖南亭市后水灯',
      alarmDevice: 'CN-N0101',
      alarmTime: '2025-09-17 14:32:26',
      clearTime: '2025-09-17 14:33:24',
      suggestion: '-',
      confirmStatus: '待确认',
      confirmStatusColor: 'orange'
    },
    {
      alarmId: 'alarm002',
      alarmLevel: '严重',
      alarmName: 'PV反接告警',
      alarmLocation: '智能运维平台/安徽省芜湖市/芜湖南亭市后水灯',
      alarmDevice: 'CN-N0101',
      alarmTime: '2025-09-17 13:15:42',
      clearTime: '2025-09-17 13:16:15',
      suggestion: '检查PV组串接线',
      confirmStatus: '已确认',
      confirmStatusColor: 'green'
    },
    {
      alarmId: 'alarm003',
      alarmLevel: '提示',
      alarmName: '通讯异常',
      alarmLocation: '智能运维平台/安徽省芜湖市/芜湖南亭市后水灯',
      alarmDevice: 'CN-N0101',
      alarmTime: '2025-09-17 12:05:18',
      suggestion: '检查通讯线路',
      confirmStatus: '待确认',
      confirmStatusColor: 'orange'
    }
  ]

  // 根据告警类型过滤
  const filteredAlarms = alarmType === 'realtime' 
    ? mockAlarms.filter(alarm => !alarm.clearTime || alarm.confirmStatus === '待确认')
    : mockAlarms

  // 分页处理
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const pagedAlarms = filteredAlarms.slice(startIndex, endIndex)

  return {
    success: true,
    code: 200,
    message: 'success',
    data: {
      alarms: pagedAlarms,
      pagination: {
        current: page,
        pageSize,
        total: filteredAlarms.length,
        totalPages: Math.ceil(filteredAlarms.length / pageSize)
      }
    }
  }
}

/**
 * 生成历史数据Mock数据
 */
export const getMockDeviceHistoryData = (
  deviceId: string,
  timeType: HistoryTimeType,
  startDate: string,
  endDate?: string
): DeviceHistoryDataResponse => {
  // 生成时间轴
  const generateTimeAxis = (type: HistoryTimeType): string[] => {
    switch (type) {
      case 'day':
        return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
      case 'month':
        return Array.from({ length: 30 }, (_, i) => `${(i + 1).toString().padStart(2, '0')}日`)
      case 'year':
        return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      default:
        return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
    }
  }

  // 生成发电量数据
  const generatePowerData = (length: number): number[] => {
    return Array.from({ length }, (_, i) => {
      if (timeType === 'day') {
        // 日数据：模拟光伏发电曲线
        const hour = i
        if (hour < 6 || hour > 18) return 0
        const peak = Math.sin(((hour - 6) / 12) * Math.PI) * 50
        return Math.max(0, peak + Math.random() * 10 - 5)
      } else {
        // 月/年数据：随机生成
        return Math.random() * 100 + 20
      }
    })
  }

  const timeAxis = generateTimeAxis(timeType)
  const powerData = generatePowerData(timeAxis.length)
  const energyData = powerData.map(p => p * 0.8 + Math.random() * 5)

  const series: ChartSeries[] = [
    {
      name: '当日发电量(kWh)',
      data: energyData,
      yAxisIndex: 0,
      color: '#ff7f0e'
    },
    {
      name: '总有功功率(kW)',
      data: powerData,
      yAxisIndex: 1,
      color: '#ffbb78'
    }
  ]

  return {
    success: true,
    code: 200,
    message: 'success',
    data: {
      chartData: {
        timeAxis,
        series,
        yAxis: [
          { name: '发电量(kWh)', position: 'left' },
          { name: '功率(kW)', position: 'right' }
        ]
      },
      summary: {
        maxPower: Math.max(...powerData),
        totalGeneration: energyData.reduce((sum, val) => sum + val, 0),
        avgEfficiency: 85.2
      }
    }
  }
}

/**
 * 生成告警详情Mock数据
 */
export const getMockAlarmDetail = (alarmId: string): AlarmDetailResponse => {
  const alarmInfo: AlarmDetailInfo = {
    alarmId,
    stationName: 'CN-N0101',
    stationLocation: '阳光云平台',
    alarmSource: '阳光云平台',
    alarmObject: '智能运维平台/安徽省芜湖市/芜湖南亭市后水灯',
    alarmLevel: '警告',
    alarmName: 'PV反接告警',
    alarmCount: 1,
    alarmTime: '2025-09-17 14:32:26',
    clearTime: '2025-09-17 14:33:24',
    autoCleared: true,
    confirmer: '-',
    confirmTime: undefined,
    confirmComment: '-',
    deviceType: '阳光云平台',
    confirmStatus: '行确认',
    alarmType: '吉',
    affectedScope: '-',
    deviceValue: '1'
  }

  // 生成告警时段的设备数据
  const timeAxis = Array.from({ length: 24 }, (_, i) => 
    `${i.toString().padStart(2, '0')}:00`
  )
  
  const series: ChartSeries[] = [
    {
      name: '当日发电量 (kWh)',
      data: Array.from({ length: 24 }, (_, i) => {
        const hour = i
        if (hour < 6 || hour > 18) return 0
        return Math.sin(((hour - 6) / 12) * Math.PI) * 30 + Math.random() * 5
      }),
      yAxisIndex: 0,
      color: '#ff7f0e'
    },
    {
      name: '总有功功率 (kW)',
      data: Array.from({ length: 24 }, (_, i) => {
        const hour = i
        if (hour < 6 || hour > 18) return 0
        return Math.sin(((hour - 6) / 12) * Math.PI) * 40 + Math.random() * 8
      }),
      yAxisIndex: 1,
      color: '#ffbb78'
    }
  ]

  const deviceData: AlarmDeviceData = {
    timeAxis,
    series,
    alarmPeriod: {
      startTime: '14:32',
      endTime: '14:33',
      duration: '1分钟'
    }
  }

  return {
    success: true,
    code: 200,
    message: 'success',
    data: {
      alarmInfo,
      deviceData,
      possibleCauses: [
        'PV组串接线错误',
        '组串极性接反',
        '组串连接松动'
      ],
      suggestions: [
        '检查PV组串接线是否正确',
        '确认组串正负极接线',
        '检查接线端子是否松动'
      ]
    }
  }
}

/**
 * 生成告警处理响应Mock数据
 */
export const getMockAlarmHandle = (
  alarmId: string,
  action: string
): AlarmHandleResponse => {
  return {
    success: true,
    code: 200,
    message: '告警处理成功',
    data: {
      alarmId,
      newStatus: action === 'confirm' ? '已确认' : '已处理',
      workOrderId: action === 'create_workorder' ? `wo_${Date.now()}` : undefined
    }
  }
}
