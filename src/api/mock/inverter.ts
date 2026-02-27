import type { InverterData, InverterDetail } from '@/api/types/device/inverter';

// 电站列表
const stations = [
  { id: '101', name: '亳州利辛县经开区污水厂', region: '安徽省亳州市' },
  { id: '102', name: '亳州利辛县城污水厂', region: '安徽省亳州市' },
  { id: '103', name: '芜湖城南污水厂', region: '安徽省芜湖市' },
  { id: '104', name: '六安凤凰桥二期污水厂', region: '安徽省六安市' },
  { id: '105', name: '君山区第一污水处理厂', region: '湖南省岳阳市' },
  { id: '106', name: '九江第一污水处理厂', region: '江西省九江市' }
];

// 设备名称前缀
const devicePrefixes = [
  '氧化沟A', '氧化沟B', '厌氧池A', '厌氧池B', '厌氧池C',
  '水解酸化池', '污泥浓缩脱水间', '鼓风机房', '配电间', '综合楼'
];

// 生成设备编号
function generateDeviceCode(index: number): string {
  const group = Math.floor(index / 100) + 1;
  const num = (index % 100).toString().padStart(2, '0');
  return `NB${group.toString().padStart(2, '0')}${num}`;
}

// 生成设备名称
function generateDeviceName(index: number): string {
  const prefix = devicePrefixes[index % devicePrefixes.length];
  const suffix = generateDeviceCode(index);
  return `${prefix} ${suffix}`;
}

// 生成随机数（指定范围）
function random(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

// 生成设备状态
function generateStatus(index: number): 'normal' | 'alarm' | 'offline' {
  // 根据源站数据：225正常，0告警，109离线
  const rand = Math.random();
  if (index < 225) return 'normal';
  if (index < 225) return 'alarm'; // 实际0个告警
  return 'offline';
}

// 生成随机逆变器数据
export function generateInverterList(count: number = 20, stationId?: string): InverterData[] {
  const list: InverterData[] = [];
  
  // 随机选择一个电站或使用传入的电站ID
  const station = stationId 
    ? stations.find(s => s.id === stationId) || stations[0]
    : stations[Math.floor(Math.random() * stations.length)];
  
  for (let i = 0; i < count; i++) {
    // 大部分设备正常，少数告警或离线
    const rand = Math.random();
    let status: 'normal' | 'alarm' | 'offline';
    if (rand < 0.80) {
      status = 'normal';
    } else if (rand < 0.90) {
      status = 'alarm';
    } else {
      status = 'offline';
    }
    
    const isOnline = status !== 'offline';
    
    list.push({
      id: `INV_${Date.now()}_${i}`,
      deviceName: generateDeviceName(i),
      deviceCode: generateDeviceCode(i),
      stationId: station.id,
      stationName: station.name,
      status,
      realtimePower: isOnline ? random(0, 150, 2) : 0,
      dailyEnergy: isOnline ? random(40, 180, 1) : 0,
      dailyEquivalentHours: isOnline ? random(0.4, 1.4, 2) : 0,
      installedCapacity: random(40, 140, 2),
      communicationStatus: isOnline ? 'online' : 'offline',
      alarmStatus: status === 'alarm' ? 'alarm' : 'normal',
      updateTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    });
  }
  
  return list;
}

// 生成设备详情
export function generateInverterDetail(inverter: InverterData): InverterDetail {
  const isOnline = inverter.status !== 'offline';
  
  return {
    basicInfo: {
      deviceName: inverter.deviceName,
      deviceCode: inverter.deviceCode,
      stationName: inverter.stationName,
      manufacturer: ['华为', '阳光电源', '上能电气', '锦浪科技'][Math.floor(Math.random() * 4)],
      model: ['SUN2000-100KTL-M1', 'SG110CX', 'SE100K', 'JNS-100K'][Math.floor(Math.random() * 4)],
      installedCapacity: inverter.installedCapacity,
      commissionDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-15`
    },
    realtimeData: {
      power: inverter.realtimePower,
      dailyEnergy: inverter.dailyEnergy,
      monthlyEnergy: isOnline ? random(2000, 5000, 0) : 0,
      yearlyEnergy: isOnline ? random(100000, 200000, 0) : 0,
      totalEnergy: isOnline ? random(400000, 800000, 0) : 0,
      efficiency: isOnline ? random(96, 99, 1) : 0,
      powerFactor: isOnline ? random(0.95, 1.0, 2) : 0,
      dcVoltage: isOnline ? random(600, 700, 1) : 0,
      dcCurrent: isOnline ? random(10, 20, 1) : 0,
      acVoltage: isOnline ? random(375, 385, 1) : 0,
      acCurrent: isOnline ? random(12, 18, 1) : 0,
      frequency: isOnline ? random(49.9, 50.1, 2) : 0,
      temperature: isOnline ? random(35, 55, 1) : 0
    },
    statistics: {
      dailyEnergy: inverter.dailyEnergy,
      yesterdayEnergy: isOnline ? random(40, 180, 1) : 0,
      monthlyEnergy: isOnline ? random(2000, 5000, 0) : 0,
      lastMonthEnergy: isOnline ? random(2000, 5000, 0) : 0,
      yearlyEnergy: isOnline ? random(100000, 200000, 0) : 0,
      dailyEquivalentHours: inverter.dailyEquivalentHours
    },
    status: {
      runStatus: isOnline ? 'running' : 'offline',
      commStatus: inverter.communicationStatus,
      alarmStatus: inverter.alarmStatus,
      alarmCount: inverter.alarmStatus === 'alarm' ? Math.floor(Math.random() * 5) + 1 : 0
    }
  };
}

// 计算统计数据
export function calculateStatistics(list: InverterData[]): {
  total: number;
  normal: number;
  alarm: number;
  offline: number;
} {
  return {
    total: list.length,
    normal: list.filter(item => item.status === 'normal').length,
    alarm: list.filter(item => item.status === 'alarm').length,
    offline: list.filter(item => item.status === 'offline').length
  };
}

