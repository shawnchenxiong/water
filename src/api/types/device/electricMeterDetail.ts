// 设备基本信息
export interface DeviceBasicInfo {
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  deviceType: string;
  productType: string;
  manufacturer: string;
  meterRatio: number;
  meterType: string;
  parentDeviceName: string;
  parentDeviceStatus: string;
  offlineTime?: string;
  offlineDuration?: string;
  location: string;
  networkComponent: string;
  connectionStatus: string;
  installDate: string;
  updateTime: string;
  onlineStatus: 'online' | 'offline';
}

// 监控数据
export interface MonitoringData {
  overview: {
    // 功率数据
    activePower: number;
    powerFactor: number;
    frequency: number;
    
    // 电能数据
    forwardActiveEnergy: number;
    reverseActiveEnergy: number;
    forwardReactiveEnergy: number;
    reverseReactiveEnergy: number;
    
    // 三相电压
    voltageA: number;
    voltageB: number;
    voltageC: number;
    
    // 三相电流
    currentA: number;
    currentB: number;
    currentC: number;
    
    // 统计数据
    dailyEnergy: number;
    monthlyEnergy: number;
    yearlyEnergy: number;
  };
  
  totalPoints: number;
  updateTime: string;
}

// 告警信息
export interface AlarmInfo {
  alarmId: string;
  alarmLevel: 1 | 2 | 3;
  alarmName: string;
  alarmLocation: string;
  alarmDevice: string;
  alarmTime: string;
  clearTime?: string;
  suggestion: string;
  confirmStatus: 'confirmed' | 'unconfirmed';
}

// 告警列表参数
export interface AlarmListParams {
  deviceId: string;
  alarmLevel?: number;
  startTime?: string;
  endTime?: string;
  clearStartTime?: string;
  clearEndTime?: string;
  confirmStatus?: string;
  pageNum: number;
  pageSize: number;
}

// 告警列表响应
export interface AlarmListResponse {
  total: number;
  list: AlarmInfo[];
}

// 历史数据参数
export interface HistoryDataParams {
  deviceId: string;
  timeType: string;
  startTime: string;
  endTime: string;
  pointIds: string[];
  sampling?: boolean;
  samplingInterval?: string;
  samplingType?: string;
}

// 历史数据响应
export interface HistoryDataResponse {
  time: string[];
  series: Array<{
    pointId: string;
    pointName: string;
    unit: string;
    values: number[];
  }>;
}

// 测点信息
export interface PointInfo {
  pointId: string;
  pointName: string;
  unit: string;
  category: string;
}

// 测点列表响应
export interface PointListResponse {
  points: PointInfo[];
  quickSelections: Array<{
    name: string;
    pointIds: string[];
  }>;
}

// 属性信息
export interface PropertyInfo {
  propertyId: string;
  propertyName: string;
  propertyType: string;
  propertyValue: string;
}

// 属性列表响应
export interface PropertyListResponse {
  properties: PropertyInfo[];
}

// 同电站设备列表响应
export interface SiblingDevicesResponse {
  devices: Array<{
    deviceId: string;
    deviceName: string;
    deviceCode: string;
    onlineStatus: 'online' | 'offline';
  }>;
  currentIndex: number;
  stationPath?: string;
}

