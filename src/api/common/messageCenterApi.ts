/**
 * 消息中心 API 接口
 */

import { request } from '@/utils/request'
import type {
  MessageListResponse,
  MessageStatistics,
  MessageQueryParams,
  MessageTab,
  Message
} from '../types/message-center'
import {
  getMessageListMock,
  getMessageStatisticsMock
} from '../mock/messageCenterMock'

/**
 * 获取消息列表
 */
export async function getMessageList(params: MessageQueryParams): Promise<MessageListResponse> {
  // 构建请求参数
  const requestParams: any = {
    pageNum: params.pageNum || params.page || 1,
    pageSize: params.pageSize || 10,
  }
  
  // 只有传了type参数才添加（"全部"不传type）
  if (params.type !== undefined && params.type !== null) {
    if (typeof params.type === 'string') {
      const typeMap: Record<string, number> = {
        'announcement': 1,
        'system': 2,
        'alarm': 3,
      }
      requestParams.type = typeMap[params.type] || Number(params.type)
    } else {
      requestParams.type = params.type
    }
  }
  
  // 调用真实API
  const response = await request.get<any>('/api/operation-logs/messageCenter', {
    params: requestParams
  })
  
  // 直接返回API数据
  if (response.success && response.code === 200) {
    const result = response.result || {}
    const dataList = result.data || []
    
    return {
      list: dataList,
      total: result.total || 0,
      page: requestParams.pageNum,
      pageSize: requestParams.pageSize,
    }
  }
  
  throw new Error(response.message || '获取消息列表失败')
}

/**
 * 获取消息统计
 * 通过调用消息列表接口获取未读数量
 */
export async function getMessageStatistics(): Promise<MessageStatistics> {
  try {
    // 调用消息列表接口，只获取第一页用于获取统计信息
    const response = await request.get<any>('/api/operation-logs/messageCenter', {
      params: {
        pageNum: 1,
        pageSize: 1, // 只需要统计信息，不需要完整列表
      }
    })
    
    if (response.success && response.code === 200) {
      const result = response.result || {}
      // 从 result.readFlag 获取未读消息数量
      const unreadCount = result.readFlag || 0
      
      return {
        unreadCount: unreadCount,
        totalCount: result.total || 0,
        announcementCount: 0, // 如果需要分类统计，需要额外调用接口
        systemCount: 0,
        alarmCount: 0,
      }
    }
    
    throw new Error(response.message || '获取消息统计失败')
  } catch (error) {
    console.error('获取消息统计失败:', error)
    // 失败时返回默认值
    return {
      unreadCount: 0,
      totalCount: 0,
      announcementCount: 0,
      systemCount: 0,
      alarmCount: 0,
    }
  }
}

/**
 * 获取消息标签页
 */
export async function getMessageTabs(): Promise<MessageTab[]> {
  // 固定返回三类标签
  return [
    {
      key: 'all',
      label: '全部',
      count: 0  // 数量需要从统计接口获取，这里先设为0
    },
    {
      key: '1',
      label: '通知公告',
      count: 0
    },
    {
      key: '2',
      label: '系统消息',
      count: 0
    },
    {
      key: '3',
      label: '告警消息',
      count: 0
    }
  ]
}

/**
 * 标记消息为已读
 */
export async function markMessageAsRead(messageId: string): Promise<boolean> {
  // 调用真实API
  const response = await request.put<any>('/api/operation-logs/editByAnntIdAndUserId', {
    anntId: messageId
  })
  
  // API返回success:true, code:0表示成功
  if (response.success && (response.code === 200 || response.code === 0)) {
    return true
  }
  
  throw new Error(response.message || '标记已读失败')
}

/**
 * 批量标记消息为已读（全部已读）
 * 不需要传递参数，后端会将当前用户的所有消息标记为已读
 */
export async function markAllMessagesAsRead(): Promise<boolean> {
  // 调用全部已读接口，不需要传递参数
  const response = await request.put<any>('/api/operation-logs/readAll')
  
  // API返回success:true, code:0或200表示成功
  if (response.success && (response.code === 200 || response.code === 0)) {
    return true
  }
  
  throw new Error(response.message || '全部已读失败')
}

/**
 * 删除消息
 */
export async function deleteMessage(messageId: string): Promise<boolean> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    // 使用Mock数据（暂不实现删除逻辑）
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 200)
    })
  }
  
  // 调用真实API
  return request.delete(`/api/message/${messageId}`)
}

/**
 * 批量删除消息
 */
export async function deleteMessages(messageIds: string[]): Promise<boolean> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    // 使用Mock数据（暂不实现删除逻辑）
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 200)
    })
  }
  
  // 调用真实API
  return request.delete('/api/message/batch', { data: { messageIds } })
}

/**
 * 获取消息详情
 */
export async function getMessageDetail(messageId: string): Promise<Message> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    // 使用Mock数据
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 从Mock数据中查找消息
        const mockData = getMessageListMock({ page: 1, pageSize: 1000 })
        const message = mockData.list.find(msg => msg.id === messageId)
        
        if (message) {
          resolve(message)
        } else {
          reject(new Error('消息不存在'))
        }
      }, 200)
    })
  }
  
  // 调用真实API
  return request.get(`/api/message/${messageId}`)
}
