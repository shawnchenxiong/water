/**
 * 工艺流程相关API
 *
 * 对接后端接口: /api/operation-logs/getAllMonitorList
 * 保留本地 mock 数据作为降级方案
 */

import { request } from '@/utils/request'
import type { ProcessData, WaterQualityData, FlowData, DeviceStatus } from '@/api/types/water-treatment'
import { generateProcessData } from '@/utils/waterTreatmentMockData'

/** 是否使用 mock 数据 */
const isMock = import.meta.env.VITE_MOCK === 'true'

/** 工艺段 ID → 中文名称映射 */
const processNames: Record<string, string> = {
  'pre-treatment': '预处理',
  'stage1-aao': 'I段AAO',
  'secondary-clarifier': '二沉池及出水',
  'sludge-dewatering': '污泥脱水',
  'high-eff-sedimentation': '高效沉淀池',
  'denitrification-filter': '反硝化深床滤池',
  'dosing-system': '加药系统',
  'stage2-aao': 'II段AAO',
  'blower-room': '鼓风机房'
}

/** 所有工艺段 ID 列表 */
const processIds = Object.keys(processNames)

// ==================== 后端数据适配 ====================

/**
 * 后端监控点数据项（根据实际接口调整）
 */
interface MonitorItem {
  id?: string
  name?: string
  monitorName?: string
  monitorCode?: string
  value?: number | string
  unit?: string
  status?: string | number
  deviceName?: string
  deviceCode?: string
  deviceType?: string
  processName?: string
  processCode?: string
  // 兼容更多可能的字段名
  [key: string]: any
}

/**
 * 将后端 getAllMonitorList 返回的数据转换为前端 ProcessData 格式
 *
 * 注意：首次对接时请查看控制台日志确认实际数据结构，
 * 然后根据实际字段名调整此函数的映射逻辑
 */
function transformMonitorData(rawList: MonitorItem[]): ProcessData[] {
  // 按工艺段分组
  const groupedByProcess = new Map<string, MonitorItem[]>()

  for (const item of rawList) {
    // 尝试多种字段名获取工艺段标识
    const processKey = item.processCode || item.processName || item.process || 'unknown'
    if (!groupedByProcess.has(processKey)) {
      groupedByProcess.set(processKey, [])
    }
    groupedByProcess.get(processKey)!.push(item)
  }

  const result: ProcessData[] = []

  for (const [processKey, items] of groupedByProcess) {
    // 匹配到前端工艺段 ID
    const matchedProcessId = matchProcessId(processKey)
    const processName = processNames[matchedProcessId] || processKey

    // 提取水质指标
    const waterQuality = extractWaterQuality(items)
    // 提取流量数据
    const flow = extractFlowData(items)
    // 提取设备状态
    const devices = extractDevices(items)

    result.push({
      processId: matchedProcessId,
      processName,
      waterQuality: waterQuality || undefined,
      flow: flow || undefined,
      devices: devices,
      timestamp: new Date().toISOString()
    })
  }

  return result
}

/**
 * 将后端工艺段标识匹配到前端 processId
 */
function matchProcessId(key: string): string {
  const lower = key.toLowerCase()

  // 中文名称匹配
  const nameMap: Record<string, string> = {
    '预处理': 'pre-treatment',
    '段aao': 'stage1-aao',
    'i段': 'stage1-aao',
    'ii段': 'stage2-aao',
    '二沉池': 'secondary-clarifier',
    '污泥脱水': 'sludge-dewatering',
    '高效沉淀': 'high-eff-sedimentation',
    '反硝化': 'denitrification-filter',
    '深床滤池': 'denitrification-filter',
    '加药': 'dosing-system',
    '鼓风机': 'blower-room',
  }

  for (const [keyword, id] of Object.entries(nameMap)) {
    if (key.includes(keyword)) return id
  }

  // 英文 code 匹配
  const codeMap: Record<string, string> = {
    'pre-treatment': 'pre-treatment',
    'pretreatment': 'pre-treatment',
    'stage1': 'stage1-aao',
    'stage2': 'stage2-aao',
    'aao1': 'stage1-aao',
    'aao2': 'stage2-aao',
    'secondary': 'secondary-clarifier',
    'sludge': 'sludge-dewatering',
    'sedimentation': 'high-eff-sedimentation',
    'denitrification': 'denitrification-filter',
    'dosing': 'dosing-system',
    'blower': 'blower-room',
  }

  for (const [keyword, id] of Object.entries(codeMap)) {
    if (lower.includes(keyword)) return id
  }

  return key
}

/** 从监控项中提取水质数据 */
function extractWaterQuality(items: MonitorItem[]): WaterQualityData | null {
  const wq: Partial<WaterQualityData> = {}
  let hasData = false

  const fieldMap: Record<string, keyof WaterQualityData> = {
    'cod': 'cod', 'COD': 'cod',
    'nh3n': 'nh3n', 'nh3-n': 'nh3n', 'NH3-N': 'nh3n', '氨氮': 'nh3n',
    'tn': 'tn', 'TN': 'tn', '总氮': 'tn',
    'tp': 'tp', 'TP': 'tp', '总磷': 'tp',
    'ss': 'ss', 'SS': 'ss', '悬浮物': 'ss',
    'ph': 'ph', 'PH': 'ph', 'pH': 'ph',
    'do': 'do', 'DO': 'do', '溶解氧': 'do',
    'turbidity': 'turbidity', '浊度': 'turbidity',
    'temperature': 'temperature', '温度': 'temperature',
    'mlss': 'mlss', 'MLSS': 'mlss',
    'orp': 'orp', 'ORP': 'orp',
  }

  for (const item of items) {
    const name = item.monitorName || item.name || ''
    const code = item.monitorCode || item.code || ''

    for (const [keyword, field] of Object.entries(fieldMap)) {
      if (name.includes(keyword) || code.includes(keyword)) {
        const val = parseFloat(String(item.value))
        if (!isNaN(val)) {
          ;(wq as any)[field] = val
          hasData = true
        }
        break
      }
    }
  }

  if (!hasData) return null

  // 填充默认值，确保必填字段存在
  return {
    cod: wq.cod ?? 0,
    nh3n: wq.nh3n ?? 0,
    tn: wq.tn ?? 0,
    tp: wq.tp ?? 0,
    ss: wq.ss ?? 0,
    ph: wq.ph ?? 7.0,
    do: wq.do ?? 0,
    turbidity: wq.turbidity ?? 0,
    temperature: wq.temperature ?? 20,
    mlss: wq.mlss,
    orp: wq.orp,
  }
}

/** 从监控项中提取流量数据 */
function extractFlowData(items: MonitorItem[]): FlowData | null {
  const flow: Partial<FlowData> = {}
  let hasData = false

  for (const item of items) {
    const name = item.monitorName || item.name || ''
    const code = item.monitorCode || item.code || ''
    const combined = name + code

    const val = parseFloat(String(item.value))
    if (isNaN(val)) continue

    if (combined.includes('进水') || combined.includes('inflow')) {
      flow.inflowRate = val; hasData = true
    } else if (combined.includes('出水') || combined.includes('outflow')) {
      flow.outflowRate = val; hasData = true
    } else if (combined.includes('回流') || combined.includes('return')) {
      flow.returnFlowRate = val; hasData = true
    } else if (combined.includes('污泥') || combined.includes('sludge')) {
      flow.sludgeFlowRate = val; hasData = true
    }
  }

  if (!hasData) return null

  return {
    inflowRate: flow.inflowRate ?? 0,
    outflowRate: flow.outflowRate ?? 0,
    returnFlowRate: flow.returnFlowRate,
    sludgeFlowRate: flow.sludgeFlowRate,
  }
}

/** 从监控项中提取设备状态 */
function extractDevices(items: MonitorItem[]): DeviceStatus[] {
  const devices: DeviceStatus[] = []

  for (const item of items) {
    if (!item.deviceName && !item.deviceCode) continue

    // 避免重复添加同一设备
    const deviceId = item.deviceCode || item.deviceId || item.id || ''
    if (devices.some(d => d.deviceId === deviceId)) continue

    const statusVal = item.status
    let status: DeviceStatus['status'] = 'stopped'
    if (statusVal === 'running' || statusVal === 1 || statusVal === '1' || statusVal === '运行') {
      status = 'running'
    } else if (statusVal === 'fault' || statusVal === 2 || statusVal === '2' || statusVal === '故障') {
      status = 'fault'
    } else if (statusVal === 'maintenance' || statusVal === 3 || statusVal === '3' || statusVal === '维护') {
      status = 'maintenance'
    }

    devices.push({
      deviceId,
      deviceName: item.deviceName || '',
      deviceType: item.deviceType || 'unknown',
      status,
      frequency: parseFloat(String(item.frequency)) || undefined,
      current: parseFloat(String(item.current)) || undefined,
      power: parseFloat(String(item.power)) || undefined,
      temperature: parseFloat(String(item.temperature)) || undefined,
      pressure: parseFloat(String(item.pressure)) || undefined,
      flowRate: parseFloat(String(item.flowRate)) || undefined,
      runningHours: parseFloat(String(item.runningHours)) || undefined,
    })
  }

  return devices
}

// ==================== 生成 mock 数据 ====================

function getMockProcessData(processId: string): ProcessData {
  const processName = processNames[processId] || '未知工艺段'
  return generateProcessData(processId, processName)
}

function getMockAllProcessData(): ProcessData[] {
  return processIds.map(id => generateProcessData(id, processNames[id]))
}

// ==================== 导出 API ====================

/**
 * 获取工艺段实时数据
 * @param processId 工艺段ID
 */
export async function getProcessData(processId: string): Promise<{ code: number; message: string; data: ProcessData }> {
  // Mock 模式
  if (isMock) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return { code: 200, message: 'success', data: getMockProcessData(processId) }
  }

  // 真实 API 模式：调用 getAllMonitorList 后按 processId 过滤
  try {
    const allData = await fetchAllMonitorData()
    const matched = allData.find(d => d.processId === processId)
    if (matched) {
      return { code: 200, message: 'success', data: matched }
    }
    // 未匹配到对应工艺段，降级使用 mock
    console.warn(`[processApi] 后端数据中未找到工艺段 "${processId}"，使用 mock 数据`)
    return { code: 200, message: 'success', data: getMockProcessData(processId) }
  } catch (error) {
    console.error('[processApi] 获取真实数据失败，降级使用 mock:', error)
    return { code: 200, message: 'success', data: getMockProcessData(processId) }
  }
}

/**
 * 获取所有工艺段数据
 */
export async function getAllProcessData(): Promise<{ code: number; message: string; data: ProcessData[] }> {
  // Mock 模式
  if (isMock) {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { code: 200, message: 'success', data: getMockAllProcessData() }
  }

  // 真实 API 模式
  try {
    const allData = await fetchAllMonitorData()
    // 如果后端返回的数据不足，用 mock 补齐缺失的工艺段
    const result = processIds.map(id => {
      const found = allData.find(d => d.processId === id)
      return found || getMockProcessData(id)
    })
    return { code: 200, message: 'success', data: result }
  } catch (error) {
    console.error('[processApi] 获取真实数据失败，降级使用 mock:', error)
    return { code: 200, message: 'success', data: getMockAllProcessData() }
  }
}

// ==================== 内部方法 ====================

/** 缓存：避免短时间内重复请求 */
let cachedData: { data: ProcessData[]; timestamp: number } | null = null
const CACHE_TTL = 10_000 // 10秒缓存

/**
 * 调用后端 getAllMonitorList 接口并转换数据
 */
async function fetchAllMonitorData(): Promise<ProcessData[]> {
  // 检查缓存
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data
  }

  const res = await request.get<any>('/api/operation-logs/getAllMonitorList')

  // jeecg-boot 响应格式: { success, code, message, result }
  // request.ts 拦截器已经处理过，返回的是 data 层
  // 但需要兼容不同的返回结构
  let rawList: MonitorItem[] = []

  if (Array.isArray(res)) {
    rawList = res
  } else if (res?.result && Array.isArray(res.result)) {
    rawList = res.result
  } else if (res?.result?.records && Array.isArray(res.result.records)) {
    rawList = res.result.records
  } else if (res?.data && Array.isArray(res.data)) {
    rawList = res.data
  }

  // 首次对接：打印原始数据帮助调试
  console.log('[processApi] getAllMonitorList 原始响应:', res)
  console.log('[processApi] 解析到监控数据条数:', rawList.length)

  if (rawList.length === 0) {
    console.warn('[processApi] 后端返回数据为空，请检查接口或登录状态')
    throw new Error('后端返回数据为空')
  }

  const transformed = transformMonitorData(rawList)
  console.log('[processApi] 转换后的工艺段数据:', transformed)

  // 更新缓存
  cachedData = { data: transformed, timestamp: Date.now() }

  return transformed
}
