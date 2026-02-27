import type {
  GetStringDiagnosisListParams,
  GetStringDiagnosisListResponse,
  StringDiagnosisRecord,
  StringDiagnosisStatistics,
  StringStatusCode,
  BatchOperationRequest,
  BatchOperationResponse,
  ExecuteDiagnosisRequest,
  ExecuteDiagnosisResponse,
  DiagnosisProgressResponse,
  DataCompareRequest,
  DataCompareResponse,
  CompareParamsResponse,
  CapacityConfigRequest,
  CapacityConfigResponse,
  ParamGroup,
  DataCompareResult,
  CompareSeriesData
} from '@/api/types/diagnosis/stringDiagnosis'

/**
 * 组串状态配置
 */
const STRING_STATUS_CONFIG = {
  'normal_not_connected': { name: '正常未接入', color: '#67C23A' },
  'branch_disconnect': { name: '支路断配', color: '#F56C6C' },
  'not_enabled_no_data': { name: '未启用支路数据未上报', color: '#909399' },
  'pending_verification': { name: '待重新核定', color: '#E6A23C' },
  'enabled_normal': { name: '已启用正常', color: '#409EFF' },
  'not_enabled': { name: '未启用', color: '#C0C4CC' }
}

/**
 * 设备名称生成配置
 */
const DEVICE_PREFIXES = ['INV', 'SUN', 'PWR', 'SMA', 'ABB', 'HUA', 'GW', 'SAJ']
const DEVICE_MODELS = ['2000', '3000', '5000', '8000', '10K', '15K', '20K', '25K', '30K', '50K']
const DEVICE_SUFFIXES = ['H', 'L', 'T', 'S', 'M', 'X', 'P', 'E']

/**
 * 生成Mock组串诊断记录
 */
const generateMockStringDiagnosisRecord = (index: number, stationId: string, stationName: string): StringDiagnosisRecord => {
  const deviceIndex = Math.floor(index / 20) + 1
  const stringIndex = (index % 20) + 1
  
  // 生成更多样化的设备名称
  const prefixIndex = Math.floor(index / 120) % DEVICE_PREFIXES.length
  const modelIndex = (deviceIndex - 1) % DEVICE_MODELS.length
  const suffixIndex = index % DEVICE_SUFFIXES.length
  const deviceNum = deviceIndex.toString().padStart(2, '0')
  
  const deviceName = `${DEVICE_PREFIXES[prefixIndex]}${DEVICE_MODELS[modelIndex]}-${deviceNum}${DEVICE_SUFFIXES[suffixIndex]}`
  
  // 随机选择状态
  const statusCodes: StringStatusCode[] = [
    'normal_not_connected', 'branch_disconnect', 
    'not_enabled_no_data', 'pending_verification',
    'enabled_normal', 'not_enabled'
  ]
  const checkStatusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)]
  const statusConfig = STRING_STATUS_CONFIG[checkStatusCode]
  
  // 根据状态确定其他属性
  const isEnabled = ['enabled_normal'].includes(checkStatusCode)
  const currentValue = checkStatusCode === 'branch_disconnect' ? 0 : 
                      Math.random() * 12 + 1 // 1-13A 随机电流
  
  return {
    id: `string_${stationId}_${deviceIndex}_${stringIndex}`,
    stationName,
    stationId,
    deviceName,
    deviceId: `device_${stationId}_${deviceIndex}`,
    stringName: `组串${stringIndex}`,
    stringIndex,
    currentValue: Number(currentValue.toFixed(2)),
    currentUnit: 'A',
    configStatus: isEnabled ? '已启用' : '未启用',
    configStatusCode: isEnabled ? 'enabled' : 'disabled',
    checkStatus: statusConfig.name,
    checkStatusCode,
    statusColor: statusConfig.color,
    lastCheckTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    remarks: Math.random() > 0.7 ? `备注信息${index}` : '',
    isEnabled,
    canEnable: !isEnabled && checkStatusCode !== 'branch_disconnect',
    canDisable: isEnabled,
    hasDataComparison: isEnabled,
    hasCapacityConfig: true
  }
}

/**
 * 生成Mock统计数据
 */
const generateMockStatistics = (stationId: string, stationName: string): StringDiagnosisStatistics => {
  return {
    stationId,
    stationName,
    deviceStatistics: {
      totalDevices: 48,
      onlineDevices: 46,
      offlineDevices: 0,
      unavailableDevices: 2
    },
    stringStatistics: {
      normalNotConnected: 148,
      branchDisconnect: 299,
      notEnabledNoData: 50,
      pendingVerification: 3,
      totalStrings: 960,
      enabledStrings: 460,
      disabledStrings: 500
    },
    lastUpdateTime: new Date().toISOString()
  }
}

/**
 * 获取Mock组串诊断列表响应
 */
export const getMockStringDiagnosisListResponse = (params: GetStringDiagnosisListParams): GetStringDiagnosisListResponse => {
  const { stationId, page = 1, pageSize = 100, enableStatus, checkStatus, deviceName } = params
  
  // 生成总数据
  const totalRecords = 960
  const stationName = '芜湖城南污水厂'
  
  // 生成所有记录
  const allRecords: StringDiagnosisRecord[] = []
  for (let i = 0; i < totalRecords; i++) {
    allRecords.push(generateMockStringDiagnosisRecord(i, stationId, stationName))
  }
  
  // 应用筛选
  let filteredRecords = [...allRecords]
  
  if (enableStatus && enableStatus !== 'all') {
    filteredRecords = filteredRecords.filter(record => {
      if (enableStatus === 'enabled') return record.isEnabled
      if (enableStatus === 'disabled') return !record.isEnabled
      return true
    })
  }
  
  if (checkStatus && checkStatus !== 'all') {
    filteredRecords = filteredRecords.filter(record => 
      record.checkStatusCode === checkStatus
    )
  }
  
  if (deviceName) {
    filteredRecords = filteredRecords.filter(record => 
      record.deviceName.toLowerCase().includes(deviceName.toLowerCase())
    )
  }
  
  // 应用分页
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex)
  
  return {
    success: true,
    code: 200,
    message: '查询成功',
    data: {
      list: paginatedRecords,
      statistics: generateMockStatistics(stationId, stationName),
      pagination: {
        current: page,
        pageSize,
        total: filteredRecords.length,
        totalPages: Math.ceil(filteredRecords.length / pageSize)
      }
    }
  }
}

/**
 * 获取Mock批量操作响应
 */
export const getMockBatchOperationResponse = (request: BatchOperationRequest): BatchOperationResponse => {
  const { stringIds, operation } = request
  
  const results = stringIds.map((stringId, index) => ({
    stringId,
    success: Math.random() > 0.1, // 90%成功率
    message: Math.random() > 0.1 ? `${operation}操作成功` : `${operation}操作失败：设备离线`
  }))
  
  const successCount = results.filter(r => r.success).length
  const failedCount = results.length - successCount
  
  return {
    success: true,
    code: 200,
    message: `批量${operation}操作完成`,
    data: {
      successCount,
      failedCount,
      results
    }
  }
}

/**
 * 获取Mock执行诊断响应
 */
export const getMockExecuteDiagnosisResponse = (request: ExecuteDiagnosisRequest): ExecuteDiagnosisResponse => {
  const { stringIds, diagnosisType } = request
  
  // 计算诊断数量
  const totalCount = stringIds ? stringIds.length : 960
  
  // 根据诊断类型估算时间
  const timePerString = diagnosisType === 'quick' ? 2 : diagnosisType === 'full' ? 5 : 3
  const estimatedTime = totalCount * timePerString
  
  return {
    success: true,
    code: 200,
    message: '诊断任务已启动',
    data: {
      taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      totalCount,
      estimatedTime
    }
  }
}

/**
 * 生成当前正在处理的设备名称
 */
const generateCurrentDeviceName = (completedCount: number): string => {
  const deviceIndex = Math.floor(completedCount / 20) + 1
  const stringIndex = (completedCount % 20) + 1
  
  const prefixIndex = Math.floor(completedCount / 120) % DEVICE_PREFIXES.length
  const modelIndex = (deviceIndex - 1) % DEVICE_MODELS.length
  const suffixIndex = completedCount % DEVICE_SUFFIXES.length
  const deviceNum = deviceIndex.toString().padStart(2, '0')
  
  const deviceName = `${DEVICE_PREFIXES[prefixIndex]}${DEVICE_MODELS[modelIndex]}-${deviceNum}${DEVICE_SUFFIXES[suffixIndex]}`
  return `${deviceName}_组串${stringIndex}`
}

/**
 * 获取Mock诊断进度响应
 */
export const getMockDiagnosisProgressResponse = (taskId: string): DiagnosisProgressResponse => {
  // 模拟进度状态
  const progress = Math.min(100, Math.floor(Math.random() * 120))
  const totalCount = 960
  const completedCount = Math.floor((progress / 100) * totalCount)
  const status = progress >= 100 ? 'completed' : progress > 0 ? 'running' : 'pending'
  
  return {
    success: true,
    code: 200,
    message: '获取进度成功',
    data: {
      taskId,
      status,
      progress,
      completedCount,
      totalCount,
      currentString: status === 'running' ? generateCurrentDeviceName(completedCount) : undefined,
      startTime: new Date(Date.now() - 30000).toISOString(),
      estimatedEndTime: status === 'running' ? new Date(Date.now() + 60000).toISOString() : undefined
    }
  }
}

/**
 * 生成Mock时间轴数据（24小时，每20分钟一个点）
 */
const generateTimeAxis = (): string[] => {
  const timeAxis: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 20) {  // 每20分钟一个数据点，更符合原图
      timeAxis.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    }
  }
  return timeAxis
}

/**
 * 生成Mock数据系列（模拟光伏组串电流特征）
 */
const generateMockDataSeries = (timeLength: number, paramNames: string[]): CompareSeriesData[] => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#9C27B0', '#00BCD4']
  
  return paramNames.map((name, index) => {
    const data: number[] = []
    
    // 为每个组串设置固定的特征参数（避免随机性导致的异常）
    const stringConfigs = [
      { peak: 750, efficiency: 1.0, noise: 10, name: 'PV组流_1' },
      { peak: 740, efficiency: 0.98, noise: 12, name: 'PV组流_2' },
      { peak: 760, efficiency: 1.02, noise: 8, name: 'PV组流_3' },
      { peak: 730, efficiency: 0.96, noise: 15, name: 'PV组流_4' },
      { peak: 745, efficiency: 0.99, noise: 11, name: 'PV组流_5' }
    ]
    
    // 获取当前组串配置，如果超出预定义范围则使用默认值
    const config = stringConfigs[index] || { peak: 720, efficiency: 0.95, noise: 10, name: name }
    const { peak: peakCurrent, efficiency, noise: noiseLevel } = config
    
    console.log(`生成 ${name} 数据: peak=${peakCurrent}A, efficiency=${efficiency}, noise=${noiseLevel}A`)
    
    for (let i = 0; i < timeLength; i++) {
      const hour = (i * 24) / timeLength  // 将索引转换为小时
      let currentValue = 0
      
      if (hour >= 6 && hour <= 18) {
        // 白天时段（日出日落间）
        const dayProgress = (hour - 6) / 12  // 0-1
        
        // 使用正弦函数模拟日照强度曲线（钟形曲线）
        const solarIntensity = Math.sin(dayProgress * Math.PI)
        
        // 早晚的缓慢变化，中午的高峰
        currentValue = peakCurrent * solarIntensity * efficiency
        
        // 添加一些稳定的波动（使用组串索引作为种子）
        const seedValue = (index + 1) * 1000 + i // 使用组串索引和时间索引作为种子
        const pseudoRandom = Math.sin(seedValue) * 0.5 + 0.5 // 0-1之间的伪随机数
        const scatterNoise = (pseudoRandom - 0.5) * noiseLevel * solarIntensity
        currentValue += scatterNoise
        
        // 模拟云层遮挡（用稳定的周期性函数模拟）
        const cloudCycle = Math.sin((i + index * 10) * 0.1) // 云层周期
        if (cloudCycle > 0.8) {  // 在特定时间点出现云层影响
          const cloudEffect = 0.1 + (cloudCycle - 0.8) * 0.5  // 10%-40%的减少
          currentValue *= (1 - cloudEffect)
        }
        
        // 中午时段的微小升高
        if (hour >= 11 && hour <= 14) {
          currentValue *= 1.05  // 中午略微提升
        }
      } else {
        // 夜间时段，电流接近0（使用固定的微小值）
        const nightNoise = Math.sin((i + index * 5) * 0.05) * 2 // 0-2A的微小噪声
        currentValue = Math.abs(nightNoise)
      }
      
      // 早晚过渡时段的平滑处理
      if (hour >= 5.5 && hour <= 6.5) {
        // 日出时段的渐进
        const sunriseProgress = (hour - 5.5) / 1
        const transitionValue = currentValue * sunriseProgress
        currentValue = transitionValue
      } else if (hour >= 17.5 && hour <= 18.5) {
        // 日落时段的渐出
        const sunsetProgress = 1 - (hour - 17.5) / 1
        const transitionValue = currentValue * sunsetProgress
        currentValue = transitionValue
      }
      
      // 确保数值不为负
      currentValue = Math.max(0, currentValue)
      
      data.push(Number(currentValue.toFixed(2)))
    }
    
    return {
      name,
      data,
      color: colors[index % colors.length],
      yAxisIndex: 0 // 所有PV组流电流数据都使用左侧Y轴（电流轴）
    }
  })
}

/**
 * 获取Mock数据对比响应
 */
export const getMockDataCompareResponse = (request: DataCompareRequest): DataCompareResponse => {
  console.log('Mock API called with request:', request)
  const { compareDate, selectedParams } = request
  
  const timeAxis = generateTimeAxis()
  const series = generateMockDataSeries(timeAxis.length, selectedParams)
  
  // 计算数据的实际范围
  const allValues = series.flatMap(s => s.data)
  const maxValue = Math.max(...allValues)
  const minValue = Math.min(...allValues)
  
  console.log('Data range:', { minValue, maxValue, seriesCount: series.length })
  
  const compareResult: DataCompareResult = {
    date: compareDate,
    timeAxis,
    series,
    yAxis: [
      { 
        name: '电流 (A)', 
        min: 0, 
        max: Math.max(1000, Math.ceil(maxValue * 1.1))  // 动态计算最大值，留有10%余量
      },
      { name: '功率 (kW)', min: 0, max: 10 }
    ]
  }
  
  console.log('Mock data generated:', { 
    timeAxisLength: timeAxis.length, 
    seriesCount: series.length,
    compareResult 
  })
  
  return {
    success: true,
    code: 200,
    message: '数据对比成功',
    data: {
      compareResult
    }
  }
}

/**
 * 获取Mock对比参数响应
 */
export const getMockCompareParamsResponse = (deviceId: string): CompareParamsResponse => {
  const paramGroups: ParamGroup[] = [
    {
      groupName: '当日发电量',
      params: [
        { name: '当日发电量(kWh)', unit: 'kWh', checked: false },
        { name: 'PV组流_1 (A)', unit: 'A', checked: true },
        { name: 'PV组流_2 (A)', unit: 'A', checked: true },
        { name: 'PV组流_3 (A)', unit: 'A', checked: true },
        { name: 'PV组流_4 (A)', unit: 'A', checked: true },
        { name: 'PV组流_5 (A)', unit: 'A', checked: true },
        { name: 'PV组流_6 (A)', unit: 'A', checked: false },
        { name: 'PV组流_7 (A)', unit: 'A', checked: false },
        { name: 'PV组流_8 (A)', unit: 'A', checked: false },
        { name: 'PV组流_9 (A)', unit: 'A', checked: false },
        { name: 'PV组流_10 (A)', unit: 'A', checked: false },
        { name: 'PV组流_11 (A)', unit: 'A', checked: false },
        { name: 'PV组流_12 (A)', unit: 'A', checked: false },
        { name: 'PV组流_13 (A)', unit: 'A', checked: false },
        { name: 'PV组流_14 (A)', unit: 'A', checked: false },
        { name: 'PV组流_15 (A)', unit: 'A', checked: false },
        { name: 'PV组流_16 (A)', unit: 'A', checked: false },
        { name: 'PV组流_17 (A)', unit: 'A', checked: false },
        { name: 'PV组流_18 (A)', unit: 'A', checked: false },
        { name: 'PV组流_19 (A)', unit: 'A', checked: false },
        { name: 'PV组流_20 (A)', unit: 'A', checked: false }
      ]
    },
    {
      groupName: '总有功功率',
      params: [
        { name: 'PV功率_1 (W)', unit: 'W', checked: false },
        { name: 'PV功率_2 (W)', unit: 'W', checked: false },
        { name: 'PV功率_3 (W)', unit: 'W', checked: false },
        { name: 'PV功率_4 (W)', unit: 'W', checked: false },
        { name: 'PV功率_5 (W)', unit: 'W', checked: false },
        { name: 'PV功率_6 (W)', unit: 'W', checked: false },
        { name: 'PV功率_7 (W)', unit: 'W', checked: false },
        { name: 'PV功率_8 (W)', unit: 'W', checked: false },
        { name: 'PV功率_9 (W)', unit: 'W', checked: false },
        { name: 'PV功率_10 (W)', unit: 'W', checked: false },
        { name: 'PV功率_11 (W)', unit: 'W', checked: false },
        { name: 'PV功率_12 (W)', unit: 'W', checked: false },
        { name: 'PV功率_13 (W)', unit: 'W', checked: false },
        { name: 'PV功率_14 (W)', unit: 'W', checked: false },
        { name: 'PV功率_15 (W)', unit: 'W', checked: false },
        { name: 'PV功率_16 (W)', unit: 'W', checked: false },
        { name: 'PV功率_17 (W)', unit: 'W', checked: false },
        { name: 'PV功率_18 (W)', unit: 'W', checked: false },
        { name: 'PV功率_19 (W)', unit: 'W', checked: false },
        { name: 'PV功率_20 (W)', unit: 'W', checked: false },
        { name: '当日发电量(kWh)', unit: 'kWh', checked: false },
        { name: '总有功功率(kW)', unit: 'kW', checked: false },
        { name: '总无功功率(kVAr)', unit: 'kVAr', checked: false },
        { name: 'A相电压 (V)', unit: 'V', checked: false },
        { name: 'A相电流 (A)', unit: 'A', checked: false },
        { name: '电网频率 (Hz)', unit: 'Hz', checked: false }
      ]
    },
    {
      groupName: 'PV电压',
      params: [
        { name: 'PV电压_1 (V)', unit: 'V', checked: false },
        { name: 'PV电压_2 (V)', unit: 'V', checked: false },
        { name: 'PV电压_3 (V)', unit: 'V', checked: false },
        { name: 'PV电压_4 (V)', unit: 'V', checked: false },
        { name: 'PV电压_5 (V)', unit: 'V', checked: false },
        { name: 'PV电压_6 (V)', unit: 'V', checked: false },
        { name: 'PV电压_7 (V)', unit: 'V', checked: false },
        { name: 'PV电压_8 (V)', unit: 'V', checked: false },
        { name: 'PV电压_9 (V)', unit: 'V', checked: false },
        { name: 'PV电压_10 (V)', unit: 'V', checked: false },
        { name: 'PV电压_11 (V)', unit: 'V', checked: false },
        { name: 'PV电压_12 (V)', unit: 'V', checked: false },
        { name: 'PV电压_13 (V)', unit: 'V', checked: false },
        { name: 'PV电压_14 (V)', unit: 'V', checked: false },
        { name: 'PV电压_15 (V)', unit: 'V', checked: false },
        { name: 'PV电压_16 (V)', unit: 'V', checked: false },
        { name: 'PV电压_17 (V)', unit: 'V', checked: false },
        { name: 'PV电压_18 (V)', unit: 'V', checked: false },
        { name: 'PV电压_19 (V)', unit: 'V', checked: false },
        { name: 'PV电压_20 (V)', unit: 'V', checked: false },
        { name: '当日发电量(kWh)', unit: 'kWh', checked: false },
        { name: '总有功功率(kW)', unit: 'kW', checked: false },
        { name: '总无功功率(kVAr)', unit: 'kVAr', checked: false },
        { name: 'C相电压 (V)', unit: 'V', checked: false },
        { name: 'B相电流 (A)', unit: 'A', checked: false },
        { name: 'C相电流 (A)', unit: 'A', checked: false },
        { name: '逆变器工作状态', unit: '', checked: false }
      ]
    }
  ]
  
  return {
    success: true,
    code: 200,
    message: '获取参数列表成功',
    data: {
      paramGroups
    }
  }
}

/**
 * 获取Mock容量配置响应
 */
export const getMockCapacityConfigResponse = (deviceId: string, request: CapacityConfigRequest): CapacityConfigResponse => {
  const { configurations } = request
  
  const results = configurations.map(config => ({
    stringId: config.stringId,
    success: Math.random() > 0.05, // 95%成功率
    message: Math.random() > 0.05 ? '容量配置更新成功' : '配置更新失败：参数验证失败'
  }))
  
  const successCount = results.filter(r => r.success).length
  const failedCount = results.length - successCount
  
  return {
    success: true,
    code: 200,
    message: '容量配置更新完成',
    data: {
      successCount,
      failedCount,
      results
    }
  }
}
