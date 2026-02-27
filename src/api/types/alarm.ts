/**
 * 告警通知项
 */
export interface AlarmNotificationItem {
  id: string;
  title: string;
  description: string;
  level: number; // 1-一般, 2-重要, 3-紧急, 4-严重
  time: string;
  stationName?: string;
  deviceName?: string;
  isRead?: boolean;
}

/**
 * 告警通知列表请求参数
 */
export interface AlarmNotificationParams {
  pageNum: number;
  pageSize: number;
  level?: number;
  isRead?: boolean;
}

/**
 * 告警通知列表响应
 */
export interface AlarmNotificationResponse {
  list: AlarmNotificationItem[];
  total: number;
  unreadCount: number;
}

