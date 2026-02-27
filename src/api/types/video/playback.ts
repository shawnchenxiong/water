/**
 * 录像回放相关类型定义
 */

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

// 录像文件
export interface VideoFile {
  id: string;
  fileName: string;
  startTime: string;
  endTime: string;
  fileSize: number;
  fileSizeMB: string;
  filePath: string;
  location: string;
}

// 时间轴数据
export interface TimelineSegment {
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  fileId: string;
  duration: number; // 秒
}

// 筛选条件
export interface PlaybackFilterForm {
  fileLocation: string;
  selectedDate: string; // YYYY-MM-DD
  timeRange: number; // 1/3/7
}

// 播放状态
export type PlayStatus = 'playing' | 'paused' | 'stopped';

// 播放速度
export type PlaySpeed = 0.5 | 1 | 2;

// 获取录像文件列表参数
export interface GetFileListParams {
  cameraId: string;
  fileLocation?: string;
  date: string; // YYYY-MM-DD
  timeRange?: number;
}

// 获取录像文件列表响应
export interface GetFileListResponse {
  files: VideoFile[];
  timeline: TimelineSegment[];
}

// 开始播放参数
export interface StartPlayParams {
  fileId: string;
  filePath: string;
  startTime?: string;
}

// 开始播放响应
export interface StartPlayResponse {
  playUrl: string;
  streamType: string;
  duration: number;
}

// 截图参数
export interface CaptureSnapshotParams {
  fileId: string;
  timestamp: string;
}

// 截图响应
export interface CaptureSnapshotResponse {
  imageUrl: string;
  base64: string;
}

// 批量下载参数
export interface BatchDownloadParams {
  fileIds: string[];
}

