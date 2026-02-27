// 时间类型
export type TimeType = 'day' | 'month' | 'year'

// 统计概览数据
export interface OverviewData {
  n_20: number // <-20% 数量
  n_20_n_10: number // -20%~-10% 数量
  n_10_p_10: number // -10%~+10% 数量
  p_10_p_20: number // +10%~+20% 数量
  p_20: number // >+20% 数量
  total: number // 总数
}

// 表格行数据
export interface DeviceDetail {
  deviceId: string // 设备ID
  deviceName: string // 设备名称
  deviceType: string // 设备类型
  regionId: string // 所属电站ID
  installedCapacity: string // 装机容量 (kWp)
  inverterPower: string // 逆变器发电量 (kWh)
  eqe: number // 等价发电时 (h)
  avgEqe: number // 平均等价发电时 (h)
  differenceEqe: number // 等价发电时偏差 (h)
  ratioEqe: number // 差值比例 (数值)
  ratioEqePrecent: string // 差值比例 (百分比字符串)
  nodeName: string // 电站名称
}

// API请求参数
export interface GetDataParams {
  regionId: string // 电站ID
  dateType: number // 时间类型：0-日、1-月、2-年
  queryTime: string // 查询时间
}

// API响应
export interface GetDataResponse {
  code: number
  message: string
  data: {
    n_20: number
    n_20_n_10: number
    n_10_p_10: number
    p_10_p_20: number
    p_20: number
    total: number
    inverterCapacity: DeviceDetail[]
  }
}

