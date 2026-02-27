// 通用API类型定义
interface PaginationParams {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  deviceType?: string;
}

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 实时数据类型定义 - 基于API响应字段完整定义
export interface RealtimeDataItem {
  // API核心字段
  deviceType: string; // 设备类型，如"0915"
  deviceId: string; // 设备ID，如"20230926105025_N0002"
  deviceName: string; // 设备名称，如"BJ-N0002"
  nodeName: string; // 节点名称/电站名称
  status: 'online' | 'offline' | 'alarm'; // 设备状态
  
  // 功率数据
  realPower: number; // 实时功率(kW)
  generation: string; // 发电量字符串格式
  
  // 发电量统计
  dailyGeneration?: number; // 日发电量(kWh) - 可能在其他接口获取
  generationMonth: number; // 月发电量(kWh)
  generationYear: number; // 年发电量(kWh)
  generationTotal: number; // 累计发电量(kWh)
  
  // 等效时间
  equivalence: number; // 等效时间(h)
  
  // 设备信息
  capacity: number; // 装机容量(kW)
  updateTime: string; // 更新时间
  
  // 区域和组织信息
  regionId: string; // 区域ID
  branch: string; // 支路信息
  
  // 告警信息
  alarmName: string; // 告警名称
  
  // 其他扩展信息（可能为null）
  meteInfos: any; // 电表信息
  inverterGl: any; // 逆变器相关
  pvInfo: any; // 光伏信息
  meteIdList: any; // 电表ID列表
  powerNormalization: any; // 功率标准化
  
  // 时间序列数据
  timeList: string[];
  
  // UI显示字段（用于表格显示）
  stationName?: string; // 所属电站（显示用）
  realtimePower?: number; // 实时功率（显示用，映射自realPower）
  monthlyGeneration?: number; // 月发电量（显示用，映射自generationMonth）
  yearlyGeneration?: number; // 年发电量（显示用，映射自generationYear）
  totalGeneration?: number; // 累计发电量（显示用，映射自generationTotal）
  dailyEquivalentHours?: number; // 日等效时（显示用，映射自equivalence）
  powerCurve?: string; // 功率曲线
  lastUpdateTime?: string; // 最后更新时间（显示用，映射自updateTime）
  location?: string; // 位置信息
  efficiency?: number; // 效率
}

export interface RealtimeStatistics {
  offline: number;
  total: number;
  alarm: number;
  online: number;
  listSize: number;
}

export interface RealtimeDataResponse {
  statistics: RealtimeStatistics;
  deviceAlarmMete: RealtimeDataItem[];
}

// 模拟实时数据 - 基于API响应格式
export const mockRealtimeData: RealtimeDataResponse = {
  statistics: {
    offline: 1,
    total: 334,
    alarm: 0,
    online: 333,
    listSize: 334
  },
  deviceAlarmMete: [
    {
      // API核心字段
      deviceType: "0915",
      deviceId: "20231019120000_BJ-N0001",
      deviceName: "BJ-N0001",
      nodeName: "亳州利辛县经开区污水厂", 
      status: "online" as const,
      
      // 功率数据
      realPower: 15.3,
      generation: "3.3",
      
      // 发电量统计
      dailyGeneration: 42.1,
      generationMonth: 1265.0,
      generationYear: 15208.0,
      generationTotal: 91248.0,
      
      // 等效时间
      equivalence: 4.25,
      
      // 设备信息
      capacity: 1000,
      updateTime: "2025-10-19 12:00:00",
      
      // 区域和组织信息
      regionId: "NE01",
      branch: "A路",
      
      // 告警信息
      alarmName: "",
      
      // 其他扩展信息
      meteInfos: null,
      inverterGl: null,
      pvInfo: null,
      meteIdList: null,
      powerNormalization: null,
      
      // 时间序列数据
      timeList: generateTimeList(),
      
      // UI显示字段
      stationName: "亳州利辛县经开区污水厂",
      realtimePower: 15.3,
      monthlyGeneration: 1265.0,
      yearlyGeneration: 15208.0,
      totalGeneration: 91248.0,
      dailyEquivalentHours: 4.25,
      powerCurve: '查看',
      lastUpdateTime: "2025-10-19 12:00:00",
      location: "安徽省亳州市",
      efficiency: 95.6
    },
    {
      // API核心字段
      deviceType: "0915",
      deviceId: "20230926105025_BJ-N0002",
      deviceName: "BJ-N0002",
      nodeName: "六安凤凰桥一期污水厂",
      status: "online" as const,
      
      // 功率数据
      realPower: 12.8,
      generation: "2.8",
      
      // 发电量统计
      dailyGeneration: 35.0,
      generationMonth: 5796.0,
      generationYear: 76114.0,
      generationTotal: 286227.0,
      
      // 等效时间
      equivalence: 77.9,
      
      // 设备信息 
      capacity: 1050,
      updateTime: "2023-09-26 10:50:36",
      
      // 区域和组织信息
      regionId: "NE01",
      branch: "",
      
      // 告警信息
      alarmName: "",
      
      // 其他扩展信息
      meteInfos: null,
      inverterGl: null,
      pvInfo: null,
      meteIdList: null,
      powerNormalization: null,
      
      // 时间序列数据
      timeList: generateTimeList(),
      
      // UI显示字段
      stationName: "六安凤凰桥一期污水厂",
      realtimePower: 12.8,
      monthlyGeneration: 5796.0,
      yearlyGeneration: 76114.0,
      totalGeneration: 286227.0,
      dailyEquivalentHours: 77.9,
      powerCurve: '查看',
      lastUpdateTime: "2023-09-26 10:50:36",
      location: "安徽省六安市",
      efficiency: 93.2
    }
  ]
};

// 生成时间列表
function generateTimeList(): string[] {
  const timeList: string[] = [];
  const startTime = new Date('2025-10-19 00:00:00');
  
  for (let i = 0; i < 288; i++) { // 24小时 * 12个5分钟间隔
    const time = new Date(startTime.getTime() + i * 5 * 60 * 1000);
    timeList.push(time.toISOString().replace('T', ' ').substring(0, 19));
  }
  
  return timeList;
}

// 生成更多模拟数据 - 基于API响应结构
function generateMockData(count: number): RealtimeDataItem[] {
  const stations = [
    "亳州利辛县经开区污水厂", "六安凤凰桥一期污水厂", "芜湖城南污水厂",
    "君山区第一污水处理厂", "临湘污水处理厂", "九江鹤问湖污水厂",
    "繁昌城南污水厂", "六安城北一期污水厂", "临港污水处理厂",
    "芜湖大龙湾污水厂", "六安东部新城污水厂", "湖滨水质净化厂"
  ];
  
  const locations = [
    "安徽省亳州市", "安徽省六安市", "安徽省芜湖市",
    "湖南省岳阳市", "江西省九江市"
  ];
  
  const regionIds = ['NE01', 'NE02', 'NW01', 'SW01', 'SE01'];
  const alarmNames = ['', '高温告警', '通讯异常', '功率异常', ''];
  const branches = ['', 'A路', 'B路', 'C路', ''];
  
  const statusOptions: Array<'online' | 'offline' | 'alarm'> = ['online', 'online', 'online', 'online', 'alarm', 'offline'];
  
  const result: RealtimeDataItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const stationIndex = i % stations.length;
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    const isOffline = status === 'offline';
    
    // 生成设备名称（类似源站的BJ-N0101格式）
    const deviceCode = `${['BJ', 'CD', 'WH', 'YY', 'JJ'][Math.floor(i / 10) % 5]}-N${String(i + 1).padStart(4, '0')}`;
    const stationName = stations[stationIndex] + (i > stations.length - 1 ? ` ${Math.floor(i / stations.length) + 1}号机组` : '');
    
    // 生成时间戳格式的设备ID（类似API响应）
    const timestamp = new Date(Date.now() - Math.random() * 365 * 24 * 3600 * 1000).toISOString().replace(/[-:T]/g, '').substring(0, 14);
    const deviceId = `${timestamp}_${deviceCode}`;
    
    // 计算发电量数据
    const dailyGen = isOffline ? 0 : parseFloat((Math.random() * 50 + 10).toFixed(1));
    const monthlyGen = isOffline ? 0 : parseFloat((dailyGen * (25 + Math.random() * 5)).toFixed(1));
    const yearlyGen = isOffline ? 0 : parseFloat((monthlyGen * (11 + Math.random() * 2)).toFixed(1));
    const totalGen = isOffline ? 0 : parseFloat((yearlyGen * (3 + Math.random() * 7)).toFixed(1));
    const realPowerValue = isOffline ? 0 : parseFloat((Math.random() * 50 + 5).toFixed(1));
    const equivalenceValue = isOffline ? 0 : parseFloat((Math.random() * 8 + 2).toFixed(2));
    const capacityValue = parseFloat((Math.random() * 1000 + 500).toFixed(0));
    
    const currentTime = new Date(Date.now() - Math.random() * 3600000);
    const updateTimeStr = currentTime.toISOString().replace('T', ' ').substring(0, 19);
    
    result.push({
      // API核心字段
      deviceType: "0915",
      deviceId: deviceId,
      deviceName: deviceCode,
      nodeName: stationName,
      status,
      
      // 功率数据
      realPower: realPowerValue,
      generation: (Math.random() * 4 + 1).toFixed(1),
      
      // 发电量统计（API字段）
      dailyGeneration: dailyGen,
      generationMonth: monthlyGen,
      generationYear: yearlyGen, 
      generationTotal: totalGen,
      
      // 等效时间
      equivalence: equivalenceValue,
      
      // 设备信息
      capacity: capacityValue,
      updateTime: updateTimeStr,
      
      // 区域和组织信息
      regionId: regionIds[i % regionIds.length],
      branch: branches[i % branches.length],
      
      // 告警信息
      alarmName: status === 'alarm' ? alarmNames[1 + Math.floor(Math.random() * 3)] : '',
      
      // 其他扩展信息
      meteInfos: null,
      inverterGl: null,
      pvInfo: null,
      meteIdList: null,
      powerNormalization: null,
      
      // 时间序列数据
      timeList: generateTimeList(),
      
      // UI显示字段（映射自API字段）
      stationName: stationName,
      realtimePower: realPowerValue,
      monthlyGeneration: monthlyGen,
      yearlyGeneration: yearlyGen,
      totalGeneration: totalGen,
      dailyEquivalentHours: equivalenceValue,
      powerCurve: isOffline ? '-' : '查看',
      lastUpdateTime: updateTimeStr,
      location: locations[Math.floor(Math.random() * locations.length)],
      efficiency: isOffline ? 0 : Math.floor(Math.random() * 20 + 80)
    });
  }
  
  return result;
}

// 获取实时数据（分页）
export async function getRealtimeData(params?: PaginationParams): Promise<ApiResponse<{
  list: RealtimeDataItem[];
  total: number;
  statistics: RealtimeStatistics;
}>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockRealtimeData(params)
  }
  
  // TODO: 实现真实API调用
  // return request.get('/api/realtime/data', { params })
  throw new Error('真实API未实现')
}

/**
 * Mock数据处理函数
 */
async function getMockRealtimeData(params?: PaginationParams): Promise<ApiResponse<{
  list: RealtimeDataItem[];
  total: number;
  statistics: RealtimeStatistics;
}>> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const { pageNum = 1, pageSize = 20, status, keyword, deviceType } = params || {};
  
  // 生成大量模拟数据
  let allData = generateMockData(334);
  
  // 筛选数据
  if (status && status !== 'all') {
    allData = allData.filter(item => item.status === status);
  }
  
  if (keyword) {
    allData = allData.filter(item => 
      item.nodeName.includes(keyword) || 
      item.deviceId?.includes(keyword) ||
      item.location?.includes(keyword)
    );
  }
  
  if (deviceType) {
    allData = allData.filter(item => item.deviceType === deviceType);
  }
  
  // 分页
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const list = allData.slice(startIndex, endIndex);
  
  // 统计数据
  const statistics: RealtimeStatistics = {
    total: allData.length,
    online: allData.filter(item => item.status === 'online').length,
    offline: allData.filter(item => item.status === 'offline').length,
    alarm: allData.filter(item => item.status === 'alarm').length,
    listSize: allData.length
  };
  
  return {
    code: 200,
    message: 'ok',
    data: {
      list,
      total: allData.length,
      statistics
    }
  };
}

// 获取单个设备详情
export async function getDeviceDetail(deviceId: string): Promise<ApiResponse<RealtimeDataItem>> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockDeviceDetail(deviceId)
  }
  
  // TODO: 实现真实API调用
  // return request.get(`/api/devices/${deviceId}`)
  throw new Error('真实API未实现')
}

/**
 * Mock设备详情数据处理函数
 */
async function getMockDeviceDetail(deviceId: string): Promise<ApiResponse<RealtimeDataItem>> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const allData = generateMockData(334);
  const device = allData.find(item => item.deviceId === deviceId);
  
  if (!device) {
    return {
      code: 404,
      message: '设备未找到',
      data: null as any
    };
  }
  
  return {
    code: 200,
    message: 'ok',
    data: device
  };
}

// 刷新实时数据
export function refreshRealtimeData(): void {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    console.log('刷新实时数据...');
    return
  }
  
  // TODO: 实现真实刷新逻辑
  // 调用真实API清除缓存
}

// 导出数据
export async function exportRealtimeData(params?: {
  status?: string;
  keyword?: string;
  deviceType?: string;
}): Promise<Blob> {
  // 检查是否使用Mock数据
  if (import.meta.env.MOCK !== 'false') {
    return getMockExportRealtimeData(params)
  }
  
  // TODO: 实现真实API调用
  // return request.get('/api/realtime/export', { params, responseType: 'blob' })
  throw new Error('真实API未实现')
}

/**
 * Mock导出数据处理函数
 */
async function getMockExportRealtimeData(params?: {
  status?: string;
  keyword?: string;
  deviceType?: string;
}): Promise<Blob> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟导出功能，返回CSV格式的Blob数据
  const { status, keyword, deviceType } = params || {};
  let allData = generateMockData(334);
  
  // 应用筛选条件
  if (status && status !== 'all') {
    allData = allData.filter(item => item.status === status);
  }
  
  if (keyword) {
    allData = allData.filter(item => 
      item.nodeName.includes(keyword) || 
      item.deviceId?.includes(keyword) ||
      item.location?.includes(keyword)
    );
  }
  
  if (deviceType) {
    allData = allData.filter(item => item.deviceType === deviceType);
  }
  
  // 生成CSV内容
  const headers = ['设备ID', '设备名称', '设备类型', '状态', '发电量', '位置', '装机容量', '效率', '最后更新时间'];
  const csvContent = [
    headers.join(','),
    ...allData.map(item => [
      item.deviceId,
      item.nodeName,
      item.deviceType,
      item.status === 'online' ? '在线' : item.status === 'offline' ? '离线' : '告警',
      item.generation,
      item.location,
      item.capacity,
      item.efficiency + '%',
      item.lastUpdateTime
    ].join(','))
  ].join('\n');
  
  // 添加BOM以支持中文
  const BOM = '\uFEFF';
  return new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
}
