import type { 
  PatrolTaskRecord, 
  PatrolTaskBasicData, 
  PatrolMonitorTableRecord,
  PatrolRecord,
  PatrolRecordBasicData
} from '@/api/types/ai-patrol'

/**
 * 生成模拟巡检任务数据
 */
export const mockPatrolTaskRecords = (): PatrolTaskRecord[] => {
  const mockData: PatrolTaskRecord[] = []
  const types = ['日常巡检', '设备巡检', '安全巡检', '环境巡检']
  const modes = ['自动巡检', '手动巡检']
  const statuses = ['执行中', '待执行', '已完成', '已暂停']
  
  for (let i = 1; i <= 50; i++) {
    mockData.push({
      id: `TASK-${String(i).padStart(6, '0')}`,
      taskName: `${types[i % types.length]} - ${i}号电站`,
      taskType: types[i % types.length],
      executeMode: modes[i % modes.length],
      executeTimeRange: '08:00 - 18:00',
      executeInterval: i % 2 === 0 ? '每天 09:00' : '每周一 09:00',
      taskStatus: statuses[i % statuses.length],
      lastExecuteTime: `2025-01-${String((i % 28) + 1).padStart(2, '0')} 09:00:00`
    })
  }
  
  return mockData
}

/**
 * 生成基础数据
 */
export const mockPatrolTaskBasicData = (): PatrolTaskBasicData => {
  return {
    taskTypes: [
      { label: '日常巡检', value: 'daily' },
      { label: '设备巡检', value: 'device' },
      { label: '安全巡检', value: 'safety' },
      { label: '环境巡检', value: 'environment' }
    ],
    executeModes: [
      { label: '自动巡检', value: 'auto' },
      { label: '手动巡检', value: 'manual' }
    ],
    taskStatuses: [
      { label: '执行中', value: 'running' },
      { label: '待执行', value: 'waiting' },
      { label: '已完成', value: 'completed' },
      { label: '已暂停', value: 'paused' }
    ]
  }
}

/**
 * 筛选任务数据
 */
export const filterPatrolTasks = (
  data: PatrolTaskRecord[],
  filters: {
    taskType?: string
    executeMode?: string
    taskStatus?: string
    keyword?: string
  }
): PatrolTaskRecord[] => {
  let filtered = [...data]
  
  if (filters.taskType) {
    filtered = filtered.filter(item => item.taskType === filters.taskType)
  }
  
  if (filters.executeMode) {
    filtered = filtered.filter(item => item.executeMode === filters.executeMode)
  }
  
  if (filters.taskStatus) {
    filtered = filtered.filter(item => item.taskStatus === filters.taskStatus)
  }
  
  if (filters.keyword) {
    filtered = filtered.filter(item => item.taskName.includes(filters.keyword))
  }
  
  return filtered
}

/**
 * 生成模拟巡检监控表格数据
 */
export const mockPatrolMonitorTableData = (dataType: 'realtime' | 'alarm'): PatrolMonitorTableRecord[] => {
  // 储能站设备区域分布
  const locations = [
    '1号电池柜区', '2号电池柜区', '3号电池柜区', '4号电池柜区',
    'PCS机房', 'EMS控制室', '消防控制室', '变压器区',
    '空调机组区', '配电室'
  ]
  
  // 储能站核心设备类型
  const deviceConfigs = [
    { type: 'BMS', name: 'BMS-{i}', points: ['单体电压', '电池温度', '绝缘检测', '均衡状态', 'SOC状态'] },
    { type: 'PCS', name: 'PCS-{i}', points: ['功率输出', '电流检测', '电压检测', '运行状态', '故障状态'] },
    { type: 'EMS', name: 'EMS-{i}', points: ['通信状态', '数据采集', '控制指令', '系统状态', '网络连接'] },
    { type: 'HVAC', name: 'HVAC-{i}', points: ['室内温度', '室内湿度', '风机状态', '制冷状态', '温控设定'] },
    { type: 'FIRE', name: 'FIRE-{i}', points: ['烟雾检测', '温度检测', '气体检测', '报警状态', '联动状态'] },
    { type: 'TRANS', name: 'TRANS-{i}', points: ['变压器温度', '负载电流', '电压等级', '绝缘状态', '冷却状态'] }
  ]
  
  const results = ['正常', '异常', '警告']
  const auditStatuses = ['已审核', '待审核', '已驳回']
  
  const data: PatrolMonitorTableRecord[] = []
  const now = new Date()
  
  if (dataType === 'realtime') {
    // 实时信息 - 模拟全面的设备巡检
    for (let i = 1; i <= 30; i++) {
      const deviceConfig = deviceConfigs[i % deviceConfigs.length]
      const deviceNum = Math.floor(i / deviceConfigs.length) + 1
      const deviceName = deviceConfig.name.replace('{i}', String(deviceNum).padStart(3, '0'))
      const pointName = deviceConfig.points[i % deviceConfig.points.length]
      
      // 根据设备类型和检测点判断异常概率
      let abnormalRate = 0.15 // 默认15%异常率
      if (deviceConfig.type === 'BMS' && (pointName.includes('温度') || pointName.includes('电压'))) {
        abnormalRate = 0.25 // 电池温度和电压异常率较高
      } else if (deviceConfig.type === 'FIRE') {
        abnormalRate = 0.05 // 消防系统异常率较低
      } else if (deviceConfig.type === 'EMS' && pointName.includes('通信')) {
        abnormalRate = 0.20 // 通信状态异常率较高
      }
      
      const isAbnormal = Math.random() < abnormalRate
      
      // 生成合理的时间分布（最近24小时内）
      const hoursAgo = Math.floor(Math.random() * 24)
      const minutesAgo = Math.floor(Math.random() * 60)
      const secondsAgo = Math.floor(Math.random() * 60)
      const checkTime = new Date(now.getTime() - (hoursAgo * 3600 + minutesAgo * 60 + secondsAgo) * 1000)
      
      let result = '正常'
      if (isAbnormal) {
        if (deviceConfig.type === 'BMS' && pointName.includes('温度')) {
          result = Math.random() < 0.7 ? '异常' : '警告' // 电池温度异常较严重
        } else if (deviceConfig.type === 'FIRE') {
          result = '异常' // 消防异常都是严重的
        } else {
          result = results[Math.floor(Math.random() * 3)]
        }
      }
      
      // 审核状态：异常的更可能已审核
      let auditStatus = auditStatuses[Math.floor(Math.random() * 3)]
      if (result === '异常') {
        auditStatus = Math.random() < 0.8 ? '已审核' : '待审核'
      }
      
      data.push({
        time: checkTime.toISOString().replace('T', ' ').substring(0, 19),
        location: locations[(i + deviceNum) % locations.length],
        deviceName,
        pointName,
        result,
        auditStatus
      })
    }
  } else {
    // 告警信息 - 主要是异常和警告数据
    const alarmDevices = [
      { device: 'BMS-002', location: '2号电池柜区', point: '单体电压', result: '异常', reason: '电压过高' },
      { device: 'BMS-003', location: '3号电池柜区', point: '电池温度', result: '警告', reason: '温度偏高' },
      { device: 'PCS-001', location: 'PCS机房', point: '功率输出', result: '异常', reason: '输出功率异常' },
      { device: 'FIRE-001', location: '消防控制室', point: '烟雾检测', result: '异常', reason: '烟雾浓度超标' },
      { device: 'HVAC-002', location: '空调机组区', point: '室内温度', result: '警告', reason: '温度控制失效' },
      { device: 'EMS-001', location: 'EMS控制室', point: '通信状态', result: '异常', reason: '通信中断' },
      { device: 'TRANS-001', location: '变压器区', point: '变压器温度', result: '警告', reason: '温度升高' },
      { device: 'BMS-001', location: '1号电池柜区', point: 'SOC状态', result: '异常', reason: 'SOC计算错误' }
    ]
    
    alarmDevices.forEach((alarm, i) => {
      // 告警时间分布在最近8小时内
      const hoursAgo = Math.floor(Math.random() * 8)
      const minutesAgo = Math.floor(Math.random() * 60)
      const alarmTime = new Date(now.getTime() - (hoursAgo * 3600 + minutesAgo * 60) * 1000)
      
      // 告警数据更可能已经审核
      const auditStatus = Math.random() < 0.7 ? '已审核' : '待审核'
      
      data.push({
        time: alarmTime.toISOString().replace('T', ' ').substring(0, 19),
        location: alarm.location,
        deviceName: alarm.device,
        pointName: alarm.point,
        result: alarm.result,
        auditStatus
      })
    })
  }
  
  // 按时间倒序排列
  return data.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
}

/**
 * 生成模拟巡检记录数据
 */
export const mockPatrolRecords = (): PatrolRecord[] => {
  const stations = ['储能站1号', '储能站2号', '储能站3号', '储能站4号', '储能站5号']
  const tasks = ['日常巡检任务', '设备巡检任务', '安全巡检任务', '环境巡检任务']
  const locations = [
    '1号电池柜区', '2号电池柜区', '3号电池柜区', '4号电池柜区',
    'PCS机房', 'EMS控制室', '消防控制室', '变压器区',
    '空调机组区', '配电室'
  ]
  
  const deviceConfigs = [
    { type: 'BMS', name: 'BMS-{i}', points: ['单体电压', '电池温度', '绝缘检测', '均衡状态', 'SOC状态'] },
    { type: 'PCS', name: 'PCS-{i}', points: ['功率输出', '电流检测', '电压检测', '运行状态', '故障状态'] },
    { type: 'EMS', name: 'EMS-{i}', points: ['通信状态', '数据采集', '控制指令', '系统状态', '网络连接'] },
    { type: 'HVAC', name: 'HVAC-{i}', points: ['室内温度', '室内湿度', '风机状态', '制冷状态', '温控设定'] },
    { type: 'FIRE', name: 'FIRE-{i}', points: ['烟雾检测', '温度检测', '气体检测', '报警状态', '联动状态'] },
    { type: 'TRANS', name: 'TRANS-{i}', points: ['变压器温度', '负载电流', '电压等级', '绝缘状态', '冷却状态'] }
  ]
  
  const results: Array<'正常' | '异常' | '警告'> = ['正常', '异常', '警告']
  const auditStatuses: Array<'待审核' | '已审核' | '已驳回'> = ['待审核', '已审核', '已驳回']
  const auditors = ['张工程师', '李技术员', '王主管', '赵检查员', '陈专家']
  
  const abnormalDescs = [
    '电池温度超出正常范围，需要检查散热系统',
    '设备通信异常，可能存在网络连接问题',
    '功率输出不稳定，建议进行设备维护',
    '烟雾浓度检测异常，需要立即排查火源',
    '系统运行状态异常，建议重启设备',
    '电压波动较大，需要检查电源稳定性'
  ]
  
  const data: PatrolRecord[] = []
  const now = new Date()
  
  for (let i = 1; i <= 80; i++) {
    const deviceConfig = deviceConfigs[i % deviceConfigs.length]
    const deviceNum = Math.floor(i / deviceConfigs.length) + 1
    const deviceName = deviceConfig.name.replace('{i}', String(deviceNum).padStart(3, '0'))
    const pointName = deviceConfig.points[i % deviceConfig.points.length]
    
    // 根据设备类型判断异常概率
    let abnormalRate = 0.20 // 默认20%异常率
    if (deviceConfig.type === 'BMS' && (pointName.includes('温度') || pointName.includes('电压'))) {
      abnormalRate = 0.35 // 电池相关异常率较高
    } else if (deviceConfig.type === 'FIRE') {
      abnormalRate = 0.08 // 消防系统异常率较低
    } else if (deviceConfig.type === 'EMS' && pointName.includes('通信')) {
      abnormalRate = 0.25 // 通信异常率较高
    }
    
    const isAbnormal = Math.random() < abnormalRate
    
    // 生成巡检时间（最近30天内）
    const daysAgo = Math.floor(Math.random() * 30)
    const hoursAgo = Math.floor(Math.random() * 24)
    const minutesAgo = Math.floor(Math.random() * 60)
    const inspectionTime = new Date(now.getTime() - (daysAgo * 86400 + hoursAgo * 3600 + minutesAgo * 60) * 1000)
    
    let result: '正常' | '异常' | '警告' = '正常'
    let abnormalDesc: string | undefined
    let images: string[] | undefined
    
    if (isAbnormal) {
      if (deviceConfig.type === 'BMS' && pointName.includes('温度')) {
        result = Math.random() < 0.8 ? '异常' : '警告'
      } else if (deviceConfig.type === 'FIRE') {
        result = '异常' // 消防异常都是严重的
      } else {
        result = results[Math.floor(Math.random() * 3)]
      }
      
      if (result !== '正常') {
        abnormalDesc = abnormalDescs[Math.floor(Math.random() * abnormalDescs.length)]
        // 异常记录有50%概率包含图片
        if (Math.random() < 0.5) {
          images = [
            `/images/patrol/device_${deviceName.toLowerCase()}_${Date.now()}.jpg`,
            `/images/patrol/inspection_${i}_${Date.now()}.jpg`
          ]
        }
      }
    }
    
    // 审核状态：异常的更可能已审核
    let auditStatus: '待审核' | '已审核' | '已驳回' = auditStatuses[Math.floor(Math.random() * 3)]
    if (result === '异常') {
      auditStatus = Math.random() < 0.85 ? '已审核' : '待审核'
    } else if (result === '警告') {
      auditStatus = Math.random() < 0.70 ? '已审核' : '待审核'
    }
    
    // 审核信息
    let auditor: string | undefined
    let auditTime: string | undefined
    let auditRemark: string | undefined
    
    if (auditStatus !== '待审核') {
      auditor = auditors[Math.floor(Math.random() * auditors.length)]
      auditTime = new Date(inspectionTime.getTime() + Math.random() * 86400000).toISOString().replace('T', ' ').substring(0, 19)
      
      if (auditStatus === '已审核') {
        auditRemark = result === '异常' ? '已确认异常，已安排维修' : '情况属实，已记录在案'
      } else {
        auditRemark = '信息不足，需要重新巡检确认'
      }
    }
    
    data.push({
      id: `PR-${String(i).padStart(6, '0')}`,
      stationName: stations[i % stations.length],
      taskId: `TASK-${String(Math.floor(i / 4) + 1).padStart(6, '0')}`,
      taskName: tasks[Math.floor(i / 20) % tasks.length],
      location: locations[(i + deviceNum) % locations.length],
      deviceName,
      deviceType: deviceConfig.type,
      pointName,
      inspectionTime: inspectionTime.toISOString().replace('T', ' ').substring(0, 19),
      result,
      abnormalDesc,
      images,
      auditStatus,
      auditor,
      auditTime,
      auditRemark,
      createTime: inspectionTime.toISOString().replace('T', ' ').substring(0, 19)
    })
  }
  
  // 按巡检时间倒序排列
  return data.sort((a, b) => new Date(b.inspectionTime).getTime() - new Date(a.inspectionTime).getTime())
}

/**
 * 生成巡检记录基础数据
 */
export const mockPatrolRecordBasicData = (): PatrolRecordBasicData => {
  return {
    deviceTypes: [
      { label: 'BMS(电池管理系统)', value: 'BMS' },
      { label: 'PCS(功率转换系统)', value: 'PCS' },
      { label: 'EMS(能量管理系统)', value: 'EMS' },
      { label: 'HVAC(温控系统)', value: 'HVAC' },
      { label: 'FIRE(消防系统)', value: 'FIRE' },
      { label: 'TRANS(变压器)', value: 'TRANS' }
    ],
    results: [
      { label: '正常', value: '正常' },
      { label: '异常', value: '异常' },
      { label: '警告', value: '警告' }
    ],
    auditStatuses: [
      { label: '待审核', value: '待审核' },
      { label: '已审核', value: '已审核' },
      { label: '已驳回', value: '已驳回' }
    ]
  }
}

/**
 * 筛选巡检记录数据
 */
export const filterPatrolRecords = (
  data: PatrolRecord[],
  filters: {
    stationId?: string
    taskId?: string
    deviceType?: string
    result?: string
    auditStatus?: string
    keyword?: string
  }
): PatrolRecord[] => {
  let filtered = [...data]
  
  if (filters.deviceType) {
    filtered = filtered.filter(item => item.deviceType === filters.deviceType)
  }
  
  if (filters.result) {
    filtered = filtered.filter(item => item.result === filters.result)
  }
  
  if (filters.auditStatus) {
    filtered = filtered.filter(item => item.auditStatus === filters.auditStatus)
  }
  
  if (filters.keyword) {
    filtered = filtered.filter(item => 
      item.stationName.includes(filters.keyword!) ||
      item.deviceName.includes(filters.keyword!) ||
      item.location.includes(filters.keyword!) ||
      item.pointName.includes(filters.keyword!)
    )
  }
  
  return filtered
}

