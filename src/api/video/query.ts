/**
 * 录像查询 API
 */

import type {
  VideoDeviceTreeNode,
  GetRecordListParams,
  GetRecordListResponse,
  PlayRecordParams,
  PlayRecordResponse,
  DeleteRecordParams,
} from '@/api/types/video/query';

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
            {
              id: 'STATION_002',
              name: '芜湖大龙湾污水厂',
              type: 'station',
              onlineCount: 1,
              totalCount: 2,
              children: [
                {
                  id: 'CAMERA_004',
                  name: '摄像头4',
                  type: 'camera',
                  status: 'online',
                },
                {
                  id: 'CAMERA_005',
                  name: '摄像头5',
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
 * 查询录像文件列表
 */
export async function getRecordList(
  params: GetRecordListParams
): Promise<GetRecordListResponse> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = Array.from({ length: 50 }, (_, i) => ({
        id: `FILE_${String(i + 1).padStart(3, '0')}`,
        fileName: `CAM001_20251018_${String(10 + i).padStart(2, '0')}0000.mp4`,
        startTime: `2025-10-18 ${String(10 + i).padStart(2, '0')}:00:00`,
        endTime: `2025-10-18 ${String(11 + i).padStart(2, '0')}:00:00`,
        location: i % 3 === 0 ? '云端存储' : '本地存储',
        cameraId: 'CAMERA_001',
        cameraName: `摄像头${(i % 5) + 1}`,
        fileSize: Math.floor(Math.random() * 2147483648), // 0-2GB
        fileSizeMB: (Math.random() * 2048).toFixed(2),
        fileType: ['普通录像', '告警录像', '手动录像'][i % 3],
        filePath: `/video/records/2025/10/18/CAM001_20251018_${String(10 + i).padStart(2, '0')}0000.mp4`,
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
 * 播放录像文件
 */
export async function playRecord(
  params: PlayRecordParams
): Promise<PlayRecordResponse> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        playUrl: `rtsp://192.168.1.100:554/playback/${params.fileId}.mp4`,
        streamType: 'rtsp',
      });
    }, 300);
  });
}

/**
 * 下载录像文件
 */
export async function downloadRecord(fileId: string): Promise<void> {
  // Mock：模拟下载
  console.log(`Downloading file: ${fileId}`);
  // 实际实现需要调用后端接口获取文件流
}

/**
 * 删除录像文件
 */
export async function deleteRecord(params: DeleteRecordParams): Promise<void> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Deleted file: ${params.fileId}`);
      resolve();
    }, 300);
  });
}

