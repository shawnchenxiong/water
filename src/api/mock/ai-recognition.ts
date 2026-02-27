import type {
  AIRecognitionHistoryRecord,
  AIRecognitionAuditRecord,
  AIRecognitionBasicData,
  RecognitionResult,
  AlgorithmType,
  AuditStatus,
  AIRecognitionHistoryQueryParams,
  AIRecognitionAuditQueryParams,
  AIRecognitionDetail
} from '@/api/types/ai-recognition'

/**
 * 生成模拟AI识别历史数据
 */
export const mockAIRecognitionHistoryRecords = (): AIRecognitionHistoryRecord[] => {
  const devices = [
    '储能柜1', '储能柜2', '储能柜3', '储能柜4', '储能柜5',
    '变流器1', '变流器2', '变压器1', '配电柜1', '监控摄像头1'
  ]

  const algorithmTypes: AlgorithmType[] = [
    'personnel_intrusion', 'fire_smoke', 'device_abnormal', 'liquid_level'
  ]

  const recognitionResults: RecognitionResult[] = ['normal', 'abnormal', 'alarm']

  const descriptions = [
    '设备运行正常，无异常检测',
    '检测到人员进入禁区',
    '发现火灾烟雾信号',
    '设备外观异常，可能存在损坏',
    '液位超出正常范围',
    '设备温度异常',
    '检测到未授权人员',
    '设备表面污渍严重',
    '连接线缆松动',
    '设备指示灯异常'
  ]

  return Array.from({ length: 25 }, (_, i) => {
    const baseTime = new Date('2025-11-01T10:00:00')
    baseTime.setMinutes(baseTime.getMinutes() - i * 30)

    const device = devices[i % devices.length]
    const algorithmType = algorithmTypes[Math.floor(Math.random() * algorithmTypes.length)]
    const recognitionResult = recognitionResults[Math.floor(Math.random() * recognitionResults.length)]
    const confidence = (0.75 + Math.random() * 0.24).toFixed(3)
    const description = descriptions[Math.floor(Math.random() * descriptions.length)]

    return {
      id: `ai-record-${i + 1}`,
      inspectionTime: baseTime.toISOString().replace('T', ' ').substring(0, 19),
      deviceName: device,
      algorithmType,
      recognitionResult,
      confidence,
      description,
      imageUrls: [
        `/images/ai-recognition/original-${i + 1}.jpg`,
        `/images/ai-recognition/annotated-${i + 1}.jpg`
      ],
      createTime: baseTime.toISOString().replace('T', ' ').substring(0, 19)
    }
  })
}

/**
 * 生成模拟AI识别审核数据
 */
export const mockAIRecognitionAuditRecords = (): AIRecognitionAuditRecord[] => {
  const historyRecords = mockAIRecognitionHistoryRecords()
  
  return historyRecords.map((record, i) => {
    const auditStatuses: AuditStatus[] = ['pending', 'audited', 'rejected']
    const auditStatus = auditStatuses[Math.floor(Math.random() * auditStatuses.length)]
    const alarmMisreport = Math.random() > 0.7 ? 'yes' : 'no'
    
    let auditor: string | undefined
    let auditTime: string | undefined
    let auditRemark: string | undefined

    if (auditStatus !== 'pending') {
      auditor = `审核员${(i % 3) + 1}`
      const auditBaseTime = new Date(record.inspectionTime)
      auditBaseTime.setHours(auditBaseTime.getHours() + Math.floor(Math.random() * 24) + 1)
      auditTime = auditBaseTime.toISOString().replace('T', ' ').substring(0, 19)
      
      const remarks = [
        '识别结果准确，算法表现良好',
        '存在误报，需要优化算法参数',
        '识别结果不准确，建议重新训练模型',
        '算法识别正常，符合预期',
        '需要增加更多样本数据进行训练'
      ]
      auditRemark = remarks[Math.floor(Math.random() * remarks.length)]
    }

    return {
      ...record,
      auditStatus,
      alarmMisreport: alarmMisreport as 'yes' | 'no',
      auditor,
      auditTime,
      auditRemark
    }
  })
}

/**
 * 生成AI识别基础数据
 */
export const mockAIRecognitionBasicData = (): AIRecognitionBasicData => {
  return {
    recognitionResults: [
      { label: '全部', value: '' },
      { label: '正常', value: 'normal' },
      { label: '异常', value: 'abnormal' },
      { label: '告警', value: 'alarm' }
    ],
    algorithmTypes: [
      { label: '全部', value: '' },
      { label: '人员入侵检测', value: 'personnel_intrusion' },
      { label: '火灾烟雾检测', value: 'fire_smoke' },
      { label: '设备异常检测', value: 'device_abnormal' },
      { label: '液位检测', value: 'liquid_level' }
    ],
    auditStatuses: [
      { label: '全部', value: '' },
      { label: '待审核', value: 'pending' },
      { label: '已审核', value: 'audited' },
      { label: '已驳回', value: 'rejected' }
    ],
    alarmMisreports: [
      { label: '全部', value: '' },
      { label: '是', value: 'yes' },
      { label: '否', value: 'no' }
    ]
  }
}

/**
 * 筛选AI识别历史记录
 */
export const filterAIRecognitionHistoryRecords = (
  data: AIRecognitionHistoryRecord[],
  filters: AIRecognitionHistoryQueryParams
): AIRecognitionHistoryRecord[] => {
  return data.filter(item => {
    // 时间范围筛选
    if (filters.timeRange && filters.timeRange.length === 2) {
      const itemTime = new Date(item.inspectionTime)
      const startTime = new Date(filters.timeRange[0])
      const endTime = new Date(filters.timeRange[1])
      
      if (itemTime < startTime || itemTime > endTime) {
        return false
      }
    }

    // 识别结果筛选
    if (filters.recognitionResult && filters.recognitionResult !== '') {
      if (item.recognitionResult !== filters.recognitionResult) {
        return false
      }
    }

    // 算法类型筛选
    if (filters.algorithmType && filters.algorithmType !== '') {
      if (item.algorithmType !== filters.algorithmType) {
        return false
      }
    }

    return true
  })
}

/**
 * 筛选AI识别审核记录
 */
export const filterAIRecognitionAuditRecords = (
  data: AIRecognitionAuditRecord[],
  filters: AIRecognitionAuditQueryParams
): AIRecognitionAuditRecord[] => {
  return data.filter(item => {
    // 时间范围筛选
    if (filters.timeRange && filters.timeRange.length === 2) {
      const itemTime = new Date(item.inspectionTime)
      const startTime = new Date(filters.timeRange[0])
      const endTime = new Date(filters.timeRange[1])
      
      if (itemTime < startTime || itemTime > endTime) {
        return false
      }
    }

    // 识别结果筛选
    if (filters.recognitionResult && filters.recognitionResult !== '') {
      if (item.recognitionResult !== filters.recognitionResult) {
        return false
      }
    }

    // 审核状态筛选
    if (filters.auditStatus && filters.auditStatus !== '') {
      if (item.auditStatus !== filters.auditStatus) {
        return false
      }
    }

    // 告警误报筛选
    if (filters.alarmMisreport && filters.alarmMisreport !== '') {
      if (item.alarmMisreport !== filters.alarmMisreport) {
        return false
      }
    }

    // 算法类型筛选
    if (filters.algorithmType && filters.algorithmType !== '') {
      if (item.algorithmType !== filters.algorithmType) {
        return false
      }
    }

    return true
  })
}

/**
 * 生成模拟AI识别详情数据
 */
export const mockAIRecognitionDetail = (recordId: string): AIRecognitionDetail => {
  const historyRecords = mockAIRecognitionHistoryRecords()
  const record = historyRecords.find(r => r.id === recordId) || historyRecords[0]

  return {
    record,
    originalImageUrl: `/images/ai-recognition/original-${recordId}.jpg`,
    annotatedImageUrl: `/images/ai-recognition/annotated-${recordId}.jpg`,
    detectionRegions: [
      {
        x: 100,
        y: 50,
        width: 200,
        height: 150,
        label: '检测目标',
        confidence: parseFloat(record.confidence)
      }
    ],
    algorithmParams: {
      threshold: 0.8,
      nmsThreshold: 0.45,
      modelVersion: '1.2.3',
      inputSize: '640x640'
    }
  }
}
