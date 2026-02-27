/**
 * 预置位巡检 API
 */

import type {
  VideoDeviceTreeNode,
  GetPresetListParams,
  GetPresetListResponse,
  PTZControlParams,
} from '@/api/types/video/presetPatrol';

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
              ],
            },
          ],
        },
      ]);
    }, 300);
  });
}

/**
 * 获取预置位列表
 */
export async function getPresetList(
  params: GetPresetListParams
): Promise<GetPresetListResponse> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = Array.from({ length: 10 }, (_, i) => ({
        id: `PRESET_${String(i + 1).padStart(3, '0')}`,
        presetNumber: i + 1,
        presetName: `预置位${i + 1}`,
        description: `这是预置位${i + 1}的描述信息`,
        isGuard: i === 0,
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
 * 云台控制
 */
export async function ptzControl(params: PTZControlParams): Promise<void> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 300);
  });
}

