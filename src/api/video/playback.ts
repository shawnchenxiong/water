/**
 * 录像回放 API
 */

import type {
  VideoDeviceTreeNode,
  GetFileListParams,
  GetFileListResponse,
  StartPlayParams,
  StartPlayResponse,
  CaptureSnapshotParams,
  CaptureSnapshotResponse,
  BatchDownloadParams,
} from '@/api/types/video/playback';

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
 * 获取录像文件列表
 */
export async function getFileList(
  params: GetFileListParams
): Promise<GetFileListResponse> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      const files = Array.from({ length: 10 }, (_, i) => ({
        id: `FILE_${String(i + 1).padStart(3, '0')}`,
        fileName: `CAM001_${params.date.replace(/-/g, '')}_${String(10 + i * 2).padStart(2, '0')}0000.mp4`,
        startTime: `${params.date} ${String(10 + i * 2).padStart(2, '0')}:00:00`,
        endTime: `${params.date} ${String(12 + i * 2).padStart(2, '0')}:00:00`,
        fileSize: Math.floor(Math.random() * 2147483648),
        fileSizeMB: (Math.random() * 2048).toFixed(2),
        filePath: `/video/records/${params.date}/CAM001_${params.date.replace(/-/g, '')}_${String(10 + i * 2).padStart(2, '0')}0000.mp4`,
        location: params.fileLocation || '前端',
      }));

      const timeline = files.map((file) => ({
        startTime: file.startTime.split(' ')[1],
        endTime: file.endTime.split(' ')[1],
        fileId: file.id,
        duration: 7200, // 2小时
      }));

      resolve({
        files,
        timeline,
      });
    }, 500);
  });
}

/**
 * 开始播放录像
 */
export async function startPlay(
  params: StartPlayParams
): Promise<StartPlayResponse> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        playUrl: `rtsp://192.168.1.100:554/playback/${params.fileId}.mp4`,
        streamType: 'rtsp',
        duration: 7200,
      });
    }, 300);
  });
}

/**
 * 截图
 */
export async function captureSnapshot(
  params: CaptureSnapshotParams
): Promise<CaptureSnapshotResponse> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        imageUrl: `/snapshots/${params.fileId}_${params.timestamp.replace(/[:\s-]/g, '')}.jpg`,
        base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      });
    }, 300);
  });
}

/**
 * 下载单个录像文件
 */
export async function downloadFile(fileId: string): Promise<void> {
  // Mock：模拟下载
  console.log(`Downloading file: ${fileId}`);
  // 实际实现需要调用后端接口获取文件流
}

/**
 * 批量下载录像文件
 */
export async function batchDownload(params: BatchDownloadParams): Promise<void> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Batch downloading files: ${params.fileIds.join(', ')}`);
      resolve();
    }, 300);
  });
}

