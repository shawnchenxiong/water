/**
 * 移动巡检统计管理类型定义
 */

// 时间维度类型
export type TimeDimension = 'week' | 'month' | 'quarter' | 'year'

// 巡检统计查询参数
export interface InspectionStatisticsQueryParams {
  stationId?: string           // 电站ID（可选，空表示全部）
  organizationId?: string      // 组织ID（可选）
  timeDimension: TimeDimension // 时间维度：day/month/quarter/year
  timeRange: string           // 时间范围，格式根据维度而定
}

// 环形图数据项
export interface PieChartDataItem {
  name: string                // 数据项名称
  value: number               // 数据值
  color: string               // 颜色
  percentage?: number         // 百分比
}

// 环形图数据
export interface PieChartData {
  total: number               // 总计次数
  normal: number              // 正常次数
  abnormal: number            // 异常次数
  notInspected: number        // 未巡检次数
  series: PieChartDataItem[]  // 图表数据系列
}

// 柱状图数据系列
export interface BarChartSeries {
  name: string                // 系列名称
  data: number[]              // 数据数组
  color: string               // 颜色
}

// 柱状图数据
export interface BarChartData {
  xAxis: string[]             // X轴标签
  series: BarChartSeries[]    // 数据系列
}

// 巡检人员统计项
export interface PersonnelStatItem {
  id: string                  // 人员ID
  name: string                // 人员姓名
  issueCount: number          // 问题数
  unconfirmedCount: number    // 未确认问题数
}

// 巡检人员统计
export interface PersonnelStats {
  total: number               // 总人数
  totalIssues: number         // 总问题数
  unconfirmedIssues: number   // 未确认问题数
  list: PersonnelStatItem[]   // 人员统计列表
}

// 电站排名项
export interface StationRankingItem {
  rank: number                // 排名
  stationName: string         // 电站名称
  stationId: string           // 电站ID
  score: number               // 评分
}

// 电站排名
export interface StationRanking {
  title: string               // 标题
  list: StationRankingItem[]  // 排名列表
}

// 人员排名项
export interface PersonnelRankingItem {
  rank: number                // 排名
  name: string                // 人员姓名
  userId: string              // 用户ID
  score: number               // 评分
}

// 人员排名
export interface PersonnelRanking {
  title: string               // 标题
  list: PersonnelRankingItem[] // 排名列表
}

// 巡检统计数据
export interface InspectionStatistics {
  timeRange: string           // 时间范围描述
  piechartData: PieChartData  // 环形图数据
  barChartData: BarChartData  // 柱状图数据
  personnelStats: PersonnelStats // 人员统计
  stationRanking: StationRanking // 电站排名
  personnelRanking: PersonnelRanking // 人员排名
}

// 巡检统计响应
export interface InspectionStatisticsResponse {
  code: number
  message: string
  data: InspectionStatistics
}

// 电站树节点
export interface StationTreeNode {
  id: string                   // 节点ID
  name: string                 // 节点名称
  type: 'platform' | 'province' | 'station'  // 节点类型
  capacity?: string            // 电站容量（仅电站节点）
  status?: string              // 电站状态（仅电站节点）
  children?: StationTreeNode[] // 子节点
}

// 电站树响应
export interface StationTreeResponse {
  code: number
  message: string
  data: {
    stationTree: StationTreeNode[]
  }
}

// 筛选表单数据
export interface FilterFormData {
  organizationId: string       // 组织ID
  timeDimension: TimeDimension // 时间维度
  timeRange: string           // 时间范围
}

// 组织选项
export interface OrganizationOption {
  value: string               // 组织ID
  label: string               // 组织名称
}

// 基础数据
export interface StatisticsBasicData {
  organizations: OrganizationOption[] // 组织选项
  timeDimensions: Array<{     // 时间维度选项
    value: TimeDimension
    label: string
  }>
}

// 基础数据响应
export interface StatisticsBasicDataResponse {
  code: number
  message: string
  data: StatisticsBasicData
}

// API响应基础结构
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 人员详细记录查询参数
export interface PersonnelDetailsQueryParams {
  userId: string              // 用户ID
  stationId?: string          // 电站ID（可选）
  timeRange: string           // 时间范围
}

// 人员详细记录
export interface PersonnelDetailRecord {
  id: string                  // 记录ID
  inspectionType: string      // 巡检类型
  stationName: string         // 电站名称
  inspectionDate: string      // 巡检日期
  issueCount: number          // 发现问题数
  status: string              // 状态
  score: number               // 评分
}

// 人员详细记录响应
export interface PersonnelDetailsResponse {
  code: number
  message: string
  data: {
    personnel: {
      id: string
      name: string
      totalInspections: number
      totalIssues: number
      averageScore: number
    }
    records: PersonnelDetailRecord[]
    pagination: {
      current: number
      pageSize: number
      total: number
      totalPages: number
    }
  }
}

// 电站排名详细数据查询参数
export interface StationRankingDetailsQueryParams {
  stationId: string           // 电站ID
  timeRange: string           // 时间范围
}

// 电站排名详细数据
export interface StationRankingDetails {
  stationInfo: {
    id: string
    name: string
    capacity: string
    status: string
  }
  scoreBreakdown: {
    completionRate: number    // 完成率评分
    issueHandlingRate: number // 问题处理率评分
    timelinessRate: number    // 及时性评分
    totalScore: number        // 总评分
  }
  inspectionSummary: {
    totalInspections: number  // 总巡检次数
    completedInspections: number // 完成巡检次数
    foundIssues: number       // 发现问题数
    resolvedIssues: number    // 解决问题数
  }
  trendData: {
    dates: string[]           // 日期数组
    scores: number[]          // 评分数组
  }
}

// 电站排名详细数据响应
export interface StationRankingDetailsResponse {
  code: number
  message: string
  data: StationRankingDetails
}

// 图表配置选项
export interface ChartOptions {
  title?: string              // 图表标题
  colors?: string[]           // 颜色配置
  responsive?: boolean        // 是否响应式
  animation?: boolean         // 是否启用动画
  legend?: {                  // 图例配置
    show: boolean
    position: 'top' | 'bottom' | 'left' | 'right'
  }
  tooltip?: {                 // 提示框配置
    show: boolean
    formatter?: string
  }
}

// 环形图配置
export interface PieChartOptions extends ChartOptions {
  innerRadius?: string        // 内半径
  outerRadius?: string        // 外半径
  centerText?: {              // 中心文本
    show: boolean
    text: string
    subText?: string
  }
}

// 柱状图配置
export interface BarChartOptions extends ChartOptions {
  xAxis?: {                   // X轴配置
    show: boolean
    type: 'category' | 'value'
  }
  yAxis?: {                   // Y轴配置
    show: boolean
    type: 'category' | 'value'
  }
  grid?: {                    // 网格配置
    show: boolean
    left: string
    right: string
    top: string
    bottom: string
  }
}

// 统计卡片数据
export interface StatisticsCard {
  id: string                  // 卡片ID
  title: string               // 卡片标题
  type: 'pie' | 'bar' | 'table' // 卡片类型
  data: any                   // 卡片数据
  loading?: boolean           // 加载状态
  error?: string              // 错误信息
}

// 导出参数
export interface ExportStatisticsParams {
  stationId?: string          // 电站ID
  organizationId?: string     // 组织ID
  timeDimension: TimeDimension // 时间维度
  timeRange: string           // 时间范围
  exportType: 'excel' | 'pdf' // 导出类型
}

// 导出响应
export interface ExportStatisticsResponse {
  code: number
  message: string
  data: {
    fileUrl: string           // 文件下载链接
    fileName: string          // 文件名
    fileSize: number          // 文件大小
  }
}
