// 报表类型
export type ReportType = 
  | 'powerStation-day'     // 电站运行日报表
  | 'powerStation-week'    // 电站运行周报表
  | 'powerStation-month'   // 电站运行月报表
  | 'powerStation-year'    // 电站运行年报表
  | 'inverter'             // 逆变器报表
  | 'controller'           // 控制器报表
  | 'energyMeter'          // 电能表报表
  | 'emission'             // 节能减排报表

// 时间粒度
export type TimeGranularity = 'date' | 'week' | 'month' | 'year'

// 电站运行报表数据
export interface PowerStationRow {
  statsDate: string
  regionName: string
  regionId: string
  location?: string
  capacity: string
  generation: string
  equivalence: string
  powerInverter: string
  powerBind: string
  powerOnline: string
  powerUse: string
  powerOffline: string
  connectTime: string
  offTime: string
  onlineTime: string
  maxPower: string
  maxPowerTime: string
  avgPower: string
  irradiation: string
  dayPR: string
  textDay: string
  maxTemp: string
  minTemp: string
  avgTemp: string
  avgWindSpeed: string
}

// 逆变器报表数据
export interface InverterRow {
  deviceId: string
  deviceName: string
  nodeName: string
  capacity: number | null
  generation: string
  equivalence: number | null
  connection: string
  maxPower: string
  maxPowerTime: string
}

// 节能减排报表数据
export interface EmissionRow {
  statsDate: string
  regionName: string
  regionId: string
  location: string
  capacity: string
  generation: string
  carbonDioxideReduction: string
  saveStandardCoal: string
  equivalentTreePlant: string
  sulfurDioxide: string
  tonerDust: string
  nitrogenOxides?: string
}

// API请求参数
export interface ReportQueryParams {
  regionId: string
  dateType: TimeGranularity
  dateTime: string
  sort?: string
  order?: 'ascending' | 'descending'
  pageNum: number
  pageSize: number
}

// API响应
export interface ReportResponse<T = any> {
  code: number
  message: string
  data: {
    list: T[]
    pageNum: number
    pageSize: number
    total: number
  }
}

// 电站选项
export interface StationOption {
  value: string
  label: string
}

