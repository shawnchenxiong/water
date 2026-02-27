/**
 * 移动巡检统计管理 Mock 数据
 */

import type {
  InspectionStatistics,
  StationTreeNode,
  StatisticsBasicData,
  PersonnelDetailRecord,
  StationRankingDetails,
  TimeDimension
} from '@/api/types/mobile-inspection-statistics'

// 电站树结构数据（使用regionId格式匹配StationTree组件）
export const mockStationTree: StationTreeNode[] = [
  {
    id: 'platform001',
    name: '智能运维平台',
    type: 'platform',
    children: [
      {
        id: 'province001',
        name: '安徽省芜湖市',
        type: 'province',
        children: [
          {
            id: 'LHYR98NH00000014',
            name: '芜湖城南污水厂',
            type: 'station',
            capacity: '50MW',
            status: 'online'
          },
          {
            id: 'LHYR98NH00000015',
            name: '芜湖大坝清水厂',
            type: 'station',
            capacity: '30MW',
            status: 'online'
          },
          {
            id: 'LHYR98NH00000016',
            name: '芜湖南亭市后水灯',
            type: 'station',
            capacity: '45MW',
            status: 'online'
          }
        ]
      },
      {
        id: 'province002',
        name: '安徽省六安市',
        type: 'province',
        children: [
          {
            id: 'LHYR98NH00000003',
            name: '亳州利辛县城污水厂',
            type: 'station',
            capacity: '25MW',
            status: 'maintenance'
          }
        ]
      },
      {
        id: 'province003',
        name: '湖南省岳阳市',
        type: 'province',
        children: [
          {
            id: 'LHYR98NH00000004',
            name: '岳阳君山区污水厂',
            type: 'station',
            capacity: '35MW',
            status: 'online'
          }
        ]
      },
      {
        id: 'province004',
        name: '江西省九江市',
        type: 'province',
        children: [
          {
            id: 'LHYR98NH00000005',
            name: '九江柴桑区污水厂',
            type: 'station',
            capacity: '40MW',
            status: 'online'
          }
        ]
      },
      {
        id: 'province005',
        name: '湖北省黄冈市',
        type: 'province',
        children: [
          {
            id: 'LHYR98NH00000006',
            name: '黄冈团风县污水厂',
            type: 'station',
            capacity: '28MW',
            status: 'offline'
          }
        ]
      }
    ]
  }
]

// 基础数据
export const mockStatisticsBasicData: StatisticsBasicData = {
  organizations: [
    { value: '', label: '请选择' },
    { value: 'org001', label: '安徽省芜湖市' },
    { value: 'org002', label: '安徽省六安市' },
    { value: 'org003', label: '湖南省岳阳市' },
    { value: 'org004', label: '江西省九江市' },
    { value: 'org005', label: '湖北省黄冈市' }
  ],
  timeDimensions: [
    { value: 'week', label: '周' },
    { value: 'month', label: '月' },
    { value: 'quarter', label: '季度' },
    { value: 'year', label: '年' }
  ]
}

// 空数据状态的统计数据
export const mockEmptyStatistics: InspectionStatistics = {
  timeRange: '2025年10月第4周',
  piechartData: {
    total: 0,
    normal: 0,
    abnormal: 0,
    notInspected: 0,
    series: [
      {
        name: '正常',
        value: 0,
        color: '#00d4ff'
      },
      {
        name: '异常',
        value: 0,
        color: '#ff8c00'
      },
      {
        name: '未巡检',
        value: 0,
        color: '#666666'
      }
    ]
  },
  barChartData: {
    xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    series: [
      {
        name: '巡检次数',
        data: [0, 0, 0, 0, 0, 0, 0],
        color: '#3498db'
      }
    ]
  },
  personnelStats: {
    total: 0,
    totalIssues: 0,
    unconfirmedIssues: 0,
    list: []
  },
  stationRanking: {
    title: '巡检排名',
    list: []
  },
  personnelRanking: {
    title: '巡检之星',
    list: []
  }
}

// 有数据状态的统计数据
export const mockStatisticsWithData: InspectionStatistics = {
  timeRange: '2025年10月第4周',
  piechartData: {
    total: 156,
    normal: 128,
    abnormal: 23,
    notInspected: 5,
    series: [
      {
        name: '正常',
        value: 128,
        color: '#00d4ff',
        percentage: 82.1
      },
      {
        name: '异常',
        value: 23,
        color: '#ff8c00',
        percentage: 14.7
      },
      {
        name: '未巡检',
        value: 5,
        color: '#666666',
        percentage: 3.2
      }
    ]
  },
  barChartData: {
    xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    series: [
      {
        name: '巡检次数',
        data: [18, 25, 22, 30, 28, 20, 13],
        color: '#3498db'
      }
    ]
  },
  personnelStats: {
    total: 6,
    totalIssues: 23,
    unconfirmedIssues: 8,
    list: [
      {
        id: 'user001',
        name: '张三',
        issueCount: 8,
        unconfirmedCount: 3
      },
      {
        id: 'user002',
        name: '李四',
        issueCount: 6,
        unconfirmedCount: 2
      },
      {
        id: 'user003',
        name: '王五',
        issueCount: 4,
        unconfirmedCount: 1
      },
      {
        id: 'user004',
        name: '赵六',
        issueCount: 3,
        unconfirmedCount: 1
      },
      {
        id: 'user005',
        name: '孙七',
        issueCount: 2,
        unconfirmedCount: 1
      }
    ]
  },
  stationRanking: {
    title: '巡检排名',
    list: [
      {
        rank: 1,
        stationName: '芜湖城南污水厂',
        stationId: 'LHYR98NH00000014',
        score: 95.6
      },
      {
        rank: 2,
        stationName: '芜湖大坝清水厂',
        stationId: 'LHYR98NH00000015',
        score: 92.3
      },
      {
        rank: 3,
        stationName: '芜湖南亭市后水灯',
        stationId: 'LHYR98NH00000016',
        score: 89.7
      },
      {
        rank: 4,
        stationName: '岳阳君山区污水厂',
        stationId: 'LHYR98NH00000004',
        score: 87.2
      },
      {
        rank: 5,
        stationName: '九江柴桑区污水厂',
        stationId: 'LHYR98NH00000005',
        score: 84.8
      }
    ]
  },
  personnelRanking: {
    title: '巡检之星',
    list: [
      {
        rank: 1,
        name: '张三',
        userId: 'user001',
        score: 98.5
      },
      {
        rank: 2,
        name: '李四',
        userId: 'user002',
        score: 96.2
      },
      {
        rank: 3,
        name: '王五',
        userId: 'user003',
        score: 94.8
      },
      {
        rank: 4,
        name: '赵六',
        userId: 'user004',
        score: 92.1
      },
      {
        rank: 5,
        name: '孙七',
        userId: 'user005',
        score: 89.6
      }
    ]
  }
}

// 不同时间维度的数据模板
export const getStatisticsByTimeDimension = (
  dimension: TimeDimension,
  stationId?: string
): InspectionStatistics => {
  // 总是返回有数据的状态，除非明确指定为空
  const baseData = { ...mockStatisticsWithData }
  
  // 根据不同电站调整数据
  if (stationId) {
    // 根据电站ID生成不同的数据
    const stationIndex = mockStationTree
      .flatMap(platform => platform.children || [])
      .flatMap(province => province.children || [])
      .findIndex(station => station.id === stationId)
    
    if (stationIndex >= 0) {
      // 为不同电站生成不同的数据
      const multiplier = 0.7 + (stationIndex * 0.1) // 0.7-1.2之间的倍数
      baseData.piechartData.total = Math.floor(baseData.piechartData.total * multiplier)
      baseData.piechartData.normal = Math.floor(baseData.piechartData.normal * multiplier)
      baseData.piechartData.abnormal = Math.floor(baseData.piechartData.abnormal * multiplier)
      baseData.piechartData.notInspected = Math.floor(baseData.piechartData.notInspected * multiplier)
      
      // 更新饼图数据
      baseData.piechartData.series = baseData.piechartData.series.map(item => ({
        ...item,
        value: Math.floor(item.value * multiplier)
      }))
      
      // 更新柱状图数据
      baseData.barChartData.series = baseData.barChartData.series.map(series => ({
        ...series,
        data: series.data.map(value => Math.floor(value * multiplier))
      }))
      
      // 更新人员统计
      baseData.personnelStats.total = Math.floor(baseData.personnelStats.total * multiplier)
      baseData.personnelStats.totalIssues = Math.floor(baseData.personnelStats.totalIssues * multiplier)
      baseData.personnelStats.unconfirmedIssues = Math.floor(baseData.personnelStats.unconfirmedIssues * multiplier)
    }
  }
  
  switch (dimension) {
    case 'week':
      return {
        ...baseData,
        timeRange: '2025年10月第4周',
        barChartData: {
          xAxis: ['第1周', '第2周', '第3周', '第4周'],
          series: [
            {
              name: '巡检次数',
              data: baseData.barChartData.series[0].data.slice(0, 4),
              color: '#3498db'
            }
          ]
        }
      }
    case 'month':
      return {
        ...baseData,
        timeRange: '2025年',
        barChartData: {
          xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          series: [
            {
              name: '巡检次数',
              data: [45, 52, 38, 41, 48, 55, 42, 39, 46, 50, 44, 47].map(val => 
                baseData.barChartData.series[0].data.length > 0 
                  ? Math.floor(val * (baseData.barChartData.series[0].data[0] / 25)) 
                  : val
              ),
              color: '#3498db'
            }
          ]
        }
      }
    case 'quarter':
      return {
        ...baseData,
        timeRange: '2025年',
        barChartData: {
          xAxis: ['1季度', '2季度', '3季度', '4季度'],
          series: [
            {
              name: '巡检次数',
              data: baseData.barChartData.series[0].data.slice(0, 4).map(val => Math.floor(val * 6)),
              color: '#3498db'
            }
          ]
        }
      }
    case 'year':
      return {
        ...baseData,
        timeRange: '近5年',
        barChartData: {
          xAxis: ['2021', '2022', '2023', '2024', '2025'],
          series: [
            {
              name: '巡检次数',
              data: baseData.barChartData.series[0].data.slice(0, 5).map(val => Math.floor(val * 15)),
              color: '#3498db'
            }
          ]
        }
      }
    default:
      return baseData
  }
}

// 根据时间维度生成时间范围描述
export const getTimeRangeByDimension = (dimension: TimeDimension): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  
  switch (dimension) {
    case 'week':
      return `${year}年${month}月第4周`
    case 'month':
      return `${year}年`
    case 'quarter':
      return `${year}年`
    case 'year':
      return `近5年`
    default:
      return `${year}年${month}月第4周`
  }
}

// 人员详细记录Mock数据
export const mockPersonnelDetails = {
  personnel: {
    id: 'user001',
    name: '张三',
    totalInspections: 45,
    totalIssues: 8,
    averageScore: 98.5
  },
  records: [
    {
      id: 'record001',
      inspectionType: '设备巡检',
      stationName: '芜湖城南污水厂',
      inspectionDate: '2025-10-21',
      issueCount: 2,
      status: '已完成',
      score: 95.0
    },
    {
      id: 'record002',
      inspectionType: '安全巡检',
      stationName: '芜湖大坝清水厂',
      inspectionDate: '2025-10-20',
      issueCount: 1,
      status: '已完成',
      score: 98.0
    },
    {
      id: 'record003',
      inspectionType: '环境巡检',
      stationName: '芜湖南亭市后水灯',
      inspectionDate: '2025-10-19',
      issueCount: 0,
      status: '已完成',
      score: 100.0
    }
  ] as PersonnelDetailRecord[],
  pagination: {
    current: 1,
    pageSize: 20,
    total: 45,
    totalPages: 3
  }
}

// 电站排名详细数据Mock
export const mockStationRankingDetails: StationRankingDetails = {
  stationInfo: {
    id: 'LHYR98NH00000014',
    name: '芜湖城南污水厂',
    capacity: '50MW',
    status: 'online'
  },
  scoreBreakdown: {
    completionRate: 38.2,      // 完成率评分 (40分满分)
    issueHandlingRate: 37.8,   // 问题处理率评分 (40分满分)
    timelinessRate: 19.6,      // 及时性评分 (20分满分)
    totalScore: 95.6           // 总评分
  },
  inspectionSummary: {
    totalInspections: 52,      // 总巡检次数
    completedInspections: 50,  // 完成巡检次数
    foundIssues: 8,            // 发现问题数
    resolvedIssues: 7          // 解决问题数
  },
  trendData: {
    dates: ['10-15', '10-16', '10-17', '10-18', '10-19', '10-20', '10-21'],
    scores: [92.3, 94.1, 95.8, 93.2, 96.4, 95.1, 95.6]
  }
}

/**
 * 根据电站ID获取统计数据
 */
export const getStatisticsByStationId = (
  stationId: string,
  timeDimension: TimeDimension = 'month'
): InspectionStatistics => {
  return getStatisticsByTimeDimension(timeDimension, stationId)
}

/**
 * 根据关键词搜索电站
 */
export const searchStationsByKeyword = (keyword: string): StationTreeNode[] => {
  if (!keyword.trim()) {
    return mockStationTree
  }

  const searchInTree = (nodes: StationTreeNode[]): StationTreeNode[] => {
    const result: StationTreeNode[] = []
    
    for (const node of nodes) {
      if (node.name.includes(keyword)) {
        result.push({ ...node })
      } else if (node.children) {
        const childResults = searchInTree(node.children)
        if (childResults.length > 0) {
          result.push({
            ...node,
            children: childResults
          })
        }
      }
    }
    
    return result
  }

  return searchInTree(mockStationTree)
}

/**
 * 获取人员详细记录
 */
export const getPersonnelDetailsByUserId = (
  userId: string,
  stationId?: string,
  timeRange?: string
) => {
  // 模拟根据参数过滤数据
  const filteredRecords = mockPersonnelDetails.records.filter(record => {
    if (stationId && !record.stationName.includes('芜湖')) {
      return false
    }
    // 这里可以根据userId和timeRange进一步过滤，暂时返回所有数据
    console.log('Filtering for userId:', userId, 'timeRange:', timeRange)
    return true
  })

  return {
    ...mockPersonnelDetails,
    records: filteredRecords,
    pagination: {
      ...mockPersonnelDetails.pagination,
      total: filteredRecords.length,
      totalPages: Math.ceil(filteredRecords.length / 20)
    }
  }
}

/**
 * 获取电站排名详细数据
 */
export const getStationRankingDetailsByStationId = (
  stationId: string,
  timeRange?: string
): StationRankingDetails => {
  // 根据不同电站返回不同的详细数据
  const stationInfo = mockStationTree
    .flatMap(platform => platform.children || [])
    .flatMap(province => province.children || [])
    .find(station => station.id === stationId)

  if (!stationInfo) {
    console.log('Station not found for timeRange:', timeRange)
    return mockStationRankingDetails
  }

  return {
    ...mockStationRankingDetails,
    stationInfo: {
      id: stationInfo.id,
      name: stationInfo.name,
      capacity: stationInfo.capacity || '0MW',
      status: stationInfo.status || 'unknown'
    }
  }
}

/**
 * 生成时间范围选项
 */
export const generateTimeRangeOptions = (dimension: TimeDimension): Array<{value: string, label: string}> => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  
  switch (dimension) {
    case 'week':
      // 生成最近8周的选项
      const weekOptions = []
      for (let i = 7; i >= 0; i--) {
        const weekNum = Math.max(1, 4 - Math.floor(i / 2))
        const monthOffset = Math.floor(i / 4)
        const targetMonth = month - monthOffset
        const targetYear = targetMonth <= 0 ? year - 1 : year
        const finalMonth = targetMonth <= 0 ? targetMonth + 12 : targetMonth
        const weekStr = `${targetYear}-${String(finalMonth).padStart(2, '0')}-W${weekNum}`
        const label = `${targetYear}年${finalMonth}月第${weekNum}周`
        weekOptions.push({ value: weekStr, label })
      }
      return weekOptions
      
    case 'month':
      // 生成最近12个月的选项
      const monthOptions = []
      for (let i = 11; i >= 0; i--) {
        const date = new Date(year, month - 1 - i, 1)
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        const label = `${date.getFullYear()}年${date.getMonth() + 1}月`
        monthOptions.push({ value: monthStr, label })
      }
      return monthOptions
      
    case 'quarter':
      // 生成最近8个季度的选项
      const quarterOptions = []
      for (let i = 7; i >= 0; i--) {
        const quarterYear = year - Math.floor(i / 4)
        const quarter = ((Math.ceil(month / 3) - 1 - (i % 4)) + 4) % 4 + 1
        const quarterStr = `${quarterYear}-Q${quarter}`
        const label = `${quarterYear}年第${quarter}季度`
        quarterOptions.push({ value: quarterStr, label })
      }
      return quarterOptions
      
    case 'year':
      // 生成最近5年的选项
      const yearOptions = []
      for (let i = 4; i >= 0; i--) {
        const yearValue = year - i
        const yearStr = String(yearValue)
        const label = `${yearValue}年`
        yearOptions.push({ value: yearStr, label })
      }
      return yearOptions
      
    default:
      return [{ value: '2025-10', label: '2025年10月第4周' }]
  }
}
