/**
 * 诊断报告Mock数据
 */

import type {
  DiagnosisReport,
  ReportListResponse,
  ReportDetail,
  ReportGenerateProgress,
  ReportPreview,
  ReportTemplate,
  ReportTemplatesResponse,
  GenerateReportResponse,
  BatchOperationResponse,
  ReportListParams,
  GenerateReportRequest,
  BatchOperationRequest
} from '@/api/types/diagnosis/diagnosisReport'

/**
 * Mock报告列表数据
 */
export const mockDiagnosisReports: DiagnosisReport[] = [
  {
    reportId: 'report_001',
    reportName: '测试',
    stationName: '六安东城污水厂',
    stationId: 'station_001',
    reportType: 'monthly',
    startDate: '2025-07-01',
    endDate: '2025-07-31',
    dateRange: '2025-07-01 - 2025-07-31',
    generateTime: '2025-08-01 09:00:00',
    reportStatus: 'completed',
    filePath: '/reports/2025/07/report_001.pdf',
    fileSize: 2048000,
    fileSizeDisplay: '2.0 MB',
    creator: '张三',
    creatorId: 'user001',
    downloadCount: 5,
    isExpired: false
  },
  {
    reportId: 'report_002',
    reportName: '月度诊断报告',
    stationName: '芜湖南亭市后水灯',
    stationId: 'station_002',
    reportType: 'monthly',
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    dateRange: '2025-06-01 - 2025-06-30',
    generateTime: '2025-07-01 08:30:00',
    reportStatus: 'completed',
    filePath: '/reports/2025/06/report_002.pdf',
    fileSize: 1536000,
    fileSizeDisplay: '1.5 MB',
    creator: '李四',
    creatorId: 'user002',
    downloadCount: 12,
    isExpired: false
  },
  {
    reportId: 'report_003',
    reportName: '周度运行报告',
    stationName: '大龙测试电站',
    stationId: 'station_003',
    reportType: 'weekly',
    startDate: '2025-07-22',
    endDate: '2025-07-28',
    dateRange: '2025-07-22 - 2025-07-28',
    generateTime: '2025-07-29 10:15:00',
    reportStatus: 'generating',
    filePath: '/reports/2025/07/report_003.pdf',
    fileSize: 0,
    fileSizeDisplay: '生成中',
    creator: '王五',
    creatorId: 'user003',
    downloadCount: 0,
    isExpired: false
  }
]

/**
 * Mock报告详细内容数据
 */
export const mockReportDetail: ReportDetail = {
  reportId: 'report_001',
  reportName: '测试',
  header: {
    title: '智能诊断报告',
    subtitle: 'AI+能源，让运维更简单',
    logo: '/images/logo.png'
  },
  basicInfo: {
    stationName: '六安东城污水厂',
    stationCapacity: '20MW',
    reportPeriod: '2025/07/01-2025/07/31',
    generateDate: '2025年8月1日',
    reportType: '月度诊断报告'
  },
  executiveSummary: {
    overallScore: 85,
    scoreLevel: '良好',
    totalIssues: 12,
    criticalIssues: 2,
    warningIssues: 5,
    normalItems: 47,
    keyFindings: [
      '通讯系统整体稳定，仅发现2处轻微异常',
      '数据质量良好，数据完整率达到98.5%',
      '设备运行正常，建议对PV3组串进行检查'
    ]
  },
  diagnosisResults: {
    communication: {
      categoryName: '通讯诊断',
      overallStatus: '良好',
      totalItems: 4,
      normalItems: 3,
      warningItems: 1,
      errorItems: 0,
      details: [
        {
          itemName: '逆变器通讯中断',
          status: 'normal',
          checkCount: 31,
          abnormalCount: 0,
          availability: '100%'
        },
        {
          itemName: '电表通讯中断',
          status: 'normal',
          checkCount: 31,
          abnormalCount: 0,
          availability: '100%'
        },
        {
          itemName: '气象站通讯中断',
          status: 'warning',
          checkCount: 31,
          abnormalCount: 2,
          availability: '93.5%'
        },
        {
          itemName: '汇流箱通讯中断',
          status: 'normal',
          checkCount: 31,
          abnormalCount: 0,
          availability: '100%'
        }
      ]
    },
    dataQuality: {
      categoryName: '数据诊断',
      overallStatus: '良好',
      totalItems: 4,
      normalItems: 4,
      warningItems: 0,
      errorItems: 0,
      details: [
        {
          itemName: '逆变器数据异常',
          status: 'normal',
          dataIntegrity: '99.2%',
          qualityScore: 95
        },
        {
          itemName: '气象站数据异常',
          status: 'normal',
          dataIntegrity: '97.8%',
          qualityScore: 92
        }
      ]
    },
    deviceOperation: {
      categoryName: '设备诊断',
      overallStatus: '需要关注',
      totalItems: 6,
      normalItems: 4,
      warningItems: 2,
      errorItems: 0,
      details: [
        {
          itemName: '逆变器停机',
          status: 'normal',
          uptime: '99.8%',
          shutdownCount: 1
        },
        {
          itemName: '逆变器PV3组串断路',
          status: 'warning',
          abnormalDays: 3,
          recommendAction: '建议安排现场检查'
        }
      ]
    }
  },
  trendAnalysis: {
    scoreHistory: [
      { date: '2025-07-01', score: 88 },
      { date: '2025-07-08', score: 92 },
      { date: '2025-07-15', score: 85 },
      { date: '2025-07-22', score: 87 },
      { date: '2025-07-31', score: 85 }
    ],
    issuesTrend: [
      { category: '通讯', trend: 'stable', change: 0 },
      { category: '数据', trend: 'improved', change: -2 },
      { category: '设备', trend: 'attention', change: +1 }
    ]
  },
  recommendations: [
    {
      priority: 'high',
      category: '设备运行',
      issue: 'PV3组串疑似断路',
      suggestion: '建议安排技术人员现场检查PV3组串连接情况，确认是否存在断路问题',
      expectedBenefit: '避免发电量损失，预计可提升2-3%发电效率'
    },
    {
      priority: 'medium',
      category: '通讯系统',
      issue: '气象站通讯偶发中断',
      suggestion: '检查气象站通讯线路和设备状态，必要时更换通讯模块',
      expectedBenefit: '提升数据完整性，改善诊断准确性'
    }
  ],
  appendix: {
    diagnosisConfiguration: {
      diagnosisVersion: 'v2.1.0',
      algorithmVersion: 'AI-DX-2025',
      dataSource: '实时监控系统',
      analysisScope: '全电站设备'
    },
    dataStatistics: {
      totalDataPoints: 2356800,
      validDataPoints: 2321456,
      dataCompleteness: '98.5%',
      averageDelay: '15秒'
    }
  }
}

/**
 * Mock报告模板数据
 */
export const mockReportTemplates: ReportTemplate[] = [
  {
    templateId: 'monthly_standard',
    templateName: '标准月度报告',
    sections: [
      { id: 'header', name: '报告头部', required: true },
      { id: 'summary', name: '诊断摘要', required: true },
      { id: 'communication', name: '通讯诊断', required: true },
      { id: 'data_quality', name: '数据诊断', required: true },
      { id: 'device_operation', name: '设备诊断', required: true },
      { id: 'trend', name: '趋势分析', required: false },
      { id: 'recommendations', name: '建议措施', required: true },
      { id: 'appendix', name: '附录信息', required: false }
    ]
  },
  {
    templateId: 'weekly_brief',
    templateName: '周度简报',
    sections: [
      { id: 'header', name: '报告头部', required: true },
      { id: 'summary', name: '诊断摘要', required: true },
      { id: 'key_issues', name: '关键问题', required: true },
      { id: 'recommendations', name: '处理建议', required: true }
    ]
  }
]

/**
 * 生成Mock报告列表数据
 */
export function generateMockReportList(params: ReportListParams): ReportListResponse {
  let filteredReports = [...mockDiagnosisReports]

  // 筛选条件过滤
  if (params.stationId) {
    filteredReports = filteredReports.filter(report => report.stationId === params.stationId)
  }
  if (params.reportType) {
    filteredReports = filteredReports.filter(report => report.reportType === params.reportType)
  }
  if (params.status) {
    filteredReports = filteredReports.filter(report => report.reportStatus === params.status)
  }
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filteredReports = filteredReports.filter(report => 
      report.reportName.toLowerCase().includes(keyword) ||
      report.stationName.toLowerCase().includes(keyword)
    )
  }

  // 排序
  if (params.sortField) {
    filteredReports.sort((a, b) => {
      const aVal = (a as any)[params.sortField!]
      const bVal = (b as any)[params.sortField!]
      const order = params.sortOrder === 'asc' ? 1 : -1
      return aVal > bVal ? order : aVal < bVal ? -order : 0
    })
  }

  // 分页
  const total = filteredReports.length
  const startIndex = (params.page - 1) * params.pageSize
  const endIndex = startIndex + params.pageSize
  const pageReports = filteredReports.slice(startIndex, endIndex)

  return {
    diagnosisReports: pageReports,
    pagination: {
      current: params.page,
      pageSize: params.pageSize,
      total,
      totalPages: Math.ceil(total / params.pageSize)
    }
  }
}

/**
 * 生成Mock报告详情数据
 */
export function getMockReportDetail(reportId: string): ReportDetail {
  // 根据报告ID生成不同的数据
  if (reportId === 'report_002') {
    return {
      ...mockReportDetail,
      reportId: 'report_002',
      reportName: '月度诊断报告',
      basicInfo: {
        ...mockReportDetail.basicInfo,
        stationName: '芜湖南亭市后水灯',
        reportPeriod: '2025/06/01-2025/06/30',
        generateDate: '2025年7月1日'
      },
      executiveSummary: {
        ...mockReportDetail.executiveSummary,
        overallScore: 92,
        scoreLevel: '优秀',
        totalIssues: 8,
        criticalIssues: 1,
        warningIssues: 3
      }
    }
  }
  
  if (reportId === 'report_003') {
    return {
      ...mockReportDetail,
      reportId: 'report_003',
      reportName: '周度运行报告',
      basicInfo: {
        ...mockReportDetail.basicInfo,
        stationName: '大龙测试电站',
        reportPeriod: '2025/07/22-2025/07/28',
        generateDate: '2025年7月29日',
        reportType: '周度诊断报告'
      },
      executiveSummary: {
        ...mockReportDetail.executiveSummary,
        overallScore: 78,
        scoreLevel: '一般',
        totalIssues: 15,
        criticalIssues: 3,
        warningIssues: 7
      }
    }
  }

  return mockReportDetail
}

/**
 * 生成Mock报告生成响应
 */
export function getMockGenerateResponse(request: GenerateReportRequest): GenerateReportResponse {
  return {
    taskId: `task_${Date.now()}`,
    estimatedTime: 120 // 2分钟
  }
}

/**
 * 生成Mock报告生成进度
 */
export function getMockGenerateProgress(taskId: string): ReportGenerateProgress {
  // 模拟进度递增
  const progress = Math.min(95, Math.floor(Math.random() * 100))
  const steps = ['数据收集', '诊断分析', '生成图表', '生成趋势分析图表', '组装报告', '生成PDF', '文件存储', '完成']
  const completedSteps = Math.floor((progress / 100) * steps.length)
  
  return {
    taskId,
    status: progress >= 95 ? 'completed' : 'running',
    progress,
    currentStep: progress >= 95 ? '报告生成完成' : steps[completedSteps] || '准备中',
    completedSteps,
    totalSteps: steps.length,
    startTime: '2025-08-01 09:00:00',
    estimatedEndTime: '2025-08-01 09:02:00'
  }
}

/**
 * 生成Mock报告预览信息
 */
export function getMockReportPreview(reportId: string): ReportPreview {
  return {
    previewUrl: `https://preview.example.com/${reportId}.pdf`,
    totalPages: 15,
    currentPage: 1,
    fileSize: 2048000
  }
}

/**
 * 生成Mock报告模板响应
 */
export function getMockReportTemplates(): ReportTemplatesResponse {
  return {
    reportTemplates: mockReportTemplates
  }
}

/**
 * 生成Mock批量操作响应
 */
export function getMockBatchOperation(request: BatchOperationRequest): BatchOperationResponse {
  return {
    taskId: `batch_task_${Date.now()}`,
    downloadUrl: request.action === 'download' ? 'https://download.example.com/batch.zip' : undefined
  }
}

