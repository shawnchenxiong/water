import type {
  DeviceBasicInfo,
  MonitoringData,
  AlarmListParams,
  AlarmListResponse,
  HistoryDataParams,
  HistoryDataResponse,
  PointListResponse,
  PropertyListResponse,
  SiblingDevicesResponse
} from '@/api/types/device/electricMeterDetail';

// Mock数据生成函数
function generateMockMonitoringData(): MonitoringData {
  return {
    overview: {
      activePower: 245.8,
      powerFactor: 0.98,
      frequency: 50.02,
      forwardActiveEnergy: 125840.6,
      reverseActiveEnergy: 2356.2,
      forwardReactiveEnergy: 15420.3,
      reverseReactiveEnergy: 1250.8,
      voltageA: 231.5,
      voltageB: 232.8,
      voltageC: 230.9,
      currentA: 245.2,
      currentB: 248.6,
      currentC: 246.8,
      dailyEnergy: 582.3,
      monthlyEnergy: 15420.5,
      yearlyEnergy: 189560.8
    },
    totalPoints: 17,
    updateTime: new Date().toLocaleString('zh-CN', { hour12: false })
  };
}

// 获取设备基本信息
export async function getDeviceBasicInfo(deviceId: string): Promise<DeviceBasicInfo> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    deviceId,
    deviceName: '1#配电室总表',
    deviceCode: '09120053599502364741',
    deviceType: '电能表',
    productType: '智能电能表',
    manufacturer: '华立科技',
    meterRatio: 120,
    meterType: '三相智能电能表',
    parentDeviceName: '1#配电柜',
    parentDeviceStatus: '在线',
    offlineTime: undefined,
    offlineDuration: undefined,
    location: '智能运维平台/安徽省亳州市/亳州利辛县经开区污水厂',
    networkComponent: 'Modbus-RTU',
    connectionStatus: '在线',
    installDate: '2022-06-15',
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
  
  const mockAlarms: any[] = [
    {
      alarmId: 'AL001',
      alarmLevel: 2,
      alarmName: '相电压不平衡',
      alarmLocation: '安徽省亳州市/亳州利辛县经开区污水厂',
      alarmDevice: '1#配电室总表',
      alarmTime: new Date(Date.now() - 3600000).toLocaleString('zh-CN', { hour12: false }),
      suggestion: '检查三相负载是否平衡',
      confirmStatus: 'unconfirmed'
    }
  ];
  
  let filteredList = [...mockAlarms];
  if (params.alarmLevel) {
    filteredList = filteredList.filter(item => item.alarmLevel === params.alarmLevel);
  }
  if (params.confirmStatus) {
    filteredList = filteredList.filter(item => item.confirmStatus === params.confirmStatus);
  }
  
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
  
  const mockAlarms: any[] = [];
  const alarmTypes = [
    { name: '相电压不平衡', level: 2, suggestion: '检查三相负载' },
    { name: '频率异常', level: 2, suggestion: '检查电网频率' },
    { name: '电流过载', level: 1, suggestion: '减少负载' },
    { name: '功率因数过低', level: 3, suggestion: '增加无功补偿' }
  ];
  
  for (let i = 0; i < 10; i++) {
    const alarmType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)];
    const alarmTime = new Date(Date.now() - Math.random() * 7 * 24 * 3600000);
    const clearTime = new Date(alarmTime.getTime() + Math.random() * 3600000);
    
    mockAlarms.push({
      alarmId: `HAL${String(i + 1).padStart(3, '0')}`,
      alarmLevel: alarmType.level,
      alarmName: alarmType.name,
      alarmLocation: '安徽省亳州市/亳州利辛县经开区污水厂',
      alarmDevice: '1#配电室总表',
      alarmTime: alarmTime.toLocaleString('zh-CN', { hour12: false }),
      clearTime: clearTime.toLocaleString('zh-CN', { hour12: false }),
      suggestion: alarmType.suggestion,
      confirmStatus: Math.random() > 0.3 ? 'confirmed' : 'unconfirmed'
    });
  }
  
  mockAlarms.sort((a, b) => new Date(b.alarmTime).getTime() - new Date(a.alarmTime).getTime());
  
  let filteredList = [...mockAlarms];
  if (params.alarmLevel) {
    filteredList = filteredList.filter(item => item.alarmLevel === params.alarmLevel);
  }
  if (params.confirmStatus) {
    filteredList = filteredList.filter(item => item.confirmStatus === params.confirmStatus);
  }
  
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
  
  const timePoints = 24;
  const time: string[] = [];
  const series: any[] = [];
  
  for (let i = 0; i < timePoints; i++) {
    if (params.timeType === 'day' || !params.timeType) {
      time.push(`${String(i).padStart(2, '0')}:00`);
    } else if (params.timeType === 'month') {
      time.push(`${String(i + 1).padStart(2, '0')}日`);
    } else {
      time.push(`${String(i + 1).padStart(2, '0')}月`);
    }
  }
  
  params.pointIds.forEach((pointId) => {
    const values: number[] = [];
    
    for (let i = 0; i < timePoints; i++) {
      let value = 0;
      
      if (pointId.includes('power')) {
        value = 240 + Math.random() * 20 - 10;
      } else if (pointId.includes('energy')) {
        value = i * 25 + Math.random() * 10;
      } else if (pointId.includes('voltage')) {
        value = 230 + Math.random() * 10 - 5;
      } else if (pointId.includes('current')) {
        value = 245 + Math.random() * 15 - 7.5;
      } else {
        value = 100 + Math.random() * 50;
      }
      
      values.push(Math.max(0, parseFloat(value.toFixed(2))));
    }
    
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

function getPointInfo(pointId: string) {
  const pointMap: Record<string, { name: string; unit: string }> = {
    p1: { name: '有功功率', unit: 'kW' },
    p2: { name: '功率因数', unit: '' },
    p3: { name: '频率', unit: 'Hz' },
    p4: { name: '正向有功电能', unit: 'kWh' },
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
      { pointId: 'p2', pointName: '功率因数', unit: '', category: 'power' },
      { pointId: 'p3', pointName: '频率', unit: 'Hz', category: 'power' },
      { pointId: 'p4', pointName: '正向有功电能', unit: 'kWh', category: 'energy' },
      { pointId: 'p5', pointName: 'A相电压', unit: 'V', category: 'voltage' },
      { pointId: 'p6', pointName: 'B相电压', unit: 'V', category: 'voltage' },
      { pointId: 'p7', pointName: 'C相电压', unit: 'V', category: 'voltage' },
      { pointId: 'p8', pointName: 'A相电流', unit: 'A', category: 'current' },
      { pointId: 'p9', pointName: 'B相电流', unit: 'A', category: 'current' },
      { pointId: 'p10', pointName: 'C相电流', unit: 'A', category: 'current' }
    ],
    quickSelections: [
      { name: '功率参数', pointIds: ['p1', 'p2', 'p3'] },
      { name: '电能', pointIds: ['p4'] },
      { name: '三相电压', pointIds: ['p5', 'p6', 'p7'] },
      { name: '三相电流', pointIds: ['p8', 'p9', 'p10'] }
    ]
  };
}

// 获取属性信息
export async function getProperties(deviceId: string): Promise<PropertyListResponse> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    properties: [
      { propertyId: '101', propertyName: '电表倍率', propertyType: '数值类型', propertyValue: '120' },
      { propertyId: '102', propertyName: '电表类型', propertyType: '枚举类型', propertyValue: '三相智能电能表' },
      { propertyId: '103', propertyName: '通讯协议', propertyType: '文本类型', propertyValue: 'Modbus-RTU' },
      { propertyId: '104', propertyName: '通讯地址', propertyType: '文本类型', propertyValue: '0x01' },
      { propertyId: '105', propertyName: '波特率', propertyType: '数值类型', propertyValue: '9600' },
      { propertyId: '106', propertyName: '校验位', propertyType: '枚举类型', propertyValue: 'None' },
      { propertyId: '107', propertyName: '停止位', propertyType: '数值类型', propertyValue: '1' }
    ]
  };
}

// 获取同电站设备列表
export async function getSiblingDevices(deviceId: string): Promise<SiblingDevicesResponse> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const devices = [];
  for (let i = 1; i <= 5; i++) {
    devices.push({
      deviceId: `EM_${String(i).padStart(4, '0')}`,
      deviceName: `${i}#配电室总表`,
      deviceCode: `0912${String(i).padStart(16, '0')}`,
      onlineStatus: Math.random() > 0.2 ? ('online' as const) : ('offline' as const)
    });
  }
  
  const currentIndex = devices.findIndex(d => d.deviceId === deviceId);
  if (currentIndex === -1) {
    devices.unshift({
      deviceId,
      deviceName: '1#配电室总表',
      deviceCode: '09120053599502364741',
      onlineStatus: 'online'
    });
  }
  
  return {
    devices,
    currentIndex: devices.findIndex(d => d.deviceId === deviceId),
    stationPath: '安徽省亳州市/亳州利辛县经开区污水厂'
  };
}

