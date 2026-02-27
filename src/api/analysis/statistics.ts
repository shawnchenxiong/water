import request from '@/utils/request'
import type { 
  ReportQueryParams, 
  ReportResponse, 
  PowerStationRow, 
  InverterRow, 
  EmissionRow,
  StationOption
} from '@/api/types/analysis/statistics'
import {
  generateMockPowerStationData,
  generateMockInverterData,
  generateMockEmissionData,
  getMockReportResponse
} from '@/api/mock/statistics'


// 获取电站列表
export async function getStationList(): Promise<StationOption[]> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { value: '1001', label: '东方光伏电站' },
          { value: '1002', label: '西区新能源电站' },
          { value: '1003', label: '南山风光互补电站' },
          { value: '1004', label: '北部综合能源站' }
        ])
      }, 300)
    })
  }
  
  const response = await request.get('/auxsysAlarm/alarm/getRegionDevice', {
    params: { showPosition: 0 }
  })
  
  if (response.data.code === 200 && response.data.data) {
    return response.data.data.map((item: any) => ({
      value: item.regionId,
      label: item.regionName
    }))
  }
  return []
}


// 获取电站运行报表
export async function getPowerStationReport(
  params: ReportQueryParams
): Promise<ReportResponse<PowerStationRow>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = generateMockPowerStationData(params)
        resolve(getMockReportResponse(mockData, params))
      }, 500)
    })
  }
  
  const response = await request.get('/auxsysCensus/report/powerStation', {
    params
  })
  return response.data
}

// 生成逆变器报表模拟数据

// 获取逆变器报表
export async function getInverterReport(
  params: ReportQueryParams
): Promise<ReportResponse<InverterRow>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = generateMockInverterData(params)
        resolve(getMockReportResponse(mockData, params))
      }, 500)
    })
  }
  
  const response = await request.get('/auxsysCensus/report/interval', {
    params
  })
  return response.data
}

// 获取控制器报表
export async function getControllerReport(
  params: ReportQueryParams
): Promise<ReportResponse<any>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: 'success',
          data: [],
          total: 0,
          current: 1,
          pageSize: 20,
          pages: 0
        })
      }, 500)
    })
  }
  
  const response = await request.get('/auxsysCensus/report/controller', {
    params
  })
  return response.data
}

// 获取电能表报表
export async function getEnergyMeterReport(
  params: ReportQueryParams
): Promise<ReportResponse<any>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: 'success',
          data: [],
          total: 0,
          current: 1,
          pageSize: 20,
          pages: 0
        })
      }, 500)
    })
  }
  
  const response = await request.get('/auxsysCensus/report/energyMeter', {
    params
  })
  return response.data
}

// 生成节能减排报表模拟数据

// 获取节能减排报表
export async function getEmissionReport(
  params: ReportQueryParams
): Promise<ReportResponse<EmissionRow>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = generateMockEmissionData(params)
        resolve(getMockReportResponse(mockData, params))
      }, 500)
    })
  }
  
  const response = await request.get('/auxsysCensus/report/selectEmissionReduction', {
    params
  })
  return response.data
}

