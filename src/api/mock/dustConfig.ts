import type { 
  DustDiagnosisConfig, 
  ConfigHistory, 
  GetConfigResponse, 
  UpdateConfigResponse, 
  ResetConfigResponse, 
  GetConfigHistoryResponse 
} from '@/api/types/diagnosis/dustConfig'
import dayjs from 'dayjs'

/**
 * 积尘诊断配置 Mock 数据
 */

// 默认配置值
export const defaultConfigs: Record<string, number | string> = {
  '清洗成本': 4,
  '积尘基准系数': 1,
  '积尘诊断阈值': 30,
  '电站气候系数': '-',
  '空气质量系数': 0.5,
  '倾斜影响系数': 0.5,
  '安装位置系数': 0.8,
  '积尘损失计算月数': 3,
  '电站积尘损失率阈值': 15,
  '除计算基准时算系数': 100,
  '雨量标准': 20,
  '设备积尘损失率阈值': 20,
}

// 生成配置参数Mock数据
export const generateMockConfigs = (): DustDiagnosisConfig[] => {
  return [
    {
      id: 'config001',
      paramName: '清洗成本',
      paramValue: 4,
      paramUnit: '元/kWp',
      modifier: null,
      modifyTime: null,
      description: '电站清洗费用,包括人工费等设备损耗,电力消耗,设备折旧等',
      category: '成本参数',
      valueType: 'number',
      minValue: 0,
      maxValue: 100,
      required: true,
      editable: true,
    },
    {
      id: 'config002',
      paramName: '积尘基准系数',
      paramValue: 1,
      paramUnit: '-',
      modifier: null,
      modifyTime: null,
      description: '积尘基准系数',
      category: '计算参数',
      valueType: 'number',
      minValue: 0.1,
      maxValue: 10,
      required: true,
      editable: true,
    },
    {
      id: 'config003',
      paramName: '积尘诊断阈值',
      paramValue: 30,
      paramUnit: '%',
      modifier: null,
      modifyTime: null,
      description: '电站积尘诊断阈值',
      category: '诊断阈值',
      valueType: 'number',
      minValue: 5,
      maxValue: 50,
      required: true,
      editable: true,
    },
    {
      id: 'config004',
      paramName: '电站气候系数',
      paramValue: '-',
      paramUnit: '-',
      modifier: null,
      modifyTime: null,
      description: '电站所在位置气候影响系数,并根据季风气候-1.0,热带季风气候-1.2,温...',
      category: '环境系数',
      valueType: 'string',
      required: false,
      editable: false,
    },
    {
      id: 'config005',
      paramName: '空气质量系数',
      paramValue: 0.5,
      paramUnit: '-',
      modifier: null,
      modifyTime: null,
      description: '电站所在空气质量系数',
      category: '环境系数',
      valueType: 'number',
      minValue: 0.1,
      maxValue: 2.0,
      required: true,
      editable: true,
    },
    {
      id: 'config006',
      paramName: '倾斜影响系数',
      paramValue: 0.5,
      paramUnit: '-',
      modifier: null,
      modifyTime: null,
      description: '电站光伏板倾斜影响系数',
      category: '环境系数',
      valueType: 'number',
      minValue: 0.1,
      maxValue: 1.0,
      required: true,
      editable: true,
    },
    {
      id: 'config007',
      paramName: '安装位置系数',
      paramValue: 0.8,
      paramUnit: '-',
      modifier: null,
      modifyTime: null,
      description: '电站安装位置系数,水面或空气质量好≤0.6-0.8,校园或政≤0.9-1.0,工业...',
      category: '环境系数',
      valueType: 'number',
      minValue: 0.1,
      maxValue: 2.0,
      required: true,
      editable: true,
    },
    {
      id: 'config008',
      paramName: '积尘损失计算月数',
      paramValue: 3,
      paramUnit: '-',
      modifier: null,
      modifyTime: null,
      description: '积尘损失计算月数',
      category: '计算参数',
      valueType: 'number',
      minValue: 1,
      maxValue: 12,
      required: true,
      editable: true,
    },
    {
      id: 'config009',
      paramName: '电站积尘损失率阈值',
      paramValue: 15,
      paramUnit: '%',
      modifier: null,
      modifyTime: null,
      description: '电站积尘损失率阈值',
      category: '诊断阈值',
      valueType: 'number',
      minValue: 5,
      maxValue: 30,
      required: true,
      editable: true,
    },
    {
      id: 'config010',
      paramName: '除计算基准时算系数',
      paramValue: 100,
      paramUnit: 'W/m²',
      modifier: null,
      modifyTime: null,
      description: '修正功率的计算系数',
      category: '计算参数',
      valueType: 'number',
      minValue: 50,
      maxValue: 200,
      required: true,
      editable: true,
    },
    {
      id: 'config011',
      paramName: '雨量标准',
      paramValue: 20,
      paramUnit: '毫米',
      modifier: null,
      modifyTime: null,
      description: '修改雨量的雨量标准',
      category: '计算参数',
      valueType: 'number',
      minValue: 5,
      maxValue: 50,
      required: true,
      editable: true,
    },
    {
      id: 'config012',
      paramName: '设备积尘损失率阈值',
      paramValue: 20,
      paramUnit: '%',
      modifier: null,
      modifyTime: null,
      description: '设备积尘损失率阈值',
      category: '诊断阈值',
      valueType: 'number',
      minValue: 10,
      maxValue: 40,
      required: true,
      editable: true,
    },
  ]
}

// 生成配置修改历史Mock数据
export const generateMockConfigHistory = (): ConfigHistory[] => {
  const configs = generateMockConfigs()
  const history: ConfigHistory[] = []

  configs.forEach((config, index) => {
    if (index < 3) { // 只为前3个配置生成历史记录
      history.push({
        id: `history_${config.id}`,
        configId: config.id,
        paramName: config.paramName,
        oldValue: typeof config.paramValue === 'number' ? config.paramValue - 1 : config.paramValue,
        newValue: config.paramValue,
        modifier: 'admin',
        modifyTime: dayjs().subtract(index + 1, 'day').format('YYYY-MM-DD HH:mm:ss'),
        remark: `调整${config.paramName}参数`,
      })
    }
  })

  return history
}

// Mock API响应函数
export const getMockConfigsResponse = (): GetConfigResponse => {
  return {
    code: 200,
    data: {
      configs: generateMockConfigs(),
    },
    message: '配置获取成功',
  }
}

export const updateMockConfigsResponse = (updatedConfigs: any[]): UpdateConfigResponse => {
  return {
    code: 200,
    data: {
      updatedCount: updatedConfigs.length,
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    },
    message: '配置更新成功',
  }
}

export const resetMockConfigsResponse = (configIds: string[]): ResetConfigResponse => {
  return {
    code: 200,
    data: {
      resetCount: configIds.length,
      resetTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    },
    message: '配置重置成功',
  }
}

export const getMockConfigHistoryResponse = (params: any): GetConfigHistoryResponse => {
  const allHistory = generateMockConfigHistory()
  const { page = 1, pageSize = 20 } = params
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const history = allHistory.slice(startIndex, endIndex)
  
  return {
    code: 200,
    data: {
      history,
      pagination: {
        total: allHistory.length,
        page,
        pageSize,
        totalPages: Math.ceil(allHistory.length / pageSize),
      },
    },
    message: '历史记录获取成功',
  }
}
