import type { FaultLibraryRecord, FaultLibraryBasicData } from '@/api/types/fault-library'

/**
 * 生成模拟故障库数据
 */
export const mockFaultLibraryRecords = (): FaultLibraryRecord[] => {
  const deviceTypes = ['BMS', 'PCS', 'EMS', 'HVAC', 'FIRE', 'TRANS']
  const modifiers = ['张工程师', '李技术员', '王主管', '赵检查员', '陈专家', '刘工程师']
  
  // 真实的储能系统故障库数据
  const faultData = [
    {
      deviceType: 'BMS',
      faultDescription: '单体电池电压异常',
      impactScope: '影响单串电池组性能，可能导致整个电池簇不平衡',
      possibleCause: '电池老化、温度异常、充放电不当、电池内阻增大、电池液泄漏',
      solutionSuggestion: '1. 检查电池连接状态\n2. 测量电池内阻和容量\n3. 调整充放电策略\n4. 必要时更换异常电池',
      relatedAlarmCount: 15
    },
    {
      deviceType: 'BMS',
      faultDescription: '电池温度过高告警',
      impactScope: '可能引起电池热失控，影响系统安全',
      possibleCause: '散热系统故障、过度充放电、环境温度过高、电池内部短路',
      solutionSuggestion: '1. 立即停止充放电\n2. 检查散热系统\n3. 监控电池温度变化\n4. 排查内部故障',
      relatedAlarmCount: 8
    },
    {
      deviceType: 'PCS',
      faultDescription: 'AC侧电压不平衡',
      impactScope: '影响电网接入质量，可能造成功率损失',
      possibleCause: '变压器故障、电网侧不平衡、PCS内部元器件故障、接线松动',
      solutionSuggestion: '1. 检查AC侧接线\n2. 测量三相电压\n3. 检查变压器\n4. 调整PCS参数',
      relatedAlarmCount: 12
    },
    {
      deviceType: 'PCS',
      faultDescription: 'DC侧电流异常',
      impactScope: '影响电池充放电效率，可能损坏PCS',
      possibleCause: 'DC熔断器故障、电池侧故障、PCS功率模块故障、传感器故障',
      solutionSuggestion: '1. 检查DC侧保护装置\n2. 测量电池电压电流\n3. 检查功率模块\n4. 校准传感器',
      relatedAlarmCount: 6
    },
    {
      deviceType: 'EMS',
      faultDescription: '通信中断告警',
      impactScope: '失去对储能系统的监控和控制能力',
      possibleCause: '网络故障、通信模块故障、软件异常、配置错误',
      solutionSuggestion: '1. 检查网络连接\n2. 重启通信模块\n3. 检查软件配置\n4. 更换通信设备',
      relatedAlarmCount: 20
    },
    {
      deviceType: 'EMS',
      faultDescription: '系统运行参数异常',
      impactScope: '影响系统运行策略和能量管理效果',
      possibleCause: '传感器故障、参数配置错误、软件算法问题、外部干扰',
      solutionSuggestion: '1. 校验传感器数据\n2. 检查参数配置\n3. 更新软件版本\n4. 排除外部干扰',
      relatedAlarmCount: 9
    },
    {
      deviceType: 'HVAC',
      faultDescription: '空调系统制冷故障',
      impactScope: '影响电池室温度控制，可能导致电池性能下降',
      possibleCause: '制冷剂不足、压缩机故障、冷凝器堵塞、传感器故障',
      solutionSuggestion: '1. 检查制冷剂压力\n2. 清洁冷凝器\n3. 检查压缩机状态\n4. 校准温度传感器',
      relatedAlarmCount: 4
    },
    {
      deviceType: 'HVAC',
      faultDescription: '通风系统异常',
      impactScope: '影响设备散热，可能导致设备过热保护',
      possibleCause: '风扇故障、风道堵塞、控制系统故障、电源问题',
      solutionSuggestion: '1. 检查风扇运行状态\n2. 清理风道\n3. 检查控制电路\n4. 测试电源电压',
      relatedAlarmCount: 7
    },
    {
      deviceType: 'FIRE',
      faultDescription: '烟雾检测器报警',
      impactScope: '可能存在火灾风险，需要立即响应',
      possibleCause: '实际火灾、误报、传感器故障、环境干扰',
      solutionSuggestion: '1. 立即现场确认\n2. 启动应急预案\n3. 检查传感器状态\n4. 排查火源风险',
      relatedAlarmCount: 2
    },
    {
      deviceType: 'FIRE',
      faultDescription: '消防联动系统故障',
      impactScope: '影响火灾应急响应能力，存在安全隐患',
      possibleCause: '控制模块故障、接线问题、设备老化、程序错误',
      solutionSuggestion: '1. 检查控制系统\n2. 测试联动设备\n3. 检查接线连接\n4. 更新控制程序',
      relatedAlarmCount: 3
    },
    {
      deviceType: 'TRANS',
      faultDescription: '变压器温度异常',
      impactScope: '影响变压器寿命，可能导致设备损坏',
      possibleCause: '过载运行、散热不良、绕组故障、冷却系统故障',
      solutionSuggestion: '1. 检查负载情况\n2. 清理散热器\n3. 检测绕组绝缘\n4. 维护冷却系统',
      relatedAlarmCount: 5
    },
    {
      deviceType: 'TRANS',
      faultDescription: '绝缘电阻下降',
      impactScope: '存在漏电风险，影响系统安全运行',
      possibleCause: '绝缘老化、受潮、污染、机械损伤',
      solutionSuggestion: '1. 测量绝缘电阻\n2. 检查受潮情况\n3. 清理污染物\n4. 必要时更换绝缘',
      relatedAlarmCount: 11
    }
  ]
  
  const data: FaultLibraryRecord[] = []
  const now = new Date()
  
  faultData.forEach((fault, i) => {
    // 生成修改时间（最近30天内）
    const daysAgo = Math.floor(Math.random() * 30)
    const hoursAgo = Math.floor(Math.random() * 24)
    const modifiedTime = new Date(now.getTime() - (daysAgo * 86400 + hoursAgo * 3600) * 1000)
    
    data.push({
      id: `FL-${String(i + 1).padStart(6, '0')}`,
      deviceType: fault.deviceType,
      faultDescription: fault.faultDescription,
      impactScope: fault.impactScope,
      possibleCause: fault.possibleCause,
      solutionSuggestion: fault.solutionSuggestion,
      relatedAlarmCount: fault.relatedAlarmCount,
      modifiedBy: modifiers[i % modifiers.length],
      modifiedTime: modifiedTime.toISOString().replace('T', ' ').substring(0, 19),
      createTime: modifiedTime.toISOString().replace('T', ' ').substring(0, 19)
    })
  })
  
  // 按修改时间倒序排列
  return data.sort((a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime())
}

/**
 * 生成故障库基础数据
 */
export const mockFaultLibraryBasicData = (): FaultLibraryBasicData => {
  return {
    deviceTypes: [
      { label: 'BMS(电池管理系统)', value: 'BMS' },
      { label: 'PCS(功率转换系统)', value: 'PCS' },
      { label: 'EMS(能量管理系统)', value: 'EMS' },
      { label: 'HVAC(温控系统)', value: 'HVAC' },
      { label: 'FIRE(消防系统)', value: 'FIRE' },
      { label: 'TRANS(变压器)', value: 'TRANS' }
    ]
  }
}

/**
 * 筛选故障库数据
 */
export const filterFaultLibraryRecords = (
  data: FaultLibraryRecord[],
  filters: {
    deviceType?: string
    faultDescription?: string
  }
): FaultLibraryRecord[] => {
  let filtered = [...data]
  
  if (filters.deviceType) {
    filtered = filtered.filter(item => item.deviceType === filters.deviceType)
  }
  
  if (filters.faultDescription) {
    filtered = filtered.filter(item => 
      item.faultDescription.includes(filters.faultDescription!) ||
      item.impactScope.includes(filters.faultDescription!) ||
      item.possibleCause.includes(filters.faultDescription!)
    )
  }
  
  return filtered
}
