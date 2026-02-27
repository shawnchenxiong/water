/**
 * 知识库类型定义
 */

/**
 * 文档记录
 */
export interface KnowledgeDocument {
  id: string
  documentName: string
  documentType: string
  documentDescription?: string
  fileFormat: string
  fileSize: number
  fileSizeDisplay: string
  associatedStations: string[]
  uploader: string
  uploaderId: string
  uploadTime: string
  updater?: string
  updateTime?: string
  downloadCount: number
  viewCount: number
  keywords: string[]
  isPublic: boolean
  fileIcon: string
  relativeTime: string
}

/**
 * 文档列表响应
 */
export interface KnowledgeDocumentListResponse {
  documents: KnowledgeDocument[]
  pagination: {
    current: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * 文档查询参数
 */
export interface KnowledgeDocumentQueryParams {
  category?: string
  stationId?: string
  keyword?: string
  page?: number
  pageSize?: number
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 文档分类
 */
export interface DocumentCategory {
  id: string
  name: string
  icon: string
  count: number
}

/**
 * 文档分类列表响应
 */
export interface DocumentCategoryListResponse {
  documentCategories: DocumentCategory[]
}

/**
 * 文档上传表单数据
 */
export interface DocumentUploadFormData {
  documentName: string
  documentType: string
  documentDescription?: string
  associatedStations: string[]
  keywords: string[]
  isPublic: boolean
}

/**
 * 文档上传响应
 */
export interface DocumentUploadResponse {
  documentIds: string[]
  successCount: number
  failedCount: number
}

/**
 * 文档预览响应
 */
export interface DocumentPreviewResponse {
  previewUrl: string
  previewType: 'pdf' | 'image' | 'text'
  canPreview: boolean
}

/**
 * 文档更新数据
 */
export interface DocumentUpdateData {
  documentName?: string
  documentDescription?: string
  documentType?: string
  associatedStations?: string[]
  keywords?: string[]
  isPublic?: boolean
}

/**
 * 批量删除请求
 */
export interface BatchDeleteDocumentsRequest {
  documentIds: string[]
}

/**
 * 批量删除响应
 */
export interface BatchDeleteDocumentsResponse {
  successCount: number
  failedCount: number
}

/**
 * 搜索建议响应
 */
export interface SearchSuggestionsResponse {
  suggestions: string[]
}

/**
 * 文件图标映射
 */
export const FILE_ICON_MAP: Record<string, string> = {
  PDF: 'pdf',
  DOC: 'word',
  DOCX: 'word',
  PPT: 'powerpoint',
  PPTX: 'powerpoint',
  XLS: 'excel',
  XLSX: 'excel',
  TXT: 'text',
  JPG: 'image',
  PNG: 'image',
  ZIP: 'archive',
  RAR: 'archive',
}

/**
 * 支持的文件格式
 */
export const SUPPORTED_FILE_FORMATS = [
  'PDF',
  'DOC',
  'DOCX',
  'PPT',
  'PPTX',
  'XLS',
  'XLSX',
  'TXT',
  'JPG',
  'PNG',
  'ZIP',
  'RAR',
]

/**
 * 文件大小限制（字节）
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

/**
 * 最大上传文件数量
 */
export const MAX_UPLOAD_FILES = 10

