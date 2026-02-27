/**
 * 视频浏览 API
 */

import type { VideoDeviceNode } from '@/api/types/video/browsing';

/**
 * 获取视频设备树
 */
export async function getVideoDeviceTree(): Promise<VideoDeviceNode[]> {
  // TODO: 替换为实际API调用

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'root',
          name: '智能运维平台',
          type: 'region',
          online: false,
          onlineCount: 2,
          totalCount: 8,
          children: [
            {
              id: 'region1',
              name: '安徽省芜湖市',
              type: 'region',
              online: false,
              onlineCount: 1,
              totalCount: 3,
              children: [
                {
                  id: 'device1',
                  name: '监控摄像头1',
                  type: 'device',
                  online: true,
                },
                {
                  id: 'device2',
                  name: '监控摄像头2',
                  type: 'device',
                  online: false,
                },
              ],
            },
            {
              id: 'region2',
              name: '安徽省六安市',
              type: 'region',
              online: false,
              onlineCount: 1,
              totalCount: 2,
              children: [
                {
                  id: 'device3',
                  name: '监控摄像头3',
                  type: 'device',
                  online: true,
                },
              ],
            },
          ],
        },
      ]);
    }, 500);
  });
}

