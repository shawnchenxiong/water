/**
 * 实时告警Mock数据
 */

import type { AlarmRecord } from '@/api/types/alarm/realtime'

/**
 * 告警级别配置
 */
export const mockAlarmLevels: Array<'severe' | 'warning' | 'normal' | 'info'> = ['severe', 'warning', 'normal', 'info']

/**
 * 告警名称配置
 */
export const mockAlarmNames = ['通讯故障', '电压异常', '温度过高', '功率偏低', '设备离线']

/**
 * 设备类型配置
 */
export const mockDeviceTypes = ['逆变器', '电能表', '汇流箱', '控制器']

/**
 * 告警状态配置
 */
export const mockAlarmStatuses: Array<'unconfirmed' | 'confirmed' | 'cleared'> = ['unconfirmed', 'confirmed', 'cleared']

/**
 * 生成Mock告警数据
 */
export function generateMockAlarmData(pageNum: number, pageSize: number): AlarmRecord[] {
  const data: AlarmRecord[] = []
  const start = (pageNum - 1) * pageSize
  
  for (let i = start; i < start + pageSize && i < 50; i++) {
    data.push({
      id: `alarm_${i + 1}`,
      alarmLevel: mockAlarmLevels[i % mockAlarmLevels.length],
      alarmName: mockAlarmNames[i % mockAlarmNames.length],
      regionName: '芜湖城南污水厂',
      deviceName: `设备${i + 1}号`,
      deviceType: mockDeviceTypes[i % mockDeviceTypes.length],
      alarmTime: `2025-10-18 ${String(10 + (i % 12)).padStart(2, '0')}:${String((i * 5) % 60).padStart(2, '0')}:00`,
      suggestion: i % 3 === 0 ? '检查设备连接' : i % 3 === 1 ? '检查参数设置' : '联系维护人员',
      confirmStatus: mockAlarmStatuses[i % mockAlarmStatuses.length]
    })
  }
  
  return data
}

