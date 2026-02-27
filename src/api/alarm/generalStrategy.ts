/**
 * 通用告警策略 API
 */

import type {
  GetGeneralStrategyParams,
  GetGeneralStrategyResponse,
  GeneralStrategyRow,
} from '@/api/types/alarm/generalStrategy';

/**
 * 生成mock数据
 */
function generateMockData(): GeneralStrategyRow[] {
  const mockData: GeneralStrategyRow[] = [
    {
      deviceType: '0802',
      deviceTypeName: '门',
      meteId: '08020001001',
      meteName: '门状态',
      meteType: '08020001',
      meteKind: 0,
      meteKindName: '遥信',
      modelId: 'LHYR98NH00000003',
      modelName: '门',
      status: 0,
      statusName: '关闭',
      name: '',
      userName: '',
      updateTime: '',
      createTime: '',
      isConfig: false,
      hasFault: '0',
    },
    {
      deviceType: '0901',
      deviceTypeName: '温湿度',
      meteId: '09010001001',
      meteName: '温度',
      meteType: '09010001',
      meteKind: 1,
      meteKindName: '遥测',
      modelId: 'LHYR98NH00000005',
      modelName: '温湿度',
      status: 0,
      statusName: '关闭',
      name: '',
      userName: '',
      updateTime: '',
      createTime: '',
      isConfig: false,
      hasFault: '0',
    },
    {
      deviceType: '0904',
      deviceTypeName: 'SF6',
      meteId: '09040001001',
      meteName: 'O₂浓度',
      meteType: '09040001',
      meteKind: 1,
      meteKindName: '遥测',
      modelId: 'LHYR98NH00000008',
      modelName: 'SF6',
      status: 0,
      statusName: '关闭',
      name: '',
      userName: '',
      updateTime: '',
      createTime: '',
      isConfig: false,
      hasFault: '0',
    },
  ];
  
  return mockData;
}

/**
 * 获取通用告警策略列表
 */
export async function getGeneralStrategyList(
  params: GetGeneralStrategyParams
): Promise<GetGeneralStrategyResponse> {
  // TODO: 替换为实际API调用
  // return request.get('/auxsysAlarm/commonAlarm/getPageList', { params });

  return new Promise((resolve) => {
    setTimeout(() => {
      const data = generateMockData();
      const start = (params.pageNum - 1) * params.pageSize;
      const end = start + params.pageSize;
      
      resolve({
        list: data.slice(start, end),
        total: data.length,
      });
    }, 500);
  });
}

