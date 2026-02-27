import type { ElectricMeterListParams, ElectricMeterListResponse, ElectricMeterDetail } from '@/api/types/device/electricMeter';
import { generateElectricMeterList, generateElectricMeterDetail, calculateStatistics } from '@/api/mock/electricMeter';

// 全局缓存的电能表列表
let cachedElectricMeterList = generateElectricMeterList();

// 获取电能表列表
export async function getElectricMeterList(params: ElectricMeterListParams): Promise<ElectricMeterListResponse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 每次请求都生成新的随机数据（10-20台设备）
  const deviceCount = Math.floor(Math.random() * 11) + 10; // 10-20台
  const mockList = generateElectricMeterList(deviceCount, params.stationId);
  
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
  
  // 按电表类型筛选
  if (params.meterType && params.meterType !== 'all') {
    filteredList = filteredList.filter(item => item.meterType === params.meterType);
  }
  
  // 计算统计数据
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

// 获取电能表详情
export async function getElectricMeterDetail(deviceId: string): Promise<ElectricMeterDetail | null> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const meter = cachedElectricMeterList.find(item => item.id === deviceId);
  if (!meter) return null;
  
  return generateElectricMeterDetail(meter);
}

// 刷新数据
export function refreshElectricMeterData(): void {
  cachedElectricMeterList = generateElectricMeterList();
}

