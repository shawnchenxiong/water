/**
 * 移动巡检问题管理 API 接口
 */

import type {
  InspectionIssue,
  InspectionIssueQueryParams,
  InspectionIssueListResponse,
  InspectionIssueDetailResponse,
  ConfirmIssueRequest,
  ConfirmIssueResponse,
  StationTreeResponse,
  StationSearchResponse,
  InspectionIssueBasicDataResponse,
  IssueStatisticsResponse,
  BatchOperationRequest,
  BatchOperationResponse,
  IssueHistoryResponse,
} from '@/api/types/mobile-inspection-issues'

import {
  mockStationTree,
  mockInspectionIssues,
  mockInspectionIssueBasicData,
  mockIssueStatistics,
  getInspectionIssuesByStationId,
  searchStationsByKeyword,
  getInspectionIssueById,
  confirmInspectionIssue,
  getIssueStatisticsByStationId,
} from '@/api/mock/mobileInspectionIssuesMock'

/**
 * 获取电站树结构
 */
export async function getStationTree(): Promise<StationTreeResponse['data']> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return {
    stationTree: mockStationTree
  }
}

/**
 * 搜索电站
 */
export async function searchStations(keyword: string): Promise<StationSearchResponse['data']> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 200))
  
  const filteredTree = searchStationsByKeyword(keyword)
  
  return {
    stationTree: filteredTree
  }
}

/**
 * 获取巡检问题列表
 */
export async function getInspectionIssueList(
  params: InspectionIssueQueryParams
): Promise<InspectionIssueListResponse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  let filteredIssues = mockInspectionIssues.filter(issue => issue.stationId === params.stationId)
  
  // 应用筛选条件
  if (params.confirmStatus) {
    filteredIssues = filteredIssues.filter(issue => issue.confirmStatus === params.confirmStatus)
  }
  
  if (params.inspectionLevel) {
    filteredIssues = filteredIssues.filter(issue => issue.inspectionLevel === params.inspectionLevel)
  }
  
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filteredIssues = filteredIssues.filter(issue => 
      issue.issueDescription.toLowerCase().includes(keyword) ||
      issue.location.toLowerCase().includes(keyword) ||
      issue.inspector.toLowerCase().includes(keyword)
    )
  }
  
  // 应用排序
  const sortField = params.sortField || 'updateTime'
  const sortOrder = params.sortOrder || 'desc'
  
  filteredIssues.sort((a, b) => {
    const aValue = a[sortField as keyof InspectionIssue]
    const bValue = b[sortField as keyof InspectionIssue]
    
    if (sortOrder === 'desc') {
      return String(bValue).localeCompare(String(aValue))
    } else {
      return String(aValue).localeCompare(String(bValue))
    }
  })
  
  // 应用分页
  const page = params.page || 1
  const pageSize = params.pageSize || 20
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedIssues = filteredIssues.slice(startIndex, endIndex)
  
  return {
    inspectionIssues: paginatedIssues,
    pagination: {
      current: page,
      pageSize: pageSize,
      total: filteredIssues.length,
      totalPages: Math.ceil(filteredIssues.length / pageSize)
    }
  }
}

/**
 * 获取问题详情
 */
export async function getInspectionIssueDetail(issueId: string): Promise<InspectionIssue> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const issue = getInspectionIssueById(issueId)
  if (!issue) {
    throw new Error('问题不存在')
  }
  
  return issue
}

/**
 * 确认问题
 */
export async function confirmIssue(request: ConfirmIssueRequest): Promise<ConfirmIssueResponse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 400))
  
  const success = confirmInspectionIssue(
    request.issueId,
    request.confirmStatus,
    request.confirmDescription
  )
  
  if (!success) {
    throw new Error('问题确认失败')
  }
  
  return {
    code: 200,
    message: '确认成功',
    data: null
  }
}

/**
 * 批量确认问题
 */
export async function batchConfirmIssues(request: BatchOperationRequest): Promise<BatchOperationResponse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 600))
  
  let successCount = 0
  let failedCount = 0
  const failedItems: string[] = []
  
  for (const issueId of request.issueIds) {
    try {
      const confirmStatus = request.operation === 'confirm' ? '已确认' : '已忽略'
      const success = confirmInspectionIssue(
        issueId,
        confirmStatus,
        request.confirmDescription || ''
      )
      
      if (success) {
        successCount++
      } else {
        failedCount++
        failedItems.push(issueId)
      }
    } catch (error) {
      failedCount++
      failedItems.push(issueId)
    }
  }
  
  return {
    code: 200,
    message: `批量操作完成，成功${successCount}个，失败${failedCount}个`,
    data: {
      successCount,
      failedCount,
      failedItems
    }
  }
}

/**
 * 获取基础数据
 */
export async function getInspectionIssueBasicData(): Promise<InspectionIssueBasicDataResponse['data']> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return mockInspectionIssueBasicData
}

/**
 * 获取问题统计数据
 */
export async function getIssueStatistics(stationId?: string): Promise<IssueStatisticsResponse['data']> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  if (stationId) {
    return getIssueStatisticsByStationId(stationId)
  } else {
    return mockIssueStatistics
  }
}

/**
 * 删除问题
 */
export async function deleteInspectionIssue(issueId: string): Promise<void> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const index = mockInspectionIssues.findIndex(issue => issue.id === issueId)
  if (index === -1) {
    throw new Error('问题不存在')
  }
  
  mockInspectionIssues.splice(index, 1)
}

/**
 * 批量删除问题
 */
export async function batchDeleteIssues(issueIds: string[]): Promise<BatchOperationResponse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  let successCount = 0
  let failedCount = 0
  const failedItems: string[] = []
  
  for (const issueId of issueIds) {
    try {
      await deleteInspectionIssue(issueId)
      successCount++
    } catch (error) {
      failedCount++
      failedItems.push(issueId)
    }
  }
  
  return {
    code: 200,
    message: `批量删除完成，成功${successCount}个，失败${failedCount}个`,
    data: {
      successCount,
      failedCount,
      failedItems
    }
  }
}

/**
 * 获取问题历史记录
 */
export async function getIssueHistory(issueId: string): Promise<IssueHistoryResponse['data']> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // 模拟历史记录数据
  return [
    {
      id: 'history001',
      issueId: issueId,
      action: '创建问题',
      operator: '张三',
      operatorId: 'user001',
      operationTime: '2025-10-21 14:30:00',
      description: '巡检发现问题',
      oldValue: '',
      newValue: '待确认'
    },
    {
      id: 'history002',
      issueId: issueId,
      action: '状态变更',
      operator: '王五',
      operatorId: 'user003',
      operationTime: '2025-10-21 17:30:00',
      description: '确认问题',
      oldValue: '待确认',
      newValue: '已确认'
    }
  ]
}

/**
 * 导出问题列表
 */
export async function exportInspectionIssues(params: InspectionIssueQueryParams): Promise<Blob> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const response = await getInspectionIssueList(params)
  const issues = response.inspectionIssues
  
  // 生成CSV内容
  const headers = [
    '问题ID',
    '巡检级别',
    '巡检类型',
    '电站名称',
    '确认状态',
    '巡检人员',
    '更新时间',
    '确认人',
    '确认时间',
    '问题描述',
    '问题位置'
  ]
  
  const csvContent = [
    headers.join(','),
    ...issues.map(issue => [
      issue.id,
      issue.inspectionLevel,
      issue.inspectionType,
      issue.stationName,
      issue.confirmStatus,
      issue.inspector,
      issue.updateTime,
      issue.confirmer || '',
      issue.confirmTime || '',
      `"${issue.issueDescription}"`,
      issue.location
    ].join(','))
  ].join('\n')
  
  // 添加BOM以支持中文
  const bom = '\uFEFF'
  return new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' })
}

/**
 * 上传问题图片
 */
export async function uploadIssueImage(file: File): Promise<string> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 模拟文件上传，返回图片URL
  return `https://example.com/images/${Date.now()}_${file.name}`
}

/**
 * 删除问题图片
 */
export async function deleteIssueImage(imageUrl: string): Promise<void> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
}
