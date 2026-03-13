export const pvMenuList = [
  {
    id: 'pv-dashboard',
    name: '综合信息',
    path: '/pv/dashboard'
  },
  {
    id: 'pv-monitor',
    name: '工艺流程',
    children: [
      { id: 'pv-process-pre-treatment', name: '预处理', path: '/pv/monitor/pre-treatment' },
      { id: 'pv-process-stage1-aao', name: 'I段AAO', path: '/pv/monitor/stage1-aao' },
      { id: 'pv-process-secondary-clarifier', name: '二沉池及出水', path: '/pv/monitor/secondary-clarifier' },
      { id: 'pv-process-sludge-dewatering', name: '污泥脱水', path: '/pv/monitor/sludge-dewatering' },
      { id: 'pv-process-high-eff-sedimentation', name: '高效沉淀池', path: '/pv/monitor/high-eff-sedimentation' },
      { id: 'pv-process-denitrification-filter', name: '反硝化深床滤池', path: '/pv/monitor/denitrification-filter' },
      { id: 'pv-process-dosing-system', name: '加药系统', path: '/pv/monitor/dosing-system' },
      { id: 'pv-process-stage2-aao', name: 'II段AAO', path: '/pv/monitor/stage2-aao' },
      { id: 'pv-process-blower-room', name: '鼓风机房', path: '/pv/monitor/blower-room' },
    ],
  },
  {
    id: 'pv-analysis',
    name: '趋势分析',
    children: [
      { id: 'pv-data-trend-query', name: '数据趋势查询', path: '/pv/analysis/data-trend-query' },
      { id: 'pv-energy-consumption', name: '能耗数据分析', path: '/pv/analysis/energy-consumption' },
    ],
  },
  {
    id: 'pv-diagnosis',
    name: '告警分析',
    children: [
      { id: 'pv-alarm-overview', name: '告警概览', path: '/pv/diagnosis/alarm-overview' },
      { id: 'pv-alarm-realtime', name: '实时告警', path: '/pv/diagnosis/alarm-realtime' },
      { id: 'pv-alarm-history', name: '历史告警', path: '/pv/diagnosis/alarm-history' },
      { id: 'pv-alarm-rules', name: '告警规则', path: '/pv/diagnosis/alarm-rules' },
      { id: 'pv-alarm-statistics', name: '告警统计', path: '/pv/diagnosis/alarm-statistics' },
    ],
  },
  {
    id: 'pv-maintenance',
    name: '报表查询',
    children: [
      { id: 'pv-report-statistics', name: '统计报表', path: '/pv/report/statistics' },
      { id: 'pv-report-custom', name: '自定义报表', path: '/pv/report/custom' },
    ],
  },
  {
    id: 'pv-user-management',
    name: '用户管理',
    path: '/pv/user-management'
  },
  {
    id: 'pv-system-management',
    name: '系统管理',
    children: [
      { id: 'pv-sys-message-center', name: '消息中心', path: '/pv/system/message-center' },
      { id: 'pv-sys-notifications', name: '通知管理', path: '/pv/system/notifications' },
      { id: 'pv-sys-settings', name: '系统设置', path: '/pv/system/settings' },
      { id: 'pv-sys-operation-log', name: '操作记录', path: '/pv/system/operation-log' },
    ],
  },
]

/**
 * 鹤问湖二期工厂菜单
 *
 * 工艺流程（es-monitor）的子菜单在运行时由后端 API 动态填充，
 * 这里只保留空的占位结构。其他模块为静态菜单。
 */
export const esMenuList = [
  {
    id: 'es-dashboard',
    name: '综合信息',
    path: '/es/dashboard'
  },
  {
    id: 'es-monitor',
    name: '工艺流程',
    // children 在运行时由 LayoutHeader 调用 monitorApi 动态填充
    children: [] as any[]
  },
  {
    id: 'es-analysis',
    name: '趋势分析',
    children: [
      { id: 'es-data-trend-query', name: '数据趋势查询', path: '/es/analysis/data-trend-query' },
      { id: 'es-energy-consumption', name: '能耗数据分析', path: '/es/analysis/energy-consumption' },
    ],
  },
  {
    id: 'es-diagnosis',
    name: '告警分析',
    children: [
      { id: 'es-alarm-overview', name: '告警概览', path: '/es/diagnosis/alarm-overview' },
      { id: 'es-alarm-realtime', name: '实时告警', path: '/es/diagnosis/alarm-realtime' },
      { id: 'es-alarm-history', name: '历史告警', path: '/es/diagnosis/alarm-history' },
      { id: 'es-alarm-rules', name: '告警规则', path: '/es/diagnosis/alarm-rules' },
      { id: 'es-alarm-statistics', name: '告警统计', path: '/es/diagnosis/alarm-statistics' },
    ],
  },
  {
    id: 'es-maintenance',
    name: '报表查询',
    children: [
      { id: 'es-report-statistics', name: '统计报表', path: '/es/report/statistics' },
      { id: 'es-report-custom', name: '自定义报表', path: '/es/report/custom' },
    ],
  },
  {
    id: 'es-user-management',
    name: '用户管理',
    path: '/es/user-management'
  },
  {
    id: 'es-system-management',
    name: '系统管理',
    children: [
      { id: 'es-sys-message-center', name: '消息中心', path: '/es/system/message-center' },
      { id: 'es-sys-notifications', name: '通知管理', path: '/es/system/notifications' },
      { id: 'es-sys-settings', name: '系统设置', path: '/es/system/settings' },
      { id: 'es-sys-operation-log', name: '操作记录', path: '/es/system/operation-log' },
    ],
  },
];