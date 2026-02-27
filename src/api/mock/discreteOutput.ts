/**
 * 输出离散率Mock数据
 */

import type { GetDataParams, DeviceDetail } from '@/api/types/analysis/discreteOutput'

/**
 * 输出离散率基线配置
 */
export const mockOutputBaseRatios = [0.06, 0.14, 0.60, 0.14, 0.06]

/**
 * 字符串哈希函数
 */
export function hashString(str: string): number {
  let hash = 0
  if (str.length === 0) return hash
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
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
 * 生成Mock输出离散率数据
 */
export function generateMockDiscreteOutputData(params: GetDataParams) {
  const seedStr = `${params.dateType}|${params.queryTime}|${params.regionId}`
  const seed = hashString(seedStr)

  const rand = (i = 0) => seededRandom(seed, i)

  // 总数在 40 ± 6 范围内浮动
  const total = 40 + Math.round(rand(1) * 12) // 40..52

  // 五档占比的基线，并做微调，最终归一
  const tweaks = mockOutputBaseRatios.map((_, i) => (rand(10 + i) - 0.5) * 0.06) // 每档 ±3%
  let ratios = mockOutputBaseRatios.map((v, i) => Math.max(0, v + tweaks[i]))
  const sum = ratios.reduce((a, b) => a + b, 0)
  ratios = ratios.map((v) => v / sum)

  // 计算各档数量，最后一档用剩余量兜底，确保求和为 total
  const counts = ratios.slice(0, 4).map((r) => Math.round(total * r))
  const firstFour = counts.reduce((a, b) => a + b, 0)
  const last = Math.max(0, total - firstFour)

  const n_20 = counts[0]
  const n_20_n_10 = counts[1] 
  const n_10_p_10 = counts[2]
  const p_10_p_20 = counts[3]
  const p_20 = last

  const toPct = (n: number) => ((n / total) * 100).toFixed(2) + '%'

  // 生成设备详情数据
  const inverterCapacity: DeviceDetail[] = []
  for (let i = 0; i < total; i++) {
    const installedCapacity = 50 + rand(20 + i) * 50 // 50-100 kWp
    const inverterPower = installedCapacity * (0.8 + rand(30 + i) * 0.4) * 24 // 发电量
    const eqe = inverterPower / installedCapacity // 等价发电时
    const avgEqe = 5 + rand(40 + i) * 3 // 平均等价发电时 5-8h
    const differenceEqe = eqe - avgEqe
    const ratioEqe = (differenceEqe / avgEqe) * 100
    
    inverterCapacity.push({
      deviceId: `INV-${params.regionId}-${String(i + 1).padStart(3, '0')}`,
      deviceName: `逆变器#${i + 1}`,
      deviceType: '逆变器',
      regionId: params.regionId,
      installedCapacity: installedCapacity.toFixed(2),
      inverterPower: inverterPower.toFixed(2),
      eqe: parseFloat(eqe.toFixed(2)),
      avgEqe: parseFloat(avgEqe.toFixed(2)),
      differenceEqe: parseFloat(differenceEqe.toFixed(2)),
      ratioEqe: parseFloat(ratioEqe.toFixed(2)),
      ratioEqePrecent: ratioEqe.toFixed(2) + '%',
      nodeName: '测试电站'
    })
  }

  return {
    n_20,
    n_20_n_10,
    n_10_p_10, 
    p_10_p_20,
    p_20,
    total,
    inverterCapacity
  }
}
