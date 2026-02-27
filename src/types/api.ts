// 通用API类型定义

// 分页参数
export interface PaginationParams {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  deviceType?: string;
}

// API响应基础结构
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

// 分页响应结构
export interface PaginatedResponse<T = any> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

// 通用错误响应
export interface ErrorResponse {
  code: number;
  message: string;
  details?: any;
}

