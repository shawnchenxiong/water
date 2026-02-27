import type { AlarmNotificationParams, AlarmNotificationResponse } from '@/api/types/alarm';

/**
 * 获取实时告警通知列表
 */
export async function getRealtimeAlarmList(
  params: AlarmNotificationParams
): Promise<AlarmNotificationResponse> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockRealtimeAlarmList(params)
  }
  
  // TODO: 实现真实API调用
  // return request.get('/api/alarms/realtime', { params })
  throw new Error('真实API未实现')
}

/**
 * Mock数据处理函数
 */
async function getMockRealtimeAlarmList(
  params: AlarmNotificationParams
): Promise<AlarmNotificationResponse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock数据
  const mockAlarms = [
    {
      id: 'alarm_001',
      title: '设备通讯中断',
      description: '六安凤凰桥二期污水厂，凤凰桥分化...',
      level: 3,
      time: '2025-08-13 10:02:42',
      stationName: '六安凤凰桥二期污水厂',
      deviceName: '逆变器01',
      isRead: false
    },
    {
      id: 'alarm_002',
      title: '电压异常告警',
      description: '亳州利辛县城污水厂，电压超出正常范围...',
      level: 2,
      time: '2025-08-13 09:45:18',
      stationName: '亳州利辛县城污水厂',
      deviceName: '电能表02',
      isRead: false
    },
    {
      id: 'alarm_003',
      title: '温度过高告警',
      description: '芜湖城南污水厂，设备温度超过阈值...',
      level: 4,
      time: '2025-08-13 09:30:05',
      stationName: '芜湖城南污水厂',
      deviceName: '逆变器05',
      isRead: false
    },
    {
      id: 'alarm_004',
      title: '功率异常',
      description: '六安东部新城污水厂，功率波动异常...',
      level: 1,
      time: '2025-08-13 09:15:22',
      stationName: '六安东部新城污水厂',
      deviceName: '逆变器03',
      isRead: false
    },
    {
      id: 'alarm_005',
      title: '通信故障',
      description: '九江鹤问湖污水厂，设备通信异常...',
      level: 2,
      time: '2025-08-13 08:58:33',
      stationName: '九江鹤问湖污水厂',
      deviceName: '气象站01',
      isRead: false
    }
  ];

  // 根据level筛选
  let filteredList = [...mockAlarms];
  if (params.level) {
    filteredList = filteredList.filter(item => item.level === params.level);
  }

  // 根据isRead筛选
  if (params.isRead !== undefined) {
    filteredList = filteredList.filter(item => item.isRead === params.isRead);
  }

  // 分页
  const start = (params.pageNum - 1) * params.pageSize;
  const end = start + params.pageSize;
  const paginatedList = filteredList.slice(start, end);

  // 计算未读数量
  const unreadCount = mockAlarms.filter(item => !item.isRead).length;

  return {
    list: paginatedList,
    total: filteredList.length,
    unreadCount
  };
}

/**
 * 标记告警为已读
 */
export async function markAlarmAsRead(alarmId: string): Promise<void> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 200));
    return
  }
  
  // TODO: 实现真实API调用
  // return request.put(`/api/alarms/${alarmId}/read`)
  throw new Error('真实API未实现')
}

/**
 * 清空所有告警通知
 */
export async function clearAllAlarms(): Promise<void> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 200));
    return
  }
  
  // TODO: 实现真实API调用
  // return request.delete('/api/alarms/clear')
  throw new Error('真实API未实现')
}

