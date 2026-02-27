import type { WeatherStationListItem, WeatherStationStats, WeatherStationDetailData, WeatherStationBasicInfo, AlarmItem } from '@/api/types/device/weatherStation';
import { getWindDirectionText } from '@/api/types/device/weatherStation';

const stationNames = [
  '利辛县城气象站',
  '东部新城气象站',
  '河西气象站',
  '东城气象站',
  '鹤问湖气象站',
  '繁昌第二污水厂气象站',
  '六安城南气象站',
  '城北二期中科气象站',
];

const stationLocations = [
  '亳州利辛县城污水厂',
  '六安东部新城污水厂',
  '六安河西污水厂',
  '六安东城污水厂',
  '九江鹤问湖污水厂',
  '繁昌第二污水厂',
  '六安城南污水厂',
  '六安城北二期污水厂',
];

export function generateWeatherStationList(count: number = 8, stationId?: string): WeatherStationListItem[] {
  const list: WeatherStationListItem[] = [];
  
  // 随机选择一个电站位置
  const locationIndex = stationId 
    ? parseInt(stationId) % stationLocations.length 
    : Math.floor(Math.random() * stationLocations.length);
  const baseLocation = stationLocations[locationIndex];
  
  for (let i = 0; i < count; i++) {
    const windDirection = Math.floor(Math.random() * 360);
    
    // 大部分设备正常，少数告警或离线
    const rand = Math.random();
    let status: 'normal' | 'alarm' | 'offline';
    if (rand < 0.85) {
      status = 'normal';
    } else if (rand < 0.95) {
      status = 'alarm';
    } else {
      status = 'offline';
    }
    
    const isOnline = status !== 'offline';
    
    list.push({
      id: `WS_${Date.now()}_${i}`,
      name: stationNames[i % stationNames.length] || `气象站${i + 1}`,
      stationName: baseLocation,
      status,
      communicationStatus: status === 'offline' ? 'offline' : 'online',
      alarmStatus: status === 'alarm' ? 'has_alarm' : 'none',
      instantIrradiance: isOnline ? (Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 100)) : 0,
      dailyIrradiance: isOnline ? parseFloat((Math.random() * 4).toFixed(2)) : 0,
      temperature: isOnline ? parseFloat((10 + Math.random() * 10).toFixed(1)) : 0,
      humidity: isOnline ? parseFloat((70 + Math.random() * 25).toFixed(1)) : 0,
      windSpeed: isOnline ? parseFloat((Math.random() * 3).toFixed(1)) : 0,
      windDirection,
      windDirectionText: getWindDirectionText(windDirection),
      updateTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
    });
  }
  
  return list;
}

export function calculateWeatherStationStats(list: WeatherStationListItem[]): WeatherStationStats {
  return {
    total: list.length,
    normal: list.filter(item => item.status === 'normal').length,
    alarm: list.filter(item => item.status === 'alarm').length,
    offline: list.filter(item => item.status === 'offline').length,
  };
}

export function generateWeatherStationDetail(id: string): WeatherStationDetailData {
  const windDirection = Math.floor(Math.random() * 360);
  
  return {
    id,
    name: '利辛县城气象站',
    stationName: '亳州利辛县城污水厂',
    updateTime: '2025-10-18 21:03:23',
    communicationStatus: 'online',
    overview: {
      instantIrradiance: 0,
      dailyIrradiance: 3.58,
      sunshineHours: 3.4,
      temperature: 13.6,
      humidity: 75.3,
      componentTemperature: 13.6,
      windDirection: getWindDirectionText(windDirection),
      windSpeed: 0,
    },
    statusInfo: {
      communicationInterrupt: 0,
    },
    totalPoints: 9,
  };
}

export function generateBasicInfo(id: string): WeatherStationBasicInfo {
  return {
    name: '利辛县城气象站',
    deviceCode: '09200053597693317189',
    deviceType: '气象站',
    productType: '辰云气象站',
    manufacturer: '武汉辰云',
    parentDeviceName: '利辛县城污水厂二期配电房3#IG2000',
    parentDeviceStatus: 'online',
    offlineTime: null,
    offlineDuration: null,
    location: '智能运维平台/安徽省亳州市/亳州利辛县城污水厂',
    networkComponent: 'B接口',
    connectionStatus: 'online',
    attributes: [
      { id: '107', name: '坐标-经度', type: '文本类型', value: '-' },
      { id: '25', name: '坐标-X轴', type: '数值类型', value: '-' },
      { id: '26', name: '坐标-Y轴', type: '数值类型', value: '-' },
      { id: '188', name: '户号', type: '文本类型', value: '-' },
      { id: '108', name: '坐标-纬度', type: '文本类型', value: '-' },
      { id: '31', name: '安装位置', type: '文本类型', value: '-' },
      { id: '15', name: '能源分类', type: '枚举类型', value: '-' },
      { id: '17', name: '物理分项', type: '树类型', value: '-' },
      { id: '16', name: '管理分项', type: '树类型', value: '-' },
    ],
  };
}

export function generateAlarmList(count: number = 0): AlarmItem[] {
  if (count === 0) return [];
  
  const alarmTypes = [
    { name: '辐照度传感器异常', level: 2, suggestion: '检查辐照度传感器连接' },
    { name: '温度传感器异常', level: 2, suggestion: '检查温度传感器' },
    { name: '湿度传感器离线', level: 1, suggestion: '检查湿度传感器通讯' },
    { name: '风速仪故障', level: 3, suggestion: '检查风速仪状态' }
  ];
  
  const alarmList: AlarmItem[] = [];
  for (let i = 0; i < count; i++) {
    const alarmType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)];
    const alarmTime = new Date(Date.now() - Math.random() * 7 * 24 * 3600000);
    const clearTime = Math.random() > 0.5 ? new Date(alarmTime.getTime() + Math.random() * 3600000) : undefined;
    
    alarmList.push({
      id: `AL${String(i + 1).padStart(4, '0')}`,
      level: alarmType.level as 1 | 2 | 3,
      name: alarmType.name,
      location: '安徽省亳州市/亳州利辛县城污水厂',
      device: '利辛县城气象站',
      time: alarmTime.toLocaleString('zh-CN', { hour12: false }),
      clearTime: clearTime?.toLocaleString('zh-CN', { hour12: false }),
      suggestion: alarmType.suggestion,
      status: clearTime ? 'cleared' : 'active'
    });
  }
  
  return alarmList.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

export function generateHistoryData(params: any) {
  // 生成模拟的历史数据（用于ECharts）
  const timeData: string[] = [];
  const temperatureData: number[] = [];
  const humidityData: number[] = [];
  const irradianceData: number[] = [];
  
  for (let i = 0; i < 24; i++) {
    timeData.push(`${String(i).padStart(2, '0')}:00`);
    temperatureData.push(parseFloat((10 + Math.random() * 10).toFixed(1)));
    humidityData.push(parseFloat((70 + Math.random() * 25).toFixed(1)));
    irradianceData.push(parseFloat((Math.random() * 4).toFixed(2)));
  }
  
  return {
    timeData,
    series: [
      { name: '环境温度', data: temperatureData, unit: '℃' },
      { name: '环境湿度', data: humidityData, unit: '%RH' },
      { name: '日辐照量', data: irradianceData, unit: 'MJ/m²' },
    ],
  };
}

