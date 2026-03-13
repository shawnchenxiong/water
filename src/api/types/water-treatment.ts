/**
 * 水处理相关数据类型定义
 */

/**
 * 水质监测数据
 */
export interface WaterQualityData {
  cod: number          // COD 化学需氧量 mg/L
  bod?: number         // BOD 生化需氧量 mg/L (可选)
  nh3n: number         // NH3-N 氨氮 mg/L
  tn: number           // TN 总氮 mg/L
  tp: number           // TP 总磷 mg/L
  ss: number           // SS 悬浮物 mg/L
  ph: number           // pH值
  do: number           // DO 溶解氧 mg/L
  turbidity: number    // 浊度 NTU
  temperature: number  // 温度 ℃
  mlss?: number        // MLSS 污泥浓度 mg/L (可选)
  orp?: number         // ORP 氧化还原电位 mV (可选)
}

/**
 * 流量数据
 */
export interface FlowData {
  inflowRate: number       // 进水流量 m³/h
  outflowRate: number      // 出水流量 m³/h
  returnFlowRate?: number  // 回流流量 m³/h
  sludgeFlowRate?: number  // 污泥流量 m³/h
}

/**
 * 液位数据
 */
export interface LevelData {
  currentLevel: number     // 当前液位 m
  maxLevel: number         // 最高液位 m
  minLevel: number         // 最低液位 m
  alarmLevel?: number      // 告警液位 m
}

/**
 * 设备运行状态
 */
export interface DeviceStatus {
  deviceId: string         // 设备ID
  deviceName: string       // 设备名称
  deviceType: string       // 设备类型
  status: 'running' | 'stopped' | 'fault' | 'maintenance'  // 运行状态
  frequency?: number       // 频率 Hz
  current?: number         // 电流 A
  power?: number           // 功率 kW
  temperature?: number     // 温度 ℃
  pressure?: number        // 压力 kPa
  flowRate?: number        // 流量 m³/h
  runningHours?: number    // 运行小时数 h
}

/**
 * 工艺段数据
 */
export interface ProcessData {
  processId: string                    // 工艺段ID
  processName: string                  // 工艺段名称
  waterQuality?: WaterQualityData      // 水质数据
  flow?: FlowData                      // 流量数据
  level?: LevelData                    // 液位数据
  devices: DeviceStatus[]              // 设备状态列表
  timestamp: string                    // 数据时间戳
}

/**
 * 污水厂统计数据
 */
export interface PlantStatistics {
  plantId: string                      // 污水厂ID
  plantName: string                    // 污水厂名称
  designCapacity: number               // 设计处理能力 m³/d
  todayVolume: number                  // 今日处理水量 m³
  monthVolume: number                  // 本月处理水量 m³
  yearVolume: number                   // 本年处理水量 m³
  loadRate: number                     // 负荷率 %
  complianceRate: number               // 出水达标率 %
  energyConsumption: number            // 能耗 kWh
  unitEnergyConsumption: number        // 单位水量能耗 kWh/m³
  deviceCount: number                  // 设备总数
  runningDeviceCount: number           // 运行设备数
  alarmCount: number                   // 告警数量
}
