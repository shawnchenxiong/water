/**
 * 移动巡检问题管理 Mock 数据
 */

import type {
  InspectionIssue,
  InspectionIssueListResponse,
  StationTreeNode,
  InspectionIssueBasicData,
  IssueStatistics,
} from '@/api/types/mobile-inspection-issues'

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

// 巡检问题列表数据
export const mockInspectionIssues: InspectionIssue[] = [
  {
    id: 'issue001',
    inspectionLevel: '高',
    levelColor: '#e74c3c',
    inspectionType: '设备巡检',
    stationName: '芜湖城南污水厂',
    stationId: 'LHYR98NH00000014',
    confirmStatus: '待确认',
    statusColor: '#e67e22',
    inspector: '张三',
    inspectorId: 'user001',
    updateTime: '2025-10-21 14:30:00',
    confirmer: '',
    confirmerId: '',
    confirmTime: '',
    confirmDescription: '',
    issueDescription: '逆变器1号机柜温度异常，需要检查散热系统',
    location: '1号逆变器房',
    images: ['image1.jpg', 'image2.jpg']
  },
  {
    id: 'issue002',
    inspectionLevel: '中',
    levelColor: '#f39c12',
    inspectionType: '安全巡检',
    stationName: '芜湖城南污水厂',
    stationId: 'LHYR98NH00000014',
    confirmStatus: '已确认',
    statusColor: '#27ae60',
    inspector: '李四',
    inspectorId: 'user002',
    updateTime: '2025-10-21 16:20:00',
    confirmer: '王五',
    confirmerId: 'user003',
    confirmTime: '2025-10-21 17:30:00',
    confirmDescription: '已安排维修人员处理，预计明日完成',
    issueDescription: '围栏东侧有轻微损坏',
    location: '东围栏区域',
    images: ['image3.jpg']
  },
  {
    id: 'issue003',
    inspectionLevel: '低',
    levelColor: '#3498db',
    inspectionType: '环境巡检',
    stationName: '芜湖城南污水厂',
    stationId: 'LHYR98NH00000014',
    confirmStatus: '已忽略',
    statusColor: '#95a5a6',
    inspector: '赵六',
    inspectorId: 'user004',
    updateTime: '2025-10-21 12:15:00',
    confirmer: '孙七',
    confirmerId: 'user005',
    confirmTime: '2025-10-21 13:00:00',
    confirmDescription: '属于正常范围，无需处理',
    issueDescription: '组件表面有少量灰尘',
    location: 'A区组件阵列',
    images: []
  },
  {
    id: 'issue004',
    inspectionLevel: '高',
    levelColor: '#e74c3c',
    inspectionType: '设备巡检',
    stationName: '芜湖大坝清水厂',
    stationId: 'LHYR98NH00000015',
    confirmStatus: '待确认',
    statusColor: '#e67e22',
    inspector: '钱八',
    inspectorId: 'user006',
    updateTime: '2025-10-21 09:45:00',
    confirmer: '',
    confirmerId: '',
    confirmTime: '',
    confirmDescription: '',
    issueDescription: '汇流箱2号出现故障报警',
    location: '2号汇流箱',
    images: ['image4.jpg', 'image5.jpg', 'image6.jpg']
  },
  {
    id: 'issue005',
    inspectionLevel: '中',
    levelColor: '#f39c12',
    inspectionType: '环境巡检',
    stationName: '芜湖大坝清水厂',
    stationId: 'LHYR98NH00000015',
    confirmStatus: '已确认',
    statusColor: '#27ae60',
    inspector: '周九',
    inspectorId: 'user007',
    updateTime: '2025-10-21 11:20:00',
    confirmer: '吴十',
    confirmerId: 'user008',
    confirmTime: '2025-10-21 15:45:00',
    confirmDescription: '已通知清洁人员进行处理',
    issueDescription: '组件阵列积尘较多，影响发电效率',
    location: 'B区组件阵列',
    images: ['image7.jpg']
  },
  {
    id: 'issue006',
    inspectionLevel: '低',
    levelColor: '#3498db',
    inspectionType: '安全巡检',
    stationName: '芜湖南亭市后水灯',
    stationId: 'LHYR98NH00000016',
    confirmStatus: '待确认',
    statusColor: '#e67e22',
    inspector: '郑十一',
    inspectorId: 'user009',
    updateTime: '2025-10-21 08:30:00',
    confirmer: '',
    confirmerId: '',
    confirmTime: '',
    confirmDescription: '',
    issueDescription: '监控摄像头角度偏移',
    location: '监控室',
    images: ['image8.jpg']
  },
  {
    id: 'issue007',
    inspectionLevel: '高',
    levelColor: '#e74c3c',
    inspectionType: '设备巡检',
    stationName: '亳州利辛县城污水厂',
    stationId: 'LHYR98NH00000003',
    confirmStatus: '已确认',
    statusColor: '#27ae60',
    inspector: '王十二',
    inspectorId: 'user010',
    updateTime: '2025-10-20 16:00:00',
    confirmer: '李十三',
    confirmerId: 'user011',
    confirmTime: '2025-10-20 18:30:00',
    confirmDescription: '紧急处理，已联系厂家维修',
    issueDescription: '变压器油温过高，存在安全隐患',
    location: '主变压器',
    images: ['image9.jpg', 'image10.jpg']
  },
  {
    id: 'issue008',
    inspectionLevel: '中',
    levelColor: '#f39c12',
    inspectionType: '环境巡检',
    stationName: '岳阳君山区污水厂',
    stationId: 'LHYR98NH00000004',
    confirmStatus: '已忽略',
    statusColor: '#95a5a6',
    inspector: '张十四',
    inspectorId: 'user012',
    updateTime: '2025-10-20 14:15:00',
    confirmer: '赵十五',
    confirmerId: 'user013',
    confirmTime: '2025-10-20 16:20:00',
    confirmDescription: '天气原因，属于正常现象',
    issueDescription: '雨后积水未及时排除',
    location: '电缆沟',
    images: []
  },
  {
    id: 'issue009',
    inspectionLevel: '低',
    levelColor: '#3498db',
    inspectionType: '安全巡检',
    stationName: '九江柴桑区污水厂',
    stationId: 'LHYR98NH00000005',
    confirmStatus: '待确认',
    statusColor: '#e67e22',
    inspector: '孙十六',
    inspectorId: 'user014',
    updateTime: '2025-10-20 10:30:00',
    confirmer: '',
    confirmerId: '',
    confirmTime: '',
    confirmDescription: '',
    issueDescription: '警示标识有轻微褪色',
    location: '入口处',
    images: ['image11.jpg']
  },
  {
    id: 'issue010',
    inspectionLevel: '高',
    levelColor: '#e74c3c',
    inspectionType: '设备巡检',
    stationName: '黄冈团风县污水厂',
    stationId: 'LHYR98NH00000006',
    confirmStatus: '待确认',
    statusColor: '#e67e22',
    inspector: '周十七',
    inspectorId: 'user015',
    updateTime: '2025-10-19 15:45:00',
    confirmer: '',
    confirmerId: '',
    confirmTime: '',
    confirmDescription: '',
    issueDescription: '断路器跳闸，需要检查线路',
    location: '配电室',
    images: ['image12.jpg', 'image13.jpg']
  }
]

// 基础数据
export const mockInspectionIssueBasicData: InspectionIssueBasicData = {
  confirmStatuses: [
    { value: '待确认', label: '待确认', color: '#e67e22' },
    { value: '已确认', label: '已确认', color: '#27ae60' },
    { value: '已忽略', label: '已忽略', color: '#95a5a6' }
  ],
  inspectionLevels: [
    { value: '高', label: '高', color: '#e74c3c' },
    { value: '中', label: '中', color: '#f39c12' },
    { value: '低', label: '低', color: '#3498db' }
  ],
  inspectionTypes: [
    { value: '设备巡检', label: '设备巡检' },
    { value: '安全巡检', label: '安全巡检' },
    { value: '环境巡检', label: '环境巡检' },
    { value: '综合巡检', label: '综合巡检' }
  ]
}

// 问题统计数据
export const mockIssueStatistics: IssueStatistics = {
  totalCount: 10,
  pendingCount: 4,
  confirmedCount: 4,
  ignoredCount: 2,
  highLevelCount: 4,
  mediumLevelCount: 3,
  lowLevelCount: 3
}

/**
 * 根据电站ID获取巡检问题列表
 */
export const getInspectionIssuesByStationId = (stationId: string): InspectionIssueListResponse => {
  const filteredIssues = mockInspectionIssues.filter(issue => issue.stationId === stationId)
  
  return {
    inspectionIssues: filteredIssues,
    pagination: {
      current: 1,
      pageSize: 20,
      total: filteredIssues.length,
      totalPages: Math.ceil(filteredIssues.length / 20)
    }
  }
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
 * 根据问题ID获取问题详情
 */
export const getInspectionIssueById = (issueId: string): InspectionIssue | null => {
  return mockInspectionIssues.find(issue => issue.id === issueId) || null
}

/**
 * 确认问题
 */
export const confirmInspectionIssue = (
  issueId: string,
  confirmStatus: string,
  confirmDescription: string
): boolean => {
  const issue = mockInspectionIssues.find(issue => issue.id === issueId)
  if (issue) {
    issue.confirmStatus = confirmStatus
    issue.statusColor = confirmStatus === '已确认' ? '#27ae60' : '#95a5a6'
    issue.confirmDescription = confirmDescription
    issue.confirmer = '当前用户'
    issue.confirmerId = 'current_user'
    issue.confirmTime = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-')
    return true
  }
  return false
}

/**
 * 获取问题统计数据
 */
export const getIssueStatisticsByStationId = (stationId: string): IssueStatistics => {
  const filteredIssues = mockInspectionIssues.filter(issue => issue.stationId === stationId)
  
  return {
    totalCount: filteredIssues.length,
    pendingCount: filteredIssues.filter(issue => issue.confirmStatus === '待确认').length,
    confirmedCount: filteredIssues.filter(issue => issue.confirmStatus === '已确认').length,
    ignoredCount: filteredIssues.filter(issue => issue.confirmStatus === '已忽略').length,
    highLevelCount: filteredIssues.filter(issue => issue.inspectionLevel === '高').length,
    mediumLevelCount: filteredIssues.filter(issue => issue.inspectionLevel === '中').length,
    lowLevelCount: filteredIssues.filter(issue => issue.inspectionLevel === '低').length
  }
}
