import type { InverterListParams, InverterListResponse, InverterDetail } from '@/api/types/device/inverter';
import { generateInverterList, generateInverterDetail, calculateStatistics } from '@/api/mock/inverter';

// 全局缓存的逆变器列表
let cachedInverterList = generateInverterList();

// 获取逆变器列表
export async function getInverterList(params: InverterListParams): Promise<InverterListResponse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 每次请求都生成新的随机数据（15-25台设备）
  const deviceCount = Math.floor(Math.random() * 11) + 15; // 15-25台
  const mockList = generateInverterList(deviceCount, params.stationId);
  
  let filteredList = [...mockList];
  
  // 按状态筛选
  if (params.status && params.status !== 'all') {
    filteredList = filteredList.filter(item => item.status === params.status);
  }
  
  // 按关键字搜索
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    filteredList = filteredList.filter(item => 
      item.deviceName.toLowerCase().includes(keyword) ||
      item.deviceCode.toLowerCase().includes(keyword) ||
      item.stationName.toLowerCase().includes(keyword)
    );
  }
  
  // 计算统计数据（基于筛选后的结果）
  const statistics = calculateStatistics(filteredList);
  
  // 分页
  const start = (params.pageNum - 1) * params.pageSize;
  const end = start + params.pageSize;
  const paginatedList = filteredList.slice(start, end);
  
  return {
    total: filteredList.length,
    list: paginatedList,
    statistics
  };
}

// 获取逆变器详情
export async function getInverterDetail(deviceId: string): Promise<InverterDetail | null> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const inverter = cachedInverterList.find(item => item.id === deviceId);
  if (!inverter) return null;
  
  return generateInverterDetail(inverter);
}

// 刷新数据（重新生成）
export function refreshInverterData(): void {
  cachedInverterList = generateInverterList();
}

