/**
 * 一键诊断API接口
 */

import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type {
  ExecuteDiagnosisRequest,
  ExecuteDiagnosisResponse,
  OneClickDiagnosisResult,
  DiagnosisProgress,
  DiagnosisHistoryResponse,
  DiagnosisHistoryQuery,
  DiagnosisConfigResponse,
  UpdateDiagnosisConfigRequest
} from '@/api/types/diagnosis'
import {
  mockOneClickDiagnosisNormal,
  mockOneClickDiagnosisWithErrors,
  mockOneClickDiagnosisHighErrors,
  mockExecuteDiagnosisResponse,
  mockDiagnosisProgress,
  mockDiagnosisHistory
} from '@/api/mock/oneClickDiagnosis'

/**
 * 执行一键诊断
 * @param data 诊断请求参数
 * @returns 诊断任务信息
 */
export async function executeOneClickDiagnosis(data: ExecuteDiagnosisRequest): Promise<ApiResponse<ExecuteDiagnosisResponse>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      code: 200,
      message: '诊断任务已启动',
      data: mockExecuteDiagnosisResponse
    }
  }
  
  // 调用真实API
  return request.post('/api/intelligent-diagnosis/one-click', data)
}

/**
 * 获取诊断结果
 * @param stationId 电站ID
 * @param stationName 电站名称（用于Mock数据判断）
 * @param taskId 任务ID（可选）
 * @returns 诊断结果
 */
export function getOneClickDiagnosisResult(stationId: string, stationName?: string, taskId?: string): Promise<ApiResponse<OneClickDiagnosisResult>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockDiagnosisResult(stationId, stationName)
  }
  
  // 调用真实API
  return request.get('/api/intelligent-diagnosis/one-click/result', {
    params: { stationId, taskId }
  })
}

/**
 * 获取Mock诊断结果
 * @param stationId 电站ID
 * @param stationName 电站名称
 * @returns Mock诊断结果
 */
async function getMockDiagnosisResult(stationId: string, stationName?: string): Promise<ApiResponse<OneClickDiagnosisResult>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // 大部分电站都显示异常数据，只有少数显示正常数据
  const isNormalStation = stationName && (
    stationName.includes('示范') || 
    stationName.includes('标准') ||
    stationName.includes('优秀') ||
    stationName.includes('测试正常')
  )
  
  // 10%概率显示高异常，70%显示中等异常，20%显示正常
  const randomValue = Math.random()
  let mockData: OneClickDiagnosisResult
  
  if (isNormalStation) {
    mockData = {
      ...mockOneClickDiagnosisNormal,
      stationId,
      stationName: stationName || mockOneClickDiagnosisNormal.stationName
    }
  } else if (randomValue < 0.3) {
    // 30%概率显示高异常数据
    mockData = {
      ...mockOneClickDiagnosisHighErrors,
      stationId,
      stationName: stationName || mockOneClickDiagnosisHighErrors.stationName
    }
  } else if (randomValue < 0.8) {
    // 50%概率显示中等异常数据
    mockData = {
      ...mockOneClickDiagnosisWithErrors,
      stationId,
      stationName: stationName || mockOneClickDiagnosisWithErrors.stationName
    }
  } else {
    // 20%概率显示正常数据
    mockData = {
      ...mockOneClickDiagnosisNormal,
      stationId,
      stationName: stationName || mockOneClickDiagnosisNormal.stationName
    }
  }
  
  return {
    success: true,
    code: 200,
    message: 'success',
    data: mockData
  }
}

/**
 * 获取诊断进度
 * @param taskId 任务ID
 * @returns 诊断进度信息
 */
export async function getDiagnosisProgress(taskId: string): Promise<ApiResponse<DiagnosisProgress>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return {
      success: true,
      code: 200,
      message: 'success',
      data: mockDiagnosisProgress
    }
  }
  
  // 调用真实API
  return request.get('/api/intelligent-diagnosis/one-click/progress', {
    params: { taskId }
  })
}

/**
 * 模拟诊断进度更新
 * @param taskId 任务ID
 * @param currentProgress 当前进度
 * @returns 更新后的进度
 */
export async function updateMockDiagnosisProgress(
  taskId: string, 
  currentProgress: number
): Promise<ApiResponse<DiagnosisProgress>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // 模拟进度增长
  const increment = Math.random() * 15 + 5 // 每次增加5-20%
  const newProgress = Math.min(currentProgress + increment, 100)
  const completedItems = Math.floor((newProgress / 100) * mockDiagnosisProgress.totalItems)
  
  const updatedProgress: DiagnosisProgress = {
    ...mockDiagnosisProgress,
    progress: Math.floor(newProgress),
    completedItems,
    status: newProgress >= 100 ? 'completed' : 'running'
  }
  
  return {
    success: true,
    code: 200,
    message: 'success',
    data: updatedProgress
  }
}

/**
 * 获取诊断历史记录
 * @param params 查询参数
 * @returns 历史记录列表
 */
export async function getDiagnosisHistory(params: DiagnosisHistoryQuery): Promise<ApiResponse<DiagnosisHistoryResponse>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 400))
    
    return {
      success: true,
      code: 200,
      message: 'success',
      data: mockDiagnosisHistory
    }
  }
  
  // 调用真实API
  return request.get('/api/intelligent-diagnosis/one-click/history', { params })
}

/**
 * 获取诊断配置
 * @param stationId 电站ID（可选）
 * @returns 诊断配置
 */
export function getDiagnosisConfig(stationId?: string): Promise<ApiResponse<DiagnosisConfigResponse>> {
  return request.get('/api/intelligent-diagnosis/one-click/config', {
    params: stationId ? { stationId } : undefined
  })
}

/**
 * 更新诊断配置
 * @param data 配置数据
 * @returns 更新结果
 */
export function updateDiagnosisConfig(data: UpdateDiagnosisConfigRequest): Promise<ApiResponse<null>> {
  return request.put('/api/intelligent-diagnosis/one-click/config', data)
}
