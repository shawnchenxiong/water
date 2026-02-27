/**
 * 特殊告警策略 API
 */

import request from '@/utils/request';
import type {
  GetStrategyListParams,
  GetStrategyListResponse,
  GetStrategyListApiResponse,
  AlarmStrategyRow,
  AlarmStrategyRowRaw,
  StrategyFormData,
  StrategyDetailResponse,
} from '@/api/types/alarm/specialStrategy';

/**
 * 转换告警等级：API返回的数字转换为页面显示的文本
 */
function convertAlarmLevel(level: string): string {
  switch (level) {
    case '0':
      return '紧急';
    case '1':
      return '一般';
    case '2':
      return '严重';
    default:
      return level;
  }
}

/**
 * 转换API数据为页面使用的数据格式
 */
function convertApiDataToRow(raw: AlarmStrategyRowRaw): AlarmStrategyRow {
  return {
    id: raw.id,
    status: raw.policyStatus, // 0-停用 1-启用，直接使用
    alarmName: raw.alarmName,
    deviceName: raw.deviceName,
    alarmLevel: convertAlarmLevel(raw.alarmLevel),
    deviceType: raw.deviceType,
    productName: '', // 接口未返回，暂时为空
    meteName: raw.pointName,
    advice: raw.handlingSuggestion || '',
    createUser: raw.creator,
    createTime: raw.createTime,
  };
}

/**
 * 获取告警策略列表
 */
export async function getStrategyList(
  params: GetStrategyListParams
): Promise<GetStrategyListResponse> {
  const requestParams: any = {
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    ...(params.factoryId && { factoryId: params.factoryId }),
    ...(params.alarmLevel && { alarmLevel: params.alarmLevel }),
    ...(params.policyStatus && { policyStatus: params.policyStatus }),
    ...(params.keywords && { keywords: params.keywords }),
  };

  const response = await request.get<GetStrategyListApiResponse>(
    '/api/operation-logs/alarmPolicy',
    {
      params: requestParams,
    }
  );

  if (response.success && response.code === 200) {
    const list = (response.result?.data || []).map(convertApiDataToRow);
    return {
      list,
      total: response.result?.total || 0,
    };
  }

  throw new Error(response.message || '获取告警策略列表失败');
}

/**
 * 启用告警策略
 */
export async function enablePolicy(policyId: string): Promise<void> {
  const response = await request.get<any>('/api/operation-logs/enabled', {
    params: {
      policyId,
    },
  });

  if (!response.success || response.code !== 200) {
    throw new Error(response.message || '启用策略失败');
  }
}

/**
 * 停用告警策略
 */
export async function deactivatePolicy(policyId: string): Promise<void> {
  const response = await request.get<any>('/api/operation-logs/deactivated', {
    params: {
      policyId,
    },
  });

  if (!response.success || response.code !== 200) {
    throw new Error(response.message || '停用策略失败');
  }
}

/**
 * 添加策略
 */
export async function addStrategy(params: StrategyFormData): Promise<void> {
  const response = await request.post<any>('/api/operation-logs/addStrategy', params);

  if (!response.success || response.code !== 200) {
    throw new Error(response.message || '添加策略失败');
  }
}

/**
 * 编辑策略
 */
export async function editStrategy(policyId: string, params: StrategyFormData): Promise<void> {
  // 确保id字段存在
  const editParams = {
    ...params,
    id: params.id || policyId,
  };
  
  const response = await request.put<any>('/api/operation-logs/editStrategy', editParams);

  if (!response.success || response.code !== 200) {
    throw new Error(response.message || '编辑策略失败');
  }
}

/**
 * 获取策略详情（用于回显）
 */
export async function getStrategyDetail(policyId: string): Promise<StrategyFormData> {
  const response = await request.get<StrategyDetailResponse>('/api/operation-logs/getStrategy', {
    params: {
      policyId,
    },
  });

  if (response.success && response.code === 200) {
    return response.result;
  }

  throw new Error(response.message || '获取策略详情失败');
}

/**
 * 删除策略
 */
export async function deletePolicy(policyId: string): Promise<void> {
  const response = await request.delete<any>('/api/operation-logs/deletePolicy', {
    params: {
      policyId,
    },
  });

  if (!response.success || response.code !== 200) {
    throw new Error(response.message || '删除策略失败');
  }
}

// 级联下拉选项类型
export interface CascadeOption {
  value: string | number;
  name: string;
  [key: string]: any;
}

/**
 * 获取厂站下拉选项
 */
export async function getFactoryOptions(): Promise<CascadeOption[]> {
  const response = await request.get<any>('/api/operation-logs/factory');
  
  // jeecg-boot接口返回格式可能是 { success: true, result: [...] } 或 { code: 200, result: [...] }
  if ((response.success && response.code === 200) || response.code === 200 || response.code === 0) {
    return response.result || response.data || [];
  }
  
  throw new Error(response.message || '获取厂站列表失败');
}

/**
 * 获取机组下拉选项
 */
export async function getUnitOptions(factoryId: string | number): Promise<CascadeOption[]> {
  if (!factoryId) return [];
  
  const response = await request.get<any>('/api/operation-logs/unit', {
    params: { factoryId },
  });
  
  if ((response.success && response.code === 200) || response.code === 200 || response.code === 0) {
    return response.result || response.data || [];
  }
  
  throw new Error(response.message || '获取机组列表失败');
}

/**
 * 获取设备下拉选项
 */
export async function getDeviceOptions(unitId: string | number): Promise<CascadeOption[]> {
  if (!unitId) return [];
  
  const response = await request.get<any>('/api/operation-logs/device', {
    params: { unitId },
  });
  
  if ((response.success && response.code === 200) || response.code === 200 || response.code === 0) {
    return response.result || response.data || [];
  }
  
  throw new Error(response.message || '获取设备列表失败');
}

/**
 * 获取点位下拉选项
 */
export async function getMonitorOptions(deviceId: string | number): Promise<CascadeOption[]> {
  if (!deviceId) return [];
  
  const response = await request.get<any>('/api/operation-logs/monitor', {
    params: { deviceId },
  });
  
  if ((response.success && response.code === 200) || response.code === 200 || response.code === 0) {
    return response.result || response.data || [];
  }
  
  throw new Error(response.message || '获取点位列表失败');
}

