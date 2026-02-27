/**
 * 视频浏览类型定义
 */

// 设备树节点
export interface VideoDeviceNode {
  id: string;
  name: string;
  type: 'region' | 'device';
  online: boolean;
  onlineCount?: number;
  totalCount?: number;
  children?: VideoDeviceNode[];
}

// 视频播放画面
export interface VideoPlayer {
  id: string;
  deviceId?: string;
  deviceName?: string;
  status: 'idle' | 'loading' | 'playing' | 'error';
  url?: string;
}

// 画面布局
export type VideoLayout = 1 | 4 | 6 | 9 | 16;

