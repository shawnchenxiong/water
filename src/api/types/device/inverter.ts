export interface InverterData {
  id: string;
  deviceName: string;
  deviceCode: string;
  stationId: string;
  stationName: string;
  status: 'normal' | 'alarm' | 'offline';
  realtimePower: number;
  dailyEnergy: number;
  dailyEquivalentHours: number;
  installedCapacity: number;
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

export interface InverterDetail {
  basicInfo: {
    deviceName: string;
    deviceCode: string;
    stationName: string;
    manufacturer: string;
    model: string;
    installedCapacity: number;
    commissionDate: string;
  };
  realtimeData: {
    power: number;
    dailyEnergy: number;
    monthlyEnergy: number;
    yearlyEnergy: number;
    totalEnergy: number;
    efficiency: number;
    powerFactor: number;
    dcVoltage: number;
    dcCurrent: number;
    acVoltage: number;
    acCurrent: number;
    frequency: number;
    temperature: number;
  };
  statistics: {
    dailyEnergy: number;
    yesterdayEnergy: number;
    monthlyEnergy: number;
    lastMonthEnergy: number;
    yearlyEnergy: number;
    dailyEquivalentHours: number;
  };
  status: {
    runStatus: string;
    commStatus: string;
    alarmStatus: string;
    alarmCount: number;
  };
}

export interface InverterListParams {
  pageNum: number;
  pageSize: number;
  status?: string;
  stationId?: string;
  keyword?: string;
}

export interface InverterListResponse {
  total: number;
  list: InverterData[];
  statistics: DeviceStatistics;
}

