/**
 * 输入离散率Mock数据
 */

import type {
  GetDispersionParams,
  DispersionSummary
} from '@/api/types/analysis/discreteInput'

/**
 * 离散率基线配置
 */
export const mockDispersionBase = [0.08, 0.18, 0.52, 0.18, 0.04] // 优/良/中/差/离线

/**
 * 字符串哈希函数
 */
export function hashString(str: string): number {
  let hash = 0
  if (str.length === 0) return hash
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * 基于种子的随机数生成器
 */
export function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 9999) * 10000
  return x - Math.floor(x)
}

/**
 * 生成Mock离散率全部数据
 */
export function generateMockDispersionAll(params: GetDispersionParams): DispersionSummary {
  // 稳定的轻微变化：基于 regionId/dateType/queryTime 的稳定随机
  const seedStr = `${params.regionId}|${params.dateType}|${params.queryTime}`
  const seed = hashString(seedStr)
  const rand = (i = 0) => seededRandom(seed, i)

  // 总数在 40..55 浮动
  const totalCount = 40 + Math.round(rand(1) * 15)

  // 五档比例基线 + 微调（归一化）
  const tweak = mockDispersionBase.map((_, i) => (rand(10 + i) - 0.5) * 0.06)
  let ratios = mockDispersionBase.map((v, i) => Math.max(0, v + tweak[i]))
  const sum = ratios.reduce((a, b) => a + b, 0)
  ratios = ratios.map((v) => v / sum)

  const counts = ratios.slice(0, 4).map((r) => Math.round(totalCount * r))
  const firstFour = counts.reduce((a, b) => a + b, 0)
  const offlineCount = Math.max(0, totalCount - firstFour)

  const excellentCount = counts[0]
  const goodCount = counts[1]
  const normalCount = counts[2]
  const poorCount = counts[3]

  const toPct = (n: number) => Number(((n / totalCount) * 100).toFixed(2))

  return {
    totalCount,
    excellentCount,
    excellentPercent: toPct(excellentCount),
    goodCount,
    goodPercent: toPct(goodCount),
    normalCount,
    normalPercent: toPct(normalCount),
    poorCount,
    poorPercent: toPct(poorCount),
    offlineCount,
    offlinePercent: toPct(offlineCount)
  }
}

/**
 * 生成Mock离散率分页数据
 */
export function generateMockDispersionPage(params: any) {
  const pageSize = params.pageSize || 10
  const pageNum = params.pageNum || 1
  const total = 45 // 与汇总数据保持一致
  
  // 基于参数生成稳定的数据
  const seedStr = `${params.regionId}|${params.dateType}|${params.queryTime}|${pageNum}`
  const seed = hashString(seedStr)
  const list = []
  
  // 生成设备数据
  for (let i = 0; i < Math.min(pageSize, total - (pageNum - 1) * pageSize); i++) {
    const deviceIndex = (pageNum - 1) * pageSize + i + 1
    const deviceRand = (j = 0) => seededRandom(seed + deviceIndex, j)
    
    // 生成离散率 (0-30%)
    const dispersionRate = Number((deviceRand(1) * 30).toFixed(2))
    
    // 根据离散率确定状态
    let status: 'excellent' | 'good' | 'normal' | 'poor' | 'offline'
    if (dispersionRate <= 2) status = 'excellent'
    else if (dispersionRate <= 5) status = 'good' 
    else if (dispersionRate <= 15) status = 'normal'
    else status = 'poor'
    
    // 生成5路组串数据
    const strings = []
    for (let j = 0; j < 5; j++) {
      strings.push({
        name: `组串${j + 1}`,
        value: Number((deviceRand(j + 10) * 25 + 5).toFixed(2)) // 5-30A
      })
    }
    
    list.push({
      deviceId: `INV-${deviceIndex.toString().padStart(3, '0')}`,
      deviceName: `逆变器#${deviceIndex}`,
      installedCapacity: Number((deviceRand(20) * 100 + 50).toFixed(2)), // 50-150kWp
      dispersionRate,
      strings,
      status
    })
  }

  const pages = Math.ceil(total / pageSize)
  
  return {
    total,
    pageNum,
    pageSize,
    pages,
    list
  }
}

