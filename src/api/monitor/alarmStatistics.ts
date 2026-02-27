/**
 * 告警统计API接口
 */

import { request } from '@/utils/request'

/**
 * 告警统计响应数据
 */
export interface AlarmStatisticsData {
  commonly: number // 普通告警数量
  serious: number // 重要告警数量
  emergent: number // 紧急告警数量
}

/**
 * 获取设备告警率统计
 * @param days 时间范围（天数），默认7天
 * @returns 告警统计数据
 */
export async function getDeviceAlarmRate(days: number = 7): Promise<AlarmStatisticsData> {
  try {
    const response = await request.get<any>('/index/deviceAlarmRate', {
      params: { item: days }
    })
    
    console.log('告警统计接口响应:', response)
    
    // 处理可能的两种返回格式：
    // 1. 直接返回 { commonly, serious, emergent }
    // 2. jeecg-boot 格式: { success: true, result: { commonly, serious, emergent } }
    let data: any
    
    if (response.result) {
      // jeecg-boot 格式
      data = response.result
    } else if (response.commonly !== undefined) {
      // 直接返回
      data = response
    } else {
      // 格式不符，返回默认值
      console.warn('告警统计接口返回格式不符合预期:', response)
      return {
        commonly: 0,
        serious: 0,
        emergent: 0,
      }
    }
    
    return {
      commonly: Number(data.commonly) || 0,
      serious: Number(data.serious) || 0,
      emergent: Number(data.emergent) || 0,
    }
  } catch (error) {
    console.error('获取告警统计失败:', error)
    // 发生错误时返回默认值
    return {
      commonly: 0,
      serious: 0,
      emergent: 0,
    }
  }
}

