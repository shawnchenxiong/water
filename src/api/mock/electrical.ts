/**
 * 电气监视Mock数据
 */

import type { ApiResponse } from '@/types/api'

export interface GraphData {
  graphId: string
  graphName: string
  svgContent: string
  nodes: GraphNode[]
  lastUpdateTime: string
}

export interface GraphNode {
  id: string
  name: string
  type: 'inverter' | 'transformer' | 'switch' | 'meter'
  status: 'normal' | 'warning' | 'error' | 'offline'
  value?: number
  unit?: string
}

/**
 * 图形配置映射
 */
export const mockGraphConfigs: Record<string, Partial<GraphData>> = {
  'graph_wuhu_sewage': {
    graphName: '芜湖污水处理厂系统图',
    nodes: [
      { id: 'inv1', name: '逆变器1', type: 'inverter', status: 'normal', value: 2.5, unit: 'MW' },
      { id: 'inv2', name: '逆变器2', type: 'inverter', status: 'warning', value: 2.2, unit: 'MW' },
      { id: 'trans1', name: '变压器1', type: 'transformer', status: 'normal', value: 35, unit: 'kV' },
    ]
  },
  'graph_liuan_sewage': {
    graphName: '六安污水处理厂系统图',
    nodes: [
      { id: 'inv1', name: '逆变器1', type: 'inverter', status: 'error', value: 0, unit: 'MW' },
      { id: 'inv2', name: '逆变器2', type: 'inverter', status: 'normal', value: 1.8, unit: 'MW' },
      { id: 'switch1', name: '开关1', type: 'switch', status: 'offline' },
    ]
  },
  'graph_bozhou_sewage': {
    graphName: '亳州污水处理厂系统图',
    nodes: [
      { id: 'inv1', name: '逆变器1', type: 'inverter', status: 'normal', value: 3.2, unit: 'MW' },
      { id: 'meter1', name: '电能表1', type: 'meter', status: 'normal', value: 1250, unit: 'kWh' },
    ]
  },
  'graph_yueyang_sewage': {
    graphName: '岳阳污水处理厂系统图',
    nodes: [
      { id: 'inv1', name: '逆变器1', type: 'inverter', status: 'warning', value: 2.1, unit: 'MW' },
      { id: 'trans1', name: '变压器1', type: 'transformer', status: 'normal', value: 35, unit: 'kV' },
    ]
  },
  'graph_jiujiang_sewage': {
    graphName: '九江污水处理厂系统图',
    nodes: [
      { id: 'inv1', name: '逆变器1', type: 'inverter', status: 'normal', value: 2.8, unit: 'MW' },
      { id: 'inv2', name: '逆变器2', type: 'inverter', status: 'normal', value: 2.9, unit: 'MW' },
      { id: 'switch1', name: '开关1', type: 'switch', status: 'normal' },
      { id: 'meter1', name: '电能表1', type: 'meter', status: 'normal', value: 2150, unit: 'kWh' },
    ]
  }
}

/**
 * 图形节点ID映射
 */
export const mockGraphIdMapping: Record<string, string> = {
  'NE01': 'graph_wuhu_sewage',
  'NE02': 'graph_liuan_sewage', 
  'NW01': 'graph_bozhou_sewage',
  'SW01': 'graph_yueyang_sewage',
  'SE01': 'graph_jiujiang_sewage'
}

/**
 * 根据节点ID获取图形编号
 */
export function getGraphIdByNode(regionId: string): string | null {
  return mockGraphIdMapping[regionId] || 'graph_default_system'
}

/**
 * 获取Mock图形数据
 */
export async function getMockGraphData(graphNum: string): Promise<ApiResponse<GraphData | null>> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 从Mock数据获取图形配置
  const config = mockGraphConfigs[graphNum]
  
  if (!config) {
    return {
      success: true,
      code: 404,
      message: '未找到对应的系统图',
      data: null
    }
  }
  
  const mockData: GraphData = {
    graphId: graphNum,
    graphName: config.graphName || '系统图',
    svgContent: generateMockSVG(config.graphName || '系统图', config.nodes || []),
    nodes: config.nodes || [],
    lastUpdateTime: new Date().toLocaleString('zh-CN')
  }
  
  return {
    success: true,
    code: 200,
    message: 'success',
    data: mockData
  }
}

/**
 * 生成Mock SVG内容
 */
export function generateMockSVG(graphName: string, nodes: GraphNode[] = []): string {
  return `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <!-- 背景 -->
      <rect width="800" height="600" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      
      <!-- 标题 -->
      <text x="400" y="40" text-anchor="middle" fill="#00d4ff" font-size="24" font-weight="bold">
        ${graphName}
      </text>
      
      <!-- 逆变器组 -->
      <g transform="translate(100, 100)">
        <rect width="120" height="80" fill="#0f172a" stroke="${getNodeColor('inverter', 'normal')}" stroke-width="2" rx="8"/>
        <text x="60" y="30" text-anchor="middle" fill="#00d4ff" font-size="14">逆变器1</text>
        <text x="60" y="50" text-anchor="middle" fill="#10b981" font-size="12">2.5 MW</text>
        <text x="60" y="65" text-anchor="middle" fill="#10b981" font-size="10">正常运行</text>
      </g>
      
      <g transform="translate(300, 100)">
        <rect width="120" height="80" fill="#0f172a" stroke="${getNodeColor('inverter', 'warning')}" stroke-width="2" rx="8"/>
        <text x="60" y="30" text-anchor="middle" fill="#00d4ff" font-size="14">逆变器2</text>
        <text x="60" y="50" text-anchor="middle" fill="#f59e0b" font-size="12">2.2 MW</text>
        <text x="60" y="65" text-anchor="middle" fill="#f59e0b" font-size="10">功率偏低</text>
      </g>
      
      <!-- 变压器 -->
      <g transform="translate(200, 250)">
        <circle cx="60" cy="40" r="35" fill="#0f172a" stroke="#00d4ff" stroke-width="2"/>
        <text x="60" y="30" text-anchor="middle" fill="#00d4ff" font-size="12">变压器</text>
        <text x="60" y="45" text-anchor="middle" fill="#10b981" font-size="10">35 kV</text>
        <text x="60" y="58" text-anchor="middle" fill="#10b981" font-size="9">正常</text>
      </g>
      
      <!-- 连接线 -->
      <line x1="160" y1="180" x2="200" y2="250" stroke="#00d4ff" stroke-width="2"/>
      <line x1="360" y1="180" x2="320" y2="250" stroke="#00d4ff" stroke-width="2"/>
      <line x1="260" y1="320" x2="400" y2="400" stroke="#00d4ff" stroke-width="2"/>
      
      <!-- 输出 -->
      <g transform="translate(350, 400)">
        <rect width="100" height="60" fill="#0f172a" stroke="#10b981" stroke-width="2" rx="6"/>
        <text x="50" y="25" text-anchor="middle" fill="#00d4ff" font-size="12">并网点</text>
        <text x="50" y="40" text-anchor="middle" fill="#10b981" font-size="10">4.7 MW</text>
        <text x="50" y="52" text-anchor="middle" fill="#10b981" font-size="9">并网正常</text>
      </g>
      
      <!-- 更新时间 -->
      <text x="20" y="580" fill="#64748b" font-size="12">
        更新时间: ${new Date().toLocaleString('zh-CN')}
      </text>
    </svg>
  `
}

/**
 * 根据节点类型和状态获取颜色
 */
function getNodeColor(type: string, status: string): string {
  const colors = {
    normal: '#00d4ff',
    warning: '#f59e0b', 
    error: '#ef4444',
    offline: '#6b7280'
  }
  return colors[status as keyof typeof colors] || colors.normal
}
