/**
 * 特殊告警策略类型定义
 */

// 电站树节点
export interface StationTreeNode {
  id: string;
  name: string;
  type: 'station' | 'device';
  children?: StationTreeNode[];
}

// 告警策略行（API返回的原始数据）
export interface AlarmStrategyRowRaw {
  id: string;
  policyStatus: string; // 0-停用 1-启用
  alarmName: string;
  deviceId: string;
  deviceName: string;
  alarmLevel: string; // 0-紧急 1-一般 2-严重
  deviceType: string;
  pointId: string;
  pointName: string;
  handlingSuggestion: string | null;
  creator: string;
  createTime: string;
}

// 告警策略行（页面使用的数据）
export interface AlarmStrategyRow {
  id: string;
  status: string; // 1-已启用 0-已停用
  alarmName: string;
  deviceName: string;
  alarmLevel: string; // 严重/警告/一般/提示
  deviceType: string;
  productName: string; // 暂时为空，接口未返回
  meteName: string;
  advice: string;
  createUser: string;
  createTime: string;
  _loading?: boolean; // 内部使用的loading状态
}

// 获取策略列表参数
export interface GetStrategyListParams {
  factoryId?: string; // 厂站id（可选）
  pageNum: number;
  pageSize: number;
  alarmLevel?: string; // 告警等级 0紧急 1一般 2严重
  policyStatus?: string; // 策略状态 0停用 1启用
  keywords?: string; // 关键字
}

// API响应格式
export interface GetStrategyListApiResponse {
  success: boolean;
  message: string;
  code: number;
  result: {
    total: number;
    data: AlarmStrategyRowRaw[];
  };
  timestamp: number;
}

// 列表响应（转换后的数据）
export interface GetStrategyListResponse {
  list: AlarmStrategyRow[];
  total: number;
}

// 添加/编辑策略请求参数
export interface StrategyFormData {
  id?: string; // 编辑时必填
  isEnabled?: string; // 策略状态
  alarmName: string; // 告警名称
  alarmLevel: string; // 告警等级
  factoryId?: string; // 场站ID
  unitId?: string; // 机组ID
  deviceId?: string; // 设备ID
  monitorId?: string; // 监控点ID
  ruleType?: number; // 表达式类型(1单数值2多数值3表达式)
  rule?: number; // 单数值符号
  ruleA?: number; // 双数值第一个符号
  ruleB?: number; // 双数值第二个符号
  numerical?: string; // 单数值的值
  numericalA?: string; // 双数值第一个的值
  numericalB?: string; // 双数值第二个的值
  isAlarmConf?: number; // 告警恢复不消失
  duration?: string; // 持续时间
  isScope?: string; // 影响范围
  categorize?: string; // 可能原因
  suggest?: string; // 处理建议
  snSerial?: string; // 设备序列号
  dataType?: string; // 数据类型
  address?: string; // 地址
}

// 策略详情响应
export interface StrategyDetailResponse {
  success: boolean;
  message: string;
  code: number;
  result: StrategyFormData;
  timestamp: number;
}

