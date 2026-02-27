/**
 * 通用告警策略类型定义
 */

// 通用告警策略行
export interface GeneralStrategyRow {
  deviceType: string;
  deviceTypeName: string;
  meteId: string;
  meteName: string;
  meteType: string;
  meteKind: number; // 0-遥信 1-遥测
  meteKindName: string;
  modelId: string;
  modelName: string;
  status: number; // 0-关闭 1-开启
  statusName: string;
  name: string; // 告警名称
  userName: string;
  updateTime: string;
  createTime: string;
  isConfig: boolean;
  hasFault: string;
}

// 获取策略列表参数
export interface GetGeneralStrategyParams {
  status?: string;
  deviceType?: string;
  meteKind?: string;
  modelId?: string;
  meteName?: string;
  pageNum: number;
  pageSize: number;
}

// 列表响应
export interface GetGeneralStrategyResponse {
  list: GeneralStrategyRow[];
  total: number;
}

