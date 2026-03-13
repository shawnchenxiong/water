export const pvRouter = {
  path: '/pv',
  component: () => import('@/components/layout/MainLayout.vue'),
  redirect: '/pv/dashboard',
  children: [
    {
      path: 'dashboard',
      name: 'PvDashboard',
      component: () => import('@/pages/pv/dashboard/index.vue'),
      meta: {
        title: '综合信息',
        requiresAuth: true,
        breadcrumb: ['综合信息'],
      },
    },
    // 工艺流程模块
    {
      path: 'monitor/pre-treatment',
      name: 'PvProcessPreTreatment',
      component: () => import('@/pages/pv/monitor/pre-treatment/index.vue'),
      meta: { title: '预处理', requiresAuth: true, breadcrumb: ['工艺流程', '预处理'] },
    },
    {
      path: 'monitor/stage1-aao',
      name: 'PvProcessStage1AAO',
      component: () => import('@/pages/pv/monitor/stage1-aao/index.vue'),
      meta: { title: 'I段AAO', requiresAuth: true, breadcrumb: ['工艺流程', 'I段AAO'] },
    },
    {
      path: 'monitor/secondary-clarifier',
      name: 'PvProcessSecondaryClarifier',
      component: () => import('@/pages/pv/monitor/secondary-clarifier/index.vue'),
      meta: { title: '二沉池及出水', requiresAuth: true, breadcrumb: ['工艺流程', '二沉池及出水'] },
    },
    {
      path: 'monitor/sludge-dewatering',
      name: 'PvProcessSludgeDewatering',
      component: () => import('@/pages/pv/monitor/sludge-dewatering/index.vue'),
      meta: { title: '污泥脱水', requiresAuth: true, breadcrumb: ['工艺流程', '污泥脱水'] },
    },
    {
      path: 'monitor/high-eff-sedimentation',
      name: 'PvProcessHighEffSedimentation',
      component: () => import('@/pages/pv/monitor/high-eff-sedimentation/index.vue'),
      meta: { title: '高效沉淀池', requiresAuth: true, breadcrumb: ['工艺流程', '高效沉淀池'] },
    },
    {
      path: 'monitor/denitrification-filter',
      name: 'PvProcessDenitrificationFilter',
      component: () => import('@/pages/pv/monitor/denitrification-filter/index.vue'),
      meta: { title: '反硝化深床滤池', requiresAuth: true, breadcrumb: ['工艺流程', '反硝化深床滤池'] },
    },
    {
      path: 'monitor/dosing-system',
      name: 'PvProcessDosingSystem',
      component: () => import('@/pages/pv/monitor/dosing-system/index.vue'),
      meta: { title: '加药系统', requiresAuth: true, breadcrumb: ['工艺流程', '加药系统'] },
    },
    {
      path: 'monitor/stage2-aao',
      name: 'PvProcessStage2AAO',
      component: () => import('@/pages/pv/monitor/stage2-aao/index.vue'),
      meta: { title: 'II段AAO', requiresAuth: true, breadcrumb: ['工艺流程', 'II段AAO'] },
    },
    {
      path: 'monitor/blower-room',
      name: 'PvProcessBlowerRoom',
      component: () => import('@/pages/pv/monitor/blower-room/index.vue'),
      meta: { title: '鼓风机房', requiresAuth: true, breadcrumb: ['工艺流程', '鼓风机房'] },
    },
    {
      path: 'monitor/scada/:id',
      name: 'PvMonitorScadaPreview',
      component: () => import('@/pages/pv/monitor/scada-preview/index.vue'),
      meta: { title: '工艺流程组态', requiresAuth: true, breadcrumb: ['工艺流程', '工艺流程组态'] },
    },
    // 智能分析模块
    // 趋势分析模块
    {
      path: 'analysis/data-trend-query',
      name: 'PvAnalysisDataTrendQuery',
      component: () => import('@/pages/pv/analysis/data-trend-query/index.vue'),
      meta: {
        title: '数据趋势查询',
        requiresAuth: true,
        breadcrumb: ['趋势分析', '数据趋势查询'],
      },
    },
    {
      path: 'analysis/energy-consumption',
      name: 'PvAnalysisEnergyConsumption',
      component: () => import('@/pages/pv/analysis/energy-consumption/index.vue'),
      meta: {
        title: '能耗数据分析',
        requiresAuth: true,
        breadcrumb: ['趋势分析', '能耗数据分析'],
      },
    },
    // 告警分析模块
    {
      path: 'diagnosis/alarm-overview',
      name: 'PvAlarmOverview',
      component: () => import('@/pages/pv/diagnosis/alarm-overview/index.vue'),
      meta: { title: '告警概览', requiresAuth: true, breadcrumb: ['告警分析', '告警概览'] },
    },
    {
      path: 'diagnosis/alarm-realtime',
      name: 'PvAlarmRealtime',
      component: () => import('@/pages/pv/diagnosis/alarm-realtime/index.vue'),
      meta: { title: '实时告警', requiresAuth: true, breadcrumb: ['告警分析', '实时告警'] },
    },
    {
      path: 'diagnosis/alarm-history',
      name: 'PvAlarmHistory',
      component: () => import('@/pages/pv/diagnosis/alarm-history/index.vue'),
      meta: { title: '历史告警', requiresAuth: true, breadcrumb: ['告警分析', '历史告警'] },
    },
    {
      path: 'diagnosis/alarm-rules',
      name: 'PvAlarmRules',
      component: () => import('@/pages/pv/diagnosis/alarm-rules/index.vue'),
      meta: { title: '告警规则', requiresAuth: true, breadcrumb: ['告警分析', '告警规则'] },
    },
    {
      path: 'diagnosis/alarm-statistics',
      name: 'PvAlarmStatistics',
      component: () => import('@/pages/pv/diagnosis/alarm-statistics/index.vue'),
      meta: { title: '告警统计', requiresAuth: true, breadcrumb: ['告警分析', '告警统计'] },
    },
    // 报表查询模块
    {
      path: 'report/statistics',
      name: 'PvReportStatistics',
      component: () => import('@/pages/pv/report/statistics/index.vue'),
      meta: { title: '统计报表', requiresAuth: true, breadcrumb: ['报表查询', '统计报表'] },
    },
    {
      path: 'report/custom',
      name: 'PvReportCustom',
      component: () => import('@/pages/pv/report/custom/index.vue'),
      meta: { title: '自定义报表', requiresAuth: true, breadcrumb: ['报表查询', '自定义报表'] },
    },
    // 智能运维模块
    // 移动巡检
    {
      path: 'maintenance/mobile-inspection/records',
      name: 'PvMaintenanceMobileInspectionRecords',
      component: () => import('@/pages/pv/maintenance/mobile-inspection/records/index.vue'),
      meta: {
        title: '巡检记录',
        requiresAuth: true,
        breadcrumb: ['智能运维', '移动巡检'],
      },
    },
    {
      path: 'maintenance/mobile-inspection/issues',
      name: 'PvMaintenanceMobileInspectionIssues',
      component: () => import('@/pages/pv/maintenance/mobile-inspection/issues/index.vue'),
      meta: {
        title: '巡检问题',
        requiresAuth: true,
        breadcrumb: ['智能运维', '移动巡检'],
      },
    },
    {
      path: 'maintenance/mobile-inspection/statistics',
      name: 'PvMaintenanceMobileInspectionStatistics',
      component: () => import('@/pages/pv/maintenance/mobile-inspection/statistics/index.vue'),
      meta: {
        title: '巡检统计',
        requiresAuth: true,
        breadcrumb: ['智能运维', '移动巡检'],
      },
    },
    {
      path: 'maintenance/plan',
      name: 'PvMaintenancePlan',
      component: () => import('@/pages/pv/maintenance/plan/index.vue'),
      meta: {
        title: '运维计划',
        requiresAuth: true,
        breadcrumb: ['智能运维', '运维计划'],
      },
    },
    {
      path: 'maintenance/work-order',
      name: 'PvMaintenanceWorkOrder',
      component: () => import('@/pages/pv/maintenance/work-order/index.vue'),
      meta: {
        title: '工单管理',
        requiresAuth: true,
        breadcrumb: ['智能运维', '工单管理'],
      },
    },
    {
      path: 'maintenance/knowledge-base',
      name: 'PvMaintenanceKnowledgeBase',
      component: () => import('@/pages/pv/maintenance/knowledge-base/index.vue'),
      meta: {
        title: '知识库',
        requiresAuth: true,
        breadcrumb: ['智能运维', '知识库'],
      },
    },
    {
      path: 'maintenance/device-ledger',
      name: 'PvMaintenanceDeviceLedger',
      component: () => import('@/pages/pv/maintenance/device-ledger/index.vue'),
      meta: {
        title: '设备台账',
        requiresAuth: true,
        breadcrumb: ['智能运维', '设备台账'],
      },
    },
    {
      path: 'user-management',
      name: 'PvUserManagement',
      component: () => import('@/pages/pv/user-management/index.vue'),
      meta: {
        title: '用户管理',
        requiresAuth: true,
        breadcrumb: ['用户管理'],
      },
    },
    // 系统管理
    {
      path: 'system/message-center',
      name: 'PvSystemMessageCenter',
      component: () => import('@/pages/pv/system/message-center/index.vue'),
      meta: { title: '消息中心', requiresAuth: true, breadcrumb: ['系统管理', '消息中心'] },
    },
    {
      path: 'system/notifications',
      name: 'PvSystemNotifications',
      component: () => import('@/pages/pv/system/notifications/index.vue'),
      meta: { title: '通知管理', requiresAuth: true, breadcrumb: ['系统管理', '通知管理'] },
    },
    {
      path: 'system/settings',
      name: 'PvSystemSettings',
      component: () => import('@/pages/pv/system/settings/index.vue'),
      meta: { title: '系统设置', requiresAuth: true, breadcrumb: ['系统管理', '系统设置'] },
    },
    {
      path: 'system/operation-log',
      name: 'PvSystemOperationLog',
      component: () => import('@/pages/pv/system/operation-log/index.vue'),
      meta: { title: '操作记录', requiresAuth: true, breadcrumb: ['系统管理', '操作记录'] },
    },
  ],
}