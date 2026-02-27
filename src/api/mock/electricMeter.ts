import type { ElectricMeterData, ElectricMeterDetail } from '@/api/types/device/electricMeter';

// 电站列表
const stations = [
  { id: '101', name: '亳州利辛县经开区污水厂', region: '安徽省亳州市' },
  { id: '102', name: '亳州利辛县城污水厂', region: '安徽省亳州市' },
  { id: '103', name: '芜湖城南污水厂', region: '安徽省芜湖市' },
  { id: '104', name: '六安凤凰桥二期污水厂', region: '安徽省六安市' },
  { id: '105', name: '君山区第一污水处理厂', region: '湖南省岳阳市' },
  { id: '106', name: '九江第一污水处理厂', region: '江西省九江市' }
];

// 生成随机数
function random(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

// 生成设备状态
function generateStatus(index: number): 'normal' | 'alarm' | 'offline' {
  // 根据源站数据：43正常，0告警，2离线
  if (index >= 43) return 'offline';
  return 'normal';
}

// 生成随机电能表数据
export function generateElectricMeterList(count: number = 15, stationId?: string): ElectricMeterData[] {
  const list: ElectricMeterData[] = [];
  
  // 随机选择一个电站或使用传入的电站ID
  const station = stationId 
    ? stations.find(s => s.id === stationId) || stations[0]
    : stations[Math.floor(Math.random() * stations.length)];
  
  for (let i = 0; i < count; i++) {
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
    const meterType = Math.random() > 0.3 ? 'AC' : 'DC'; // 70%交流，30%直流
    
    list.push({
      id: `EM_${Date.now()}_${i}`,
      deviceName: `${station.name}-电能表${i + 1}`,
      deviceCode: `EM${(i + 1).toString().padStart(3, '0')}`,
      stationId: station.id,
      stationName: station.name,
      status,
      meterRatio: [60, 80, 100, 120, 150][Math.floor(Math.random() * 5)],
      meterType,
      activePower: isOnline ? random(50, 250, 2) : 0,
      forwardActiveEnergy: isOnline ? random(5000, 15000, 1) : 0,
      reverseActiveEnergy: isOnline ? random(0, 1000, 2) : 0,
      forwardReactiveEnergy: isOnline ? random(100, 300, 2) : 0,
      reverseReactiveEnergy: isOnline ? random(0, 80, 2) : 0,
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

// 生成电能表详情
export function generateElectricMeterDetail(meter: ElectricMeterData): ElectricMeterDetail {
  const isOnline = meter.status !== 'offline';
  
  return {
    basicInfo: {
      deviceName: meter.deviceName,
      deviceCode: meter.deviceCode,
      stationName: meter.stationName,
      manufacturer: ['华为', '正泰', '威胜', '科陆'][Math.floor(Math.random() * 4)],
      model: ['DTSD1352', 'DTS1946', 'DTZY1296', 'DSZY1345'][Math.floor(Math.random() * 4)],
      meterRatio: meter.meterRatio,
      installDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-15`,
      meterType: meter.meterType === 'AC' ? '交流' : '直流'
    },
    realtimeData: {
      activePower: meter.activePower,
      forwardActiveEnergy: meter.forwardActiveEnergy,
      reverseActiveEnergy: meter.reverseActiveEnergy,
      forwardReactiveEnergy: meter.forwardReactiveEnergy,
      reverseReactiveEnergy: meter.reverseReactiveEnergy,
      voltageA: isOnline ? random(375, 385, 1) : 0,
      voltageB: isOnline ? random(375, 385, 1) : 0,
      voltageC: isOnline ? random(375, 385, 1) : 0,
      currentA: isOnline ? random(120, 130, 1) : 0,
      currentB: isOnline ? random(120, 130, 1) : 0,
      currentC: isOnline ? random(120, 130, 1) : 0,
      frequency: isOnline ? random(49.9, 50.1, 2) : 0,
      powerFactor: isOnline ? random(0.95, 1.0, 2) : 0
    },
    statistics: {
      dailyEnergy: isOnline ? random(150, 200, 1) : 0,
      yesterdayEnergy: isOnline ? random(150, 200, 1) : 0,
      monthlyEnergy: isOnline ? random(3000, 5000, 0) : 0,
      lastMonthEnergy: isOnline ? random(3000, 5000, 0) : 0,
      yearlyEnergy: isOnline ? random(100000, 200000, 0) : 0
    },
    status: {
      runStatus: isOnline ? 'running' : 'offline',
      commStatus: meter.communicationStatus,
      alarmStatus: meter.alarmStatus,
      alarmCount: meter.alarmStatus === 'alarm' ? Math.floor(Math.random() * 5) + 1 : 0
    },
    config: {
      meterRatio: meter.meterRatio,
      meterType: meter.meterType === 'AC' ? '交流' : '直流',
      commProtocol: ['Modbus RTU', 'DL/T 645', 'IEC 61850'][Math.floor(Math.random() * 3)],
      commAddress: (Math.floor(Math.random() * 99) + 1).toString().padStart(2, '0')
    }
  };
}

// 计算统计数据
export function calculateStatistics(list: ElectricMeterData[]): {
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

