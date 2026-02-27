import request from '@/utils/request'
import type { AlarmQueryParams, AlarmTrendData, AlarmRankItem, ApiResponse } from '@/api/types/alarm/overview'

// 已废弃：使用环境变量统一控制Mock数据
// const USE_MOCK_DATA = true

// 获取告警数量趋势
export async function getAlarmCountTrend(
  params: AlarmQueryParams
): Promise<ApiResponse<AlarmTrendData>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 根据不同的时间粒度生成不同的数据
        let timeList: string[] = []
        let newAlarmList: number[] = []
        let confirmAlarmList: number[] = []
        
        if (params.dateType === 0) {
          // 近7天
          timeList = ['12-13', '12-14', '12-15', '12-16', '12-17', '12-18', '12-19']
          newAlarmList = [5, 8, 3, 12, 6, 9, 7]
          confirmAlarmList = [4, 7, 2, 10, 5, 8, 6]
        } else if (params.dateType === 1) {
          // 月
          timeList = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
          newAlarmList = Array.from({ length: 30 }, () => Math.floor(Math.random() * 15) + 1)
          confirmAlarmList = newAlarmList.map(v => Math.floor(v * 0.8))
        } else {
          // 年
          timeList = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
          newAlarmList = [45, 58, 43, 72, 56, 69, 57, 62, 54, 68, 51, 63]
          confirmAlarmList = [40, 52, 38, 65, 50, 62, 51, 56, 48, 61, 46, 57]
        }
        
        const alarmSum = newAlarmList.reduce((a, b) => a + b, 0)
        const confirmAlarmSum = confirmAlarmList.reduce((a, b) => a + b, 0)
        const falseAlarmSum = alarmSum - confirmAlarmSum
        const accuracy = alarmSum > 0 ? ((confirmAlarmSum / alarmSum) * 100).toFixed(1) : '0'
        
        resolve({
          code: 200,
          message: 'success',
          data: {
            confirmAlarmSum,
            confirmAlarmList,
            timeList,
            newAlarmList,
            falseAlarmSum,
            alarmSum,
            accuracy
          }
        })
      }, 500)
    })
  }
  
  // 真实API调用
  const response = await request.get('/auxsysAlarm/alarmQuery/selectAlarmCountTrend', {
    params
  })
  return response.data
}

// 获取设备告警排名TOP20
export async function getAlarmRank(
  params: AlarmQueryParams
): Promise<ApiResponse<AlarmRankItem[]>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockDevices = [
          '1#逆变器', '2#逆变器', '3#逆变器', '4#逆变器', '5#逆变器',
          '1#电能表', '2#电能表', '3#电能表', '4#电能表', '5#电能表',
          '汇流箱1', '汇流箱2', '汇流箱3', '汇流箱4', '汇流箱5',
          '气象站', '环境监测1', '环境监测2', '箱变1', '箱变2'
        ]
        
        const data: AlarmRankItem[] = mockDevices.map((name, index) => ({
          deviceType: index < 5 ? '0919' : index < 10 ? '0917' : '0921',
          regionId: params.regionId,
          alarmcount: Math.floor(Math.random() * 50) + (20 - index),
          deviceId: `device_${index + 1}`,
          deviceName: name
        }))
        
        // 按告警次数降序排序
        data.sort((a, b) => b.alarmcount - a.alarmcount)
        
        resolve({
          code: 200,
          message: 'success',
          data
        })
      }, 500)
    })
  }
  
  // 真实API调用
  const response = await request.get('/auxsysAlarm/alarmQuery/selectAlarmRank', {
    params
  })
  return response.data
}

/**
 * 获取设备告警率统计（饼图数据）
 * @param item 时间范围参数（1=24小时, 7=7天, 15=15天, 30=30天）
 */
export async function getDeviceAlarmRate(item: number): Promise<{
  emergent: string   // 紧急告警（字符串格式）
  serious: string    // 重要告警（字符串格式）
  commonly: string   // 普通告警（字符串格式）
}> {
  // 真实API调用
  
  // 定义响应类型（接口返回的是字符串格式）
  interface AlarmRateResponse {
    emergent: string
    serious: string
    commonly: string
  }
  
  // jeecg-boot 接口响应格式：{ code, message, result } 或 { code, message, data }
  interface ApiResponseWrapper {
    code?: number
    message?: string
    result?: AlarmRateResponse
    data?: AlarmRateResponse
  }
  
  const response = await request.get<ApiResponseWrapper | AlarmRateResponse>('/index/deviceAlarmRate', {
    params: { item }
  })
  
  // 如果响应包含 result 或 data 字段，则从中提取数据；否则直接使用响应
  let data: AlarmRateResponse
  if (response && typeof response === 'object' && ('result' in response || 'data' in response)) {
    const apiResponse = response as ApiResponseWrapper
    data = apiResponse.result || apiResponse.data || { emergent: '0', serious: '0', commonly: '0' }
  } else {
    data = response as AlarmRateResponse
  }
  
  // 返回响应数据
  return {
    emergent: data.emergent || '0',
    serious: data.serious || '0',
    commonly: data.commonly || '0'
  }
}

/**
 * 获取时间区间告警统计（折线图数据）
 * @param item 时间范围参数（1=24小时, 3=3天, 7=7天, 15=15天, 30=30天）
 */
export async function getTimeIntervalLogs(item: number): Promise<{
  '1': Array<{ time_interval: string; total_data: number }>  // 普通告警
  '2': Array<{ time_interval: string; total_data: number }>  // 重要告警
  '3': Array<{ time_interval: string; total_data: number }>  // 紧急告警
}> {
  // 真实API调用
  
  // 定义响应类型
  interface TimeIntervalLogsResponse {
    '1': Array<{ time_interval: string; total_data: number }>
    '2': Array<{ time_interval: string; total_data: number }>
    '3': Array<{ time_interval: string; total_data: number }>
  }
  
  // jeecg-boot 接口响应格式：{ code, message, result } 或 { code, message, data }
  interface ApiResponseWrapper {
    code?: number
    message?: string
    result?: TimeIntervalLogsResponse
    data?: TimeIntervalLogsResponse
  }
  
  const response = await request.get<ApiResponseWrapper | TimeIntervalLogsResponse>('/index/timeIntervalLogs', {
    params: { item }
  })
  
  // 如果响应包含 result 或 data 字段，则从中提取数据；否则直接使用响应
  if (response && typeof response === 'object' && ('result' in response || 'data' in response)) {
    const apiResponse = response as ApiResponseWrapper
    return apiResponse.result || apiResponse.data || { '1': [], '2': [], '3': [] }
  }
  
  // 直接返回响应数据（兼容直接返回数据的情况）
  return response as TimeIntervalLogsResponse
}

/**
 * 获取监测数据统计
 * @param item 时间范围参数（1=24小时, 3=3天, 7=7天, 15=15天, 30=30天）
 */
export async function getMonitorData(item: number): Promise<number> {
  const response = await request.get<any>('/index/findMonitorData', {
    params: { item }
  })
  
  // jeecg-boot 接口可能返回 { code, message, result } 或直接返回数字
  if (response && typeof response === 'object' && ('result' in response || 'data' in response)) {
    return (response.result ?? response.data) ?? 0
  }
  
  return typeof response === 'number' ? response : 0
}

/**
 * 获取告警数量统计
 * @param item 时间范围参数（1=24小时, 3=3天, 7=7天, 15=15天, 30=30天）
 */
export async function getAlertNum(item: number): Promise<number> {
  const response = await request.get<any>('/index/findAlertNum', {
    params: { item }
  })
  
  // jeecg-boot 接口可能返回 { code, message, result } 或直接返回数字
  if (response && typeof response === 'object' && ('result' in response || 'data' in response)) {
    return (response.result ?? response.data) ?? 0
  }
  
  return typeof response === 'number' ? response : 0
}

/**
 * 获取操作量统计
 * @param item 时间范围参数（1=24小时, 3=3天, 7=7天, 15=15天, 30=30天）
 */
export async function getOperationLog(item: number): Promise<number> {
  const response = await request.get<any>('/index/findOperationLog', {
    params: { item }
  })
  
  // jeecg-boot 接口可能返回 { code, message, result } 或直接返回数字
  if (response && typeof response === 'object' && ('result' in response || 'data' in response)) {
    return (response.result ?? response.data) ?? 0
  }
  
  return typeof response === 'number' ? response : 0
}

/**
 * 获取所有设备统计
 */
export async function getAllDevices(): Promise<number> {
  const response = await request.get<any>('/index/list')
  
  // jeecg-boot 接口可能返回 { code, message, result } 或直接返回数字
  if (response && typeof response === 'object' && ('result' in response || 'data' in response)) {
    return (response.result ?? response.data) ?? 0
  }
  
  return typeof response === 'number' ? response : 0
}

/**
 * 获取在线设备统计
 */
export async function getOnLineDeviceNum(): Promise<number> {
  const response = await request.get<any>('/index/findOnLineDeviceNum')
  
  // jeecg-boot 接口可能返回 { code, message, result } 或直接返回数字
  if (response && typeof response === 'object' && ('result' in response || 'data' in response)) {
    return (response.result ?? response.data) ?? 0
  }
  
  return typeof response === 'number' ? response : 0
}

/**
 * 获取活跃设备统计
 * @param item 时间范围参数（1=24小时, 3=3天, 7=7天, 15=15天, 30=30天）
 */
export async function getActiveDevicesNum(item: number): Promise<number> {
  const response = await request.get<any>('/index/findActiveDevicesNum', {
    params: { item }
  })
  
  // jeecg-boot 接口可能返回 { code, message, result } 或直接返回数字
  if (response && typeof response === 'object' && ('result' in response || 'data' in response)) {
    return (response.result ?? response.data) ?? 0
  }
  
  return typeof response === 'number' ? response : 0
}

/**
 * 获取告警设备统计
 * @param item 时间范围参数（1=24小时, 3=3天, 7=7天, 15=15天, 30=30天）
 */
export async function getAlertDevicesNum(item: number): Promise<number> {
  const response = await request.get<any>('/index/findAlertDevicesNum', {
    params: { item }
  })
  
  // jeecg-boot 接口可能返回 { code, message, result } 或直接返回数字
  if (response && typeof response === 'object' && ('result' in response || 'data' in response)) {
    return (response.result ?? response.data) ?? 0
  }
  
  return typeof response === 'number' ? response : 0
}

/**
 * 获取告警量统计
 * @param item 时间范围参数（1=24小时, 3=3天, 7=7天, 15=15天, 30=30天）
 */
export async function getDailyOperation(item: number): Promise<number> {
  const response = await request.get<any>('/index/findDailyOperation', {
    params: { item }
  })
  
  // jeecg-boot 接口可能返回 { code, message, result } 或直接返回数字
  if (response && typeof response === 'object' && ('result' in response || 'data' in response)) {
    return (response.result ?? response.data) ?? 0
  }
  
  return typeof response === 'number' ? response : 0
}

