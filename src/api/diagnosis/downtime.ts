/**
 * 停机诊断API接口
 */

import request from '@/utils/request'
import type {
  DowntimeStatistics,
  DowntimeEventListResponse,
  DowntimeQueryParams,
  DowntimeEvent
} from '@/api/types/diagnosis/downtime'

import {
  generateMockDowntimeStatistics,
  generateMockDowntimeEvents
} from '@/api/mock/downtime'

const useMock = import.meta.env.MOCK !== 'false'

/**
 * 获取停机统计数据
 */
export async function getDowntimeStatistics(
  params: DowntimeQueryParams
): Promise<DowntimeStatistics> {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockDowntimeStatistics(params.stationId))
      }, 500)
    })
  }

  const response = await request.get('/api/intelligent-diagnosis/downtime/statistics', {
    params
  })
  return response.data
}

/**
 * 获取停机事件列表
 */
export async function getDowntimeEventList(
  params: DowntimeQueryParams
): Promise<DowntimeEventListResponse> {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, pageSize = 20, stationId } = params
        const allEvents = generateMockDowntimeEvents(stationId, 15)
        
        const start = (page - 1) * pageSize
        const end = start + pageSize
        
        resolve({
          events: allEvents.slice(start, end),
          pagination: {
            total: allEvents.length,
            page,
            pageSize,
            totalPages: Math.ceil(allEvents.length / pageSize)
          }
        })
      }, 500)
    })
  }

  const response = await request.get('/api/intelligent-diagnosis/downtime/events', {
    params
  })
  return response.data
}

/**
 * 更新停机事件
 */
export async function updateDowntimeEvent(event: DowntimeEvent): Promise<void> {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 500)
    })
  }

  await request.put(`/api/intelligent-diagnosis/downtime/events/${event.id}`, event)
}

