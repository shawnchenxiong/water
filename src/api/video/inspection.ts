/**
 * 视频巡检 API
 */

import type {
  VideoDeviceTreeNode,
  GetTaskListParams,
  GetTaskListResponse,
  CreateTaskParams,
  UpdateTaskParams,
  DeleteTaskParams,
  StartTaskParams,
  StartTaskResponse,
  StopTaskParams,
} from '@/api/types/video/inspection';

/**
 * 获取设备树
 */
export async function getVideoDeviceTree(): Promise<VideoDeviceTreeNode[]> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'REGION_001',
          name: '安徽省芜湖市',
          type: 'region',
          onlineCount: 3,
          totalCount: 5,
          children: [
            {
              id: 'STATION_001',
              name: '芜湖城南污水厂',
              type: 'station',
              onlineCount: 2,
              totalCount: 3,
              children: [
                {
                  id: 'CAMERA_001',
                  name: '摄像头1',
                  type: 'camera',
                  status: 'online',
                },
                {
                  id: 'CAMERA_002',
                  name: '摄像头2',
                  type: 'camera',
                  status: 'online',
                },
                {
                  id: 'CAMERA_003',
                  name: '摄像头3',
                  type: 'camera',
                  status: 'offline',
                },
              ],
            },
          ],
        },
      ]);
    }, 300);
  });
}

/**
 * 查询巡检任务列表
 */
export async function getTaskList(
  params: GetTaskListParams
): Promise<GetTaskListResponse> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = Array.from({ length: 10 }, (_, i) => ({
        id: `TASK_${String(i + 1).padStart(3, '0')}`,
        taskName: `巡检任务${i + 1}`,
        description: `这是巡检任务${i + 1}的描述`,
        cameraCount: Math.floor(Math.random() * 5) + 1,
        playDuration: 10 + i * 5,
        loopCount: i % 3 === 0 ? 0 : i + 1,
        status: ['stopped', 'running', 'paused'][i % 3] as any,
        enabled: i % 2 === 0,
        cameras: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
          cameraId: `CAMERA_${String(j + 1).padStart(3, '0')}`,
          cameraName: `摄像头${j + 1}`,
          playUrl: '',
        })),
        createTime: `2025-10-${String(18 - i).padStart(2, '0')} 10:00:00`,
        updateTime: `2025-10-${String(18 - i).padStart(2, '0')} 10:00:00`,
      }));

      const start = (params.pageNum - 1) * params.pageSize;
      const end = start + params.pageSize;
      const list = mockData.slice(start, end);

      resolve({
        list,
        total: mockData.length,
      });
    }, 500);
  });
}

/**
 * 创建巡检任务
 */
export async function createTask(params: CreateTaskParams): Promise<void> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Create task:', params);
      resolve();
    }, 300);
  });
}

/**
 * 更新巡检任务
 */
export async function updateTask(params: UpdateTaskParams): Promise<void> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Update task:', params);
      resolve();
    }, 300);
  });
}

/**
 * 删除巡检任务
 */
export async function deleteTask(params: DeleteTaskParams): Promise<void> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Delete task:', params.id);
      resolve();
    }, 300);
  });
}

/**
 * 启动巡检任务
 */
export async function startTask(
  params: StartTaskParams
): Promise<StartTaskResponse> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        taskId: params.id,
        cameras: Array.from({ length: 5 }, (_, i) => ({
          cameraId: `CAMERA_${String(i + 1).padStart(3, '0')}`,
          cameraName: `摄像头${i + 1}`,
          playUrl: `rtsp://192.168.1.100:554/camera/${String(i + 1).padStart(3, '0')}.mp4`,
        })),
      });
    }, 300);
  });
}

/**
 * 停止巡检任务
 */
export async function stopTask(params: StopTaskParams): Promise<void> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Stop task:', params.id);
      resolve();
    }, 300);
  });
}

