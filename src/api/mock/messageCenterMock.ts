/**
 * 消息中心 Mock 数据
 */

import type {
  AnnouncementMessage,
  AlarmMessage,
  SystemMessage,
  MaintenanceMessage,
  MessageListResponse,
  MessageStatistics,
  MessageQueryParams,
  MessageTab
} from '../types/message-center'

// 公告消息 Mock 数据
export const mockAnnouncementMessages: AnnouncementMessage[] = [
  {
    id: 'ann_001',
    title: '系统维护通知：本周六晚上22:00-24:00进行系统升级',
    content: '为了提升系统性能和用户体验，我们将于本周六（10月26日）晚上22:00-24:00进行系统升级维护。维护期间系统将暂时无法访问，请提前做好相关准备工作。',
    publishTime: '2025-10-21 09:30:00',
    publisher: '系统管理员',
    status: 'unread',
    type: 'announcement',
    priority: 'high',
    attachments: ['维护计划详情.pdf']
  },
  {
    id: 'ann_002',
    title: '新功能发布：智能诊断模块正式上线',
    content: '经过长期的开发和测试，智能诊断模块现已正式上线。该模块提供一键诊断、组串诊断、积尘诊断等多项功能，帮助用户更好地监控和维护光伏设备。',
    publishTime: '2025-10-20 14:15:00',
    publisher: '产品经理',
    status: 'read',
    type: 'announcement',
    priority: 'medium'
  },
  {
    id: 'ann_003',
    title: '安全提醒：请及时更新密码',
    content: '为保障账户安全，建议所有用户定期更新登录密码。密码应包含大小写字母、数字和特殊字符，长度不少于8位。',
    publishTime: '2025-10-19 16:45:00',
    publisher: '安全管理员',
    status: 'read',
    type: 'announcement',
    priority: 'medium'
  },
  {
    id: 'ann_004',
    title: '培训通知：光伏运维最佳实践培训',
    content: '将于下周三（10月30日）下午14:00-17:00举办光伏运维最佳实践培训，欢迎相关人员参加。培训地点：会议室A，请提前报名。',
    publishTime: '2025-10-18 11:20:00',
    publisher: '人力资源部',
    status: 'unread',
    type: 'announcement',
    priority: 'low'
  },
  {
    id: 'ann_005',
    title: '节假日值班安排通知',
    content: '关于国庆节期间的值班安排，请各部门负责人查看附件中的详细安排表，确保节假日期间系统正常运行。',
    publishTime: '2025-10-17 08:30:00',
    publisher: '运营部',
    status: 'read',
    type: 'announcement',
    priority: 'medium',
    attachments: ['国庆值班安排表.xlsx']
  }
]

// 告警消息 Mock 数据
export const mockAlarmMessages: AlarmMessage[] = [
  {
    id: 'alarm_001',
    title: '芜湖城南污水厂 - 逆变器离线告警',
    content: '设备编号：INV-001，设备于2025-10-21 10:15:00离线，请及时检查网络连接和设备状态。',
    alarmTime: '2025-10-21 10:15:00',
    alarmLevel: 'error',
    stationName: '芜湖城南污水厂',
    deviceName: '逆变器INV-001',
    status: 'unread',
    type: 'alarm'
  },
  {
    id: 'alarm_002',
    title: '岳阳君山区污水厂 - 发电量异常',
    content: '今日发电量较昨日同期下降35%，建议检查设备运行状态和天气条件。',
    alarmTime: '2025-10-21 09:45:00',
    alarmLevel: 'warning',
    stationName: '岳阳君山区污水厂',
    status: 'read',
    type: 'alarm'
  },
  {
    id: 'alarm_003',
    title: '九江柴桑区污水厂 - 温度过高告警',
    content: '逆变器温度达到78°C，超过安全阈值，请立即检查散热系统。',
    alarmTime: '2025-10-20 15:30:00',
    alarmLevel: 'critical',
    stationName: '九江柴桑区污水厂',
    deviceName: '逆变器INV-003',
    status: 'read',
    type: 'alarm'
  }
]

// 系统消息 Mock 数据
export const mockSystemMessages: SystemMessage[] = [
  {
    id: 'sys_001',
    title: '系统更新完成 v2.1.0',
    content: '系统已成功更新至v2.1.0版本，新增了多项功能和性能优化。',
    createTime: '2025-10-21 08:00:00',
    status: 'unread',
    type: 'system',
    category: 'update'
  },
  {
    id: 'sys_002',
    title: '数据备份完成',
    content: '定期数据备份已于2025-10-20 23:00:00完成，备份文件已存储至安全位置。',
    createTime: '2025-10-20 23:30:00',
    status: 'read',
    type: 'system',
    category: 'maintenance'
  }
]

// 运维消息 Mock 数据
export const mockMaintenanceMessages: MaintenanceMessage[] = [
  {
    id: 'maint_001',
    title: '工单分派：芜湖城南污水厂设备检修',
    content: '请于明日上午前往芜湖城南污水厂进行逆变器检修工作。',
    createTime: '2025-10-21 11:00:00',
    assignee: '张三',
    status: 'unread',
    type: 'maintenance',
    workOrderId: 'WO-2025102101',
    priority: 'high'
  },
  {
    id: 'maint_002',
    title: '巡检任务提醒：岳阳君山区污水厂月度巡检',
    content: '本月度巡检任务即将到期，请及时完成相关巡检工作。',
    createTime: '2025-10-20 16:30:00',
    assignee: '李四',
    status: 'read',
    type: 'maintenance',
    priority: 'medium'
  }
]

// 获取消息列表
export function getMessageListMock(params: MessageQueryParams): MessageListResponse {
  let allMessages: any[] = []
  
  // 根据类型筛选消息
  switch (params.type) {
    case 'announcement':
      allMessages = [...mockAnnouncementMessages]
      break
    case 'alarm':
      allMessages = [...mockAlarmMessages]
      break
    case 'system':
      allMessages = [...mockSystemMessages]
      break
    case 'maintenance':
      allMessages = [...mockMaintenanceMessages]
      break
    default:
      allMessages = [
        ...mockAnnouncementMessages,
        ...mockAlarmMessages,
        ...mockSystemMessages,
        ...mockMaintenanceMessages
      ]
  }
  
  // 根据状态筛选
  if (params.status) {
    allMessages = allMessages.filter(msg => msg.status === params.status)
  }
  
  // 关键字搜索
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    allMessages = allMessages.filter(msg => 
      msg.title.toLowerCase().includes(keyword) ||
      msg.content.toLowerCase().includes(keyword)
    )
  }
  
  // 时间范围筛选
  if (params.startTime || params.endTime) {
    allMessages = allMessages.filter(msg => {
      const msgTime = new Date(getMessageTime(msg)).getTime()
      const start = params.startTime ? new Date(params.startTime).getTime() : 0
      const end = params.endTime ? new Date(params.endTime).getTime() : Date.now()
      return msgTime >= start && msgTime <= end
    })
  }
  
  // 按时间倒序排序
  allMessages.sort((a, b) => {
    const timeA = new Date(getMessageTime(a)).getTime()
    const timeB = new Date(getMessageTime(b)).getTime()
    return timeB - timeA
  })
  
  // 分页
  const page = params.page || 1
  const pageSize = params.pageSize || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = allMessages.slice(start, end)
  
  return {
    list,
    total: allMessages.length,
    page,
    pageSize
  }
}

// 获取消息时间
function getMessageTime(message: any): string {
  if ('publishTime' in message) return message.publishTime
  if ('alarmTime' in message) return message.alarmTime
  if ('createTime' in message) return message.createTime
  return new Date().toISOString()
}

// 获取消息统计
export function getMessageStatisticsMock(): MessageStatistics {
  const allMessages = [
    ...mockAnnouncementMessages,
    ...mockAlarmMessages,
    ...mockSystemMessages,
    ...mockMaintenanceMessages
  ]
  
  return {
    totalCount: allMessages.length,
    unreadCount: allMessages.filter(msg => msg.status === 'unread').length,
    announcementCount: mockAnnouncementMessages.length,
    alarmCount: mockAlarmMessages.length,
    systemCount: mockSystemMessages.length,
    maintenanceCount: mockMaintenanceMessages.length
  }
}

// 获取消息标签页
export function getMessageTabsMock(): MessageTab[] {
  const stats = getMessageStatisticsMock()
  
  return [
    {
      key: 'all',
      label: '全部消息',
      count: stats.totalCount
    },
    {
      key: 'announcement',
      label: '公告消息',
      count: stats.announcementCount
    },
    {
      key: 'alarm',
      label: '告警消息',
      count: stats.alarmCount
    },
    {
      key: 'system',
      label: '系统消息',
      count: stats.systemCount
    },
    {
      key: 'maintenance',
      label: '运维消息',
      count: stats.maintenanceCount
    }
  ]
}

// 标记消息为已读
export function markMessageAsReadMock(messageId: string): boolean {
  // 查找并标记消息为已读
  const allMessages = [
    ...mockAnnouncementMessages,
    ...mockAlarmMessages,
    ...mockSystemMessages,
    ...mockMaintenanceMessages
  ]
  
  const message = allMessages.find(msg => msg.id === messageId)
  if (message) {
    message.status = 'read'
    return true
  }
  
  return false
}

// 批量标记消息为已读
export function markAllMessagesAsReadMock(type?: string): boolean {
  let messages: any[] = []
  
  switch (type) {
    case 'announcement':
      messages = mockAnnouncementMessages
      break
    case 'alarm':
      messages = mockAlarmMessages
      break
    case 'system':
      messages = mockSystemMessages
      break
    case 'maintenance':
      messages = mockMaintenanceMessages
      break
    default:
      messages = [
        ...mockAnnouncementMessages,
        ...mockAlarmMessages,
        ...mockSystemMessages,
        ...mockMaintenanceMessages
      ]
  }
  
  messages.forEach(msg => {
    msg.status = 'read'
  })
  
  return true
}
