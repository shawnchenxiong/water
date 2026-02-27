// 设备基本信息
export interface DeviceBasicInfo {
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  deviceType: string;
  productType: string;
  manufacturer: string;
  parentDeviceName: string;
  parentDeviceStatus: string;
  offlineTime?: string;
  offlineDuration?: string;
  location: string;
  networkComponent: string;
  connectionStatus: string;
  updateTime: string;
  onlineStatus: 'online' | 'offline';
}

// 监控数据
export interface MonitoringData {
  overview: {
    // 发电量数据
    dailyGeneration: number;
    yesterdayGeneration: number;
    monthlyGeneration: number;
    lastMonthGeneration: number;
    yearlyGeneration: number;
    lastYearGeneration: number;
    totalGeneration: number;
    
    // 功率数据
    totalActivePower: number;
    totalDcPower: number;
    totalReactivePower: number;
    totalApparentPower: number;
    totalPowerFactor: number;
    
    // 直流侧数据
    dcVoltage1: number;
    dcVoltage2: number;
    dcVoltage3: number;
    dcVoltage4: number;
    dcCurrent1: number;
    dcCurrent2: number;
    dcCurrent3: number;
    dcCurrent4: number;
    dcBusVoltage: number;
    
    // 交流侧数据
    acVoltageAB: number;
    acVoltageBC: number;
    acVoltageCA: number;
    acCurrentA: number;
    acCurrentB: number;
    acCurrentC: number;
    gridFrequency: number;
    
    // 其他数据
    inverterTemperature: number;
    groundImpedance: number;
    acNtcTemperature: number;
    pvTotalVoltage: number;
    pvTotalCurrent: number;
  };
  
  pvInfo: {
    pvCurrent1: number; pvCurrent2: number; pvCurrent3: number; pvCurrent4: number;
    pvCurrent5: number; pvCurrent6: number; pvCurrent7: number; pvCurrent8: number;
    pvCurrent9: number; pvCurrent10: number; pvCurrent11: number; pvCurrent12: number;
    pvCurrent13: number; pvCurrent14: number; pvCurrent15: number; pvCurrent16: number;
    pvCurrent17: number; pvCurrent18: number; pvCurrent19: number; pvCurrent20: number;
    pvVoltage1: number; pvVoltage2: number; pvVoltage3: number; pvVoltage4: number;
    pvVoltage5: number; pvVoltage6: number; pvVoltage7: number; pvVoltage8: number;
    pvVoltage9: number; pvVoltage10: number;
  };
  
  statusInfo: {
    commInterrupt: 0 | 1;
    normalRunning: 0 | 1;
    initialStandby: 0 | 1;
    standby: 0 | 1;
    deratedOperation: 0 | 1;
    limitedOperation: 0 | 1;
    controlShutdown: 0 | 1;
    faultShutdown: 0 | 1;
    gridSurge: 0 | 1;
    internalFanFault: 0 | 1;
    externalFanFault: 0 | 1;
    dcSpdFail: 0 | 1;
    vgSpdFail: 0 | 1;
    phaseGroundAlarm: 0 | 1;
    gridOverVoltage: 0 | 1;
    gridUnderVoltage: 0 | 1;
    overloadDerating: 0 | 1;
    gridOverFrequency: 0 | 1;
    gridUnderFrequency: 0 | 1;
    gridReverse: 0 | 1;
    noGrid: 0 | 1;
    gridImbalance: 0 | 1;
    gridFreqJitter: 0 | 1;
    gridOverCurrent: 0 | 1;
    gridCurrentTrackFault: 0 | 1;
    dcOverVoltage: 0 | 1;
    dcBusOverVoltage: 0 | 1;
    dcBusImbalance1: 0 | 1;
    dcBusUnderVoltage: 0 | 1;
    dcBusImbalance2: 0 | 1;
    dcAOverCurrent: 0 | 1;
    dcBOverCurrent: 0 | 1;
    dcInputDisturbance: 0 | 1;
    dcReverse: 0 | 1;
    busVoltageInconsistent: 0 | 1;
    gridDisturbance1: 0 | 1;
    dspInitProtect: 0 | 1;
    inverterOverTemp: 0 | 1;
    pvInsulationFault: 0 | 1;
    leakageCurrentProtect: 0 | 1;
    relayCheckProtect: 0 | 1;
    dcComponentExcess: 0 | 1;
    leakageCurrentSelfCheck: 0 | 1;
    underTempProtect: 0 | 1;
    arcSelfCheck: 0 | 1;
    arcFault: 0 | 1;
    dspSelfCheckFault: 0 | 1;
    gridDisturbance2: 0 | 1;
    gridCurrentSampleFault: 0 | 1;
    igbtOverCurrent: 0 | 1;
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

// 组串信息
export interface StringInfo {
  stringName: string;
  enableStatus: 'enabled' | 'disabled';
  realtimeCurrent: number;
  capacity: number;
}

// 组串列表响应
export interface StringListResponse {
  strings: StringInfo[];
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

