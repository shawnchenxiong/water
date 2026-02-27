/**
 * 移动巡检记录管理 API 接口
 */

import type {
  InspectionRecordQueryParams,
  InspectionRecordListResponse,
  StationTreeResponse,
  StationSearchResponse,
  InspectionRecordBasicDataResponse,
  RecordStatisticsResponse,
  InspectionRecordDetailResponse,
  CreateInspectionRecordRequest,
  CreateInspectionRecordResponse,
  UpdateInspectionRecordRequest,
  UpdateInspectionRecordResponse,
  ExportParams,
  RecordHistoryResponse,
  FileUploadResponse,
  ApiResponse
} from '@/api/types/mobile-inspection-records'

import {
  mockStationTree,
  getInspectionRecordsByStationId,
  searchStationsByKeyword,
  mockInspectionRecordBasicData,
  getRecordStatisticsByStationId,
  getInspectionRecordById,
  createInspectionRecord,
  updateInspectionRecord,
  deleteInspectionRecord
} from '@/api/mock/mobileInspectionRecordsMock'

/**
 * 获取电站树结构
 */
export const getStationTree = async (): Promise<StationTreeResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return {
    code: 200,
    message: 'success',
    data: {
      stationTree: mockStationTree
    }
  }
}

/**
 * 获取巡检记录列表
 */
export const getInspectionRecordList = async (
  params: InspectionRecordQueryParams
): Promise<ApiResponse<InspectionRecordListResponse>> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const data = getInspectionRecordsByStationId(params.stationId)
  
  // 模拟排序
  if (params.sortField === 'updateTime') {
    data.inspectionRecords.sort((a, b) => {
      const timeA = new Date(a.updateTime).getTime()
      const timeB = new Date(b.updateTime).getTime()
      return params.sortOrder === 'asc' ? timeA - timeB : timeB - timeA
    })
  }
  
  // 模拟分页
  const { page = 1, pageSize = 20 } = params
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedRecords = data.inspectionRecords.slice(startIndex, endIndex)
  
  return {
    code: 200,
    message: 'success',
    data: {
      inspectionRecords: paginatedRecords,
      pagination: {
        current: page,
        pageSize,
        total: data.inspectionRecords.length,
        totalPages: Math.ceil(data.inspectionRecords.length / pageSize)
      }
    }
  }
}

/**
 * 搜索电站
 */
export const searchStations = async (keyword: string): Promise<StationSearchResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 200))
  
  const filteredStations = searchStationsByKeyword(keyword)
  
  return {
    code: 200,
    message: 'success',
    data: {
      stationTree: filteredStations
    }
  }
}

/**
 * 获取巡检记录基础数据
 */
export const getInspectionRecordBasicData = async (): Promise<InspectionRecordBasicDataResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return {
    code: 200,
    message: 'success',
    data: mockInspectionRecordBasicData
  }
}

/**
 * 获取记录统计数据
 */
export const getRecordStatistics = async (stationId: string): Promise<RecordStatisticsResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const statistics = getRecordStatisticsByStationId(stationId)
  
  return {
    code: 200,
    message: 'success',
    data: statistics
  }
}

/**
 * 获取巡检记录详情
 */
export const getInspectionRecordDetail = async (recordId: string): Promise<InspectionRecordDetailResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const record = getInspectionRecordById(recordId)
  
  if (!record) {
    throw new Error('记录不存在')
  }
  
  // 模拟详情数据
  const detailData = {
    ...record,
    inspectionItems: [
      {
        id: 'item001',
        itemName: '逆变器检查',
        itemType: '设备检查',
        checkResult: '正常',
        isNormal: true,
        description: '逆变器运行参数正常，无异常报警',
        images: []
      },
      {
        id: 'item002',
        itemName: '电缆检查',
        itemType: '设备检查',
        checkResult: '正常',
        isNormal: true,
        description: '电缆外观完好，无破损',
        images: []
      }
    ],
    attachments: [],
    location: '电站主控室',
    weather: '晴',
    temperature: '25°C',
    remarks: '巡检顺利完成'
  }
  
  return {
    code: 200,
    message: 'success',
    data: detailData
  }
}

/**
 * 创建巡检记录
 */
export const createInspectionRecordApi = async (
  data: CreateInspectionRecordRequest
): Promise<CreateInspectionRecordResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const recordId = createInspectionRecord({
    stationId: data.stationId,
    inspectionType: data.inspectionType,
    inspectorId: data.inspectorId
  })
  
  return {
    code: 200,
    message: '创建成功',
    data: {
      id: recordId
    }
  }
}

/**
 * 更新巡检记录
 */
export const updateInspectionRecordApi = async (
  data: UpdateInspectionRecordRequest
): Promise<UpdateInspectionRecordResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const success = updateInspectionRecord(data.id, {
    inspectionStatus: data.inspectionStatus,
    inspectionNotes: data.inspectionNotes
  })
  
  if (!success) {
    throw new Error('更新失败，记录不存在')
  }
  
  return {
    code: 200,
    message: '更新成功',
    data: null
  }
}

/**
 * 删除巡检记录
 */
export const deleteInspectionRecordApi = async (recordId: string): Promise<ApiResponse<null>> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const success = deleteInspectionRecord(recordId)
  
  if (!success) {
    throw new Error('删除失败，记录不存在')
  }
  
  return {
    code: 200,
    message: '删除成功',
    data: null
  }
}

/**
 * 导出巡检记录
 */
export const exportInspectionRecords = async (params: ExportParams): Promise<Blob> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 获取要导出的数据
  const data = getInspectionRecordsByStationId(params.stationId)
  
  // 模拟生成Excel文件
  const csvContent = [
    '巡检类型,巡检电站,巡检状态,巡检耗注,巡检人员,更新时间,创建时间,巡检耗时',
    ...data.inspectionRecords.map(record => 
      `${record.inspectionType},${record.stationName},${record.inspectionStatus},${record.inspectionNotes},${record.inspector},${record.updateTime},${record.createTime},${record.duration}`
    )
  ].join('\n')
  
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
}

/**
 * 导入巡检记录
 */
export const importInspectionRecords = async (file: File): Promise<ApiResponse<{ successCount: number; failCount: number }>> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 模拟导入结果
  return {
    code: 200,
    message: '导入完成',
    data: {
      successCount: 10,
      failCount: 2
    }
  }
}

/**
 * 下载导入模板
 */
export const downloadImportTemplate = async (): Promise<Blob> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const templateContent = [
    '巡检类型,电站ID,巡检人员ID,巡检位置,天气情况,温度,备注',
    '设备巡检,LHYR98NH00000014,user001,主控室,晴,25°C,示例数据',
    '安全巡检,LHYR98NH00000015,user002,配电室,多云,22°C,示例数据'
  ].join('\n')
  
  return new Blob([templateContent], { type: 'text/csv;charset=utf-8;' })
}

/**
 * 上传附件
 */
export const uploadAttachment = async (file: File): Promise<FileUploadResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    code: 200,
    message: '上传成功',
    data: {
      fileUrl: `https://example.com/files/${file.name}`,
      fileName: file.name,
      fileSize: file.size
    }
  }
}

/**
 * 获取记录历史
 */
export const getRecordHistory = async (recordId: string): Promise<RecordHistoryResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // 模拟历史记录数据
  const historyData = [
    {
      id: 'history001',
      recordId,
      action: '创建记录',
      operator: '张三',
      operatorId: 'user001',
      operationTime: '2025-10-21 08:00:00',
      description: '创建巡检记录',
      oldValue: '',
      newValue: '待开始'
    },
    {
      id: 'history002',
      recordId,
      action: '开始巡检',
      operator: '张三',
      operatorId: 'user001',
      operationTime: '2025-10-21 08:30:00',
      description: '开始执行巡检任务',
      oldValue: '待开始',
      newValue: '进行中'
    },
    {
      id: 'history003',
      recordId,
      action: '完成巡检',
      operator: '张三',
      operatorId: 'user001',
      operationTime: '2025-10-21 14:30:00',
      description: '巡检任务完成',
      oldValue: '进行中',
      newValue: '已完成'
    }
  ]
  
  return {
    code: 200,
    message: 'success',
    data: historyData
  }
}

/**
 * 批量操作巡检记录
 */
export const batchOperateRecords = async (
  recordIds: string[],
  operation: 'delete' | 'export' | 'updateStatus',
  operationData?: any
): Promise<ApiResponse<{ successCount: number; failCount: number }>> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  let successCount = 0
  let failCount = 0
  
  for (const recordId of recordIds) {
    try {
      if (operation === 'delete') {
        const success = deleteInspectionRecord(recordId)
        if (success) {
          successCount++
        } else {
          failCount++
        }
      } else if (operation === 'updateStatus' && operationData?.status) {
        const success = updateInspectionRecord(recordId, {
          inspectionStatus: operationData.status
        })
        if (success) {
          successCount++
        } else {
          failCount++
        }
      } else {
        successCount++
      }
    } catch (error) {
      failCount++
    }
  }
  
  return {
    code: 200,
    message: `批量操作完成，成功${successCount}条，失败${failCount}条`,
    data: {
      successCount,
      failCount
    }
  }
}
