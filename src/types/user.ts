/**
 * 用户相关类型定义
 */

export interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
  roles: string[]
  permissions: string[]
  createTime: string
  updateTime: string
  orgCode?: string // 部门编码
  tenantId?: number // 租户ID
}

export interface LoginParams {
  username: string
  password: string
  rememberMe?: boolean
}

// 租户信息
export interface TenantInfo {
  id: number
  name: string
}

// 部门信息
export interface DepartInfo {
  id: string
  departName: string
  orgCode: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  userInfo: UserInfo
  expiresIn: number
  // 多租户相关字段
  tenantList?: TenantInfo[] // 租户列表
  multi_depart?: number // 0:无部门 1:一个部门 2:多个部门
  departs?: DepartInfo[] // 部门列表
}

