/**
 * 自定义报表相关类型定义
 */

// 模板
export interface ReportTemplate {
  id: string;
  templateName: string;
  templateType: string; // 对比报表/统计报表
  createTime: string;
  creator: string;
}

// 任务
export interface ReportTask {
  id: string;
  taskName: string;
  createTime: string;
  dataTimeRange: string;
  status: string; // completed/processing/failed
  fileUrl?: string;
}

// 设备树节点
export interface DeviceTreeNode {
  id: string;
  name: string;
  type: 'region' | 'station' | 'device';
  children?: DeviceTreeNode[];
}

// 指标树节点
export interface IndicatorTreeNode {
  id: string;
  name: string;
  children?: IndicatorTreeNode[];
}

// 查询模板列表参数
export interface GetTemplateListParams {
  templateType?: string;
  stationName?: string;
  pageNum: number;
  pageSize: number;
}

// 查询模板列表响应
export interface GetTemplateListResponse {
  list: ReportTemplate[];
  total: number;
}

// 查询任务列表参数
export interface GetTaskListParams {
  taskName?: string;
  status?: string;
  pageNum: number;
  pageSize: number;
}

// 查询任务列表响应
export interface GetTaskListResponse {
  list: ReportTask[];
  total: number;
}

