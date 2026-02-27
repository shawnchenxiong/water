/**
 * 告警屏蔽 API
 */

import type {
  GetShieldListParams,
  GetShieldListResponse,
  AlarmShieldRow,
} from '@/api/types/alarm/shield';

/**
 * 生成mock数据
 */
function generateMockData(avoidType: string): AlarmShieldRow[] {
  const baseData: AlarmShieldRow[] = [];
  
  for (let i = 1; i <= 20; i++) {
    const item: AlarmShieldRow = {
      id: 236000000000000 + i,
      avoidStartTime: '2024-10-15',
      avoidEndTime: '2025-10-31',
      isClearRealAlarm: '1',
      avoidType,
      userId: 302,
      userName: 'admin',
      createTime: '2024-10-15 10:00:00',
      updateTime: '2024-10-15 10:00:00',
      reasonClearRealAlarm: avoidType === '1' 
        ? 'Regional maintenance in progress' 
        : avoidType === '2' 
        ? 'Device upgrade in progress' 
        : 'Data collection debugging',
      remark: `Shield No.${i}`,
      avoidWeekTime: '[[...]]',
      regionId: 'LHYR98NH00000001',
      stationPath: 'Smart O&M Platform/Anhui Province/Test Station',
      stationName: `Test Station ${i}`,
    };

    if (avoidType === '2') {
      item.deviceId = `09190234551399813${i}`;
      item.deviceName = `Inverter Device ${i}`;
      item.deviceModelId = `LHYR98NH0000031${i}`;
      item.deviceModelName = 'Model A';
    } else if (avoidType === '3') {
      item.deviceId = `09190234551399813${i}`;
      item.deviceName = `Controller Device ${i}`;
      item.meteId = `METE${i}`;
      item.meteName = `Monitoring Metric ${i}`;
    }

    baseData.push(item);
  }
  
  return baseData;
}

/**
 * 获取告警屏蔽列表
 */
export async function getShieldList(
  params: GetShieldListParams
): Promise<GetShieldListResponse> {
  // TODO: 替换为实际API调用
  // return request.get('/auxsysAlarm/alarmAvoid/getPageList', { params });

  return new Promise((resolve) => {
    setTimeout(() => {
      const data = generateMockData(params.avoidType);
      const start = (params.pageNum - 1) * params.pageSize;
      const end = start + params.pageSize;
      
      resolve({
        list: data.slice(start, end),
        total: data.length,
      });
    }, 500);
  });
}

