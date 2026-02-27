import type {
  PatrolTaskQueryParams,
  PatrolTaskPageResponse,
  PatrolTaskBasicData,
  PatrolTaskRecord,
  PatrolMonitorTableParams,
  PatrolMonitorTableResponse,
  PatrolRecordQueryParams,
  PatrolRecordPageResponse,
  PatrolRecordBasicData,
  ApiResponse
} from '@/api/types/ai-patrol'
import {
  mockPatrolTaskRecords,
  mockPatrolTaskBasicData,
  mockPatrolMonitorTableData,
  mockPatrolRecords,
  mockPatrolRecordBasicData,
  filterPatrolTasks,
  filterPatrolRecords
} from '@/api/mock/ai-patrol'

/**
 * 获取巡检任务列表
 */
export async function getPatrolTasks(
  params: PatrolTaskQueryParams
): Promise<ApiResponse<PatrolTaskPageResponse>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockPatrolTasks(params)
  }
  
  // 生产环境调用真实API
  // return request.get('/api/ai-patrol/tasks', { params })
  
  // 临时返回Mock数据（后端API未完成时）
  return getMockPatrolTasks(params)
}

/**
 * Mock数据处理函数
 */
async function getMockPatrolTasks(
  params: PatrolTaskQueryParams
): Promise<ApiResponse<PatrolTaskPageResponse>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const allData = mockPatrolTaskRecords()
  
  // 筛选数据
  const filteredData = filterPatrolTasks(allData, {
    taskType: params.taskType,
    executeMode: params.executeMode,
    taskStatus: params.taskStatus,
    keyword: params.keyword
  })
  
  // 分页
  const current = params.current || 1
  const pageSize = params.pageSize || 20
  const total = filteredData.length
  const pages = Math.ceil(total / pageSize)
  const start = (current - 1) * pageSize
  const end = start + pageSize
  const records = filteredData.slice(start, end)
  
  return {
    code: 200,
    message: 'success',
    data: {
      records,
      total,
      current,
      pageSize,
      pages
    }
  }
}

/**
 * 获取巡检任务基础数据
 */
export async function getPatrolTaskBasicData(): Promise<ApiResponse<PatrolTaskBasicData>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockPatrolTaskBasicData()
  }
  
  // 生产环境调用真实API
  // return request.get('/api/ai-patrol/basic-data')
  
  // 临时返回Mock数据（后端API未完成时）
  return getMockPatrolTaskBasicData()
}

/**
 * Mock基础数据处理函数
 */
async function getMockPatrolTaskBasicData(): Promise<ApiResponse<PatrolTaskBasicData>> {
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return {
    code: 200,
    message: 'success',
    data: mockPatrolTaskBasicData()
  }
}

/**
 * 删除巡检任务
 */
export async function deletePatrolTask(taskId: string): Promise<ApiResponse<null>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      code: 200,
      message: 'Delete successfully',
      data: null
    }
  }
  
  // 生产环境调用真实API
  // return request.delete(`/api/ai-patrol/tasks/${taskId}`)
  
  // 临时返回Mock响应
  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    code: 200,
    message: 'Delete successfully',
    data: null
  }
}

/**
 * 批量删除巡检任务
 */
export async function batchDeletePatrolTasks(taskIds: string[]): Promise<ApiResponse<null>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      code: 200,
      message: 'Batch delete successfully',
      data: null
    }
  }
  
  // 生产环境调用真实API
  // return request.post('/api/ai-patrol/tasks/batch-delete', { taskIds })
  
  // 临时返回Mock响应
  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    code: 200,
    message: 'Batch delete successfully',
    data: null
  }
}

/**
 * 获取巡检任务详情
 */
export async function getPatrolTaskDetail(taskId: string): Promise<ApiResponse<PatrolTaskRecord>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const allData = mockPatrolTaskRecords()
    const task = allData.find(item => item.id === taskId)
    
    if (!task) {
      return {
        code: 404,
        message: 'Task not found',
        data: null as any
      }
    }
    
    return {
      code: 200,
      message: 'success',
      data: task
    }
  }
  
  // 生产环境调用真实API
  // return request.get(`/api/ai-patrol/tasks/${taskId}`)
  
  // 临时返回Mock响应
  await new Promise(resolve => setTimeout(resolve, 300))
  const allData = mockPatrolTaskRecords()
  const task = allData.find(item => item.id === taskId)
  
  if (!task) {
    return {
      code: 404,
      message: 'Task not found',
      data: null as any
    }
  }
  
  return {
    code: 200,
    message: 'success',
    data: task
  }
}

/**
 * 获取巡检监控表格数据
 */
export async function getPatrolMonitorTableData(
  params: PatrolMonitorTableParams
): Promise<ApiResponse<PatrolMonitorTableResponse>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockPatrolMonitorTableData(params)
  }
  
  // 生产环境调用真实API
  // return request.get('/api/ai-patrol/monitor/table-data', { params })
  
  // 临时返回Mock数据（后端API未完成时）
  return getMockPatrolMonitorTableData(params)
}

/**
 * Mock监控表格数据处理函数
 */
async function getMockPatrolMonitorTableData(
  params: PatrolMonitorTableParams
): Promise<ApiResponse<PatrolMonitorTableResponse>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const allData = mockPatrolMonitorTableData(params.dataType)
  
  // 分页
  const current = params.current || 1
  const pageSize = params.pageSize || 10
  const total = allData.length
  const pages = Math.ceil(total / pageSize)
  const start = (current - 1) * pageSize
  const end = start + pageSize
  const records = allData.slice(start, end)
  
  return {
    code: 200,
    message: 'success',
    data: {
      records,
      total,
      current,
      pageSize,
      pages
    }
  }
}

