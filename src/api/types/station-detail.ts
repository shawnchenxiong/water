/**
 * 电站详情类型定义
 */

/**
 * 电站详情数据
 */
export interface StationDetail {
  /** 电站ID */
  id: string
  /** 电站名称 */
  name: string
  /** 地理位置 */
  location: string
  /** 建设状态 */
  status: string
  /** 装机容量（MWp） */
  capacity: number
  /** 瞬时辐照（W/m²） */
  irradiance: number
  /** 日辐照量（MJ/m²） */
  dailyIrradiance: number
  /** 实时功率（kW） */
  realPower: number
  /** 当日发电量（kWh） */
  dailyPower: number
  /** 当月发电量（kWh） */
  monthlyPower: number
  /** 当年发电量（万kWh） */
  yearlyPower: number
  /** 累计发电量（万kWh） */
  totalPower: number
  /** 用电功率（kW） */
  consumption: number
  /** 电网功率（kW） */
  grid: number
  /** 光伏功率（kW） */
  pvPower: number
  /** 电站图片 */
  image?: string
  /** 电站描述 */
  description?: string
}

/**
 * 天气信息
 */
export interface WeatherInfo {
  /** 当前天气 */
  current: {
    /** 温度（°C） */
    temperature: number
    /** 风向 */
    wind: string
    /** 风速 */
    windSpeed: string
    /** 日出日落时间 */
    sunTime: string
    /** 日期 */
    date: string
    /** 天气类型 */
    type: 'sunny' | 'cloudy' | 'rainy'
    /** 天气描述 */
    desc: string
    /** 温度范围 */
    tempRange: string
  }
  /** 未来天气预报 */
  forecast: Array<{
    /** 日期 */
    date: string
    /** 天气类型 */
    type: 'sunny' | 'cloudy' | 'rainy'
    /** 天气描述 */
    desc: string
    /** 温度范围 */
    tempRange: string
  }>
  /** 更新时间 */
  updateTime: string
}

/**
 * 电站完整信息（包含天气）
 */
export interface StationFullInfo {
  /** 电站详情 */
  station: StationDetail
  /** 天气信息 */
  weather: WeatherInfo
}

