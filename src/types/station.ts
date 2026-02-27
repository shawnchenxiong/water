export interface StationTreeNode {
  regionId: string;
  regionName: string;
  modelId: string;
  upRegionId: string;
  iconPath?: string;
  subsystemCode?: string | null;
  gridType?: string | null;
  sort: number;
  administrationCode?: string;
  childList?: StationTreeNode[];
  deviceList?: any[] | null;
  
  // 扩展字段（来自场站管理接口）
  factoryId?: number; // 场站ID
  note?: string; // 场站信息
  address?: string; // 场站地址
  photo?: string; // 场站照片
  lon?: number; // 经度
  lat?: number; // 纬度
}

export interface StationTreeResponse {
  code: number;
  message: string;
  data: StationTreeNode[];
}

export interface StationTreeProps {
  deviceType?: string; // 设备类型参数
  filterModelId?: string; // 过滤模型ID
  autoSelectFirstLeaf?: boolean; // 是否自动选中首个叶子节点
}

export interface StationTreeEmits {
  (e: 'node-click', node: StationTreeNode): void;
  (e: 'refresh'): void;
}

// 设备监测数据项
export interface DeviceMetric {
  name: string; // 监测项名称（如：电压、电流、频率）
  totalAmount: string; // 监测值（包含单位）
}

// 电站数据接口（匹配真实API结构）
export interface StationData {
  regionName: string; // 电站名称
  monthElectric: string; // 月发电量
  nowTemp: string; // 当前温度
  createdate: string; // 创建/更新时间
  
  // 告警数据
  alarmData: {
    list: any[];
    total: number;
  };
  
  // 曲线数据
  curveData: {
    timeList: string[]; // 时间列表（5分钟间隔，288个点）
    powerGenerationList: (number | string)[]; // 功率列表（数字或"-"）
    irradiationList: (number | string)[]; // 辐射列表（数字或"-"）
    weatherIconList?: string[]; // 天气图标列表（可选）
    isShowIrradiation?: string; // 是否显示辐射（可选）
  };
  
  // 设备监测数据（从 /device/listByFactoryId 接口获取）
  deviceMetrics?: DeviceMetric[]; // 设备监测数据数组
  
  // 以下为兼容旧代码的字段
  id?: string;
  name?: string;
  capacity?: number;
  commStatus?: 'normal' | 'partial_offline' | 'all_offline' | 'connecting';
  alarmStatus?: 'none' | 'has_alarm';
  dailyEnergy?: number;
  dailyHours?: number;
  realPower?: number;
  powerNormalized?: number;
  powerSource?: string;
  deviceCount?: {
    total: number;
    offline: number;
  };
  latestAlarm?: string;
  powerTrend?: {
    time: string[];
    power: number[];
    radiation: number[];
  };
}

// 电站统计数据接口
export interface StationStats {
  total: number;
  commNormal: number;
  allOffline: number;
  partialOffline: number;
  // 告警统计（不关联卡片筛选）
  commonlyAlarm: number; // 普通告警
  seriousAlarm: number; // 重要告警
  emergentAlarm: number; // 紧急告警
}