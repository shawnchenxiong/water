import request from '@/utils/request'
import type {
  HistoryAlarmQueryParams,
  HistoryAlarmResponse,
  OperationLogItem,
  AlarmDetailResponse,
  EliminateAlarmRequest,
  ConfirmAlarmRequest,
  DeviceAlarmQueryParams,
  DeviceAlarmResponse,
  DeviceBasicInfoResponse,
  MonitoringInfoResponse,
  HistoryDataParameterResponse,
  HistoryDataQueryParams,
  HistoryDataResponse
} from '@/api/types/alarm/history'
/**
 * 获取历史告警列表（操作日志）
 */
export async function getHistoryAlarmList(params: HistoryAlarmQueryParams): Promise<{
  code: number
  message: string
  data: {
    list: OperationLogItem[]
    total: number
  }
}> {
  const response = (await request.get<HistoryAlarmResponse>('/api/operation-logs', {
    params
  })) as unknown as HistoryAlarmResponse

  // 转换响应格式：将 result.data 转换为 data.list
  return {
    code: response.code,
    message: response.message,
    data: {
      list: response.result.data,
      total: response.result.total
    }
  }
}

/**
 * 获取告警详情
 * @param id 告警ID
 * @param startDate 开始时间（可选，ISO格式）
 * @param endDate 结束时间（可选，ISO格式）
 * @param parameters 参数列表（可选，逗号分隔）
 */
export async function getAlarmDetails(
  id: number,
  startDate?: string,
  endDate?: string,
  parameters?: string
): Promise<AlarmDetailResponse> {
  const params: Record<string, any> = { id }
  if (startDate) {
    params.startDate = startDate
  }
  if (endDate) {
    params.endDate = endDate
  }
  if (parameters) {
    params.parameters = parameters
  }
  const response = (await request.get<AlarmDetailResponse>('/api/operation-logs/getDetails', {
    params
  })) as unknown as AlarmDetailResponse
  return response
}

/**
 * 消除告警
 * @param params 消除告警请求参数
 */
export async function eliminateAlarm(params: EliminateAlarmRequest): Promise<{
  success: boolean
  message: string
  code: number
  result: string
  timestamp: number
}> {
  const response = (await request.put<{
    success: boolean
    message: string
    code: number
    result: string
    timestamp: number
  }>('/api/operation-logs/eliminate', params)) as unknown as {
    success: boolean
    message: string
    code: number
    result: string
    timestamp: number
  }
  return response
}

/**
 * 确认告警
 * @param params 确认告警请求参数
 */
export async function confirmAlarm(params: ConfirmAlarmRequest): Promise<{
  success: boolean
  message: string
  code: number
  result: string
  timestamp: number
}> {
  const response = (await request.put<{
    success: boolean
    message: string
    code: number
    result: string
    timestamp: number
  }>('/api/operation-logs/confirm', params)) as unknown as {
    success: boolean
    message: string
    code: number
    result: string
    timestamp: number
  }
  return response
}

/**
 * 设备类型选项
 */
export interface DeviceTypeOption {
  name: string
  value: string
}

/**
 * 获取设备类型列表
 */
export async function getDeviceTypeList(): Promise<DeviceTypeOption[]> {
  const response = (await request.get<{
    success: boolean
    message: string
    code: number
    result: DeviceTypeOption[]
    timestamp: number
  }>('/api/operation-logs/deviceType')) as unknown as {
    success: boolean
    message: string
    code: number
    result: DeviceTypeOption[]
    timestamp: number
  }
  
  if (response.success && response.code === 200) {
    return response.result || []
  }
  
  return []
}

/**
 * 获取设备实时告警列表
 * @param params 查询参数
 */
export async function getDeviceRealtimeAlarms(params: DeviceAlarmQueryParams): Promise<DeviceAlarmResponse> {
  const response = (await request.get<DeviceAlarmResponse>('/api/operation-logs/realTimeAlarm', {
    params
  })) as unknown as DeviceAlarmResponse
  
  return response
}

/**
 * 获取设备历史告警列表
 * @param params 查询参数
 */
export async function getDeviceHistoryAlarms(params: DeviceAlarmQueryParams): Promise<DeviceAlarmResponse> {
  const response = (await request.get<DeviceAlarmResponse>('/api/operation-logs/historicalAlerts', {
    params
  })) as unknown as DeviceAlarmResponse
  
  return response
}

/**
 * 获取设备基础信息
 * @param deviceId 设备ID
 */
export async function getDeviceBasicInfo(deviceId: string): Promise<DeviceBasicInfoResponse> {
  const response = (await request.get<DeviceBasicInfoResponse>('/api/operation-logs/basicInformation', {
    params: { deviceId }
  })) as unknown as DeviceBasicInfoResponse
  
  return response
}

/**
 * 获取设备监控信息
 * @param deviceId 设备ID
 */
export async function getDeviceMonitoringInfo(deviceId: string): Promise<MonitoringInfoResponse> {
  const response = (await request.get<MonitoringInfoResponse>('/api/operation-logs/monitoringInformation', {
    params: { deviceId }
  })) as unknown as MonitoringInfoResponse
  
  return response
}

/**
 * 获取历史数据参数选择列表
 * @param deviceId 设备ID
 */
export async function getHistoryDataParameters(deviceId: string): Promise<HistoryDataParameterResponse> {
  const response = (await request.get<HistoryDataParameterResponse>('/api/operation-logs/parameterSelection', {
    params: { deviceId }
  })) as unknown as HistoryDataParameterResponse
  
  return response
}

/**
 * 获取历史数据
 * @param params 查询参数
 */
export async function getHistoryData(params: HistoryDataQueryParams): Promise<HistoryDataResponse> {
  const response = (await request.get<HistoryDataResponse>('/api/operation-logs/historicalData', {
    params: {
      deviceId: params.deviceId,
      startDate: params.startDate,
      endDate: params.endDate,
      parameters: params.parameters
    },
    timeout: 60000 // 超时时间60秒
  })) as unknown as HistoryDataResponse
  
  return response
}

