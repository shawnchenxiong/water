/**
 * 移动巡检记录管理 Mock 数据
 */

import type {
  InspectionRecord,
  InspectionRecordListResponse,
  StationTreeNode,
  InspectionRecordBasicData,
  RecordStatistics,
} from '@/api/types/mobile-inspection-records'

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

// 巡检记录列表数据
export const mockInspectionRecords: InspectionRecord[] = [
  {
    id: 'record001',
    inspectionType: '设备巡检',
    stationName: '芜湖城南污水厂',
    stationId: 'LHYR98NH00000014',
    inspectionStatus: '已完成',
    inspectionNotes: '设备运行正常，无异常发现',
    inspector: '张三',
    inspectorId: 'user001',
    updateTime: '2025-10-21 14:30:00',
    createTime: '2025-10-21 08:00:00',
    duration: '6.5小时'
  },
  {
    id: 'record002',
    inspectionType: '安全巡检',
    stationName: '芜湖城南污水厂',
    stationId: 'LHYR98NH00000014',
    inspectionStatus: '进行中',
    inspectionNotes: '',
    inspector: '李四',
    inspectorId: 'user002',
    updateTime: '2025-10-21 16:20:00',
    createTime: '2025-10-21 13:00:00',
    duration: ''
  },
  {
    id: 'record003',
    inspectionType: '环境巡检',
    stationName: '芜湖城南污水厂',
    stationId: 'LHYR98NH00000014',
    inspectionStatus: '已完成',
    inspectionNotes: '环境清洁，无污染源',
    inspector: '王五',
    inspectorId: 'user003',
    updateTime: '2025-10-21 11:45:00',
    createTime: '2025-10-21 09:00:00',
    duration: '2.5小时'
  },
  {
    id: 'record004',
    inspectionType: '设备巡检',
    stationName: '芜湖大坝清水厂',
    stationId: 'LHYR98NH00000015',
    inspectionStatus: '已完成',
    inspectionNotes: '逆变器运行稳定，温度正常',
    inspector: '赵六',
    inspectorId: 'user004',
    updateTime: '2025-10-21 10:30:00',
    createTime: '2025-10-21 07:30:00',
    duration: '3小时'
  },
  {
    id: 'record005',
    inspectionType: '综合巡检',
    stationName: '芜湖大坝清水厂',
    stationId: 'LHYR98NH00000015',
    inspectionStatus: '待开始',
    inspectionNotes: '',
    inspector: '孙七',
    inspectorId: 'user005',
    updateTime: '2025-10-21 18:00:00',
    createTime: '2025-10-21 18:00:00',
    duration: ''
  },
  {
    id: 'record006',
    inspectionType: '安全巡检',
    stationName: '芜湖南亭市后水灯',
    stationId: 'LHYR98NH00000016',
    inspectionStatus: '已完成',
    inspectionNotes: '安全设施完好，警示标识清晰',
    inspector: '周八',
    inspectorId: 'user006',
    updateTime: '2025-10-20 16:45:00',
    createTime: '2025-10-20 14:00:00',
    duration: '2.75小时'
  },
  {
    id: 'record007',
    inspectionType: '设备巡检',
    stationName: '亳州利辛县城污水厂',
    stationId: 'LHYR98NH00000003',
    inspectionStatus: '进行中',
    inspectionNotes: '',
    inspector: '吴九',
    inspectorId: 'user007',
    updateTime: '2025-10-20 15:20:00',
    createTime: '2025-10-20 12:00:00',
    duration: ''
  },
  {
    id: 'record008',
    inspectionType: '环境巡检',
    stationName: '岳阳君山区污水厂',
    stationId: 'LHYR98NH00000004',
    inspectionStatus: '已完成',
    inspectionNotes: '周边环境良好，无杂草覆盖',
    inspector: '郑十',
    inspectorId: 'user008',
    updateTime: '2025-10-20 12:30:00',
    createTime: '2025-10-20 09:30:00',
    duration: '3小时'
  },
  {
    id: 'record009',
    inspectionType: '设备巡检',
    stationName: '九江柴桑区污水厂',
    stationId: 'LHYR98NH00000005',
    inspectionStatus: '已完成',
    inspectionNotes: '设备运行参数正常，无故障报警',
    inspector: '王十一',
    inspectorId: 'user009',
    updateTime: '2025-10-19 17:15:00',
    createTime: '2025-10-19 13:00:00',
    duration: '4.25小时'
  },
  {
    id: 'record010',
    inspectionType: '综合巡检',
    stationName: '黄冈团风县污水厂',
    stationId: 'LHYR98NH00000006',
    inspectionStatus: '待开始',
    inspectionNotes: '',
    inspector: '李十二',
    inspectorId: 'user010',
    updateTime: '2025-10-19 08:00:00',
    createTime: '2025-10-19 08:00:00',
    duration: ''
  },
  {
    id: 'record011',
    inspectionType: '安全巡检',
    stationName: '芜湖城南污水厂',
    stationId: 'LHYR98NH00000014',
    inspectionStatus: '已完成',
    inspectionNotes: '消防设备检查完毕，功能正常',
    inspector: '张十三',
    inspectorId: 'user011',
    updateTime: '2025-10-18 15:30:00',
    createTime: '2025-10-18 13:30:00',
    duration: '2小时'
  },
  {
    id: 'record012',
    inspectionType: '设备巡检',
    stationName: '芜湖大坝清水厂',
    stationId: 'LHYR98NH00000015',
    inspectionStatus: '已完成',
    inspectionNotes: '汇流箱检查完成，接线牢固',
    inspector: '赵十四',
    inspectorId: 'user012',
    updateTime: '2025-10-18 11:20:00',
    createTime: '2025-10-18 08:00:00',
    duration: '3.33小时'
  }
]

// 基础数据
export const mockInspectionRecordBasicData: InspectionRecordBasicData = {
  inspectionTypes: [
    { value: '设备巡检', label: '设备巡检' },
    { value: '安全巡检', label: '安全巡检' },
    { value: '环境巡检', label: '环境巡检' },
    { value: '综合巡检', label: '综合巡检' }
  ],
  inspectionStatuses: [
    { value: '待开始', label: '待开始', color: '#909399' },
    { value: '进行中', label: '进行中', color: '#E6A23C' },
    { value: '已完成', label: '已完成', color: '#67C23A' },
    { value: '已暂停', label: '已暂停', color: '#F56C6C' }
  ]
}

// 记录统计数据
export const mockRecordStatistics: RecordStatistics = {
  totalCount: 12,
  completedCount: 8,
  inProgressCount: 2,
  pendingCount: 2,
  deviceInspectionCount: 5,
  safetyInspectionCount: 4,
  environmentInspectionCount: 2
}

/**
 * 根据电站ID获取巡检记录列表
 */
export const getInspectionRecordsByStationId = (stationId: string): InspectionRecordListResponse => {
  const filteredRecords = mockInspectionRecords.filter(record => record.stationId === stationId)
  
  return {
    inspectionRecords: filteredRecords,
    pagination: {
      current: 1,
      pageSize: 20,
      total: filteredRecords.length,
      totalPages: Math.ceil(filteredRecords.length / 20)
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
 * 根据记录ID获取记录详情
 */
export const getInspectionRecordById = (recordId: string): InspectionRecord | null => {
  return mockInspectionRecords.find(record => record.id === recordId) || null
}

/**
 * 获取记录统计数据
 */
export const getRecordStatisticsByStationId = (stationId: string): RecordStatistics => {
  const filteredRecords = mockInspectionRecords.filter(record => record.stationId === stationId)
  
  return {
    totalCount: filteredRecords.length,
    completedCount: filteredRecords.filter(record => record.inspectionStatus === '已完成').length,
    inProgressCount: filteredRecords.filter(record => record.inspectionStatus === '进行中').length,
    pendingCount: filteredRecords.filter(record => record.inspectionStatus === '待开始').length,
    deviceInspectionCount: filteredRecords.filter(record => record.inspectionType === '设备巡检').length,
    safetyInspectionCount: filteredRecords.filter(record => record.inspectionType === '安全巡检').length,
    environmentInspectionCount: filteredRecords.filter(record => record.inspectionType === '环境巡检').length
  }
}

/**
 * 创建巡检记录
 */
export const createInspectionRecord = (recordData: Partial<InspectionRecord>): string => {
  const newRecord: InspectionRecord = {
    id: `record${Date.now()}`,
    inspectionType: recordData.inspectionType || '设备巡检',
    stationName: recordData.stationName || '',
    stationId: recordData.stationId || '',
    inspectionStatus: '待开始',
    inspectionNotes: '',
    inspector: recordData.inspector || '',
    inspectorId: recordData.inspectorId || '',
    updateTime: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-'),
    createTime: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-'),
    duration: ''
  }
  
  mockInspectionRecords.unshift(newRecord)
  return newRecord.id
}

/**
 * 更新巡检记录
 */
export const updateInspectionRecord = (
  recordId: string,
  updateData: Partial<InspectionRecord>
): boolean => {
  const recordIndex = mockInspectionRecords.findIndex(record => record.id === recordId)
  if (recordIndex === -1) {
    return false
  }
  
  mockInspectionRecords[recordIndex] = {
    ...mockInspectionRecords[recordIndex],
    ...updateData,
    updateTime: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-')
  }
  
  return true
}

/**
 * 删除巡检记录
 */
export const deleteInspectionRecord = (recordId: string): boolean => {
  const recordIndex = mockInspectionRecords.findIndex(record => record.id === recordId)
  if (recordIndex === -1) {
    return false
  }
  
  mockInspectionRecords.splice(recordIndex, 1)
  return true
}
