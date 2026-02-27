/**
 * 认证授权相关类型定义
 */

export interface TokenInfo {
  token: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

export type UserRole = 'admin' | 'operator' | 'viewer'

export interface Permission {
  id: string
  name: string
  code: string
  description?: string
}

