/**
 * 损失诊断API接口
 */

import request from '@/utils/request'
import type {
  LossDiagnosisData,
  LossDiagnosisQueryParams,
  LossDiagnosisExportRequest,
  LossDiagnosisExportResponse,
  WeatherData
} from '@/api/types/diagnosis/lossDiagnosis'

import {
  generateMockLossDiagnosisData,
  mockLossDiagnosisExport,
  generateMockWeatherData
} from '@/api/mock/lossDiagnosis'

const useMock = import.meta.env.MOCK !== 'false'

/**
 * 获取损失诊断数据
 */
export async function getLossDiagnosisData(
  params: LossDiagnosisQueryParams
): Promise<LossDiagnosisData> {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockLossDiagnosisData(params.stationId, params.month))
      }, 500)
    })
  }

  const response = await request.get('/api/intelligent-diagnosis/loss-diagnosis/data', {
    params
  })
  return response.data
}

/**
 * 获取天气数据
 */
export async function getWeatherData(
  stationId: string,
  startDate: string,
  endDate: string
): Promise<WeatherData[]> {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockWeatherData(stationId, startDate, endDate))
      }, 300)
    })
  }

  const response = await request.get('/api/intelligent-diagnosis/loss-diagnosis/weather', {
    params: { stationId, startDate, endDate }
  })
  return response.data.weatherData
}

/**
 * 导出损失诊断报告
 */
export async function exportLossDiagnosisReport(
  data: LossDiagnosisExportRequest
): Promise<LossDiagnosisExportResponse> {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...mockLossDiagnosisExport,
          fileName: `损失诊断报告-${data.month}.${data.exportType === 'excel' ? 'xlsx' : 'csv'}`
        })
      }, 1000)
    })
  }

  const response = await request.post('/api/intelligent-diagnosis/loss-diagnosis/export', data)
  return response.data
}

