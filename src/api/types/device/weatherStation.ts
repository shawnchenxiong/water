export interface WeatherStationStats {
  total: number;
  normal: number;
  alarm: number;
  offline: number;
}

export interface WeatherStationListItem {
  id: string;
  name: string;
  stationName: string;
  status: 'normal' | 'alarm' | 'offline';
  communicationStatus: 'online' | 'offline';
  alarmStatus: 'none' | 'has_alarm';
  instantIrradiance: number; // W/m²
  dailyIrradiance: number; // MJ/m²
  temperature: number; // ℃
  humidity: number; // %RH
  windSpeed: number; // m/s
  windDirection: number; // 风向角度 0-360度
  windDirectionText: string; // 风向中文描述（东风、东南风、西风等）
  updateTime: string; // YYYY/MM/DD HH:mm:ss
}

export interface WeatherStationDetailData {
  id: string;
  name: string;
  stationName: string;
  updateTime: string;
  communicationStatus: 'online' | 'offline';
  overview: {
    instantIrradiance: number; // 瞬时辐射 W/m²
    dailyIrradiance: number; // 日辐照量 MJ/m²
    sunshineHours: number; // 日照时数 h
    temperature: number; // 环境温度 ℃
    humidity: number; // 环境湿度 %RH
    componentTemperature: number; // 组件温度 ℃
    windDirection: string; // 瞬时风向
    windSpeed: number; // 瞬时风速 m/s
  };
  statusInfo: {
    communicationInterrupt: number; // 设备通讯中断
  };
  totalPoints: number; // 总测点数
}

export interface WeatherStationBasicInfo {
  name: string;
  deviceCode: string;
  deviceType: string;
  productType: string;
  manufacturer: string;
  parentDeviceName: string;
  parentDeviceStatus: 'online' | 'offline';
  offlineTime: string | null;
  offlineDuration: string | null;
  location: string;
  networkComponent: string;
  connectionStatus: 'online' | 'offline';
  attributes: Array<{
    id: string;
    name: string;
    type: string;
    value: string;
  }>;
}

export interface AlarmItem {
  id: string;
  level: string;
  name: string;
  location: string;
  device: string;
  time: string;
  suggestion: string;
  status: string;
}

// 风向角度转中文的辅助函数
export function getWindDirectionText(angle: number): string {
  if (angle < 0 || angle > 360) return '未知';
  
  const directions = [
    '北风', '东北风', '东风', '东南风',
    '南风', '西南风', '西风', '西北风'
  ];
  
  const index = Math.round(angle / 45) % 8;
  return directions[index];
}

