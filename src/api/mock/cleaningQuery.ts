import type { 
  CleaningRecord, 
  GetCleaningRecordsResponse,
  CreateCleaningRecordResponse,
  UpdateCleaningRecordResponse,
  DeleteCleaningRecordResponse,
  GetStationsResponse,
  Station,
  CleaningMethod 
} from '@/api/types/diagnosis/cleaningQuery'
import dayjs from 'dayjs'

/**
 * 积尘清洗查询 Mock 数据
 */

// 清洗方式选项
export const cleaningMethods: CleaningMethod[] = [
  '人工清洗',
  '机器人清洗', 
  '高压水枪',
  '干式清洗',
  '化学清洗'
]

// 清洗人员选项
const cleaningPersonnels = ['张三', '李四', '王五', '赵六', '钱七', '孙八']

// 提交人选项
const submitters = ['管理员', '运维员', '技术员', '维护员']

// 生成电站Mock数据
export const generateMockStations = (): Station[] => {
  return [
    {
      stationId: 'station_001',
      stationName: '芜湖城南污水厂',
      location: '安徽省芜湖市',
      capacity: 5919.34
    },
    {
      stationId: 'station_002', 
      stationName: '芜湖大龙湾污水厂',
      location: '安徽省芜湖市',
      capacity: 4136.68
    },
    {
      stationId: 'station_003',
      stationName: '六安东城污水厂',
      location: '安徽省六安市',
      capacity: 4310.28
    },
    {
      stationId: 'station_004',
      stationName: '六安凤凰桥一期污水厂',
      location: '安徽省六安市',
      capacity: 2287.00
    },
    {
      stationId: 'station_005',
      stationName: '六安河西污水厂',
      location: '安徽省六安市',
      capacity: 3832.01
    }
  ]
}

// 生成清洗记录Mock数据
export const generateMockCleaningRecords = (
  stationId: string,
  startTime: string,
  endTime: string,
  page: number = 1,
  pageSize: number = 20
): CleaningRecord[] => {
  const stations = generateMockStations()
  const station = stations.find(s => s.stationId === stationId) || stations[0]
  
  const records: CleaningRecord[] = []
  const start = dayjs(startTime)
  const end = dayjs(endTime)
  
  // 根据时间范围生成记录数量
  const days = end.diff(start, 'days')
  const recordCount = Math.min(days, 50) // 最多50条记录
  
  for (let i = 0; i < recordCount; i++) {
    const cleaningTime = start.add(Math.floor(Math.random() * days), 'days')
      .add(Math.floor(Math.random() * 12) + 8, 'hours') // 8-20点之间
      .add(Math.floor(Math.random() * 60), 'minutes')
    
    const submitTime = cleaningTime.add(
      Math.floor(Math.random() * 10) + 1, 'hours'
    ) // 提交时间晚于清洗时间
    
    records.push({
      id: `record_${stationId}_${i + 1}`,
      stationId: station.stationId,
      stationName: station.stationName,
      cleaningTime: cleaningTime.format('YYYY-MM-DD HH:mm:ss'),
      cleaningMethod: cleaningMethods[Math.floor(Math.random() * cleaningMethods.length)],
      cleaningArea: Math.floor(Math.random() * 2000) + 500, // 500-2500平方米
      cleaningPersonnel: cleaningPersonnels[Math.floor(Math.random() * cleaningPersonnels.length)],
      cleaningCost: Math.random() > 0.3 ? Math.floor(Math.random() * 1000) + 200 : undefined, // 200-1200元
      submitter: submitters[Math.floor(Math.random() * submitters.length)],
      submitTime: submitTime.format('YYYY-MM-DD HH:mm:ss'),
      remark: Math.random() > 0.5 ? 
        ['定期清洗', '积尘较重，深度清洗', '雨后补充清洗', '维护性清洗', '季度清洗'][
          Math.floor(Math.random() * 5)
        ] : undefined
    })
  }
  
  // 按清洗时间倒序排列
  records.sort((a, b) => dayjs(b.cleaningTime).valueOf() - dayjs(a.cleaningTime).valueOf())
  
  // 分页处理
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  return records.slice(startIndex, endIndex)
}

// Mock API响应函数
export const getMockCleaningRecordsResponse = (
  stationId: string,
  startTime: string, 
  endTime: string,
  page: number = 1,
  pageSize: number = 20
): GetCleaningRecordsResponse => {
  
  const allRecords = generateMockCleaningRecords(stationId, startTime, endTime, 1, 1000)
  const totalRecords = allRecords.length
  const records = generateMockCleaningRecords(stationId, startTime, endTime, page, pageSize)
  
  return {
    code: 200,
    data: {
      records,
      pagination: {
        total: totalRecords,
        page,
        pageSize,
        totalPages: Math.ceil(totalRecords / pageSize)
      }
    },
    message: '查询成功'
  }
}

export const getMockStationsResponse = (): GetStationsResponse => {
  
  return {
    code: 200,
    data: {
      stations: generateMockStations()
    },
    message: '电站列表获取成功'
  }
}

export const createMockCleaningRecordResponse = (recordData: any): CreateCleaningRecordResponse => {
  
  return {
    code: 200,
    data: {
      recordId: `record_${Date.now()}`
    },
    message: '清洗记录添加成功'
  }
}

export const updateMockCleaningRecordResponse = (recordId: string, updateData: any): UpdateCleaningRecordResponse => {
  console.log('Mock API: 更新清洗记录', { recordId, updateData })
  
  return {
    code: 200,
    data: {
      recordId,
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    },
    message: '清洗记录更新成功'
  }
}

export const deleteMockCleaningRecordResponse = (recordId: string): DeleteCleaningRecordResponse => {
  console.log('Mock API: 删除清洗记录', recordId)
  
  return {
    code: 200,
    data: {
      recordId
    },
    message: '清洗记录删除成功'
  }
}

// 空数据Mock
export const getMockEmptyRecordsResponse = (): GetCleaningRecordsResponse => {
  return {
    code: 200,
    data: {
      records: [],
      pagination: {
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      }
    },
    message: '暂无清洗记录'
  }
}
