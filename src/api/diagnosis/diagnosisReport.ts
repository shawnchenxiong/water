/**
 * 诊断报告API接口
 */

import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type {
  ReportListParams,
  ReportListResponse,
  GenerateReportRequest,
  GenerateReportResponse,
  ReportGenerateProgress,
  ReportDetail,
  ReportPreview,
  ReportTemplatesResponse,
  BatchOperationRequest,
  BatchOperationResponse
} from '@/api/types/diagnosis/diagnosisReport'
import {
  generateMockReportList,
  getMockReportDetail,
  getMockGenerateResponse,
  getMockGenerateProgress,
  getMockReportPreview,
  getMockReportTemplates,
  getMockBatchOperation
} from '@/api/mock/diagnosisReport'

/**
 * 获取诊断报告列表
 */
export async function getReportList(params: ReportListParams): Promise<ApiResponse<ReportListResponse>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 300))
    const mockData = generateMockReportList(params)
    return {
      code: 200,
      message: 'success',
      data: mockData
    }
  }

  const response = await request.get('/api/intelligent-diagnosis/reports', {
    params: {
      stationId: params.stationId,
      reportType: params.reportType,
      status: params.status,
      startTime: params.startTime,
      endTime: params.endTime,
      keyword: params.keyword,
      page: params.page,
      pageSize: params.pageSize,
      sortField: params.sortField,
      sortOrder: params.sortOrder
    }
  })

  return response.data
}

/**
 * 生成诊断报告
 */
export async function generateReport(data: GenerateReportRequest): Promise<ApiResponse<GenerateReportResponse>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 500))
    const mockData = getMockGenerateResponse(data)
    return {
      code: 200,
      message: '报告生成任务已启动',
      data: mockData
    }
  }

  const response = await request.post('/api/intelligent-diagnosis/reports/generate', {
    reportName: data.reportName,
    stationId: data.stationId,
    templateId: data.templateId,
    startDate: data.startDate,
    endDate: data.endDate,
    includeCharts: data.includeCharts,
    includeTrends: data.includeTrends,
    customSections: data.customSections
  })

  return response.data
}

/**
 * 获取报告生成进度
 */
export async function getGenerateProgress(taskId: string): Promise<ApiResponse<ReportGenerateProgress>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 200))
    const mockData = getMockGenerateProgress(taskId)
    return {
      code: 200,
      message: 'success',
      data: mockData
    }
  }

  const response = await request.get('/api/intelligent-diagnosis/reports/generate/progress', {
    params: { taskId }
  })

  return response.data
}

/**
 * 获取报告详细内容
 */
export async function getReportDetail(reportId: string, includeContent = false): Promise<ApiResponse<ReportDetail>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 400))
    const mockData = getMockReportDetail(reportId)
    return {
      code: 200,
      message: 'success',
      data: mockData
    }
  }

  const response = await request.get(`/api/intelligent-diagnosis/reports/${reportId}`, {
    params: { includeContent }
  })

  return response.data
}

/**
 * 下载报告文件
 * 注意：实际项目中后端应该使用html2pdf等库生成真实的PDF文件
 */
export async function downloadReport(reportId: string, format = 'pdf'): Promise<Blob> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 返回一个模拟的错误，让前端使用html2pdf生成
    // 这样可以确保下载的是真正的PDF文件
    throw new Error('MOCK_USE_HTML2PDF')
  }

  const response = await request.get(`/api/intelligent-diagnosis/reports/${reportId}/download`, {
    params: { format },
    responseType: 'blob'
  })

  return response.data
}

/**
 * 预览报告内容
 */
export async function previewReport(reportId: string, page = 1, pageSize?: number): Promise<ApiResponse<ReportPreview>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 300))
    const mockData = getMockReportPreview(reportId)
    return {
      code: 200,
      message: 'success',
      data: mockData
    }
  }

  const response = await request.get(`/api/intelligent-diagnosis/reports/${reportId}/preview`, {
    params: { page, pageSize }
  })

  return response.data
}

/**
 * 删除报告
 */
export async function deleteReport(reportId: string): Promise<ApiResponse<null>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      code: 200,
      message: '报告删除成功',
      data: null
    }
  }

  const response = await request.delete(`/api/intelligent-diagnosis/reports/${reportId}`)

  return response.data
}

/**
 * 获取报告模板
 */
export async function getReportTemplates(): Promise<ApiResponse<ReportTemplatesResponse>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 200))
    const mockData = getMockReportTemplates()
    return {
      code: 200,
      message: 'success',
      data: mockData
    }
  }

  const response = await request.get('/api/intelligent-diagnosis/reports/templates')

  return response.data
}

/**
 * 批量操作报告
 */
export async function batchOperateReports(request: BatchOperationRequest): Promise<ApiResponse<BatchOperationResponse>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 800))
    const mockData = getMockBatchOperation(request)
    return {
      code: 200,
      message: '批量操作已完成',
      data: mockData
    }
  }

  const response = await request.post('/api/intelligent-diagnosis/reports/batch', {
    action: request.action,
    reportIds: request.reportIds,
    exportFormat: request.exportFormat
  })

  return response.data
}
