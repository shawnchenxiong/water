import type { WeatherStationListItem, WeatherStationStats, WeatherStationDetailData, WeatherStationBasicInfo, AlarmItem } from '@/api/types/device/weatherStation';
import { generateWeatherStationList, calculateWeatherStationStats, generateWeatherStationDetail, generateBasicInfo, generateAlarmList, generateHistoryData } from '@/api/mock/weatherStation';

// 模拟数据缓存
let cachedStationList: WeatherStationListItem[] = [];

export const fetchWeatherStationList = async (params: {
  page: number;
  pageSize: number;
  status: string;
  keyword: string;
  stationId?: string;
}): Promise<{ list: WeatherStationListItem[]; total: number; stats: WeatherStationStats }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 每次请求都生成新的随机数据（5-10台气象站）
      const deviceCount = Math.floor(Math.random() * 6) + 5; // 5-10台
      const mockList = generateWeatherStationList(deviceCount, params.stationId);
      
      let filteredList = [...mockList];
      
      // 按状态筛选
      if (params.status && params.status !== 'all') {
        filteredList = filteredList.filter(item => item.status === params.status);
      }
      
      // 按关键字搜索
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        filteredList = filteredList.filter(item =>
          item.name.toLowerCase().includes(keyword) ||
          item.stationName.toLowerCase().includes(keyword)
        );
      }
      
      // 分页
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      const paginatedList = filteredList.slice(start, end);
      
      // 计算统计信息
      const stats = calculateWeatherStationStats(filteredList);
      
      resolve({
        list: paginatedList,
        total: filteredList.length,
        stats,
      });
    }, 300);
  });
};

export const fetchWeatherStationDetail = async (id: string): Promise<WeatherStationDetailData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateWeatherStationDetail(id));
    }, 500);
  });
};

export const fetchRealAlarmList = async (params: {
  deviceId: string;
  level?: string;
  status?: string;
  pageNum: number;
  pageSize: number;
}): Promise<{ list: AlarmItem[]; total: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fullList = generateAlarmList(3); // 生成3条实时告警
      const start = (params.pageNum - 1) * params.pageSize;
      const end = start + params.pageSize;
      const list = fullList.slice(start, end);
      resolve({ list, total: fullList.length });
    }, 500);
  });
};

export const fetchHistoryAlarmList = async (params: {
  deviceId: string;
  level?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  pageNum: number;
  pageSize: number;
}): Promise<{ list: AlarmItem[]; total: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fullList = generateAlarmList(10); // 生成10条历史告警
      const start = (params.pageNum - 1) * params.pageSize;
      const end = start + params.pageSize;
      const list = fullList.slice(start, end);
      resolve({ list, total: fullList.length });
    }, 500);
  });
};

export const fetchHistoryData = async (params: {
  deviceId: string;
  timeType: string;
  startTime?: string;
  endTime?: string;
  sampling: boolean;
  granularity: string;
  samplingType: string;
  parameters: string[];
}): Promise<{ timeData: string[]; series: Array<{ name: string; data: number[]; unit: string }> }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateHistoryData(params));
    }, 500);
  });
};

export const fetchBasicInfo = async (id: string): Promise<WeatherStationBasicInfo> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateBasicInfo(id));
    }, 500);
  });
};

