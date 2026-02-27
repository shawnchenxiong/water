/**
 * 诊断报告类型定义
 */

// 报告状态枚举
export type ReportStatus = 'generating' | 'completed' | 'failed' | 'expired'

// 诊断项状态枚举  
export type DiagnosisItemStatus = 'normal' | 'warning' | 'error'

// 报告类型枚举
export type ReportType = 'monthly' | 'weekly' | 'custom'

// 优先级枚举
export type Priority = 'high' | 'medium' | 'low'

// 趋势类型枚举
export type TrendType = 'stable' | 'improved' | 'attention'

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
}

// 分页响应
export interface PaginationResponse {
  current: number
  pageSize: number
  total: number
  totalPages: number
}

// 报告列表查询参数
export interface ReportListParams extends PaginationParams {
  stationId?: string
  reportType?: ReportType
  status?: ReportStatus
  startTime?: string
  endTime?: string
  keyword?: string
  sortField?: string
  sortOrder?: 'desc' | 'asc'
}

// 报告基本信息
export interface DiagnosisReport {
  reportId: string
  reportName: string
  stationName: string
  stationId: string
  reportType: ReportType
  startDate: string
  endDate: string
  dateRange: string
  generateTime: string
  reportStatus: ReportStatus
  filePath: string
  fileSize: number
  fileSizeDisplay: string
  creator: string
  creatorId: string
  downloadCount: number
  isExpired: boolean
}

// 报告列表响应
export interface ReportListResponse {
  diagnosisReports: DiagnosisReport[]
  pagination: PaginationResponse
}

// 报告头部信息
export interface ReportHeader {
  title: string
  subtitle: string
  logo: string
}

// 报告基础信息
export interface ReportBasicInfo {
  stationName: string
  stationCapacity: string
  reportPeriod: string
  generateDate: string
  reportType: string
}

// 诊断摘要
export interface ExecutiveSummary {
  overallScore: number
  scoreLevel: string
  totalIssues: number
  criticalIssues: number
  warningIssues: number
  normalItems: number
  keyFindings: string[]
}

// 诊断项详情
export interface DiagnosisItemDetail {
  itemName: string
  status: DiagnosisItemStatus
  checkCount?: number
  abnormalCount?: number
  availability?: string
  dataIntegrity?: string
  qualityScore?: number
  uptime?: string
  shutdownCount?: number
  abnormalDays?: number
  recommendAction?: string
}

// 诊断类别结果
export interface DiagnosisCategory {
  categoryName: string
  overallStatus: string
  totalItems: number
  normalItems: number
  warningItems: number
  errorItems: number
  details: DiagnosisItemDetail[]
}

// 诊断结果
export interface DiagnosisResults {
  communication: DiagnosisCategory
  dataQuality: DiagnosisCategory
  deviceOperation: DiagnosisCategory
}

// 评分历史
export interface ScoreHistory {
  date: string
  score: number
}

// 问题趋势
export interface IssueTrend {
  category: string
  trend: TrendType
  change: number
}

// 趋势分析
export interface TrendAnalysis {
  scoreHistory: ScoreHistory[]
  issuesTrend: IssueTrend[]
}

// 建议措施
export interface Recommendation {
  priority: Priority
  category: string
  issue: string
  suggestion: string
  expectedBenefit: string
}

// 诊断配置信息
export interface DiagnosisConfiguration {
  diagnosisVersion: string
  algorithmVersion: string
  dataSource: string
  analysisScope: string
}

// 数据统计信息
export interface DataStatistics {
  totalDataPoints: number
  validDataPoints: number
  dataCompleteness: string
  averageDelay: string
}

// 附录信息
export interface ReportAppendix {
  diagnosisConfiguration: DiagnosisConfiguration
  dataStatistics: DataStatistics
}

// 报告详细内容
export interface ReportDetail {
  reportId: string
  reportName: string
  header: ReportHeader
  basicInfo: ReportBasicInfo
  executiveSummary: ExecutiveSummary
  diagnosisResults: DiagnosisResults
  trendAnalysis: TrendAnalysis
  recommendations: Recommendation[]
  appendix: ReportAppendix
}

// 报告生成请求参数
export interface GenerateReportRequest {
  reportName: string
  stationId: string
  templateId: string
  startDate: string
  endDate: string
  includeCharts?: boolean
  includeTrends?: boolean
  customSections?: string[]
}

// 报告生成响应
export interface GenerateReportResponse {
  taskId: string
  estimatedTime: number
}

// 报告生成进度
export interface ReportGenerateProgress {
  taskId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  currentStep: string
  completedSteps: number
  totalSteps: number
  startTime: string
  estimatedEndTime: string
}

// 报告预览信息
export interface ReportPreview {
  previewUrl: string
  totalPages: number
  currentPage: number
  fileSize: number
}

// 报告模板章节
export interface TemplateSection {
  id: string
  name: string
  required: boolean
}

// 报告模板
export interface ReportTemplate {
  templateId: string
  templateName: string
  sections: TemplateSection[]
}

// 报告模板列表响应
export interface ReportTemplatesResponse {
  reportTemplates: ReportTemplate[]
}

// 批量操作请求
export interface BatchOperationRequest {
  action: 'download' | 'delete' | 'export'
  reportIds: string[]
  exportFormat?: 'zip' | 'pdf' | 'word'
}

// 批量操作响应
export interface BatchOperationResponse {
  taskId: string
  downloadUrl?: string
}

