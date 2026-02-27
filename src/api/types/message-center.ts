/**
 * 消息中心相关类型定义
 */

// 消息类型（API返回：1=通知公告, 2=系统消息, 3=告警消息）
export type MessageType = '1' | '2' | '3' | 'announcement' | 'alarm' | 'system' | 'maintenance'

// 消息状态（API返回：0=未读, 1=已读）
export type MessageStatus = '0' | '1' | 'unread' | 'read'

// 消息（直接使用API返回的字段）
export interface Message {
  id: string
  anntId: string
  userId: string
  titile: string  // API返回的字段名（拼写错误）
  msgContent: string
  sender: string
  priority: string  // M, H, L
  readFlag: string  // 0=未读, 1=已读
  sendTime: string
  pageNo: string | null
  pageSize: string | null
  msgCategory: string  // 1=通知公告, 2=系统消息, 3=告警消息
  busId: string | null
  busType: string | null
  openType: string | null
  openPage: string | null
  bizSource: string | null
  msgAbstract: string | null
}

// 消息查询参数
export interface MessageQueryParams {
  type?: number | string  // 1=通知公告, 2=系统消息, 3=告警消息
  pageNum?: number
  pageSize?: number
  keyword?: string
  startTime?: string
  endTime?: string
  // 兼容旧参数
  page?: number
  status?: MessageStatus
}

// 消息列表响应
export interface MessageListResponse {
  list: Message[]
  total: number
  page: number
  pageSize: number
}

// 消息统计
export interface MessageStatistics {
  totalCount: number
  unreadCount: number
  announcementCount: number
  alarmCount: number
  systemCount: number
  maintenanceCount: number
}

// 消息中心标签页
export interface MessageTab {
  key: MessageType | 'all'
  label: string
  count: number
}

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
}

// 排序参数
export interface SortParams {
  field: string
  order: 'asc' | 'desc'
}
