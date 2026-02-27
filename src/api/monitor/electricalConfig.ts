/**
 * 组态设计API接口
 */

import { request } from '@/utils/request'

export interface ElectricalConfig {
  id?: number
  name: string
  remark?: string
  deviceId?: string
  isForScreen?: number
  createTime?: string
  updateTime?: string
  createBy?: string
  updateBy?: string
  tenantId?: string
}

export interface ConfigListParams {
  pageNo?: number
  pageSize?: number
  name?: string
  remark?: string
  factoryId?: number
}

export interface ConfigListResponse {
  success: boolean
  message: string
  code: number
  result: {
    data: ElectricalConfig[]  // 实际接口返回的是 data 字段
    total: number
    size?: number
    current?: number
    pages?: number
  }
}

/**
 * 获取组态设计列表
 */
export async function getConfigList(params: ConfigListParams): Promise<ConfigListResponse> {
  return request.get<ConfigListResponse>('/configuration/device/list', { params })
}

/**
 * 获取组态设计详情
 */
export async function getConfigDetail(id: number) {
  return request.get(`/configuration/device/${id}`)
}

/**
 * 新增组态设计
 */
export async function addConfig(data: Partial<ElectricalConfig>) {
  return request.post('/configuration/device', data)
}

/**
 * 修改组态设计
 */
export async function updateConfig(data: Partial<ElectricalConfig>) {
  return request.put('/configuration/device', data)
}

/**
 * 删除组态设计
 */
export async function deleteConfig(id: number) {
  return request.delete(`/configuration/device/${id}`)
}

/**
 * 导出组态设计
 */
export async function exportConfig(id: number) {
  return request.get(`/configuration/device/export/${id}`, {
    responseType: 'blob'
  })
}

/**
 * 获取导入URL
 */
export function getImportUrl(): string {
  return import.meta.env.VITE_APP_BASE_URL + '/configuration/device/importTxtUrl'
}

/**
 * 获取设计器URL
 */
export function getDesignUrl(deviceId: number): string {
  const token = localStorage.getItem('token')
  const tenantId = localStorage.getItem('tenantId') || '1'
  return `${import.meta.env.VITE_APP_RCSCADA_API}/editor?deviceId=${deviceId}&tt=${token}&tenantId=${tenantId}`
}

/**
 * 获取预览URL
 */
export function getPreviewUrl(deviceId: number): string {
  const token = localStorage.getItem('token')
  const tenantId = localStorage.getItem('tenantId') || '1'
  return `${import.meta.env.VITE_APP_RCSCADA_API}/preview?deviceId=${deviceId}&tt=${token}&tenantId=${tenantId}`
}

