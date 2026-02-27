/**
 * 停机诊断Mock数据
 */

import type {
  DowntimeStatistics,
  DowntimeEventListResponse,
  DowntimeEvent
} from '@/api/types/diagnosis/downtime'

/**
 * Mock停机统计数据（参考UI设计图）
 */
export function generateMockDowntimeStatistics(stationId: string): DowntimeStatistics {
  return {
    summary: {
      lossEnergy: 3400.8,
      lossRevenue: 2040.48,
      availabilityRate: 99.44
    },
    timeAnalysis: {
      categories: ['小于1小时', '1-7小时', '7-21小时', '21-49小时', '49-98小时', '98+小时'],
      lossEnergy: [237.89, 3162.91, 0, 0, 0, 0]
    },
    reasonAnalysis: {
      categories: [
        '调度限电',
        '电网故障停运',
        '电网异常停运',
        '设备故障停运',
        '指令控制停运',
        '冰雪覆盖停运',
        '未归明原因停运'
      ],
      lossEnergy: [0, 0, 0, 3374.80, 0, 0, 26.00]
    }
  }
}

/**
 * Mock停机事件列表
 */
export function generateMockDowntimeEvents(stationId: string, total: number): DowntimeEvent[] {
  return Array.from({ length: total }, (_, i) => ({
    id: `event_${i + 1}`,
    stationName: '芜湖城南污水厂',
    deviceName: `CN-N${String(i + 1).padStart(4, '0')}`,
    startTime: `2025-10-${String((i % 30) + 1).padStart(2, '0')} 08:00:00`,
    endTime: `2025-10-${String((i % 30) + 1).padStart(2, '0')} ${String(9 + (i % 5)).padStart(2, '0')}:00:00`,
    duration: `${i % 5 + 1}小时`,
    lossEnergy: Math.round((100 + Math.random() * 200) * 100) / 100,
    lossRevenue: Math.round((60 + Math.random() * 120) * 100) / 100,
    reason: i % 10 === 0 ? '未归明原因停运' : '设备故障停运'
  }))
}

