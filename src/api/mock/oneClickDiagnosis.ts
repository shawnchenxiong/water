/**
 * 一键诊断Mock数据
 */

import type {
  OneClickDiagnosisResult,
  DiagnosisProgress,
  DiagnosisHistoryResponse,
  DiagnosisConfigResponse,
  ExecuteDiagnosisResponse,
  AbnormalObject
} from '@/api/types/diagnosis'

/** 正常状态的一键诊断Mock数据 */
export const mockOneClickDiagnosisNormal: OneClickDiagnosisResult = {
  stationId: 'station001',
  stationName: '芜湖南亭市后水灯',
  overallScore: 100,
  diagnosisTime: '2024-09-11 06:49:23',
  abnormalCount: 0,
  diagnosisStatus: 'completed',
  categories: [
    {
      categoryId: 'communication',
      categoryName: '通讯诊断',
      categoryIcon: 'communication',
      items: [
        {
          itemId: 'inv_comm_error',
          itemName: '逆变器通讯中断',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '逆变器通讯状态正常',
          detailUrl: '/intelligent-diagnosis/communication/inverter'
        },
        {
          itemId: 'meter_comm_error',
          itemName: '电表通讯中断',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '电表通讯状态正常',
          detailUrl: '/intelligent-diagnosis/communication/meter'
        },
        {
          itemId: 'weather_comm_error',
          itemName: '气象站通讯中断',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '气象站通讯状态正常',
          detailUrl: '/intelligent-diagnosis/communication/weather'
        },
        {
          itemId: 'combiner_comm_error',
          itemName: '汇流箱通讯中断',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '汇流箱通讯状态正常',
          detailUrl: '/intelligent-diagnosis/communication/combiner'
        }
      ]
    },
    {
      categoryId: 'data_quality',
      categoryName: '数据诊断',
      categoryIcon: 'data',
      items: [
        {
          itemId: 'inv_data_abnormal',
          itemName: '逆变器数据异常',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '逆变器数据质量正常',
          detailUrl: '/intelligent-diagnosis/data-quality/inverter-data'
        },
        {
          itemId: 'weather_data_abnormal',
          itemName: '气象站数据异常',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '气象数据质量正常',
          detailUrl: '/intelligent-diagnosis/data-quality/weather-data'
        },
        {
          itemId: 'inv_power_abnormal',
          itemName: '逆变器发电异常类',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '逆变器发电量正常',
          detailUrl: '/intelligent-diagnosis/data-quality/inverter-power'
        },
        {
          itemId: 'meter_power_abnormal',
          itemName: '电能表发电异常类',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '电能计量正常',
          detailUrl: '/intelligent-diagnosis/data-quality/meter-power'
        }
      ]
    },
    {
      categoryId: 'device_operation',
      categoryName: '设备诊断',
      categoryIcon: 'device',
      items: [
        {
          itemId: 'inv_shutdown',
          itemName: '逆变器停机',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '逆变器运行正常',
          detailUrl: '/intelligent-diagnosis/device-operation/inverter-shutdown'
        },
        {
          itemId: 'inv_pv1_disconnect',
          itemName: '逆变器PV1组串断路',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: 'PV1组串连接正常',
          detailUrl: '/intelligent-diagnosis/device-operation/pv1-disconnect'
        },
        {
          itemId: 'inv_pv2_disconnect',
          itemName: '逆变器PV2组串断路',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: 'PV2组串连接正常',
          detailUrl: '/intelligent-diagnosis/device-operation/pv2-disconnect'
        },
        {
          itemId: 'inv_pv3_disconnect',
          itemName: '逆变器PV3组串断路',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: 'PV3组串连接正常',
          detailUrl: '/intelligent-diagnosis/device-operation/pv3-disconnect'
        },
        {
          itemId: 'inv_pv4_disconnect',
          itemName: '逆变器PV4组串断路',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: 'PV4组串连接正常',
          detailUrl: '/intelligent-diagnosis/device-operation/pv4-disconnect'
        },
        {
          itemId: 'inv_pv5_disconnect',
          itemName: '逆变器PV5组串断路',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: 'PV5组串连接正常',
          detailUrl: '/intelligent-diagnosis/device-operation/pv5-disconnect'
        }
      ]
    }
  ]
}

/** 有异常状态的一键诊断Mock数据 */
export const mockOneClickDiagnosisWithErrors: OneClickDiagnosisResult = {
  stationId: 'station001',
  stationName: '芜湖南亭市后水灯',
  overallScore: 45,
  diagnosisTime: '2024-09-11 06:49:23',
  abnormalCount: 8,
  diagnosisStatus: 'completed',
  categories: [
    {
      categoryId: 'communication',
      categoryName: '通讯诊断',
      categoryIcon: 'communication',
      items: [
        {
          itemId: 'inv_comm_error',
          itemName: '逆变器通讯中断',
          status: 'error',
          statusText: '异常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '检测到5台逆变器通讯中断',
          abnormalCount: 5,
          detailUrl: '/intelligent-diagnosis/communication/inverter'
        },
        {
          itemId: 'meter_comm_error',
          itemName: '电表通讯中断',
          status: 'error',
          statusText: '异常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '检测到2台电表通讯中断',
          abnormalCount: 2,
          detailUrl: '/intelligent-diagnosis/communication/meter'
        },
        {
          itemId: 'weather_comm_error',
          itemName: '气象站通讯中断',
          status: 'error',
          statusText: '异常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '气象站通讯完全中断',
          abnormalCount: 1,
          detailUrl: '/intelligent-diagnosis/communication/weather'
        },
        {
          itemId: 'combiner_comm_error',
          itemName: '汇流箱通讯中断',
          status: 'warning',
          statusText: '警告',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '部分汇流箱通讯不稳定',
          abnormalCount: 3,
          detailUrl: '/intelligent-diagnosis/communication/combiner'
        }
      ]
    },
    {
      categoryId: 'data_quality',
      categoryName: '数据诊断',
      categoryIcon: 'data',
      items: [
        {
          itemId: 'inv_data_abnormal',
          itemName: '逆变器数据异常',
          status: 'error',
          statusText: '异常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '检测到3台逆变器数据异常',
          abnormalCount: 3,
          detailUrl: '/intelligent-diagnosis/data-quality/inverter-data'
        },
        {
          itemId: 'weather_data_abnormal',
          itemName: '气象站数据异常',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '气象数据质量正常',
          detailUrl: '/intelligent-diagnosis/data-quality/weather-data'
        },
        {
          itemId: 'inv_power_abnormal',
          itemName: '逆变器发电异常类',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '逆变器发电量正常',
          detailUrl: '/intelligent-diagnosis/data-quality/inverter-power'
        },
        {
          itemId: 'meter_power_abnormal',
          itemName: '电能表发电异常类',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '电能计量正常',
          detailUrl: '/intelligent-diagnosis/data-quality/meter-power'
        }
      ]
    },
    {
      categoryId: 'device_operation',
      categoryName: '设备诊断',
      categoryIcon: 'device',
      items: [
        {
          itemId: 'inv_shutdown',
          itemName: '逆变器停机',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '逆变器运行正常',
          detailUrl: '/intelligent-diagnosis/device-operation/inverter-shutdown'
        },
        {
          itemId: 'inv_pv1_disconnect',
          itemName: '逆变器PV1组串断路',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: 'PV1组串连接正常',
          detailUrl: '/intelligent-diagnosis/device-operation/pv1-disconnect'
        },
        {
          itemId: 'inv_pv2_disconnect',
          itemName: '逆变器PV2组串断路',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: 'PV2组串连接正常',
          detailUrl: '/intelligent-diagnosis/device-operation/pv2-disconnect'
        },
        {
          itemId: 'inv_pv3_disconnect',
          itemName: '逆变器PV3组串断路',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: 'PV3组串连接正常',
          detailUrl: '/intelligent-diagnosis/device-operation/pv3-disconnect'
        },
        {
          itemId: 'inv_pv4_disconnect',
          itemName: '逆变器PV4组串断路',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: 'PV4组串连接正常',
          detailUrl: '/intelligent-diagnosis/device-operation/pv4-disconnect'
        },
        {
          itemId: 'inv_pv5_disconnect',
          itemName: '逆变器PV5组串断路',
          status: 'normal',
          statusText: '正常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: 'PV5组串连接正常',
          detailUrl: '/intelligent-diagnosis/device-operation/pv5-disconnect'
        }
      ]
    }
  ],
  /** 异常对象列表 */
  abnormalObjects: [
    {
      objectId: 'INV-001',
      objectName: 'GA-N0103',
      objectType: '逆变器',
      abnormalType: '通讯中断',
      abnormalDescription: '设备通讯异常，无法获取数据',
      diagnosisItemId: 'inv_comm_error'
    },
    {
      objectId: 'INV-002',
      objectName: 'GA-N0104',
      objectType: '逆变器',
      abnormalType: '通讯中断',
      abnormalDescription: '设备通讯异常，无法获取数据',
      diagnosisItemId: 'inv_comm_error'
    },
    {
      objectId: 'INV-003',
      objectName: 'GA-N0105',
      objectType: '逆变器',
      abnormalType: '通讯中断',
      abnormalDescription: '设备通讯异常，无法获取数据',
      diagnosisItemId: 'inv_comm_error'
    },
    {
      objectId: 'INV-004',
      objectName: 'GA-N0106',
      objectType: '逆变器',
      abnormalType: '数据异常',
      abnormalDescription: '输出功率数据异常波动',
      diagnosisItemId: 'inv_data_abnormal'
    },
    {
      objectId: 'INV-005',
      objectName: 'GA-N0107',
      objectType: '逆变器',
      abnormalType: '数据异常',
      abnormalDescription: '输出功率数据异常波动',
      diagnosisItemId: 'inv_data_abnormal'
    },
    {
      objectId: 'WEATHER-001',
      objectName: 'WS-001',
      objectType: '气象站',
      abnormalType: '通讯中断',
      abnormalDescription: '气象站数据更新延迟',
      diagnosisItemId: 'weather_comm_error'
    },
    {
      objectId: 'METER-001',
      objectName: 'EM-001',
      objectType: '电表',
      abnormalType: '通讯中断',
      abnormalDescription: '电表通讯异常',
      diagnosisItemId: 'meter_comm_error'
    },
    {
      objectId: 'COMBINER-001',
      objectName: 'CB-001',
      objectType: '汇流箱',
      abnormalType: '通讯不稳定',
      abnormalDescription: '汇流箱通讯间歇性中断',
      diagnosisItemId: 'combiner_comm_error'
    }
  ]
}

/** 诊断执行响应Mock数据 */
export const mockExecuteDiagnosisResponse: ExecuteDiagnosisResponse = {
  taskId: 'task_001',
  estimatedTime: 300
}

/** 诊断进度Mock数据 */
export const mockDiagnosisProgress: DiagnosisProgress = {
  taskId: 'task_001',
  status: 'running',
  progress: 65,
  currentItem: '逆变器通讯检查',
  completedItems: 8,
  totalItems: 14,
  startTime: '2024-09-11 06:45:00',
  estimatedEndTime: '2024-09-11 06:50:00'
}

/** 诊断历史记录Mock数据 */
export const mockDiagnosisHistory: DiagnosisHistoryResponse = {
  records: [
    {
      diagnosisId: 'diag_001',
      diagnosisTime: '2024-09-11 06:49:23',
      overallScore: 100,
      abnormalCount: 0,
      status: 'completed',
      duration: 180
    },
    {
      diagnosisId: 'diag_002',
      diagnosisTime: '2024-09-10 14:30:15',
      overallScore: 85,
      abnormalCount: 2,
      status: 'completed',
      duration: 195
    },
    {
      diagnosisId: 'diag_003',
      diagnosisTime: '2024-09-09 09:15:42',
      overallScore: 92,
      abnormalCount: 1,
      status: 'completed',
      duration: 165
    }
  ],
  pagination: {
    current: 1,
    pageSize: 10,
    total: 25,
    totalPages: 3
  }
}

/** 高异常率的一键诊断Mock数据 */
export const mockOneClickDiagnosisHighErrors: OneClickDiagnosisResult = {
  stationId: 'station001',
  stationName: '芜湖南亭市后水灯',
  overallScore: 35,
  diagnosisTime: '2024-09-11 06:49:23',
  abnormalCount: 12,
  diagnosisStatus: 'completed',
  categories: [
    {
      categoryId: 'communication',
      categoryName: '通讯诊断',
      categoryIcon: 'communication',
      items: [
        {
          itemId: 'inv_comm_error',
          itemName: '逆变器通讯中断',
          status: 'error',
          statusText: '异常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '检测到12台逆变器通讯中断',
          abnormalCount: 12,
          detailUrl: '/intelligent-diagnosis/communication/inverter'
        },
        {
          itemId: 'meter_comm_error',
          itemName: '电表通讯中断',
          status: 'error',
          statusText: '异常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '检测到5台电表通讯中断',
          abnormalCount: 5,
          detailUrl: '/intelligent-diagnosis/communication/meter'
        },
        {
          itemId: 'weather_comm_error',
          itemName: '气象站通讯中断',
          status: 'error',
          statusText: '异常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '气象站通讯完全中断',
          abnormalCount: 2,
          detailUrl: '/intelligent-diagnosis/communication/weather'
        },
        {
          itemId: 'combiner_comm_error',
          itemName: '汇流箱通讯中断',
          status: 'error',
          statusText: '异常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '检测到8台汇流箱通讯故障',
          abnormalCount: 8,
          detailUrl: '/intelligent-diagnosis/communication/combiner'
        }
      ]
    },
    {
      categoryId: 'data_quality',
      categoryName: '数据诊断',
      categoryIcon: 'data',
      items: [
        {
          itemId: 'inv_data_abnormal',
          itemName: '逆变器数据异常',
          status: 'error',
          statusText: '异常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '检测到15台逆变器数据异常',
          abnormalCount: 15,
          detailUrl: '/intelligent-diagnosis/data-quality/inverter-data'
        },
        {
          itemId: 'weather_data_abnormal',
          itemName: '气象站数据异常',
          status: 'error',
          statusText: '异常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '辐照度和温度数据严重异常',
          abnormalCount: 2,
          detailUrl: '/intelligent-diagnosis/data-quality/weather-data'
        },
        {
          itemId: 'inv_power_abnormal',
          itemName: '逆变器发电异常类',
          status: 'error',
          statusText: '异常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '检测到18台逆变器发电异常',
          abnormalCount: 18,
          detailUrl: '/intelligent-diagnosis/data-quality/inverter-power'
        },
        {
          itemId: 'meter_power_abnormal',
          itemName: '电能表发电异常类',
          status: 'error',
          statusText: '异常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '电能表计量严重偏差',
          abnormalCount: 3,
          detailUrl: '/intelligent-diagnosis/data-quality/meter-power'
        }
      ]
    },
    {
      categoryId: 'device_operation',
      categoryName: '设备诊断',
      categoryIcon: 'device',
      items: [
        {
          itemId: 'inv_shutdown',
          itemName: '逆变器停机',
          status: 'error',
          statusText: '异常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '检测到6台逆变器停机',
          abnormalCount: 6,
          detailUrl: '/intelligent-diagnosis/device-operation/inverter-shutdown'
        },
        {
          itemId: 'inv_pv1_disconnect',
          itemName: '逆变器PV1组串断路',
          status: 'error',
          statusText: '异常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '检测到4台逆变器PV1组串断路',
          abnormalCount: 4,
          detailUrl: '/intelligent-diagnosis/device-operation/pv1-disconnect'
        },
        {
          itemId: 'inv_pv2_disconnect',
          itemName: '逆变器PV2组串断路',
          status: 'error',
          statusText: '异常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '检测到3台逆变器PV2组串断路',
          abnormalCount: 3,
          detailUrl: '/intelligent-diagnosis/device-operation/pv2-disconnect'
        },
        {
          itemId: 'inv_pv3_disconnect',
          itemName: '逆变器PV3组串断路',
          status: 'warning',
          statusText: '警告',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '检测到2台逆变器PV3组串异常',
          abnormalCount: 2,
          detailUrl: '/intelligent-diagnosis/device-operation/pv3-disconnect'
        },
        {
          itemId: 'inv_pv4_disconnect',
          itemName: '逆变器PV4组串断路',
          status: 'error',
          statusText: '异常',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '检测到5台逆变器PV4组串断路',
          abnormalCount: 5,
          detailUrl: '/intelligent-diagnosis/device-operation/pv4-disconnect'
        },
        {
          itemId: 'inv_pv5_disconnect',
          itemName: '逆变器PV5组串断路',
          status: 'warning',
          statusText: '警告',
          lastCheckTime: '2024-09-11 06:49:23',
          description: '检测到1台逆变器PV5组串异常',
          abnormalCount: 1,
          detailUrl: '/intelligent-diagnosis/device-operation/pv5-disconnect'
        }
      ]
    }
  ],
  /** 异常对象列表 */
  abnormalObjects: [
    // 通讯中断异常对象
    {
      objectId: 'INV-001',
      objectName: 'GA-N0101',
      objectType: '逆变器',
      abnormalType: '通讯中断',
      abnormalDescription: '设备通讯完全中断',
      diagnosisItemId: 'inv_comm_error'
    },
    {
      objectId: 'INV-002',
      objectName: 'GA-N0102',
      objectType: '逆变器',
      abnormalType: '通讯中断',
      abnormalDescription: '设备通讯完全中断',
      diagnosisItemId: 'inv_comm_error'
    },
    {
      objectId: 'INV-003',
      objectName: 'GA-N0103',
      objectType: '逆变器',
      abnormalType: '通讯中断',
      abnormalDescription: '设备通讯完全中断',
      diagnosisItemId: 'inv_comm_error'
    },
    {
      objectId: 'METER-001',
      objectName: 'EM-001',
      objectType: '电表',
      abnormalType: '通讯中断',
      abnormalDescription: '电表通讯完全中断',
      diagnosisItemId: 'meter_comm_error'
    },
    {
      objectId: 'METER-002',
      objectName: 'EM-002',
      objectType: '电表',
      abnormalType: '通讯中断',
      abnormalDescription: '电表通讯完全中断',
      diagnosisItemId: 'meter_comm_error'
    },
    {
      objectId: 'WEATHER-001',
      objectName: 'WS-001',
      objectType: '气象站',
      abnormalType: '通讯中断',
      abnormalDescription: '气象站通讯完全中断',
      diagnosisItemId: 'weather_comm_error'
    },
    {
      objectId: 'COMBINER-001',
      objectName: 'CB-001',
      objectType: '汇流箱',
      abnormalType: '通讯中断',
      abnormalDescription: '汇流箱通讯故障',
      diagnosisItemId: 'combiner_comm_error'
    },
    // 数据异常对象
    {
      objectId: 'INV-011',
      objectName: 'GA-N0111',
      objectType: '逆变器',
      abnormalType: '数据异常',
      abnormalDescription: '输出功率数据严重异常',
      diagnosisItemId: 'inv_data_abnormal'
    },
    {
      objectId: 'INV-012',
      objectName: 'GA-N0112',
      objectType: '逆变器',
      abnormalType: '数据异常',
      abnormalDescription: '输出功率数据严重异常',
      diagnosisItemId: 'inv_data_abnormal'
    },
    {
      objectId: 'INV-013',
      objectName: 'GA-N0113',
      objectType: '逆变器',
      abnormalType: '发电异常',
      abnormalDescription: '逆变器发电量严重偏低',
      diagnosisItemId: 'inv_power_abnormal'
    },
    // 设备停机异常对象
    {
      objectId: 'INV-021',
      objectName: 'GA-N0121',
      objectType: '逆变器',
      abnormalType: '设备停机',
      abnormalDescription: '逆变器停机故障',
      diagnosisItemId: 'inv_shutdown'
    },
    {
      objectId: 'INV-022',
      objectName: 'GA-N0122',
      objectType: '逆变器',
      abnormalType: '组串断路',
      abnormalDescription: 'PV1组串断路',
      diagnosisItemId: 'inv_pv1_disconnect'
    }
  ]
}

/** 诊断配置Mock数据 */
export const mockDiagnosisConfig: DiagnosisConfigResponse = {
  diagnosisItems: [
    {
      itemId: 'inv_comm_error',
      itemName: '逆变器通讯中断',
      category: 'communication',
      enabled: true,
      weight: 10,
      thresholds: {
        timeout: 300,
        warningLevel: 60,
        errorLevel: 300
      }
    },
    {
      itemId: 'meter_comm_error',
      itemName: '电表通讯中断',
      category: 'communication',
      enabled: true,
      weight: 10,
      thresholds: {
        timeout: 300,
        warningLevel: 60,
        errorLevel: 300
      }
    },
    {
      itemId: 'weather_comm_error',
      itemName: '气象站通讯中断',
      category: 'communication',
      enabled: true,
      weight: 10,
      thresholds: {
        timeout: 300,
        warningLevel: 60,
        errorLevel: 300
      }
    },
    {
      itemId: 'combiner_comm_error',
      itemName: '汇流箱通讯中断',
      category: 'communication',
      enabled: true,
      weight: 10,
      thresholds: {
        timeout: 300,
        warningLevel: 60,
        errorLevel: 300
      }
    }
  ]
}

