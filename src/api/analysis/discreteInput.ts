import request from '@/utils/request'
import type {
  GetDispersionParams,
  GetDispersionPageParams,
  GetDispersionAllResponse,
  GetDispersionPageResponse
} from '@/api/types/analysis/discreteInput'
import { 
  generateMockDispersionAll, 
  generateMockDispersionPage 
} from '@/api/mock/discreteInput'

export async function getDispersionAll(params: GetDispersionParams): Promise<GetDispersionAllResponse> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      code: 200,
      message: 'success',
      data: generateMockDispersionAll(params)
    }
  }
  
  const response = await request.get('/auxsysCensus/consistency/getDispersionAll', { params })
  return response.data
}

export async function getDispersionPage(params: GetDispersionPageParams): Promise<GetDispersionPageResponse> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    await new Promise(resolve => setTimeout(resolve, 300))
    const mockData = generateMockDispersionPage(params)
    return {
      code: 200,
      message: 'success',
      data: mockData
    }
  }
  
  const response = await request.get('/auxsysCensus/consistency/getDispersionPage', { params })
  return response.data
}