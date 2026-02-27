/**
 * 电气监视API接口
 */

import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import { 
  getMockGraphData as getElectricalMockData, 
  getGraphIdByNode 
} from '@/api/mock/electrical'

/**
 * 图形数据接口
 */
export interface GraphData {
  graphId: string
  graphName: string
  svgContent: string
  nodes: GraphNode[]
  lastUpdateTime: string
}

/**
 * 图形节点接口
 */
export interface GraphNode {
  id: string
  name: string
  type: 'inverter' | 'transformer' | 'switch' | 'meter'
  status: 'normal' | 'warning' | 'error' | 'offline'
  value?: number
  unit?: string
}

/**
 * 获取系统图数据
 * @param graphNum 图形编号
 * @returns 图形数据
 */
export async function getGraphData(graphNum: string): Promise<ApiResponse<GraphData | null>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getElectricalMockData(graphNum)
  }
  
  // 调用真实API
  return request.get(`/api/monitor/electrical/graph/${graphNum}`)
}

/**
 * 根据节点生成图形编号
 * @param node 节点信息
 * @returns 图形编号
 */
export function generateGraphNumByNode(node: any): string | null {
  // 只有叶子节点（没有children的节点）才有图形
  if (node.children && node.children.length > 0) {
    return null
  }
  
  // 使用Mock数据中的映射
  return getGraphIdByNode(node.regionId)
}


