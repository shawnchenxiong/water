import { request } from '@/utils/request'
import type {
  DeviceBasicInfoResponse,
  DeviceMonitorResponse,
  DeviceAlarmsResponse,
  DeviceHistoryDataResponse,
  AlarmDetailResponse,
  AlarmHandleResponse,
  AlarmFilterParams,
  HistoryDataParams,
  AlarmHandleRequest,
  DeviceDetailTab
} from '@/api/types/diagnosis/deviceDetail'

// Mock数据导入
import {
  getMockDeviceBasicInfo,
  getMockDeviceMonitorInfo,
  getMockDeviceAlarms,
  getMockDeviceHistoryData,
  getMockAlarmDetail,
  getMockAlarmHandle
} from '@/api/mock/deviceDetail'

/**
 * 获取设备基础信息
 */
export const getDeviceBasicInfo = async (
  deviceId: string,
  tab: DeviceDetailTab = 'basic'
): Promise<DeviceBasicInfoResponse> => {
  try {
    // 默认使用Mock数据，除非明确设置MOCK=false
    if (import.meta.env.MOCK !== 'false') {
      return getMockDeviceBasicInfo(deviceId)
    }

    const response = await request.get<DeviceBasicInfoResponse>(
      `/api/intelligent-diagnosis/string-diagnosis/device/${deviceId}/details`,
      {
        params: { tab }
      }
    )
    return response.data
  } catch (error) {
    console.error('获取设备基础信息失败:', error)
    // 失败时返回Mock数据
    return getMockDeviceBasicInfo(deviceId)
  }
}

/**
 * 获取设备监控信息
 */
export const getDeviceMonitorInfo = async (
  deviceId: string
): Promise<DeviceMonitorResponse> => {
  try {
    // 默认使用Mock数据，除非明确设置MOCK=false
    if (import.meta.env.MOCK !== 'false') {
      return getMockDeviceMonitorInfo(deviceId)
    }

    const response = await request.get<DeviceMonitorResponse>(
      `/api/intelligent-diagnosis/string-diagnosis/device/${deviceId}/monitor`
    )
    return response.data
  } catch (error) {
    console.error('获取设备监控信息失败:', error)
    // 失败时返回Mock数据
    return getMockDeviceMonitorInfo(deviceId)
  }
}

/**
 * 获取设备告警信息
 */
export const getDeviceAlarms = async (
  params: AlarmFilterParams
): Promise<DeviceAlarmsResponse> => {
  try {
    // 默认使用Mock数据，除非明确设置MOCK=false
    if (import.meta.env.MOCK !== 'false') {
      return getMockDeviceAlarms(
        params.deviceId,
        params.alarmType,
        params.page,
        params.pageSize
      )
    }

    const response = await request.get<DeviceAlarmsResponse>(
      `/api/intelligent-diagnosis/string-diagnosis/device/${params.deviceId}/alarms`,
      { params }
    )
    return response.data
  } catch (error) {
    console.error('获取设备告警信息失败:', error)
    // 失败时返回Mock数据
    return getMockDeviceAlarms(
      params.deviceId,
      params.alarmType,
      params.page,
      params.pageSize
    )
  }
}

/**
 * 获取设备历史数据
 */
export const getDeviceHistoryData = async (
  params: HistoryDataParams
): Promise<DeviceHistoryDataResponse> => {
  try {
    // 默认使用Mock数据，除非明确设置MOCK=false
    if (import.meta.env.MOCK !== 'false') {
      return getMockDeviceHistoryData(
        params.deviceId,
        params.timeType,
        params.startDate,
        params.endDate
      )
    }

    const response = await request.get<DeviceHistoryDataResponse>(
      `/api/intelligent-diagnosis/string-diagnosis/device/${params.deviceId}/history-data`,
      { params }
    )
    return response.data
  } catch (error) {
    console.error('获取设备历史数据失败:', error)
    // 失败时返回Mock数据
    return getMockDeviceHistoryData(
      params.deviceId,
      params.timeType,
      params.startDate,
      params.endDate
    )
  }
}

/**
 * 获取告警详情
 */
export const getAlarmDetail = async (
  alarmId: string
): Promise<AlarmDetailResponse> => {
  try {
    // 默认使用Mock数据，除非明确设置MOCK=false
    if (import.meta.env.MOCK !== 'false') {
      return getMockAlarmDetail(alarmId)
    }

    const response = await request.get<AlarmDetailResponse>(
      `/api/intelligent-diagnosis/string-diagnosis/alarm/${alarmId}/details`
    )
    return response.data
  } catch (error) {
    console.error('获取告警详情失败:', error)
    // 失败时返回Mock数据
    return getMockAlarmDetail(alarmId)
  }
}

/**
 * 处理告警
 */
export const handleAlarm = async (
  alarmId: string,
  request: AlarmHandleRequest
): Promise<AlarmHandleResponse> => {
  try {
    // 默认使用Mock数据，除非明确设置MOCK=false
    if (import.meta.env.MOCK !== 'false') {
      return getMockAlarmHandle(alarmId, request.action)
    }

    const response = await request.post<AlarmHandleResponse>(
      `/api/intelligent-diagnosis/string-diagnosis/alarm/${alarmId}/handle`,
      request
    )
    return response.data
  } catch (error) {
    console.error('处理告警失败:', error)
    // 失败时返回Mock数据
    return getMockAlarmHandle(alarmId, request.action)
  }
}
