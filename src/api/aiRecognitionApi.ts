import type {
  AIRecognitionHistoryQueryParams,
  AIRecognitionHistoryPageResponse,
  AIRecognitionAuditQueryParams,
  AIRecognitionAuditPageResponse,
  AIRecognitionBasicData,
  AlgorithmAuditParams,
  AIRecognitionDetail,
  ApiResponse
} from '@/api/types/ai-recognition'
import {
  mockAIRecognitionHistoryRecords,
  mockAIRecognitionAuditRecords,
  mockAIRecognitionBasicData,
  filterAIRecognitionHistoryRecords,
  filterAIRecognitionAuditRecords,
  mockAIRecognitionDetail
} from '@/api/mock/ai-recognition'
import { request } from '@/utils/request'

/**
 * 获取AI识别历史数据
 */
export async function getAIRecognitionHistoryRecords(
  params: AIRecognitionHistoryQueryParams
): Promise<ApiResponse<AIRecognitionHistoryPageResponse>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockAIRecognitionHistoryRecords(params)
  }
  
  // 生产环境调用真实API
  return request.get('/api/ai-recognition/history', { params })
}

/**
 * 获取AI识别审核数据
 */
export async function getAIRecognitionAuditRecords(
  params: AIRecognitionAuditQueryParams
): Promise<ApiResponse<AIRecognitionAuditPageResponse>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockAIRecognitionAuditRecords(params)
  }
  
  // 生产环境调用真实API
  return request.get('/api/ai-recognition/audit', { params })
}

/**
 * 获取AI识别基础数据
 */
export async function getAIRecognitionBasicData(): Promise<ApiResponse<AIRecognitionBasicData>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockAIRecognitionBasicData()
  }
  
  // 生产环境调用真实API
  return request.get('/api/ai-recognition/basic-data')
}

/**
 * 获取AI识别详情
 */
export async function getAIRecognitionDetail(
  recordId: string
): Promise<ApiResponse<AIRecognitionDetail>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockAIRecognitionDetail(recordId)
  }
  
  // 生产环境调用真实API
  return request.get(`/api/ai-recognition/detail/${recordId}`)
}

/**
 * 执行算法审核
 */
export async function executeAlgorithmAudit(
  params: AlgorithmAuditParams
): Promise<ApiResponse<boolean>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockAlgorithmAudit(params)
  }
  
  // 生产环境调用真实API
  return request.post('/api/ai-recognition/audit', params)
}

/**
 * 导出测评数据
 */
export async function exportEvaluationData(
  params: AIRecognitionAuditQueryParams
): Promise<ApiResponse<string>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockExportEvaluationData(params)
  }
  
  // 生产环境调用真实API
  return request.post('/api/ai-recognition/export/evaluation', params)
}

/**
 * 导出图片数据
 */
export async function exportImageData(
  recordIds: string[]
): Promise<ApiResponse<string>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockExportImageData(recordIds)
  }
  
  // 生产环境调用真实API
  return request.post('/api/ai-recognition/export/images', { recordIds })
}

/**
 * Mock数据处理 - AI识别历史记录
 */
async function getMockAIRecognitionHistoryRecords(
  params: AIRecognitionHistoryQueryParams
): Promise<ApiResponse<AIRecognitionHistoryPageResponse>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // 生成模拟数据
  const allData = mockAIRecognitionHistoryRecords()
  
  // 应用筛选条件
  const filteredData = filterAIRecognitionHistoryRecords(allData, params)
  
  // 分页处理
  const current = params.current || 1
  const pageSize = params.pageSize || 10
  const total = filteredData.length
  const startIndex = (current - 1) * pageSize
  const endIndex = startIndex + pageSize
  const records = filteredData.slice(startIndex, endIndex)
  
  return {
    code: 200,
    message: 'success',
    data: {
      records,
      total,
      current,
      pageSize,
      pages: Math.ceil(total / pageSize)
    }
  }
}

/**
 * Mock数据处理 - AI识别审核记录
 */
async function getMockAIRecognitionAuditRecords(
  params: AIRecognitionAuditQueryParams
): Promise<ApiResponse<AIRecognitionAuditPageResponse>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // 生成模拟数据
  const allData = mockAIRecognitionAuditRecords()
  
  // 应用筛选条件
  const filteredData = filterAIRecognitionAuditRecords(allData, params)
  
  // 分页处理
  const current = params.current || 1
  const pageSize = params.pageSize || 10
  const total = filteredData.length
  const startIndex = (current - 1) * pageSize
  const endIndex = startIndex + pageSize
  const records = filteredData.slice(startIndex, endIndex)
  
  return {
    code: 200,
    message: 'success',
    data: {
      records,
      total,
      current,
      pageSize,
      pages: Math.ceil(total / pageSize)
    }
  }
}

/**
 * Mock数据处理 - 基础数据
 */
async function getMockAIRecognitionBasicData(): Promise<ApiResponse<AIRecognitionBasicData>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return {
    code: 200,
    message: 'success',
    data: mockAIRecognitionBasicData()
  }
}

/**
 * Mock数据处理 - 识别详情
 */
async function getMockAIRecognitionDetail(
  recordId: string
): Promise<ApiResponse<AIRecognitionDetail>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 400))
  
  return {
    code: 200,
    message: 'success',
    data: mockAIRecognitionDetail(recordId)
  }
}

/**
 * Mock数据处理 - 算法审核
 */
async function getMockAlgorithmAudit(
  params: AlgorithmAuditParams
): Promise<ApiResponse<boolean>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    code: 200,
    message: `成功审核 ${params.recordIds.length} 条记录`,
    data: true
  }
}

/**
 * Mock数据处理 - 导出测评数据
 */
async function getMockExportEvaluationData(
  params: AIRecognitionAuditQueryParams
): Promise<ApiResponse<string>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 生成下载URL
  const filename = `ai_evaluation_${new Date().getTime()}.xlsx`
  const downloadUrl = `/downloads/${filename}`
  
  return {
    code: 200,
    message: '测评数据导出成功',
    data: downloadUrl
  }
}

/**
 * Mock数据处理 - 导出图片数据
 */
async function getMockExportImageData(
  recordIds: string[]
): Promise<ApiResponse<string>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 生成下载URL
  const filename = `ai_images_${new Date().getTime()}.zip`
  const downloadUrl = `/downloads/${filename}`
  
  return {
    code: 200,
    message: `成功导出 ${recordIds.length} 张图片`,
    data: downloadUrl
  }
}
