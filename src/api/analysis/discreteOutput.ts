import request from '@/utils/request'
import type { GetDataParams, GetDataResponse } from '@/api/types/analysis/discreteOutput'
import { generateMockDiscreteOutputData } from '@/api/mock/discreteOutput'

/**
 * 获取逆变器输出离散率数据
 */
export async function getDiscreteOutputData(params: GetDataParams): Promise<GetDataResponse> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const mockData = generateMockDiscreteOutputData(params)
    return {
      code: 200,
      message: 'success',
      data: mockData
    }
  }

  const response = await request.get('/auxsysCensus/consistency/getDiscreteOutput', {
    params: {
      regionId: params.regionId,
      dateType: params.dateType,
      queryTime: params.queryTime,
      deviceType: '逆变器'
    }
  })
  
  return response.data
}