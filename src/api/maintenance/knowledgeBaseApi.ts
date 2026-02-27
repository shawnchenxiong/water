/**
 * 知识库 API
 * @description 提供知识库文档管理的完整功能
 */

import request from '@/utils/request'
import type {
  KnowledgeDocumentListResponse,
  KnowledgeDocumentQueryParams,
  DocumentCategoryListResponse,
  DocumentUploadFormData,
  DocumentUploadResponse,
  DocumentPreviewResponse,
  DocumentUpdateData,
  BatchDeleteDocumentsRequest,
  BatchDeleteDocumentsResponse,
  SearchSuggestionsResponse,
} from '../types/knowledge-base'
import {
  mockKnowledgeDocumentList,
  mockCategoryList,
  mockKnowledgeDocuments,
} from '../mock/knowledgeBaseMock'

/**
 * 获取文档列表
 */
export function getKnowledgeDocuments(
  params: KnowledgeDocumentQueryParams
): Promise<KnowledgeDocumentListResponse> {
  // 开发阶段使用 Mock 数据
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockKnowledgeDocuments]

      // 分类筛选
      if (params.category && params.category !== 'all') {
        filteredData = filteredData.filter((item) => item.documentType === params.category)
      }

      // 电站筛选
      if (params.stationId) {
        filteredData = filteredData.filter((item) =>
          item.associatedStations.includes(params.stationId!)
        )
      }

      // 关键词搜索
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase()
        filteredData = filteredData.filter(
          (item) =>
            item.documentName.toLowerCase().includes(keyword) ||
            (item.documentDescription && item.documentDescription.toLowerCase().includes(keyword)) ||
            item.keywords.some((k) => k.toLowerCase().includes(keyword))
        )
      }

      // 排序
      const sortField = params.sortField || 'uploadTime'
      const sortOrder = params.sortOrder || 'desc'
      filteredData.sort((a, b) => {
        let aValue = (a as any)[sortField]
        let bValue = (b as any)[sortField]

        if (sortField === 'uploadTime' || sortField === 'updateTime') {
          aValue = new Date(aValue).getTime()
          bValue = new Date(bValue).getTime()
        }

        if (sortOrder === 'desc') {
          return bValue - aValue
        } else {
          return aValue - bValue
        }
      })

      // 分页
      const page = params.page || 1
      const pageSize = params.pageSize || 18
      const total = filteredData.length
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedData = filteredData.slice(start, end)

      resolve({
        documents: paginatedData,
        pagination: {
          current: page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      })
    }, 300)
  })

  // 生产环境使用真实 API
  // return request.get<KnowledgeDocumentListResponse>('/api/knowledge-base/documents', { params })
}

/**
 * 获取文档分类统计
 */
export function getDocumentCategories(stationId?: string): Promise<DocumentCategoryListResponse> {
  // 开发阶段使用 Mock 数据
  return new Promise((resolve) => {
    setTimeout(() => {
      // 如果有电站筛选，重新计算分类统计
      let categories = [...mockCategoryList.documentCategories]
      
      if (stationId) {
        const stationDocs = mockKnowledgeDocuments.filter((doc) =>
          doc.associatedStations.includes(stationId)
        )
        
        categories = categories.map((cat) => {
          if (cat.id === 'all') {
            return { ...cat, count: stationDocs.length }
          }
          const count = stationDocs.filter((doc) => doc.documentType === cat.id).length
          return { ...cat, count }
        })
      }

      resolve({ documentCategories: categories })
    }, 200)
  })

  // 生产环境使用真实 API
  // return request.get<DocumentCategoryListResponse>('/api/knowledge-base/categories', {
  //   params: stationId ? { stationId } : undefined,
  // })
}

/**
 * 上传文档
 */
export function uploadDocuments(
  formData: DocumentUploadFormData,
  files: File[]
): Promise<DocumentUploadResponse> {
  // 开发阶段模拟上传
  return new Promise((resolve) => {
    setTimeout(() => {
      const documentIds = files.map((_, index) => `doc${Date.now()}_${index}`)
      resolve({
        documentIds,
        successCount: files.length,
        failedCount: 0,
      })
    }, 2000) // 模拟上传时间
  })

  // 生产环境使用真实 API
  // const formDataObj = new FormData()
  // Object.keys(formData).forEach((key) => {
  //   const value = (formData as any)[key]
  //   if (Array.isArray(value)) {
  //     formDataObj.append(key, JSON.stringify(value))
  //   } else {
  //     formDataObj.append(key, value)
  //   }
  // })
  // files.forEach((file) => {
  //   formDataObj.append('files', file)
  // })
  // return request.post<DocumentUploadResponse>('/api/knowledge-base/documents/upload', formDataObj, {
  //   headers: { 'Content-Type': 'multipart/form-data' },
  // })
}

/**
 * 下载文档
 */
export function downloadDocument(documentId: string): Promise<Blob> {
  // 开发阶段模拟下载
  return new Promise((resolve) => {
    setTimeout(() => {
      const blob = new Blob(['模拟文档内容'], { type: 'application/octet-stream' })
      resolve(blob)
    }, 500)
  })

  // 生产环境使用真实 API
  // return request.get<Blob>(`/api/knowledge-base/documents/${documentId}/download`, {
  //   responseType: 'blob',
  // })
}

/**
 * 预览文档
 */
export function previewDocument(documentId: string): Promise<DocumentPreviewResponse> {
  // 开发阶段模拟预览
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        previewUrl: `https://example.com/preview/${documentId}`,
        previewType: 'pdf',
        canPreview: true,
      })
    }, 300)
  })

  // 生产环境使用真实 API
  // return request.get<DocumentPreviewResponse>(`/api/knowledge-base/documents/${documentId}/preview`)
}

/**
 * 更新文档信息
 */
export function updateDocument(
  documentId: string,
  data: DocumentUpdateData
): Promise<void> {
  // 开发阶段模拟更新
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 500)
  })

  // 生产环境使用真实 API
  // return request.put<void>(`/api/knowledge-base/documents/${documentId}`, data)
}

/**
 * 删除文档
 */
export function deleteDocument(documentId: string): Promise<void> {
  // 开发阶段模拟删除
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 300)
  })

  // 生产环境使用真实 API
  // return request.delete<void>(`/api/knowledge-base/documents/${documentId}`)
}

/**
 * 批量删除文档
 */
export function batchDeleteDocuments(
  data: BatchDeleteDocumentsRequest
): Promise<BatchDeleteDocumentsResponse> {
  // 开发阶段模拟批量删除
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        successCount: data.documentIds.length,
        failedCount: 0,
      })
    }, 500)
  })

  // 生产环境使用真实 API
  // return request.delete<BatchDeleteDocumentsResponse>('/api/knowledge-base/documents/batch', { data })
}

/**
 * 获取搜索建议
 */
export function getSearchSuggestions(
  keyword: string,
  limit = 10
): Promise<SearchSuggestionsResponse> {
  // 开发阶段模拟搜索建议
  return new Promise((resolve) => {
    setTimeout(() => {
      const suggestions = [
        '运维手册',
        '故障处理',
        '月报表',
        '财务报表',
        '竣工图',
        '清洗标准',
        '运行分析',
        '计量计费',
      ].filter((item) => item.includes(keyword)).slice(0, limit)

      resolve({ suggestions })
    }, 200)
  })

  // 生产环境使用真实 API
  // return request.get<SearchSuggestionsResponse>('/api/knowledge-base/search/suggestions', {
  //   params: { keyword, limit },
  // })
}

/**
 * 获取文档详情
 */
export function getDocumentDetail(documentId: string) {
  // 开发阶段使用 Mock 数据
  return new Promise((resolve) => {
    setTimeout(() => {
      const document = mockKnowledgeDocuments.find((item) => item.id === documentId)
      resolve(document || null)
    }, 200)
  })

  // 生产环境使用真实 API
  // return request.get(`/api/knowledge-base/documents/${documentId}`)
}
