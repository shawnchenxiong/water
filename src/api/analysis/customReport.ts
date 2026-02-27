/**
 * 自定义报表 API
 */

import type {
  DeviceTreeNode,
  IndicatorTreeNode,
  GetTemplateListParams,
  GetTemplateListResponse,
  GetTaskListParams,
  GetTaskListResponse,
} from '@/api/types/analysis/customReport';

/**
 * 获取设备树
 */
export async function getDeviceTree(): Promise<DeviceTreeNode[]> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'REGION_001',
          name: '安徽省芜湖市',
          type: 'region',
          children: [
            {
              id: 'STATION_001',
              name: '芜湖城南污水厂',
              type: 'station',
              children: [
                { id: 'DEVICE_001', name: '逆变器1', type: 'device' },
                { id: 'DEVICE_002', name: '逆变器2', type: 'device' },
              ],
            },
          ],
        },
      ]);
    }, 300);
  });
}

/**
 * 获取指标树
 */
export async function getIndicatorTree(): Promise<IndicatorTreeNode[]> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 'IND_001', name: '气象站', children: [{ id: 'IND_001_01', name: '辐射强度' }] },
        { id: 'IND_002', name: '电能表', children: [{ id: 'IND_002_01', name: '发电量' }] },
        { id: 'IND_003', name: '逆变器', children: [{ id: 'IND_003_01', name: '利用小时数' }] },
      ]);
    }, 300);
  });
}

/**
 * 获取模板列表
 */
export async function getTemplateList(
  params: GetTemplateListParams
): Promise<GetTemplateListResponse> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = Array.from({ length: 10 }, (_, i) => ({
        id: `TPL_${String(i + 1).padStart(3, '0')}`,
        templateName: `报表模板${i + 1}`,
        templateType: i % 2 === 0 ? '对比报表' : '统计报表',
        createTime: `2025-10-${String(18 - i).padStart(2, '0')} 10:00:00`,
        creator: '管理员',
      }));

      const start = (params.pageNum - 1) * params.pageSize;
      const end = start + params.pageSize;
      const list = mockData.slice(start, end);

      resolve({ list, total: mockData.length });
    }, 500);
  });
}

/**
 * 获取任务列表
 */
export async function getTaskList(
  params: GetTaskListParams
): Promise<GetTaskListResponse> {
  // Mock数据
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = Array.from({ length: 10 }, (_, i) => ({
        id: `TASK_${String(i + 1).padStart(3, '0')}`,
        taskName: `报表任务${i + 1}`,
        createTime: `2025-10-${String(18 - i).padStart(2, '0')} 10:00:00`,
        dataTimeRange: `2025-10-${String(i + 1).padStart(2, '0')} ~ 2025-10-${String(i + 10).padStart(2, '0')}`,
        status: ['completed', 'processing', 'failed'][i % 3],
        fileUrl: i % 3 === 0 ? `/files/report_${i + 1}.xlsx` : undefined,
      }));

      const start = (params.pageNum - 1) * params.pageSize;
      const end = start + params.pageSize;
      const list = mockData.slice(start, end);

      resolve({ list, total: mockData.length });
    }, 500);
  });
}

