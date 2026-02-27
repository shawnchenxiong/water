/**
 * 缺陷管理 API
 */
import request from '@/utils/request'
import type {
  DefectQueryParams,
  DefectListResponse,
  DefectBasicDataResponse,
  DefectRecord
} from '@/api/types/defect-management'

// Mock 数据
import {
  mockDefectList,
  mockDefectBasicData,
  mockDefectDetail
} from '@/api/mock/defectManagement'

/**
 * 获取缺陷列表
 */
export function getDefectList(params: DefectQueryParams): Promise<DefectListResponse> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return Promise.resolve(mockDefectList(params))
  }
  
  return request.get('/api/maintenance/defects', { params })
}

/**
 * 获取缺陷基础数据
 */
export function getDefectBasicData(): Promise<DefectBasicDataResponse> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return Promise.resolve(mockDefectBasicData())
  }
  
  return request.get('/api/maintenance/defects/basic-data')
}

/**
 * 获取缺陷详情
 */
export function getDefectDetail(id: string): Promise<{ code: number; message: string; data: DefectRecord }> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return Promise.resolve(mockDefectDetail(id))
  }
  
  return request.get(`/api/maintenance/defects/${id}`)
}

/**
 * 创建缺陷
 */
export function createDefect(data: Partial<DefectRecord>): Promise<{ code: number; message: string; data: DefectRecord }> {
  return request.post('/api/maintenance/defects', data)
}

/**
 * 更新缺陷
 */
export function updateDefect(id: string, data: Partial<DefectRecord>): Promise<{ code: number; message: string; data: DefectRecord }> {
  return request.put(`/api/maintenance/defects/${id}`, data)
}

/**
 * 删除缺陷
 */
export function deleteDefect(id: string): Promise<{ code: number; message: string }> {
  return request.delete(`/api/maintenance/defects/${id}`)
}

/**
 * 转工单
 */
export function convertToWorkOrder(defectIds: string[]): Promise<{ code: number; message: string; data: { workOrderId: string } }> {
  return request.post('/api/maintenance/defects/convert-to-work-order', { defectIds })
}

/**
 * 导出缺陷数据
 */
export function exportDefects(params: DefectQueryParams): Promise<Blob> {
  return request.get('/api/maintenance/defects/export', {
    params,
    responseType: 'blob'
  })
}

/**
 * 导出模板
 */
export function exportDefectTemplate(): Promise<Blob> {
  return request.get('/api/maintenance/defects/export-template', {
    responseType: 'blob'
  })
}

/**
 * 导入缺陷数据
 */
export function importDefects(file: File): Promise<{ code: number; message: string; data: { successCount: number; failCount: number } }> {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/api/maintenance/defects/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

