/**
 * 告警屏蔽类型定义
 */

// 电站树节点
export interface StationTreeNode {
  id: string;
  name: string;
  type: 'station' | 'device';
  children?: StationTreeNode[];
}

// 屏蔽类型
export type AvoidType = '1' | '2' | '3'; // 1-区域 2-设备 3-监控量

// 屏蔽列表项
export interface AlarmShieldRow {
  id: number;
  avoidStartTime: string;
  avoidEndTime: string;
  isClearRealAlarm: string; // 1-是 0-否
  avoidType: string;
  userId: number;
  userName: string;
  createTime: string;
  updateTime: string;
  reasonClearRealAlarm: string; // 消除原因
  remark: string; // 备注
  avoidWeekTime: string; // 时间段配置
  regionId: string;
  stationPath: string;
  stationName: string;
  deviceId?: string; // 设备屏蔽
  deviceName?: string;
  deviceModelId?: string;
  deviceModelName?: string;
  meteId?: string; // 监控量屏蔽
  meteName?: string;
}

// 获取屏蔽列表参数
export interface GetShieldListParams {
  regionId: string;
  avoidType: AvoidType;
  pageNum: number;
  pageSize: number;
  beginTime?: string;
  endTime?: string;
  deviceType?: string; // 设备屏蔽和监控量屏蔽使用
  deviceName?: string; // 设备屏蔽和监控量屏蔽使用
  meteName?: string; // 监控量屏蔽使用
}

// 列表响应
export interface GetShieldListResponse {
  list: AlarmShieldRow[];
  total: number;
}

