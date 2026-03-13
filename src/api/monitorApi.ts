/**
 * 工艺流程监控 API - 对接后端 getAllMonitorList 接口
 *
 * 后端地址：/api/operation-logs/getAllMonitorList
 * 返回结构：
 *   {
 *     success: true,
 *     code: 200,
 *     result: [
 *       {
 *         value: "160",                    // 一级节点ID
 *         label: "九江水厂",               // 一级菜单名称
 *         responsible: null,
 *         children: [
 *           {
 *             value: "126",                // 二级节点ID
 *             label: "中水回用TG100",       // 二级菜单名称
 *             responsible: null,
 *             children: [
 *               {
 *                 value: "1620",            // 三级节点ID
 *                 label: "中水回用TG100",   // 三级菜单名称
 *                 responsible: "1#",
 *                 children: [              // 四级(叶子节点) - 具体监控点
 *                   { value: "14923", label: "1号手自动", responsible: "1#", children: null },
 *                   { value: "14924", label: "缺水低液位", responsible: "1#", children: null },
 *                 ]
 *               }
 *             ]
 *           }
 *         ]
 *       }
 *     ]
 *   }
 *
 * 说明：
 *   - result 中的 label 对应工艺流程一级菜单
 *   - children 中的 label 对应工艺流程二级菜单
 *   - 更深层级的 children 对应具体监控点/设备
 */

import { request } from '@/utils/request'

// ==================== 类型定义 ====================

/** 后端返回的监控树节点 */
export interface MonitorTreeNode {
  /** 节点ID */
  value: string
  /** 节点名称（菜单显示名） */
  label: string
  /** 负责人标识 */
  responsible: string | null
  /** 子节点列表，null 表示叶子节点 */
  children: MonitorTreeNode[] | null
}

// jeecg-boot 标准响应格式: { success, message, code, result }
// 由 request.ts 拦截器统一处理，此处不需要单独定义类型

/** 转换后的菜单项，供前端菜单渲染使用 */
export interface ProcessMenuItem {
  /** 唯一ID，格式：es-monitor-{value} */
  id: string
  /** 菜单显示名称 */
  name: string
  /** 路由路径 */
  path?: string
  /** 子菜单 */
  children?: ProcessMenuItem[]
  /** 后端原始 value（节点ID） */
  monitorValue?: string
}

// ==================== 缓存管理 ====================

/** 缓存后端原始树形数据，避免重复请求 */
let cachedTreeData: { data: MonitorTreeNode[]; timestamp: number } | null = null
const CACHE_TTL = 60_000 // 60秒缓存，菜单结构变更不频繁

// ==================== API 方法 ====================

/**
 * 获取工艺流程监控列表（原始树形数据）
 * 直接返回后端 result 数组
 */
export async function getAllMonitorList(): Promise<MonitorTreeNode[]> {
  // 检查缓存
  if (cachedTreeData && Date.now() - cachedTreeData.timestamp < CACHE_TTL) {
    return cachedTreeData.data
  }

  try {
    const res = await request.get<any>('/api/operation-logs/getAllMonitorList')

    // 兼容多种响应结构
    let treeData: MonitorTreeNode[] = []

    if (Array.isArray(res)) {
      // 拦截器已经剥离了外层，直接得到 result 数组
      treeData = res
    } else if (res?.result && Array.isArray(res.result)) {
      treeData = res.result
    } else if (Array.isArray(res?.data)) {
      treeData = res.data
    }

    console.log('[monitorApi] getAllMonitorList 原始数据:', treeData)

    // 更新缓存
    cachedTreeData = { data: treeData, timestamp: Date.now() }

    return treeData
  } catch (error) {
    console.error('[monitorApi] 获取监控列表失败:', error)
    return []
  }
}

/**
 * 将后端树形数据转换为二期工艺流程菜单
 *
 * 转换规则：
 *   - result[].label → 一级菜单（如"九江水厂"）
 *   - result[].children[].label → 二级菜单（如"中水回用TG100"）
 *   - 二级菜单的子节点不再继续展开为菜单，而是作为工艺流程页的具体监控点
 *
 * 生成的路由路径格式：/es/monitor/process/{value}
 */
export function transformToMenuItems(treeData: MonitorTreeNode[]): ProcessMenuItem[] {
  if (!treeData || treeData.length === 0) return []

  const result: ProcessMenuItem[] = []

  for (const level1 of treeData) {
    // 一级菜单节点
    const menuItem: ProcessMenuItem = {
      id: `es-monitor-${level1.value}`,
      name: level1.label,
      monitorValue: level1.value,
    }

    // 如果有二级子节点，生成子菜单
    if (level1.children && level1.children.length > 0) {
      menuItem.children = level1.children.map(level2 => ({
        id: `es-monitor-${level1.value}-${level2.value}`,
        name: level2.label,
        // 路由指向二期工艺流程通用页面，携带 monitorId 参数
        path: `/es/monitor/process/${level2.value}`,
        monitorValue: level2.value,
      }))
    } else {
      // 没有子节点时，自身即为可点击的菜单项
      menuItem.path = `/es/monitor/process/${level1.value}`
    }

    result.push(menuItem)
  }

  return result
}

/**
 * 获取指定节点ID的完整子树数据
 * 用于工艺流程页面展示具体监控点列表
 *
 * @param nodeValue 节点的 value（ID）
 * @returns 匹配的节点及其完整子树，未找到返回 null
 */
export async function getMonitorNodeById(nodeValue: string): Promise<MonitorTreeNode | null> {
  const treeData = await getAllMonitorList()

  // 深度优先搜索匹配节点
  function findNode(nodes: MonitorTreeNode[]): MonitorTreeNode | null {
    for (const node of nodes) {
      if (node.value === nodeValue) {
        return node
      }
      if (node.children) {
        const found = findNode(node.children)
        if (found) return found
      }
    }
    return null
  }

  return findNode(treeData)
}

/**
 * 获取指定节点下所有叶子节点（具体监控点）
 * 递归展平所有没有 children 的节点
 *
 * @param node 要展开的节点
 * @returns 所有叶子节点列表
 */
export function getLeafNodes(node: MonitorTreeNode): MonitorTreeNode[] {
  const leaves: MonitorTreeNode[] = []

  function traverse(n: MonitorTreeNode) {
    if (!n.children || n.children.length === 0) {
      leaves.push(n)
    } else {
      for (const child of n.children) {
        traverse(child)
      }
    }
  }

  traverse(node)
  return leaves
}

/**
 * 清除缓存（用于需要强制刷新的场景）
 */
export function clearMonitorCache(): void {
  cachedTreeData = null
}
