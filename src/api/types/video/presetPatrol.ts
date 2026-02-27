/**
 * 预置位巡检相关类型定义
 */

// 预置位
export interface PresetPosition {
  id: string;
  presetNumber: number;
  presetName: string;
  description: string;
  isGuard: boolean;
}

// 设备树节点
export interface VideoDeviceTreeNode {
  id: string;
  name: string;
  type: 'region' | 'station' | 'camera';
  status?: 'online' | 'offline';
  onlineCount?: number;
  totalCount?: number;
  children?: VideoDeviceTreeNode[];
}

// 查询预置位列表参数
export interface GetPresetListParams {
  cameraId: string;
  pageNum: number;
  pageSize: number;
}

// 查询预置位列表响应
export interface GetPresetListResponse {
  list: PresetPosition[];
  total: number;
}

// 云台控制参数
export interface PTZControlParams {
  cameraId: string;
  action: string; // up/down/left/right/zoomin/zoomout等
  speed?: number;
}

