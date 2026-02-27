import request from '@/utils/request'
import type { AlarmQueryParams, AlarmListResponse } from '@/api/types/alarm/realtime'
import { generateMockAlarmData } from '@/api/mock/realtimeAlarm'

// 获取告警列表
export async function getAlarmList(params: AlarmQueryParams): Promise<AlarmListResponse> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      code: 200,
      message: 'ok',
      data: {
        list: generateMockAlarmData(params.pageNum, params.pageSize),
        total: 50
      }
    }
  }
  
  const response = await request.get('/auxsysAlarm/alarmQuery/getAlarmCollectList', {
    params
  })
  return response.data
}

