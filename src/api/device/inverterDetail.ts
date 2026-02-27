import type {
  DeviceBasicInfo,
  MonitoringData,
  AlarmListParams,
  AlarmListResponse,
  HistoryDataParams,
  HistoryDataResponse,
  PointListResponse,
  PropertyListResponse,
  StringListResponse,
  SiblingDevicesResponse
} from '@/api/types/device/inverterDetail';

// Mock数据生成函数
function generateMockMonitoringData(): MonitoringData {
  return {
    overview: {
      dailyGeneration: 59.6,
      yesterdayGeneration: 174.3,
      monthlyGeneration: 3368,
      lastMonthGeneration: 9136,
      yearlyGeneration: 147275,
      lastYearGeneration: 179581,
      totalGeneration: 451848,
      totalActivePower: 35.48,
      totalDcPower: 37.57,
      totalReactivePower: 0.01,
      totalApparentPower: 35.2,
      totalPowerFactor: 1,
      dcVoltage1: 749.4,
      dcVoltage2: 743.6,
      dcVoltage3: 747.5,
      dcVoltage4: 769.1,
      dcCurrent1: 7.2,
      dcCurrent2: 7.1,
      dcCurrent3: 7.4,
      dcCurrent4: 6.7,
      dcBusVoltage: 775.7,
      acVoltageAB: 233.4,
      acVoltageBC: 235.8,
      acVoltageCA: 235,
      acCurrentA: 48.8,
      acCurrentB: 49,
      acCurrentC: 49.1,
      gridFrequency: 50.03,
      inverterTemperature: 64.3,
      groundImpedance: 1203,
      acNtcTemperature: 0,
      pvTotalVoltage: 870.1,
      pvTotalCurrent: 49.2
    },
    pvInfo: {
      pvCurrent1: 3.2, pvCurrent2: 4, pvCurrent3: 3.3, pvCurrent4: 3.7,
      pvCurrent5: 3.4, pvCurrent6: 3.9, pvCurrent7: 3.3, pvCurrent8: 3.3,
      pvCurrent9: 3.4, pvCurrent10: 3.9, pvCurrent11: 3.3, pvCurrent12: 0.2,
      pvCurrent13: 3.3, pvCurrent14: 3.7, pvCurrent15: 3.2, pvCurrent16: 0.1,
      pvCurrent17: 0, pvCurrent18: 0, pvCurrent19: 0, pvCurrent20: 0,
      pvVoltage1: 745.6, pvVoltage2: 743.4, pvVoltage3: 747.9, pvVoltage4: 770.9,
      pvVoltage5: 706.5, pvVoltage6: 715.2, pvVoltage7: 791.1, pvVoltage8: 847.7,
      pvVoltage9: 0, pvVoltage10: 0
    },
    statusInfo: {
      commInterrupt: 0, normalRunning: 1, initialStandby: 0, standby: 0,
      deratedOperation: 1, limitedOperation: 0, controlShutdown: 0, faultShutdown: 0,
      gridSurge: 0, internalFanFault: 0, externalFanFault: 0, dcSpdFail: 0,
      vgSpdFail: 0, phaseGroundAlarm: 0, gridOverVoltage: 0, gridUnderVoltage: 0,
      overloadDerating: 0, gridOverFrequency: 0, gridUnderFrequency: 0, gridReverse: 0,
      noGrid: 0, gridImbalance: 0, gridFreqJitter: 0, gridOverCurrent: 0,
      gridCurrentTrackFault: 0, dcOverVoltage: 0, dcBusOverVoltage: 0,
      dcBusImbalance1: 0, dcBusUnderVoltage: 0, dcBusImbalance2: 0,
      dcAOverCurrent: 0, dcBOverCurrent: 0, dcInputDisturbance: 0,
      dcReverse: 0, busVoltageInconsistent: 0, gridDisturbance1: 0,
      dspInitProtect: 0, inverterOverTemp: 0, pvInsulationFault: 0,
      leakageCurrentProtect: 0, relayCheckProtect: 0, dcComponentExcess: 0,
      leakageCurrentSelfCheck: 0, underTempProtect: 0, arcSelfCheck: 0,
      arcFault: 0, dspSelfCheckFault: 0, gridDisturbance2: 0,
      gridCurrentSampleFault: 0, igbtOverCurrent: 0
    },
    totalPoints: 113,
    updateTime: new Date().toLocaleString('zh-CN', { hour12: false })
  };
}

// 获取设备基本信息
export async function getDeviceBasicInfo(deviceId: string): Promise<DeviceBasicInfo> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    deviceId,
    deviceName: '氧化沟B NB0101',
    deviceCode: '09150053599502364741',
    deviceType: '逆变器',
    productType: '亳州锦浪',
    manufacturer: '锦浪',
    parentDeviceName: '经开区IG2000',
    parentDeviceStatus: '在线',
    offlineTime: undefined,
    offlineDuration: undefined,
    location: '智能运维平台/安徽省亳州市/亳州利辛县经开区污水厂',
    networkComponent: 'B接口',
    connectionStatus: '在线',
    updateTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    onlineStatus: 'online'
  };
}

// 获取监控数据
export async function getMonitoringData(deviceId: string): Promise<MonitoringData> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return generateMockMonitoringData();
}

// 获取实时告警列表
export async function getRealtimeAlarms(params: AlarmListParams): Promise<AlarmListResponse> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // 生成模拟告警数据
  const mockAlarms: any[] = [
    {
      alarmId: 'AL001',
      alarmLevel: 2,
      alarmName: '电网过压告警',
      alarmLocation: '安徽省亳州市/亳州利辛县经开区污水厂',
      alarmDevice: '氧化沟B NB0101',
      alarmTime: new Date(Date.now() - 3600000).toLocaleString('zh-CN', { hour12: false }),
      suggestion: '检查电网电压是否正常，必要时联系供电部门',
      confirmStatus: 'unconfirmed'
    },
    {
      alarmId: 'AL002',
      alarmLevel: 3,
      alarmName: '内部风扇异常',
      alarmLocation: '安徽省亳州市/亳州利辛县经开区污水厂',
      alarmDevice: '氧化沟B NB0101',
      alarmTime: new Date(Date.now() - 7200000).toLocaleString('zh-CN', { hour12: false }),
      suggestion: '检查风扇运行状态，清理灰尘或更换风扇',
      confirmStatus: 'confirmed'
    },
    {
      alarmId: 'AL003',
      alarmLevel: 1,
      alarmName: '逆变器过温保护',
      alarmLocation: '安徽省亳州市/亳州利辛县经开区污水厂',
      alarmDevice: '氧化沟B NB0101',
      alarmTime: new Date(Date.now() - 10800000).toLocaleString('zh-CN', { hour12: false }),
      suggestion: '立即停机检查，检查散热系统是否正常',
      confirmStatus: 'unconfirmed'
    }
  ];
  
  // 应用筛选
  let filteredList = [...mockAlarms];
  if (params.alarmLevel) {
    filteredList = filteredList.filter(item => item.alarmLevel === params.alarmLevel);
  }
  if (params.confirmStatus) {
    filteredList = filteredList.filter(item => item.confirmStatus === params.confirmStatus);
  }
  
  // 分页
  const start = (params.pageNum - 1) * params.pageSize;
  const end = start + params.pageSize;
  
  return {
    total: filteredList.length,
    list: filteredList.slice(start, end)
  };
}

// 获取历史告警列表
export async function getHistoryAlarms(params: AlarmListParams): Promise<AlarmListResponse> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // 生成模拟历史告警数据
  const mockAlarms: any[] = [];
  const alarmTypes = [
    { name: '电网过压', level: 2, suggestion: '检查电网电压' },
    { name: '电网欠压', level: 2, suggestion: '检查电网电压' },
    { name: '逆变器过温', level: 1, suggestion: '检查散热系统' },
    { name: '内部风扇异常', level: 3, suggestion: '检查风扇状态' },
    { name: '直流过压', level: 2, suggestion: '检查直流侧电压' },
    { name: 'PV绝缘故障', level: 1, suggestion: '检查组串绝缘' }
  ];
  
  for (let i = 0; i < 15; i++) {
    const alarmType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)];
    const alarmTime = new Date(Date.now() - Math.random() * 7 * 24 * 3600000);
    const clearTime = new Date(alarmTime.getTime() + Math.random() * 3600000);
    
    mockAlarms.push({
      alarmId: `HAL${String(i + 1).padStart(3, '0')}`,
      alarmLevel: alarmType.level,
      alarmName: alarmType.name,
      alarmLocation: '安徽省亳州市/亳州利辛县经开区污水厂',
      alarmDevice: '氧化沟B NB0101',
      alarmTime: alarmTime.toLocaleString('zh-CN', { hour12: false }),
      clearTime: clearTime.toLocaleString('zh-CN', { hour12: false }),
      suggestion: alarmType.suggestion,
      confirmStatus: Math.random() > 0.3 ? 'confirmed' : 'unconfirmed'
    });
  }
  
  // 按时间排序
  mockAlarms.sort((a, b) => new Date(b.alarmTime).getTime() - new Date(a.alarmTime).getTime());
  
  // 应用筛选
  let filteredList = [...mockAlarms];
  if (params.alarmLevel) {
    filteredList = filteredList.filter(item => item.alarmLevel === params.alarmLevel);
  }
  if (params.confirmStatus) {
    filteredList = filteredList.filter(item => item.confirmStatus === params.confirmStatus);
  }
  
  // 分页
  const start = (params.pageNum - 1) * params.pageSize;
  const end = start + params.pageSize;
  
  return {
    total: filteredList.length,
    list: filteredList.slice(start, end)
  };
}

// 批量确认告警
export async function confirmAlarms(alarmIds: string[]): Promise<{successCount: number; failCount: number}> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    successCount: alarmIds.length,
    failCount: 0
  };
}

// 批量消除告警
export async function clearAlarms(alarmIds: string[]): Promise<{successCount: number; failCount: number}> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    successCount: alarmIds.length,
    failCount: 0
  };
}

// 获取历史数据
export async function getHistoryData(params: HistoryDataParams): Promise<HistoryDataResponse> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 生成模拟数据
  const timePoints = 24;
  const time: string[] = [];
  const series: any[] = [];
  
  // 根据时间类型生成不同的时间点
  for (let i = 0; i < timePoints; i++) {
    if (params.timeType === 'day' || !params.timeType) {
      time.push(`${String(i).padStart(2, '0')}:00`);
    } else if (params.timeType === 'month') {
      time.push(`${String(i + 1).padStart(2, '0')}日`);
    } else {
      time.push(`${String(i + 1).padStart(2, '0')}月`);
    }
  }
  
  // 根据选择的测点生成数据
  params.pointIds.forEach((pointId) => {
    const values: number[] = [];
    
    // 根据测点ID生成不同特征的曲线
    for (let i = 0; i < timePoints; i++) {
      let value = 0;
      
      if (pointId === 'p1' || pointId.includes('power')) {
        // 功率曲线 - 类似太阳辐照曲线
        const peak = 35;
        const morning = 6;
        const evening = 18;
        if (i < morning || i > evening) {
          value = 0;
        } else {
          const midDay = (morning + evening) / 2;
          const angle = ((i - morning) / (evening - morning)) * Math.PI;
          value = peak * Math.sin(angle) + Math.random() * 2 - 1;
        }
      } else if (pointId === 'p4' || pointId.includes('energy')) {
        // 电量曲线 - 累积曲线
        value = i * 8 + Math.random() * 5;
      } else if (pointId.includes('voltage')) {
        // 电压曲线 - 较稳定
        value = 230 + Math.random() * 10 - 5;
      } else if (pointId.includes('current')) {
        // 电流曲线 - 跟随功率变化
        const peak = 48;
        const morning = 6;
        const evening = 18;
        if (i < morning || i > evening) {
          value = 0;
        } else {
          const midDay = (morning + evening) / 2;
          const angle = ((i - morning) / (evening - morning)) * Math.PI;
          value = peak * Math.sin(angle) + Math.random() * 2 - 1;
        }
      } else {
        // 默认曲线
        value = 30 + Math.sin((i / timePoints) * Math.PI * 2) * 20 + Math.random() * 3;
      }
      
      values.push(Math.max(0, parseFloat(value.toFixed(2))));
    }
    
    // 获取测点信息
    const pointInfo = getPointInfo(pointId);
    
    series.push({
      pointId,
      pointName: pointInfo.name,
      unit: pointInfo.unit,
      values
    });
  });
  
  return { time, series };
}

// 辅助函数：获取测点信息
function getPointInfo(pointId: string) {
  const pointMap: Record<string, { name: string; unit: string }> = {
    p1: { name: '有功功率', unit: 'kW' },
    p2: { name: '无功功率', unit: 'kVar' },
    p3: { name: '视在功率', unit: 'kVA' },
    p4: { name: '日发电量', unit: 'kWh' },
    p5: { name: 'A相电压', unit: 'V' },
    p6: { name: 'B相电压', unit: 'V' },
    p7: { name: 'C相电压', unit: 'V' },
    p8: { name: 'A相电流', unit: 'A' },
    p9: { name: 'B相电流', unit: 'A' },
    p10: { name: 'C相电流', unit: 'A' }
  };
  return pointMap[pointId] || { name: `测点${pointId}`, unit: 'kW' };
}

// 获取测点列表
export async function getPointList(deviceId: string): Promise<PointListResponse> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    points: [
      { pointId: 'p1', pointName: '有功功率', unit: 'kW', category: 'power' },
      { pointId: 'p2', pointName: '无功功率', unit: 'kVar', category: 'power' },
      { pointId: 'p3', pointName: '视在功率', unit: 'kVA', category: 'power' },
      { pointId: 'p4', pointName: '日发电量', unit: 'kWh', category: 'energy' },
      { pointId: 'p5', pointName: 'A相电压', unit: 'V', category: 'voltage' },
      { pointId: 'p6', pointName: 'B相电压', unit: 'V', category: 'voltage' },
      { pointId: 'p7', pointName: 'C相电压', unit: 'V', category: 'voltage' },
      { pointId: 'p8', pointName: 'A相电流', unit: 'A', category: 'current' },
      { pointId: 'p9', pointName: 'B相电流', unit: 'A', category: 'current' },
      { pointId: 'p10', pointName: 'C相电流', unit: 'A', category: 'current' }
    ],
    quickSelections: [
      { name: '功率', pointIds: ['p1', 'p2', 'p3'] },
      { name: '电量', pointIds: ['p4'] },
      { name: '交流电压', pointIds: ['p5', 'p6', 'p7'] },
      { name: 'PV电压', pointIds: ['p5', 'p6'] },
      { name: 'PV电流', pointIds: ['p8', 'p9', 'p10'] }
    ]
  };
}

// 获取属性信息
export async function getProperties(deviceId: string): Promise<PropertyListResponse> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    properties: [
      { propertyId: '107', propertyName: '坐标-经度', propertyType: '文本类型', propertyValue: '-' },
      { propertyId: '25', propertyName: '坐标-X轴', propertyType: '数值类型', propertyValue: '-' },
      { propertyId: '26', propertyName: '坐标-Y轴', propertyType: '数值类型', propertyValue: '-' },
      { propertyId: '188', propertyName: '户号', propertyType: '文本类型', propertyValue: '-' },
      { propertyId: '108', propertyName: '坐标-纬度', propertyType: '文本类型', propertyValue: '-' },
      { propertyId: '31', propertyName: '安装位置', propertyType: '文本类型', propertyValue: '-' },
      { propertyId: '15', propertyName: '能源分类', propertyType: '枚举类型', propertyValue: '-' },
      { propertyId: '17', propertyName: '物理分项', propertyType: '树类型', propertyValue: '-' },
      { propertyId: '16', propertyName: '管理分项', propertyType: '树类型', propertyValue: '-' }
    ]
  };
}

// 获取组串详情
export async function getStrings(deviceId: string): Promise<StringListResponse> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const strings = [];
  for (let i = 1; i <= 20; i++) {
    strings.push({
      stringName: `PV电流_${i}`,
      enableStatus: i === 1 ? ('enabled' as const) : ('disabled' as const),
      realtimeCurrent: parseFloat((Math.random() * 4).toFixed(1)),
      capacity: i === 1 ? 129250 : 0
    });
  }
  
  return { strings };
}

// 获取同电站设备列表
export async function getSiblingDevices(deviceId: string): Promise<SiblingDevicesResponse> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const devices = [];
  for (let i = 1; i <= 5; i++) {
    devices.push({
      deviceId: `INV_${String(i).padStart(4, '0')}`,
      deviceName: `逆变器${i}号`,
      deviceCode: `0915${String(i).padStart(16, '0')}`,
      onlineStatus: Math.random() > 0.2 ? ('online' as const) : ('offline' as const)
    });
  }
  
  const currentIndex = devices.findIndex(d => d.deviceId === deviceId);
  if (currentIndex === -1) {
    devices.unshift({
      deviceId,
      deviceName: '氧化沟B NB0101',
      deviceCode: '09150053599502364741',
      onlineStatus: 'online'
    });
  }
  
  return {
    devices,
    currentIndex: devices.findIndex(d => d.deviceId === deviceId),
    stationPath: '安徽省亳州市/亳州利辛县经开区污水厂'
  };
}

