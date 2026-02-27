export interface ElectricMeterData {
  id: string;
  deviceName: string;
  deviceCode: string;
  stationId: string;
  stationName: string;
  status: 'normal' | 'alarm' | 'offline';
  meterRatio: number;
  meterType: 'AC' | 'DC'; // 交流/直流
  activePower: number;
  forwardActiveEnergy: number;
  reverseActiveEnergy: number;
  forwardReactiveEnergy: number;
  reverseReactiveEnergy: number;
  communicationStatus: 'online' | 'offline';
  alarmStatus: 'normal' | 'alarm';
  updateTime: string;
}

export interface DeviceStatistics {
  total: number;
  normal: number;
  alarm: number;
  offline: number;
}

export interface ElectricMeterDetail {
  basicInfo: {
    deviceName: string;
    deviceCode: string;
    stationName: string;
    manufacturer: string;
    model: string;
    meterRatio: number;
    installDate: string;
    meterType: string;
  };
  realtimeData: {
    activePower: number;
    forwardActiveEnergy: number;
    reverseActiveEnergy: number;
    forwardReactiveEnergy: number;
    reverseReactiveEnergy: number;
    voltageA: number;
    voltageB: number;
    voltageC: number;
    currentA: number;
    currentB: number;
    currentC: number;
    frequency: number;
    powerFactor: number;
  };
  statistics: {
    dailyEnergy: number;
    yesterdayEnergy: number;
    monthlyEnergy: number;
    lastMonthEnergy: number;
    yearlyEnergy: number;
  };
  status: {
    runStatus: string;
    commStatus: string;
    alarmStatus: string;
    alarmCount: number;
  };
  config: {
    meterRatio: number;
    meterType: string;
    commProtocol: string;
    commAddress: string;
  };
}

export interface ElectricMeterListParams {
  pageNum: number;
  pageSize: number;
  status?: string;
  stationId?: string;
  keyword?: string;
  meterType?: string;
}

export interface ElectricMeterListResponse {
  total: number;
  list: ElectricMeterData[];
  statistics: DeviceStatistics;
}

