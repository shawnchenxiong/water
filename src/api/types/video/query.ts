/**
 * 录像查询相关类型定义
 */

// 设备树节点
export interface VideoDeviceTreeNode {
  id: string;
  name: string;
  type: 'region' | 'station' | 'camera';
  status?: 'online' | 'offline'; // 仅camera类型有
  onlineCount?: number; // region/station类型有
  totalCount?: number; // region/station类型有
  children?: VideoDeviceTreeNode[];
}

// 录像文件
export interface VideoRecordFile {
  id: string;
  fileName: string;
  startTime: string;
  endTime: string;
  location: string; // 本地存储/云端存储
  cameraId: string;
  cameraName: string;
  fileSize: number; // Bytes
  fileSizeMB: string; // 格式化后
  fileType: string; // 普通录像/告警录像/手动录像
  filePath: string;
}

// 筛选条件
export interface QueryFilterForm {
  fileLocation: string;
  dateRange: [string, string];
  fileType: string;
}

// 查询录像列表参数
export interface GetRecordListParams {
  deviceId?: string;
  regionId?: string;
  fileLocation?: string;
  startTime: string;
  endTime: string;
  fileType?: string;
  pageNum: number;
  pageSize: number;
}

// 查询录像列表响应
export interface GetRecordListResponse {
  list: VideoRecordFile[];
  total: number;
}

// 播放录像参数
export interface PlayRecordParams {
  fileId: string;
  filePath: string;
}

// 播放录像响应
export interface PlayRecordResponse {
  playUrl: string;
  streamType: string;
}

// 删除录像参数
export interface DeleteRecordParams {
  fileId: string;
}

