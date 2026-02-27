/**
 * 工单管理 Mock 数据
 * @description 提供工单管理功能的模拟数据
 */

import type {
  WorkOrder,
  WorkOrderType,
  WorkOrderUser,
  WorkflowConfig,
  WorkOrderBasicDataResponse,
  WorkOrderListResponse,
} from '../types/work-order'

/**
 * 工单类型数据
 */
export const mockWorkOrderTypes: WorkOrderType[] = [
  {
    value: '检修工单',
    label: '检修工单',
    icon: 'repair',
    color: '#e74c3c',
  },
  {
    value: '维护工单',
    label: '维护工单',
    icon: 'maintenance',
    color: '#3498db',
  },
  {
    value: '巡检工单',
    label: '巡检工单',
    icon: 'inspection',
    color: '#f39c12',
  },
  {
    value: '清洁工单',
    label: '清洁工单',
    icon: 'cleaning',
    color: '#27ae60',
  },
  {
    value: '其他工单',
    label: '其他工单',
    icon: 'other',
    color: '#9b59b6',
  },
]

/**
 * 用户数据
 */
export const mockUsers: WorkOrderUser[] = [
  {
    id: 'user001',
    name: '张三',
    role: '运维工程师',
    department: '运维部'
  },
  {
    id: 'user002',
    name: '李四',
    role: '运维主管',
    department: '运维部'
  },
  {
    id: 'user003',
    name: '王五',
    role: '技术员',
    department: '技术部'
  },
  {
    id: 'supervisor001',
    name: '运维主管',
    role: '主管',
    department: '运维部'
  }
]

/**
 * 工作流配置
 */
export const mockWorkflowConfig: WorkflowConfig = {
  nodes: [
    {
      id: 'start',
      name: '开始',
      type: 'start',
      x: 50,
      y: 150,
    },
    {
      id: 'assign',
      name: '分派',
      type: 'task',
      x: 250,
      y: 150,
      assignedUsers: ['supervisor001']
    },
    {
      id: 'countersign',
      name: '会签',
      type: 'countersign',
      x: 450,
      y: 80,
      assignedUsers: ['user001', 'user002', 'supervisor001']
    },
    {
      id: 'approve',
      name: '审批',
      type: 'approve',
      x: 450,
      y: 220,
      assignedUsers: ['supervisor001']
    },
    {
      id: 'final_approve',
      name: '终审',
      type: 'approve',
      x: 650,
      y: 150,
      assignedUsers: ['supervisor001']
    },
    {
      id: 'end',
      name: '结束',
      type: 'end',
      x: 780,
      y: 150,
    },
  ],
  edges: [
    {
      id: 'edge1',
      source: 'start',
      target: 'assign',
    },
    {
      id: 'edge2',
      source: 'assign',
      target: 'countersign',
    },
    {
      id: 'edge3',
      source: 'assign',
      target: 'approve',
    },
    {
      id: 'edge4',
      source: 'countersign',
      target: 'final_approve',
    },
    {
      id: 'edge5',
      source: 'approve',
      target: 'final_approve',
    },
    {
      id: 'edge6',
      source: 'final_approve',
      target: 'end',
    },
  ],
}

/**
 * 工单数据
 */
export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'wo001',
    serialNumber: 1,
    stationName: '芜湖城南污水厂',
    stationId: 'LHYR98NH00000014',
    workOrderType: '检修工单',
    workOrderSource: '运维计划',
    workOrderNumber: 'WO202510210001',
    workOrderDescription: '1#逆变器定期维护检修，检查设备运行状态，清理设备表面灰尘，检测电气连接',
    flowStatus: '处理中',
    statusColor: '#3498db',
    currentProcessor: '张三',
    currentProcessorId: 'user001',
    startTime: '2025-10-21 08:00:00',
    endTime: '2025-10-21 18:00:00',
    actualStartTime: '2025-10-21 08:30:00',
    actualEndTime: '',
    createTime: '2025-10-20 15:00:00',
    creator: '系统',
    creatorId: 'system',
    workOrderLevel: '常规',
    enableAlert: false,
    processingAdvice: '注意设备断电操作，确保人员安全',
    attachments: ['maintenance_plan.pdf'],
    isMerged: false,
    plannedCompletionTime: '2025-10-21 18:00:00',
    actualCompletionTime: undefined,
    priority: '中',
    workOrderObjects: [
      {
        id: 'obj001',
        objectType: '逆变器',
        objectName: '1#逆变器',
        objectId: 'INV001',
        description: '需要进行定期维护检查'
      }
    ],
    flowRecords: [
      {
        id: 'record001',
        workOrderId: 'wo001',
        nodeId: 'node001',
        nodeName: '创建',
        processor: '系统',
        processorId: 'system',
        action: '创建',
        processingComment: '系统自动创建工单',
        processTime: '2025-10-20 15:00:00',
        attachments: []
      },
      {
        id: 'record002',
        workOrderId: 'wo001',
        nodeId: 'node002',
        nodeName: '分派',
        processor: '运维主管',
        processorId: 'supervisor001',
        action: '分派',
        processingComment: '分派给张三处理',
        processTime: '2025-10-20 16:00:00',
        attachments: []
      }
    ]
  },
  {
    id: 'wo002',
    serialNumber: 2,
    stationName: '芜湖城南污水厂',
    stationId: 'LHYR98NH00000014',
    workOrderType: '维护工单',
    workOrderSource: '告警触发',
    workOrderNumber: 'WO202510210002',
    workOrderDescription: '电能表通讯异常，需要检查通讯线路和设备状态',
    flowStatus: '待分派',
    statusColor: '#f39c12',
    currentProcessor: '待分派',
    currentProcessorId: '',
    startTime: '2025-10-21 10:00:00',
    endTime: '2025-10-21 16:00:00',
    actualStartTime: '',
    actualEndTime: '',
    createTime: '2025-10-21 09:30:00',
    creator: '告警系统',
    creatorId: 'alarm_system',
    workOrderLevel: '紧急',
    enableAlert: true,
    processingAdvice: '优先处理，影响发电量统计',
    attachments: [],
    isMerged: false,
    plannedCompletionTime: '2025-10-21 16:00:00',
    actualCompletionTime: undefined,
    priority: '高',
    workOrderObjects: [],
    flowRecords: [
      {
        id: 'record003',
        workOrderId: 'wo002',
        nodeId: 'node001',
        nodeName: '创建',
        processor: '告警系统',
        processorId: 'alarm_system',
        action: '创建',
        processingComment: '告警自动创建工单',
        processTime: '2025-10-21 09:30:00',
        attachments: []
      }
    ]
  },
  {
    id: 'wo003',
    serialNumber: 3,
    stationName: '亳州利辛县城污水厂',
    stationId: 'LHYR98NH00000003',
    workOrderType: '巡检工单',
    workOrderSource: '定期巡检',
    workOrderNumber: 'WO202510210003',
    workOrderDescription: '月度例行巡检，检查所有设备运行状态',
    flowStatus: '已完成',
    statusColor: '#27ae60',
    currentProcessor: '张三',
    currentProcessorId: 'user001',
    startTime: '2025-10-20 09:00:00',
    endTime: '2025-10-20 17:00:00',
    actualStartTime: '2025-10-20 09:15:00',
    actualEndTime: '2025-10-20 16:45:00',
    createTime: '2025-10-19 14:00:00',
    creator: '运维主管',
    creatorId: 'supervisor001',
    workOrderLevel: '常规',
    enableAlert: false,
    processingAdvice: '按照巡检清单逐项检查',
    attachments: ['inspection_checklist.pdf'],
    isMerged: false,
    plannedCompletionTime: '2025-10-20 17:00:00',
    actualCompletionTime: '2025-10-20 16:45:00',
    priority: '低',
    workOrderObjects: [],
    flowRecords: [
      {
        id: 'record004',
        workOrderId: 'wo003',
        nodeId: 'node001',
        nodeName: '创建',
        processor: '运维主管',
        processorId: 'supervisor001',
        action: '创建',
        processingComment: '创建月度巡检工单',
        processTime: '2025-10-19 14:00:00',
        attachments: []
      },
      {
        id: 'record005',
        workOrderId: 'wo003',
        nodeId: 'node002',
        nodeName: '完成',
        processor: '张三',
        processorId: 'user001',
        action: '完成',
        processingComment: '巡检完成，设备运行正常',
        processTime: '2025-10-20 16:45:00',
        attachments: ['inspection_report.pdf']
      }
    ]
  },
  {
    id: 'wo004',
    serialNumber: 4,
    stationName: '宿州市第二污水厂',
    stationId: 'LHYR98NH00000008',
    workOrderType: '清洁工单',
    workOrderSource: '运维计划',
    workOrderNumber: 'WO202510180004',
    workOrderDescription: '组件清洗工作，清理光伏板表面积尘，提高发电效率',
    flowStatus: '已完成',
    statusColor: '#27ae60',
    currentProcessor: '张三',
    currentProcessorId: 'user001',
    startTime: '2025-10-18 08:00:00',
    endTime: '2025-10-18 16:00:00',
    actualStartTime: '2025-10-18 08:30:00',
    actualEndTime: '2025-10-18 15:30:00',
    createTime: '2025-10-17 16:00:00',
    creator: '系统',
    creatorId: 'system',
    workOrderLevel: '常规',
    enableAlert: false,
    processingAdvice: '注意清洗时间，避开高温时段',
    attachments: ['cleaning_plan.pdf'],
    isMerged: false,
    plannedCompletionTime: '2025-10-18 16:00:00',
    actualCompletionTime: '2025-10-18 15:30:00',
    priority: '中',
    workOrderObjects: [
      {
        id: 'obj004',
        objectType: '光伏组件',
        objectName: 'A区光伏板',
        objectId: 'PV_A001-A100',
        description: '需要清洗的光伏组件区域'
      }
    ],
    flowRecords: [
      {
        id: 'record006',
        workOrderId: 'wo004',
        nodeId: 'node001',
        nodeName: '创建',
        processor: '系统',
        processorId: 'system',
        action: '创建',
        processingComment: '系统自动创建清洗工单',
        processTime: '2025-10-17 16:00:00',
        attachments: []
      },
      {
        id: 'record007',
        workOrderId: 'wo004',
        nodeId: 'node002',
        nodeName: '完成',
        processor: '张三',
        processorId: 'user001',
        action: '完成',
        processingComment: '清洗完成，发电效率提升3%',
        processTime: '2025-10-18 15:30:00',
        attachments: ['cleaning_report.pdf', 'efficiency_comparison.xlsx']
      }
    ]
  },
  {
    id: 'wo005',
    serialNumber: 5,
    stationName: '芜湖城南污水厂',
    stationId: 'LHYR98NH00000014',
    workOrderType: '检修工单',
    workOrderSource: '告警触发',
    workOrderNumber: 'WO202510150005',
    workOrderDescription: '2#逆变器故障检修，设备报警显示直流侧电压异常',
    flowStatus: '已关闭',
    statusColor: '#95a5a6',
    currentProcessor: '张三',
    currentProcessorId: 'user001',
    startTime: '2025-10-15 10:00:00',
    endTime: '2025-10-15 18:00:00',
    actualStartTime: '2025-10-15 10:30:00',
    actualEndTime: '2025-10-15 17:15:00',
    createTime: '2025-10-15 09:45:00',
    creator: '告警系统',
    creatorId: 'alarm_system',
    workOrderLevel: '紧急',
    enableAlert: true,
    processingAdvice: '立即处理，影响发电',
    attachments: ['alarm_log.pdf'],
    isMerged: false,
    plannedCompletionTime: '2025-10-15 18:00:00',
    actualCompletionTime: '2025-10-15 17:15:00',
    priority: '高',
    workOrderObjects: [
      {
        id: 'obj005',
        objectType: '逆变器',
        objectName: '2#逆变器',
        objectId: 'INV002',
        description: '直流侧电压异常的逆变器设备'
      }
    ],
    flowRecords: [
      {
        id: 'record008',
        workOrderId: 'wo005',
        nodeId: 'node001',
        nodeName: '创建',
        processor: '告警系统',
        processorId: 'alarm_system',
        action: '创建',
        processingComment: '告警自动创建检修工单',
        processTime: '2025-10-15 09:45:00',
        attachments: []
      },
      {
        id: 'record009',
        workOrderId: 'wo005',
        nodeId: 'node002',
        nodeName: '完成',
        processor: '张三',
        processorId: 'user001',
        action: '完成',
        processingComment: '更换故障熔断器，设备恢复正常运行',
        processTime: '2025-10-15 17:15:00',
        attachments: ['repair_report.pdf', 'parts_replacement.jpg']
      }
    ]
  }
]

/**
 * 基础数据
 */
export const mockBasicData: WorkOrderBasicDataResponse = {
  workOrderTypes: [
    { id: 'maintenance', name: '维护工单', label: '维护工单', value: 'maintenance', color: '#3498db' },
    { id: 'repair', name: '检修工单', label: '检修工单', value: 'repair', color: '#e74c3c' },
    { id: 'inspection', name: '巡检工单', label: '巡检工单', value: 'inspection', color: '#f39c12' },
    { id: 'cleaning', name: '清洁工单', label: '清洁工单', value: 'cleaning', color: '#27ae60' },
  ],
  workOrderSources: [
    { label: '运维计划', value: 'plan', color: '#3498db' },
    { label: '告警触发', value: 'alarm', color: '#e74c3c' },
    { label: '人工创建', value: 'manual', color: '#f39c12' },
    { label: '定期巡检', value: 'routine', color: '#27ae60' },
  ],
  flowStatuses: [
    { label: '待分派', value: '待分派', color: '#f39c12' },
    { label: '处理中', value: '处理中', color: '#3498db' },
    { label: '已完成', value: '已完成', color: '#27ae60' },
    { label: '已关闭', value: '已关闭', color: '#95a5a6' },
  ],
  workOrderLevels: [
    { label: '紧急', value: '紧急', color: '#e74c3c' },
    { label: '重要', value: '重要', color: '#f39c12' },
    { label: '常规', value: '常规', color: '#3498db' },
    { label: '低优先级', value: '低优先级', color: '#95a5a6' },
  ],
  users: mockUsers,
  stations: [
    { id: 'LHYR98NH00000014', name: '芜湖城南污水厂' },
    { id: 'LHYR98NH00000003', name: '亳州利辛县城污水厂' },
    { id: 'LHYR98NH00000008', name: '宿州市第二污水厂' },
  ]
}

/**
 * 工单列表数据（用于兼容旧版本）
 */
export const mockWorkOrderListData: WorkOrderListResponse = {
  workOrders: mockWorkOrders,
  pagination: {
    current: 1,
    pageSize: 20,
    total: mockWorkOrders.length,
    totalPages: Math.ceil(mockWorkOrders.length / 20),
  },
}