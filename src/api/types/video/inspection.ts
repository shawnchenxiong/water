/**
 * 视频巡检相关类型定义
 */

// 任务状态
export type TaskStatus = 'stopped' | 'running' | 'paused';

// 摄像头信息
export interface CameraInfo {
  cameraId: string;
  cameraName: string;
  playUrl?: string;
}

// 巡检任务
export interface InspectionTask {
  id: string;
  taskName: string;
  description: string;
  cameraCount: number;
  playDuration: number; // 秒
  loopCount: number; // 0表示无限循环
  status: TaskStatus;
  enabled: boolean;
  cameras: CameraInfo[];
  createTime: string;
  updateTime: string;
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

// 查询任务列表参数
export interface GetTaskListParams {
  keyword?: string;
  pageNum: number;
  pageSize: number;
}

// 查询任务列表响应
export interface GetTaskListResponse {
  list: InspectionTask[];
  total: number;
}

// 创建任务参数
export interface CreateTaskParams {
  taskName: string;
  description?: string;
  cameraIds: string[];
  playDuration: number;
  loopCount: number;
  enabled: boolean;
}

// 更新任务参数
export interface UpdateTaskParams extends CreateTaskParams {
  id: string;
}

// 删除任务参数
export interface DeleteTaskParams {
  id: string;
}

// 启动任务参数
export interface StartTaskParams {
  id: string;
}

// 启动任务响应
export interface StartTaskResponse {
  taskId: string;
  cameras: CameraInfo[];
}

// 停止任务参数
export interface StopTaskParams {
  id: string;
}

// 任务表单
export interface TaskForm {
  id?: string;
  taskName: string;
  description: string;
  selectedCameras: VideoDeviceTreeNode[];
  playDuration: number;
  loopMode: 'loop' | 'count';
  loopCount: number;
  enabled: boolean;
}

