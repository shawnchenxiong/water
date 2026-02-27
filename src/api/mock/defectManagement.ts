/**
 * 缺陷管理模拟数据
 */
import type {
  DefectQueryParams,
  DefectListResponse,
  DefectBasicDataResponse,
  DefectRecord
} from '@/api/types/defect-management'

/**
 * 生成模拟缺陷记录
 */
function generateMockDefect(id: number): DefectRecord {
  const deviceTypes = ['逆变器', '电能表', '气象站', '汇流箱', '变压器', '开关柜']
  const defectTypes = ['设备故障', '性能异常', '通信故障', '数据异常', '告警异常']
  const defectLevels = ['紧急', '重要', '一般', '轻微']
  const defectReasons = ['设备老化', '环境因素', '人为因素', '设计缺陷', '维护不当', '其他']
  const handleStatuses = ['待处理', '处理中', '已完成', '已关闭']
  const responsibleUnits = ['运维部', '技术部', '工程部', '外包单位']
  const stationNames = ['安徽省芜湖市光伏电站', '江苏省南京市光伏电站', '浙江省杭州市光伏电站']
  const submitters = ['张三', '李四', '王五', '赵六', '钱七']

  const deviceType = deviceTypes[id % deviceTypes.length]
  const defectType = defectTypes[id % defectTypes.length]
  const defectLevel = defectLevels[id % defectLevels.length]
  const defectReason = defectReasons[id % defectReasons.length]
  const handleStatus = handleStatuses[id % handleStatuses.length]
  const responsibleUnit = responsibleUnits[id % responsibleUnits.length]
  const stationName = stationNames[id % stationNames.length]
  const submitter = submitters[id % submitters.length]

  // 根据处理状态设置颜色
  const statusColors = {
    '待处理': '#E6A23C',
    '处理中': '#409EFF',
    '已完成': '#67C23A',
    '已关闭': '#909399'
  }

  const now = new Date()
  const submitTime = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)

  return {
    id: `DEFECT-${String(id).padStart(6, '0')}`,
    stationId: `STATION-${String((id % 3) + 1).padStart(3, '0')}`,
    stationName,
    deviceName: `${deviceType}-${String(id).padStart(3, '0')}`,
    deviceType,
    defectType,
    defectLevel,
    defectReason,
    defectDescription: `${defectType}: 设备运行出现${defectType}，需要及时处理。${defectReason}导致的问题。`,
    handleStatus,
    responsibleUnit,
    submitter,
    submitTime: submitTime.toISOString().slice(0, 19).replace('T', ' '),
    updateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    statusColor: statusColors[handleStatus as keyof typeof statusColors]
  }
}

/**
 * 获取缺陷列表（模拟）
 */
export function mockDefectList(params: DefectQueryParams): DefectListResponse {
  const { page = 1, pageSize = 20 } = params

  // 生成模拟数据
  const allDefects: DefectRecord[] = []
  for (let i = 1; i <= 156; i++) {
    allDefects.push(generateMockDefect(i))
  }

  // 根据筛选条件过滤
  let filteredDefects = allDefects

  if (params.stationId) {
    filteredDefects = filteredDefects.filter(d => d.stationId === params.stationId)
  }

  if (params.deviceName1) {
    filteredDefects = filteredDefects.filter(d =>
      d.deviceName.toLowerCase().includes(params.deviceName1!.toLowerCase())
    )
  }

  if (params.deviceName2) {
    filteredDefects = filteredDefects.filter(d =>
      d.deviceName.toLowerCase().includes(params.deviceName2!.toLowerCase())
    )
  }

  if (params.deviceType) {
    filteredDefects = filteredDefects.filter(d => d.deviceType === params.deviceType)
  }

  if (params.defectType) {
    filteredDefects = filteredDefects.filter(d => d.defectType === params.defectType)
  }

  if (params.defectLevel) {
    filteredDefects = filteredDefects.filter(d => d.defectLevel === params.defectLevel)
  }

  if (params.defectReason) {
    filteredDefects = filteredDefects.filter(d => d.defectReason === params.defectReason)
  }

  if (params.handleStatus) {
    filteredDefects = filteredDefects.filter(d => d.handleStatus === params.handleStatus)
  }

  // 日期范围过滤
  if (params.submitTimeStart) {
    filteredDefects = filteredDefects.filter(d => d.submitTime >= params.submitTimeStart!)
  }

  if (params.submitTimeEnd) {
    filteredDefects = filteredDefects.filter(d => d.submitTime <= params.submitTimeEnd!)
  }

  // 排序
  if (params.sortField) {
    filteredDefects.sort((a, b) => {
      const aValue = a[params.sortField as keyof DefectRecord] as string
      const bValue = b[params.sortField as keyof DefectRecord] as string
      const order = params.sortOrder === 'asc' ? 1 : -1
      return aValue > bValue ? order : -order
    })
  }

  // 分页
  const total = filteredDefects.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const defects = filteredDefects.slice(start, end)

  return {
    code: 200,
    message: 'Success',
    data: {
      defects,
      pagination: {
        current: page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }
}

/**
 * 获取缺陷基础数据（模拟）
 */
export function mockDefectBasicData(): DefectBasicDataResponse {
  return {
    code: 200,
    message: 'Success',
    data: {
      deviceTypes: [
        { label: '逆变器', value: '逆变器' },
        { label: '电能表', value: '电能表' },
        { label: '气象站', value: '气象站' },
        { label: '汇流箱', value: '汇流箱' },
        { label: '变压器', value: '变压器' },
        { label: '开关柜', value: '开关柜' }
      ],
      defectTypes: [
        { label: '设备故障', value: '设备故障' },
        { label: '性能异常', value: '性能异常' },
        { label: '通信故障', value: '通信故障' },
        { label: '数据异常', value: '数据异常' },
        { label: '告警异常', value: '告警异常' }
      ],
      defectLevels: [
        { label: '紧急', value: '紧急', color: '#F56C6C' },
        { label: '重要', value: '重要', color: '#E6A23C' },
        { label: '一般', value: '一般', color: '#409EFF' },
        { label: '轻微', value: '轻微', color: '#909399' }
      ],
      defectReasons: [
        { label: '设备老化', value: '设备老化' },
        { label: '环境因素', value: '环境因素' },
        { label: '人为因素', value: '人为因素' },
        { label: '设计缺陷', value: '设计缺陷' },
        { label: '维护不当', value: '维护不当' },
        { label: '其他', value: '其他' }
      ],
      handleStatuses: [
        { label: '待处理', value: '待处理', color: '#E6A23C' },
        { label: '处理中', value: '处理中', color: '#409EFF' },
        { label: '已完成', value: '已完成', color: '#67C23A' },
        { label: '已关闭', value: '已关闭', color: '#909399' }
      ],
      responsibleUnits: [
        { label: '运维部', value: '运维部' },
        { label: '技术部', value: '技术部' },
        { label: '工程部', value: '工程部' },
        { label: '外包单位', value: '外包单位' }
      ]
    }
  }
}

/**
 * 获取缺陷详情（模拟）
 */
export function mockDefectDetail(id: string): { code: number; message: string; data: DefectRecord } {
  const idNum = parseInt(id.split('-')[1])
  return {
    code: 200,
    message: 'Success',
    data: generateMockDefect(idNum)
  }
}

