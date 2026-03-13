/* eslint-disable */


//consType: 6,
// 0 原样赋值 也就是 将dv 的值原样赋值给绑定属性key res ： dv
// 1 缩放赋值 也就是 将dv 的值缩放后赋值给绑定属性key res = val * dv(缩放dv) val的值是input的
// 2 前置连接赋值 也就是 将val + dv 的值 赋值给绑定属性key res = val + dv val的值是input的
// 3 后置连接赋值 也就是 将dv + val 的值 赋值给绑定属性key res = dv + val val的值是input的
// 4 前置 + dv + 后置连接赋值 也就是 将min + dv + val的值 赋值给绑定属性key res = min + dv + max min/max的值是input的

// 6 条件赋值 就是数据点的值满足cons的条件 min <= dv <= max, dv为数据点的值，
//   就设置val 的值给绑定属性key {label: '关', min: 0, max: 0, val: 0}, res = (min<=dv<=max ----- val)

// valType: 'image',// input 输入框 color 选择颜色 image 选择图片 select 下拉框
// key: 'stateValue',//对应style中的key
// fixed: false,// 条件数量固定 不可增加删除,
// hasLabelCol: true, 是否有第一列值名 cons 中label 高于此值 fixed == true时 cons 的 title优值则优先级大
// labelKeyword: '状态',值名关键值 生成后后面是 + index
// valDisable: 输入val的时候此值控制是否允许输入

// cons: 条件列表
//     cot:0, 比较类型 比较方是 【数据点的值】 和 【输入框的值（min, max）】进行比较
//        以下代号 dv 为数据点的值代号 minv为输入框的min的值 maxv为输入框的max的值 valv 为输入框val的值
//         0: 相等比较 dv == minv 此时 max输入框无效
//         1: 非相等比较 dv != minv 此时 max输入框无效
//         2: 做大小比较 dv <= minv 此时 max输入框无效
//         3: 做大小比较 minv <= dv <= maxv
//         4: 做大小比较 dv >= maxv 此时 min输入框无效
//         6: 外包含 dv中包含minv
//         7: 非外包含 dv中不包含minv
//         6: 内包含 minv中包含dv
//         7: 非内包含 minv中不包含dv
//     min: null,
//     max: null,
//     val: null

export const StaticPointPropMap = {
    'scaleValValues': {
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'scaleValValues',
        virvarId: null,
        name: '刻度值',
        outputType: 0,
        key: 'style:scaleVal',
        consType: 4,
        prefix: null,
        suffix: null,
        // props: ['showScale', 'bgFillColor1', 'bgFillColor2', 'scaleValDuration', 'scaleTransX', 'scaleFontSize', 'scaleFontColor', 'scaleColor', 'minScale', 'maxScale', 'smallUnitScale', 'bigUnitScale'],
        props: [],
        category: 'data',
    },
    'chartValues': {
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'chartValues',
        virvarId: null,
        name: '图表数据',
        outputType: 0,
        key: 'style:chartConfig',
        consType: 4,
        prefix: null,
        suffix: null,
        props: [],
        category: 'data',
    },
    'troughLiquidProgressValues': {
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'troughLiquidProgressValues',
        virvarId: null,
        name: '液位/高度',
        outputType: 0,
        key: 'style:troughLiquidProgress',
        consType: 4,
        prefix: null,
        suffix: null,
        // props: ['troughMinScale','troughMaxScale','troughBorderWidth','troughBorderRadius','troughBorderColor','troughBackgroundColor','troughLiquidColor'],
        props: [],
        category: 'data',
    },
    'textOutputValues': {// 文本输出
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'textOutputValues',
        virvarId: null,
        name: '文本输出',
        outputType: 0,
        key: 'attr:value',
        consType: 4,
        prefix: null,
        suffix: null,
        props: null,
        category: 'style',
    },
    'commonTextValues': {// 状态文本 (条件文本内容)
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'commonTextValues',
        virvarId: null,
        name: '状态文本',
        remark: '条件列表',
        valType: 'input',
        key: 'attr:value',
        fixed: false,
        consType: 5,
        hasLabelCol: true,
        labelKeyword: '状态',
        valDisable: false,
        cons: [
            { cot: 3, min: null, max: null, val: null },
            { cot: 3, min: null, max: null, val: null },
        ],
        props: null,
        category: 'style',
    },
    'gaugeValues': { // 仪表盘数据绑定
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'gaugeValues',
        virvarId: null,
        name: '仪表盘数值',
        outputType: 0,
        key: 'style:gaugeValue',
        consType: 4,
        prefix: null,
        suffix: null,
        props: ['gaugeValueMode', 'gaugeTestValue', 'gaugeMin', 'gaugeMax', 'gaugeUnit', 'gaugeTitle', 'gaugeAlarmMode', 'lowWarningThreshold', 'lowDangerThreshold', 'highWarningThreshold', 'highDangerThreshold', 'dialColor', 'pointerColor', 'normalColor', 'warningColor', 'dangerColor'],
        category: 'data',
    },
    'openCloseValues': {// 开关值
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'openCloseValues',
        virvarId: null,
        name: '开关状态',
        remark: '条件列表',
        valType: 'input',
        key: 'style:stateValue',
        fixed: true,
        consType: 5,
        hasLabelCol: true,
        labelKeyword: '状态',
        valDisable: true,
        cons: [
            { cot: 3, label: '开', min: null, max: null, val: 1 },
            { cot: 3, label: '关', min: null, max: null, val: 0 },
        ],
        // props: ['openStateImg', 'closeStateImg'],
        props: ['staticSwitchState'],
        category: 'data',
    },
    'stateImageValues': {// 状态值图片
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'stateImageValues',
        virvarId: null,
        name: '状态图片',
        remark: '条件列表',
        valType: 'image',
        key: 'style:stateImage',
        fixed: false,
        consType: 5,
        hasLabelCol: true,
        labelKeyword: '状态',
        valDisable: false,
        cons: [
            { cot: 0, min: 0, max: null, val: null },
            { cot: 1, min: 0, max: null, val: null },
        ],
        // props: ['defaultImg'],
        props: [],
        category: 'data',
    },
    'stateTextValues': {// 状态值文字
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'stateTextValues',
        virvarId: null,
        name: '状态文字',
        remark: '条件列表',
        valType: 'input',
        key: 'attr:value',
        fixed: false,
        consType: 5,
        hasLabelCol: true,
        labelKeyword: '状态',
        valDisable: false,
        cons: [
            { cot: 3, min: null, max: null, val: null },
            { cot: 3, min: null, max: null, val: null },
        ],
        props: null,
        category: 'data',
    },
    'flowStateValues': {// 流动条
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'flowStateValues',
        virvarId: null,
        name: '流动动画',
        remark: '条件列表',
        valType: 'input',
        key: 'style:pipSpeed',
        fixed: true,
        consType: 5,
        hasLabelCol: true,
        labelKeyword: '状态',
        valDisable: true,
        cons: [
            { label: '静止', cot: 0, min: null, max: null, val: 0 },
            { label: '正常', cot: 0, min: null, max: null, val: 1 },
            { label: '慢速', cot: 0, min: null, max: null, val: 2 },
            { label: '快速', cot: 0, min: null, max: null, val: 3 },
        ],
        // props: ['flowFluidWidth','flowFluidColor','flowPipWidth','flowPipDashWidth','flowPipColor','flowDirection', 'pipRound', 'flowRound'],
        props: [],
        category: 'data',
    },
    'commonStrokeColor': {// 背景色
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'commonStrokeColor',
        virvarId: null,
        name: '背景颜色',
        remark: '条件列表',
        valType: 'color',
        key: 'style:strokeColor',
        fixed: false,
        consType: 5,
        hasLabelCol: true,
        labelKeyword: '状态',
        valDisable: false,
        cons: [
            { cot: 3, min: null, max: null, val: null },
            { cot: 3, min: null, max: null, val: null },
        ],
        props: null,
        category: 'style',
    },
    'commonFontColor': {// 字体颜色
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'commonFontColor',
        virvarId: null,
        name: '文字颜色',
        remark: '条件列表',
        valType: 'color',
        key: 'style:fontColor',
        fixed: false,
        consType: 5,
        hasLabelCol: true,
        labelKeyword: '状态',
        valDisable: false,
        cons: [
            { cot: 0, min: null, max: null, val: null },
            { cot: 1, min: null, max: null, val: null },
        ],
        props: null,
        category: 'style',
    },
    'commonVisible': {//显示隐藏
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'commonVisible',
        virvarId: null,
        name: '显示隐藏',
        remark: '条件列表',
        valType: 'input',
        key: 'attr:visible',
        fixed: true,
        consType: 5,
        hasLabelCol: true,
        labelKeyword: '状态',
        valDisable: true,
        cons: [
            { cot: 3, label: '显示', min: null, max: null, val: 1 },
            { cot: 3, label: '隐藏', min: null, max: null, val: 0 },
        ],
        props: null,
        category: 'style',
    },
    'commonRotateAnim': { // 旋转动画
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'commonRotateAnim',
        virvarId: null,
        name: '旋转动画',
        remark: '条件列表',
        valType: 'input',
        valSelectOption: [],
        key: 'style:rotateAnimState',
        fixed: true,
        consType: 5,
        hasLabelCol: true,
        labelKeyword: '状态',
        valDisable: true,
        cons: [
            { cot: 3, label: '开启', min: null, max: null, val: 1 },
            { cot: 3, label: '停止', min: null, max: null, val: 0 },
        ],
        props: ['rotateDirection', 'rotateSpeed'],
        category: 'anim',
    },
    'commonTwinkleAnim': { // 闪烁动画
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'commonTwinkleAnim',
        virvarId: null,
        name: '闪烁动画',
        remark: '条件列表',
        valType: 'input',
        valSelectOption: [],
        key: 'style:twinkleAnimState',
        fixed: true,
        consType: 5,
        hasLabelCol: true,
        labelKeyword: '状态',
        valDisable: true,
        cons: [
            { cot: 3, label: '开启', min: null, max: null, val: 1 },
            { cot: 3, label: '停止', min: null, max: null, val: 0 },
        ],
        props: ['twinkleSpeed'],
        category: 'anim',
    },
    'singleClickEvent': { // 单击事件
        hasSaveClear: true,
        hasVirvar: false,
        dpropKey: 'singleClickEvent',
        name: '单击事件',
        consType: 3,
        category: 'event',
        clickType: null, // 点击反应类型
        ctrlType: null, // 反向控制点位 控制类型 0直接控制 1条件控制
        pointKey: null,// 反向控制点位 点位key
        pointValueDirect: null,// 反向控制点位 直接控制输入值
        pointValueVirvarId: null,// 反向控制点位 条件变量
        pointValueConsProp: {// 反向控制点位 条件变量条件列表
            valType: 'input',
            fixed: false,
            hasLabelCol: false,
            valDisable: false,
            cons: [
                { cot: 0, min: null, max: null, val: null },
            ]
        },
        commandContent: null,
        changePageId: null,
        outerLink: null,
    },
    'doubleClickEvent': { // 双击事件
        hasSaveClear: true,
        hasVirvar: false,
        dpropKey: 'doubleClickEvent',
        name: '双击事件',
        consType: 3,
        category: 'event',
        clickType: null, // 点击反应类型
        ctrlType: null, // 反向控制点位 控制类型 0直接控制 1条件控制
        pointKey: null,// 反向控制点位 点位key
        pointValueDirect: null,// 反向控制点位 直接控制输入值
        pointValueVirvarId: null,// 反向控制点位 条件变量
        pointValueConsProp: {// 反向控制点位 条件变量条件列表
            valType: 'input',
            fixed: false,
            hasLabelCol: false,
            valDisable: false,
            cons: [
                { cot: 0, min: null, max: null, val: null },
            ]
        },
        commandContent: null,
        changePageId: null,
        outerLink: null,
    },
    'globalScript': { // 全局脚本
        hasSaveClear: true,
        hasVirvar: false,
        dpropKey: 'globalScript',
        name: '脚本内容',
        consType: 7,
        category: 'script',
        key: 'script:globalScript',
        cellId: null,
        script: null, // 脚本内容
    },
    'commonScript': { // 组件脚本
        hasSaveClear: true,
        hasVirvar: false,
        dpropKey: 'commonScript',
        name: '脚本内容',
        consType: 7,
        category: 'script',
        key: 'script:chartScript',
        cellId: null,
        script: null, // 脚本内容
    },
    'shuziTimeValues': {
        hasSaveClear: false,
        hasVirvar: false,
        dpropKey: 'shuziTimeValues',
        name: '数字日期',
        consType: 6,
        props: ['timeFormat'],
        category: 'data',
    },
    'videoPlayerValues': {
        hasSaveClear: false,
        hasVirvar: false,
        dpropKey: 'videoPlayerValues',
        name: '点播/直播',
        consType: 6,
        props: ['playUrl', 'poster'],
        category: 'data',
    },
    'htmlTextareaDefaultValues': {
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'htmlTextareaDefaultValues',
        virvarId: null,
        name: '默认文本',
        outputType: 0,
        key: 'attr:value',
        consType: 4,
        prefix: null,
        suffix: null,
        // props: ['placeholderText', 'textareaRows'],
        props: [],
        category: 'data',
    },
    'htmlTextInputDefaultValues': {
        hasSaveClear: true,
        hasVirvar: true,
        hasReverseControl: true, // 支持反向控制（下发模式）
        dpropKey: 'htmlTextInputDefaultValues',
        virvarId: null,
        name: '变量绑定',
        outputType: 0,
        key: 'attr:value',
        consType: 4,
        prefix: null,
        suffix: null,
        props: ['inputMode'],
        category: 'data',
    },
    'tableViewListValues': {
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'tableViewListValues',
        virvarId: null,
        name: '表格数据',
        outputType: 0,
        key: 'style:listData',
        consType: 4,
        prefix: null,
        suffix: null,
        // props: ['placeholderText'],
        props: [],
        category: 'data',
    },
    'erchenchiValues': {
        hasSaveClear: true,
        hasVirvar: false,
        dpropKey: 'erchenchiValues',
        virvarId: null,
        name: '二沉池配置',
        outputType: 0,
        key: 'style:erchenchiConfig',
        consType: 0,
        prefix: null,
        suffix: null,
        props: ['erchenchiDeviceId'],
        category: 'erchenchi',
    },
    'erchenchiStatusValues': {
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'erchenchiStatusValues',
        virvarId: null,
        name: '默认文本',
        outputType: 0,
        key: 'attr:value',
        consType: 4,
        prefix: null,
        suffix: null,
        props: ['staticStatusValue', 'cellFontSize'],
        category: 'data',
    },
    'textMonitorValues': {
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'textMonitorValues',
        virvarId: null,
        name: '多变量配置',
        outputType: 0,
        key: 'style:monitorConfig',
        consType: 4,
        prefix: null,
        suffix: null,
        props: ['monitorVarList'],
        category: 'data',
    },
    'singleDataBindValues': {
        hasSaveClear: true,
        hasVirvar: true,
        hasReverseControl: true, // 新增：标识此绑定支持反向控制配置
        dpropKey: 'singleDataBindValues',
        virvarId: null,
        name: '变量绑定',
        outputType: 0,
        key: 'attr:value',
        consType: 4,
        prefix: null,
        suffix: null,
        props: [],
        category: 'data',
    },
    'erchenchiDataValues': {
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'erchenchiDataValues',
        virvarId: null,
        name: '数据显示',
        outputType: 0,
        key: 'attr:value',
        consType: 4,
        prefix: null,
        suffix: null,
        props: ['dataLabelHeader', 'dataTitle', 'dataTitleFontSize', 'dataTitleFontColor', 'dataTitleSpacing', 'dataControlHeader', 'dataValueFontSize', 'dataValueFontColor', 'dataValueSpacing'],
        category: 'data',
    },
    'progressSliderValues': {
        hasSaveClear: true,
        hasVirvar: true,
        dpropKey: 'progressSliderValues',
        virvarId: null,
        name: '进度滑块',
        outputType: 1, // 默认百分比输出
        key: 'style:sliderValue',
        consType: 4,
        prefix: null,
        suffix: null,
        props: ['sliderMin', 'sliderMax', 'trackColor', 'sliderFillColor', 'sliderThumbColor', 'sliderFontColor', 'sliderFontSize', 'sliderSpacing', 'showThumb'],
        category: 'data',
    },
    'trendChartValues': { // 趋势图配置
        hasSaveClear: true,
        hasVirvar: false, // 趋势图使用SN列表而非单个变量
        dpropKey: 'trendChartValues',
        virvarId: null,
        name: '趋势图配置',
        outputType: 0,
        key: 'style:trendConfig',
        consType: 6, // 使用简单属性配置
        prefix: null,
        suffix: null,
        props: [
            'trendChartHeader',
            'trendChartStyle',
            'trendTitle',
            'trendTimeMode',
            'trendTimePreset',
            'trendCustomDuration',
            'trendStartTime',
            'trendEndTime',
            'trendSnList',
            'trendRefreshInterval',
            'trendStyleHeader',
            'trendShowTitle',
            'trendShowLegend',
            'trendShowTooltip',
            'trendShowArea',
            'trendBgColor',
            'trendBorderColor',
            'trendTitleColor',
            'trendTextColor',
            'trendGridColor'
        ],
        category: 'data',
    },
    'pulseControlValues': { // 脉冲控制组件配置
        hasSaveClear: true,
        hasVirvar: true, // 启用虚拟变量选择器
        dpropKey: 'pulseControlValues',
        virvarId: null,
        name: '目标点位',
        outputType: 0,
        key: 'style:pulseTargetKey', // 绑定到 pulseTargetKey 属性
        consType: 0, // 原样赋值，存储虚拟变量ID
        prefix: null,
        suffix: null,
        props: [
            'pulseControlHeader',
            'pulseHighValue',
            'pulseLowValue',
            'pulseDelay',
            'pulseOutputType'
        ],
        category: 'data',
    },
    'pulseControlStyleValues': { // 脉冲控制组件样式配置（显示在样式栏）
        hasSaveClear: false,
        hasVirvar: false,
        dpropKey: 'pulseControlStyleValues',
        virvarId: null,
        name: '按钮样式',
        outputType: 0,
        key: 'style:pulseButtonStyle',
        consType: 6, // 简单属性配置
        prefix: null,
        suffix: null,
        props: [
            'pulseStyleHeader',
            'pulseButtonText',
            'pulseButtonBgColor',
            'pulseBgImage',
            'pulseButtonTextColor',
            'pulseButtonFontSize',
            'pulseButtonRadius'
        ],
        category: 'style', // 放在样式栏
    },
};

export const StaticStylePropMap = {
    'sliderMin': {
        name: '最小值',
        type: 'input',
        key: 'sliderMin',
        defVal: '0',
        config: { type: 'number' }
    },
    'sliderMax': {
        name: '最大值',
        type: 'input',
        key: 'sliderMax',
        defVal: '100',
        config: { type: 'number' }
    },
    'trackColor': {
        name: '轨道颜色',
        type: 'color',
        key: 'trackColor',
        defVal: '#EEEEEE',
        config: {}
    },
    'inputMode': { // Renamed from inputModeConfig to inputMode to match key
        name: '输入模式',
        type: 'select',
        key: 'inputMode',
        defVal: 'display',
        config: {
            options: [
                { key: 'display', title: '回显模式（只读）' },
                { key: 'control', title: '下发模式（可输入）' }
            ]
        }
    },
    'sliderFillColor': {
        name: '填充颜色',
        type: 'color',
        key: 'fillColor',
        defVal: '#FF8800',
        config: {}
    },
    'sliderThumbColor': {
        name: '滑块颜色',
        type: 'color',
        key: 'thumbColor',
        defVal: '#FF8800',
        config: {}
    },
    'sliderFontColor': {
        name: '数值颜色',
        type: 'color',
        key: 'fontColor',
        defVal: '#FFFFFF',
        config: {}
    },
    'showThumb': {
        name: '显示滑块',
        type: 'switch',
        key: 'showThumb',
        config: { trueLabel: '显示', falseLabel: '隐藏' }
    },
    'sliderTextMode': {
        name: '数值显示',
        type: 'select',
        key: 'sliderTextMode',
        defVal: 'percent',
        config: {
            options: [
                { key: 'value', title: '原值输出' },
                { key: 'percent', title: '百分比输出' }
            ]
        }
    },
    'sliderFontSize': {
        name: '字体大小',
        type: 'input',
        key: 'sliderFontSize',
        defVal: '12',
        config: { type: 'number' }
    },
    'sliderSpacing': {
        name: '文字间距',
        type: 'input',
        key: 'sliderSpacing',
        defVal: '5',
        config: { type: 'number' }
    },
    'dataLabelHeader': {
        name: '显示标签',
        type: 'header',
    },
    'dataTitle': {
        name: '标签内容',
        type: 'input',
        key: 'dataTitle',
        config: {
            type: 'text',
            placeholder: '输入名称（如：频率）'
        },
    },
    'dataTitleFontSize': {
        name: '标签字体大小',
        type: 'input',
        key: 'dataTitleFontSize',
        defVal: '12',
        config: {
            type: 'number',
            min: 8,
            max: 100,
            step: 1,
            unit: 'px',
        },
    },
    'dataTitleFontColor': {
        name: '标签字体颜色',
        type: 'color',
        key: 'dataTitleFontColor',
        defVal: '#ffffff',
        config: {},
    },
    'dataTitleSpacing': {
        name: '标签左右间距',
        type: 'input',
        key: 'dataTitleSpacing',
        defVal: '0',
        config: {
            type: 'number',
            min: 0,
            max: 100,
            step: 1,
            unit: 'px',
        },
    },
    'dataControlHeader': {
        name: '显示控制',
        type: 'header',
    },
    'dataValueFontSize': {
        name: '数值字体大小',
        type: 'input',
        key: 'dataValueFontSize',
        defVal: '13',
        config: {
            type: 'number',
            min: 8,
            max: 100,
            step: 1,
            unit: 'px',
        },
    },
    'dataValueFontColor': {
        name: '数值字体颜色',
        type: 'color',
        key: 'dataValueFontColor',
        defVal: '#00ddff',
        config: {},
    },
    'dataValueSpacing': {
        name: '数值左右间距',
        type: 'input',
        key: 'dataValueSpacing',
        defVal: '8',
        config: {
            type: 'number',
            min: 0,
            max: 100,
            step: 1,
            unit: 'px',
        },
    },
    'staticStatusValue': {
        name: '输入数值',
        type: 'input',
        key: 'staticStatusValue',
        config: {
            type: 'text',
            placeholder: '输入 0, 1 或 2 控制状态'
        },
    },
    'staticSwitchState': {
        name: '手动开关',
        type: 'input',
        key: 'staticSwitchState',
        config: {
            type: 'text',
            placeholder: '输入 0/1 测试'
        },
    },
    'cellFontSize': {
        name: '文字大小',
        type: 'input',
        key: 'fontSize',
        defVal: '12',
        config: {
            type: 'number',
            min: 1,
            max: 100,
            step: 1,
            unit: 'px',
        },
    },
    'monitorVarList': {
        name: '变量列表',
        type: 'textarea',
        key: 'monitorVarList',
        config: {
            rows: 6,
            placeholder: '请输入变量名称，每行一个'
        },
    },
    'erchenchiDeviceId': {
        name: '设备选择',
        type: 'deviceSelect',
        key: 'erchenchiDeviceId',
        config: {
            placeholder: '请选择设备'
        },
    },
    'openStateImg': {
        name: '状态开图',
        type: 'image',
        key: 'openStateImg',
        config: {},
    },
    'closeStateImg': {
        name: '状态关图',
        type: 'image',
        key: 'closeStateImg',
        config: {},
    },
    'defaultImg': {
        name: '默认图片',
        type: 'image',
        key: 'defaultImg',
        config: {},
    },
    'rotateDirection': {
        name: '旋转动画方向',
        type: 'select',
        key: 'rotateDirection',
        config: {
            options: [{ key: null, title: '请选择' }, { key: 0, title: '顺时针' }, { key: 1, title: '逆时针' }]
        },
    },
    'rotateSpeed': {
        name: '旋转动画速度',
        type: 'select',
        key: 'rotateSpeed',
        config: {
            options: [{ key: null, title: '请选择' }, { key: '6', title: '慢速' }, { key: '3', title: '正常' }, {
                key: '1',
                title: '快速'
            }]
        },
    },
    'twinkleSpeed': {
        name: '闪烁动画速度',
        type: 'select',
        key: 'twinkleSpeed',
        config: {
            options: [{ key: null, title: '请选择' }, { key: '1', title: '慢速' }, { key: '2', title: '正常' }, {
                key: '3',
                title: '快速'
            }]
        },
    },
    'flowFluidWidth': {
        name: '流体宽度',
        type: 'input',
        key: 'strokeWidth',
        config: {
            type: 'number',
            min: 1,
            max: 100,
            step: 1,
            hideStep: false,
            decimal: false,
            required: false,
            unit: 'px',
        },
    },
    'flowFluidColor': {
        name: '流体颜色',
        type: 'color',
        key: 'strokeColor',
        config: {},
    },
    'flowPipWidth': {
        name: '管道宽度',
        type: 'input',
        key: 'pipWidth',
        config: {
            type: 'number',
            min: 1,
            max: 100,
            step: 1,
            hideStep: false,
            decimal: false,
            required: false,
            unit: 'px',
        },
    },
    'flowPipDashWidth': {
        name: '流体间距',
        type: 'input',
        key: 'pipDash',
        config: {
            type: 'number',
            min: 1,
            max: 100,
            step: 1,
            hideStep: false,
            decimal: false,
            required: false,
            unit: 'px',
        },
    },
    'flowPipColor': {
        name: '管道颜色',
        type: 'color',
        key: 'strokeBgColor',
        config: {},
    },
    'flowDirection': {
        name: '流动方向',
        type: 'select',
        key: 'flowDirection',
        config: {
            options: [{ key: null, title: '请选择' }, { key: 0, title: '正向' }, { key: 1, title: '反向' }]
        },
    },
    'flowSpeed': {
        name: '流动速度',
        type: 'select',
        key: 'pipSpeed',
        config: {
            options: [{ key: null, title: '请选择' }, { key: 1, title: '慢速' }, { key: 2, title: '正常' }, {
                key: 3,
                title: '快速'
            }]
        },
    },
    'flowRound': {
        name: '流体圆角',
        type: 'switch',
        key: 'flowRound',
        config: {
            trueLabel: '开启',
            falseLabel: '关闭'
        },
    },
    'pipRound': {
        name: '管道圆角',
        type: 'switch',
        key: 'pipRound',
        config: {
            trueLabel: '开启',
            falseLabel: '关闭'
        },
    },
    'troughBubbles': {
        name: '气泡状态',
        type: 'select',
        key: 'troughBubbles',
        config: {
            options: [
                { key: 1, title: '显示' },
                { key: 0, title: '隐藏' },
            ]
        },
    },
    'troughBorderWidth': {
        name: '槽体宽度',
        type: 'input',
        key: 'troughBorderWidth',
        config: {
            type: 'number',
            min: 1,
            max: 100,
            step: 1,
            hideStep: false,
            decimal: false,
            required: false,
            unit: 'px',
        },
    },
    'troughBorderRadius': {
        name: '槽体圆角',
        type: 'input',
        key: 'troughBorderRadius',
        config: {
            type: 'number',
            min: 1,
            max: 100,
            step: 1,
            hideStep: false,
            decimal: false,
            required: false,
            unit: 'px',
        },
    },
    'troughBorderColor': {
        name: '槽体颜色',
        type: 'color',
        key: 'troughBorderColor',
        config: {},
    },
    'troughBackgroundColor': {
        name: '槽体背景',
        type: 'color',
        key: 'troughBackgroundColor',
        config: {},
    },
    'troughLiquidColor': {
        name: '液体颜色',
        type: 'color',
        key: 'troughLiquidColor',
        config: {},
    },
    'troughMinScale': {
        name: '液位最小值',
        type: 'input',
        key: 'troughMinScale',
        config: {
            type: 'number',
            min: 0,
            max: 9999,
            step: 1,
            hideStep: false,
            decimal: true,
            required: false,
            unit: 'L',
        },
    },
    'troughMaxScale': {
        name: '液位最大值',
        type: 'input',
        key: 'troughMaxScale',
        config: {
            type: 'number',
            min: 0,
            max: 9999,
            step: 1,
            hideStep: false,
            decimal: true,
            required: false,
            unit: 'L',
        },
    },
    'timeFormat': {
        name: '日期格式',
        type: 'select',
        key: 'timeFormat',
        config: {
            options: [
                { key: 0, title: 'YYYY-MM-DD HH:mm:ss' },
                { key: 1, title: 'YYYY-MM-DD' },
                { key: 2, title: 'YYYY-MM' },
                { key: 3, title: 'MM-DD' },
                { key: 4, title: 'HH:mm:ss' },
                { key: 5, title: 'HH:mm' },
                { key: 6, title: 'mm:ss' },
                { key: 7, title: 'YYYY年MM月DD日 HH:mm:ss' },
                { key: 8, title: 'YYYY年MM月DD日' },
                { key: 9, title: 'YYYY年MM月' },
                { key: 10, title: 'MM月DD日' },
            ]
        },
    },
    'playUrl': {
        name: '播放地址',
        type: 'input',
        key: 'playUrl',
        config: {
            type: 'text',
            required: false,
        },
    },
    'poster': {
        name: '封面',
        type: 'input',
        key: 'poster',
        config: {
            type: 'text',
            required: false,
        },
    },
    'showScale': {
        name: '显示刻度',
        type: 'switch',
        key: 'showScale',
        config: {
            trueLabel: '显示',
            falseLabel: '隐藏'
        },
    },
    'bgFillColor1': {
        name: '背景1',
        type: 'color',
        key: 'bgFillColor1',
        config: {},
    },
    'bgFillColor2': {
        name: '背景2',
        type: 'color',
        key: 'bgFillColor2',
        config: {},
    },
    'minScale': {
        name: '最小刻度值',
        type: 'input',
        key: 'minScale',
        config: {
            type: 'number',
            min: -9999,
            max: 9999,
            step: 1,
            hideStep: false,
            decimal: true,
            required: true,
            unit: '',
        },
    },
    'scaleValDuration': {
        name: '动画时长',
        type: 'input',
        key: 'scaleValDuration',
        config: {
            type: 'number',
            min: 0,
            max: 999,
            step: 0.1,
            hideStep: false,
            decimal: true,
            required: true,
            unit: '秒',
        },
    },
    'scaleTransX': {
        name: '刻度偏移',
        type: 'input',
        key: 'scaleTransX',
        config: {
            type: 'number',
            min: -100,
            max: 100,
            step: 0.1,
            hideStep: false,
            decimal: true,
            required: true,
            unit: 'px',
        },
    },
    'scaleFontSize': {
        name: '刻度字体大小',
        type: 'input',
        key: 'fontSize',
        config: {
            type: 'number',
            min: 0,
            max: 100,
            step: 0.1,
            hideStep: false,
            decimal: true,
            required: true,
            unit: 'px',
        },
    },

    'scaleFontColor': {
        name: '刻度文字颜色',
        type: 'color',
        key: 'fontColor',
        config: {},
    },
    'alarmFontColor': {
        name: '数据/分页颜色',
        type: 'color',
        key: 'fontColor',
        config: {},
    },
    'scaleColor': {
        name: '刻度颜色',
        type: 'color',
        key: 'scaleColor',
        config: {},
    },
    'scaleBgColor': {
        name: '背景颜色',
        type: 'color',
        key: 'fillColor',
        config: {},
    },
    'scaleStrokeColor': {
        name: '边框颜色',
        type: 'color',
        key: 'strokeColor',
        config: {},
    },
    'maxScale': {
        name: '最大刻度值',
        type: 'input',
        key: 'maxScale',
        config: {
            type: 'number',
            min: -9999,
            max: 9999,
            step: 1,
            hideStep: false,
            decimal: true,
            required: true,
            unit: '',
        },
    },
    'smallUnitScale': {
        name: '小刻度间隔',
        type: 'input',
        key: 'smallUnitScale',
        config: {
            type: 'number',
            min: 0,
            max: 9999,
            step: 1,
            hideStep: false,
            decimal: true,
            required: true,
            unit: '',
        },
    },
    'bigUnitScale': {
        name: '大刻度间隔',
        type: 'input',
        key: 'bigUnitScale',
        config: {
            type: 'number',
            min: 0,
            max: 9999,
            step: 1,
            hideStep: false,
            decimal: true,
            required: true,
            unit: '',
        },
    },
    'textareaRows': {
        name: '文字行数',
        type: 'input',
        key: 'textareaRows',
        config: {
            type: 'number',
            min: 0,
            max: 50,
            step: 1,
            hideStep: false,
            decimal: false,
            required: true,
            unit: '',
        },
    },
    'placeholderText': {
        name: 'placeholder',
        type: 'input',
        key: 'placeholderText',
        config: {
            type: 'text',
        },
    },
    'tableBoderColor': {
        name: '表格边框颜色',
        key: 'borderColor',
        type: 'color',
        config: {},
    },
    'tableHeaderBgColor': {
        name: '表头背景颜色',
        key: 'tableHeaderBgColor',
        type: 'color',
        config: {},
    },
    'tableHeaderFontColor': {
        name: '表头字体颜色',
        key: 'tableHeaderFontColor',
        type: 'color',
        config: {},
    },
    'tableHeaderFontSize': {
        name: '表头字体大小',
        type: 'input',
        key: 'tableHeaderFontSize',
        config: {
            type: 'number',
            min: 8,
            max: 50,
            step: 1,
            hideStep: false,
            decimal: false,
            required: true,
            unit: 'px',
        },
    },
    'tableHeaderFontStyle': {
        name: '表头字体样式',
        type: 'select',
        key: 'tableHeaderFontStyle',
        config: {
            options: [
                { key: 'normal', title: '正常' },
                { key: 'italic', title: '斜体' },
            ]
        },
    },
    'tableHeaderFontWeight': {
        name: '表头字体权重',
        type: 'select',
        key: 'tableHeaderFontWeight',
        config: {
            options: [
                { key: 'normal', title: '正常' },
                { key: 'bold', title: '粗体' },
            ]
        },
    },
    'blazeColor': {
        name: '气泡颜色',
        key: 'blazeColor',
        type: 'color',
        config: {},
    },
    'blazeSize': {
        name: '气泡大小',
        type: 'input',
        key: 'blazeSize',
        config: {
            type: 'number',
            min: 5,
            max: 500,
            step: 1,
            hideStep: false,
            decimal: false,
            required: true,
            unit: 'px',
        },
    },
    'blazeLevel': {
        name: '沸腾程度',
        type: 'select',
        key: 'blazeLevel',
        config: {
            options: [
                { key: 0, title: ' 不沸腾' },
                { key: 1, title: '微微冒泡' },
                { key: 2, title: '正常冒泡' },
                { key: 3, title: '快速冒泡' },
            ]
        },
    },
    'erchenchiDeviceId': {
        name: '设备选择',
        type: 'deviceSelect',
        key: 'erchenchiDeviceId',
        config: {
            placeholder: '请选择设备'
        },
    },
    // === 仪表盘属性配置 ===
    'gaugeValueMode': {
        name: '数值模式',
        type: 'select',
        key: 'gaugeValueMode',
        config: {
            options: [
                { key: 'raw', title: '原值' },
                { key: 'percent', title: '百分比' },
            ]
        },
    },
    'gaugeTestValue': {
        name: '测试数值',
        type: 'input',
        key: 'gaugeValue',
        config: {
            type: 'number',
            min: -99999,
            max: 99999,
            step: 1,
            decimal: true,
            placeholder: '输入测试值',
        },
    },
    'gaugeMin': {
        name: '最小值',
        type: 'input',
        key: 'gaugeMin',
        config: {
            type: 'number',
            min: -9999,
            max: 9999,
            step: 1,
            decimal: true,
            required: true,
        },
    },
    'gaugeMax': {
        name: '最大值',
        type: 'input',
        key: 'gaugeMax',
        config: {
            type: 'number',
            min: -9999,
            max: 99999,
            step: 1,
            decimal: true,
            required: true,
        },
    },
    'gaugeUnit': {
        name: '数值单位',
        type: 'input',
        key: 'gaugeUnit',
        config: {
            placeholder: '原值模式单位(百分比时忽略)',
        },
    },
    'gaugeTitle': {
        name: '标题文字',
        type: 'input',
        key: 'gaugeTitle',
        config: {
            placeholder: '底部标题',
        },
    },
    'gaugeAlarmMode': {
        name: '警告模式',
        type: 'select',
        key: 'gaugeAlarmMode',
        config: {
            options: [
                { key: 'high', title: '高值警告' },
                { key: 'low', title: '低值警告' },
                { key: 'both', title: '双向警告' },
            ]
        },
    },
    'warningThreshold': {
        name: '警告阈值',
        type: 'input',
        key: 'warningThreshold',
        config: {
            type: 'number',
            min: -99999,
            max: 99999,
            step: 1,
            decimal: true,
        },
    },
    'dangerThreshold': {
        name: '危险阈值',
        type: 'input',
        key: 'dangerThreshold',
        config: {
            type: 'number',
            min: 0,
            max: 99999,
            step: 1,
            decimal: true,
        },
    },
    'lowWarningThreshold': {
        name: '低值警告阈值',
        type: 'input',
        key: 'lowWarningThreshold',
        config: {
            type: 'number',
            min: -99999,
            max: 99999,
            step: 1,
            decimal: true,
            placeholder: '双向模式使用',
        },
    },
    'lowDangerThreshold': {
        name: '低值危险阈值',
        type: 'input',
        key: 'lowDangerThreshold',
        config: {
            type: 'number',
            min: -99999,
            max: 99999,
            step: 1,
            decimal: true,
            placeholder: '双向模式使用',
        },
    },
    'highWarningThreshold': {
        name: '高值警告阈值',
        type: 'input',
        key: 'highWarningThreshold',
        config: {
            type: 'number',
            min: -99999,
            max: 99999,
            step: 1,
            decimal: true,
            placeholder: '双向模式使用',
        },
    },
    'highDangerThreshold': {
        name: '高值危险阈值',
        type: 'input',
        key: 'highDangerThreshold',
        config: {
            type: 'number',
            min: -99999,
            max: 99999,
            step: 1,
            decimal: true,
            placeholder: '双向模式使用',
        },
    },
    'dialColor': {
        name: '表盘颜色',
        key: 'dialColor',
        type: 'color',
        config: {},
    },
    'pointerColor': {
        name: '指针颜色',
        key: 'pointerColor',
        type: 'color',
        config: {},
    },
    'normalColor': {
        name: '正常区颜色',
        key: 'normalColor',
        type: 'color',
        config: {},
    },
    'warningColor': {
        name: '警告区颜色',
        key: 'warningColor',
        type: 'color',
        config: {},
    },
    'dangerColor': {
        name: '危险区颜色',
        key: 'dangerColor',
        type: 'color',
        config: {},
    },
    // ============================================
    // 趋势图样式属性
    // ============================================
    'trendChartHeader': {
        name: '数据配置',
        type: 'header',
    },
    'trendTitle': {
        name: '图表标题',
        type: 'input',
        key: 'trendTitle',
        defVal: '趋势图',
        config: {
            type: 'text',
            placeholder: '输入图表标题'
        },
    },
    'trendChartStyle': {
        name: '图表样式',
        type: 'select',
        key: 'trendChartStyle',
        defVal: 'dark',
        config: {
            options: [
                { key: 'dark', title: '深色模式' },
                { key: 'transparent', title: '透明折线图' },
                { key: 'bar', title: '直方图' },
                { key: 'scatter', title: '离散点状图' },
                { key: 'stacked_area', title: '渐变堆叠面积图' }
            ]
        }
    },
    'trendTimeMode': {
        name: '数据模式',
        type: 'select',
        key: 'trendTimeMode',
        defVal: 'realtime',
        config: {
            options: [
                { key: 'realtime', title: '实时数据' },
                { key: 'history', title: '历史数据' }
            ]
        },
    },
    'trendTimePreset': {
        name: '时间范围',
        type: 'select',
        key: 'trendTimePreset',
        defVal: 'hour_1',
        config: {
            options: [
                { key: 'minute_1', title: '最近1分钟' },
                { key: 'minute_5', title: '最近5分钟' },
                { key: 'minute_30', title: '最近半小时' },
                { key: 'hour_3', title: '最近3小时' },
                { key: 'day_1', title: '最近一天' },
                { key: 'day_7', title: '最近7天' },
                { key: 'day_30', title: '最近30天' },
                { key: 'custom', title: '自定义' }
            ]
        },
    },
    'trendCustomDuration': {
        name: '自定义时长(秒)',
        type: 'input',
        key: 'trendCustomDuration',
        defVal: '3600',
        config: { type: 'number', min: 10, max: 9999999 }
    },
    'trendStartTime': {
        name: '开始时间',
        type: 'datetime',
        key: 'trendStartTime',
        defVal: '0',
        config: { step: 60 }
    },
    'trendEndTime': {
        name: '结束时间',
        type: 'datetime',
        key: 'trendEndTime',
        defVal: '0',
        config: { step: 60 }
    },
    'trendSnList': {
        name: '监控变量',
        type: 'varselect',
        key: 'trendSnList',
        config: {
            placeholder: '点击选择监控变量'
        },
    },
    'trendRefreshInterval': {
        name: '刷新间隔',
        type: 'select',
        key: 'trendRefreshInterval',
        defVal: '0',
        config: {
            options: [
                { key: '0', title: '不自动刷新' },
                { key: '1', title: '1秒' },
                { key: '5', title: '5秒' },
                { key: '10', title: '10秒' },
                { key: '30', title: '30秒' },
                { key: '60', title: '1分钟' },
                { key: '300', title: '5分钟' }
            ]
        },
    },
    'trendStyleHeader': {
        name: '外观设置',
        type: 'header',
    },
    'trendShowTitle': {
        name: '显示标题',
        type: 'switch',
        key: 'trendShowTitle',
        defVal: '1',
        config: { trueLabel: '显示', falseLabel: '隐藏' },
    },
    'trendShowLegend': {
        name: '显示图例',
        type: 'switch',
        key: 'trendShowLegend',
        defVal: '1',
        config: { trueLabel: '显示', falseLabel: '隐藏' },
    },
    'trendShowTooltip': {
        name: '显示提示',
        type: 'switch',
        key: 'trendShowTooltip',
        defVal: '1',
        config: { trueLabel: '显示', falseLabel: '隐藏' },
    },
    'trendShowArea': {
        name: '区域填充',
        type: 'switch',
        key: 'trendShowArea',
        defVal: '1',
        config: { trueLabel: '显示', falseLabel: '隐藏' },
    },
    'trendBgColor': {
        name: '背景颜色',
        type: 'color',
        key: 'trendBgColor',
        defVal: '#1a1a2e',
        config: {},
    },
    'trendBorderColor': {
        name: '边框颜色',
        type: 'color',
        key: 'trendBorderColor',
        defVal: '#16213e',
        config: {},
    },
    'trendTitleColor': {
        name: '标题颜色',
        type: 'color',
        key: 'trendTitleColor',
        defVal: '#ffffff',
        config: {},
    },
    'trendTextColor': {
        name: '文字颜色',
        type: 'color',
        key: 'trendTextColor',
        defVal: '#aaaaaa',
        config: {},
    },
    'trendGridColor': {
        name: '网格颜色',
        type: 'color',
        key: 'trendGridColor',
        defVal: '#2a2a4a',
        config: {},
    },
    // =============== 脉冲控制组件样式配置 ===============
    'pulseControlHeader': {
        name: '脉冲设置',
        type: 'header',
    },
    'pulseTargetKey': {
        name: '目标点位',
        type: 'virvar', // 使用变量选择器
        key: 'pulseTargetKey',
        config: {
            placeholder: '选择要控制的点位'
        },
    },
    'pulseHighValue': {
        name: '激活电平值',
        type: 'input',
        key: 'pulseHighValue',
        defVal: '1',
        config: {
            type: 'text',
            placeholder: '输入激活时发送的值（默认1）'
        },
    },
    'pulseLowValue': {
        name: '复位电平值',
        type: 'input',
        key: 'pulseLowValue',
        defVal: '0',
        config: {
            type: 'text',
            placeholder: '输入复位时发送的值（默认0）'
        },
    },
    'pulseDelay': {
        name: '脉冲延迟',
        type: 'input',
        key: 'pulseDelay',
        defVal: '2000',
        config: {
            type: 'number',
            min: 100,
            max: 60000,
            step: 100,
            unit: 'ms',
        },
    },
    'pulseOutputType': {
        name: '输出类型',
        type: 'select',
        key: 'pulseOutputType',
        defVal: 'numeric',
        config: {
            options: [
                { key: 'numeric', title: '数值输出（1/0）' },
                { key: 'boolean', title: '布尔输出（true/false）' }
            ]
        },
    },
    'pulseStyleHeader': {
        name: '按钮样式',
        type: 'header',
    },
    'pulseButtonText': {
        name: '按钮文字',
        type: 'input',
        key: 'pulseButtonText',
        defVal: '脉冲触发',
        config: {
            type: 'text',
            placeholder: '输入按钮显示文字'
        },
    },
    'pulseButtonBgColor': {
        name: '按钮背景',
        type: 'color',
        key: 'pulseButtonBgColor',
        defVal: '#409eff',
        config: {},
    },
    'pulseBgImage': {
        name: '导入样式',
        type: 'image',
        key: 'pulseBgImage',
        config: {
            placeholder: '选择图片自定义按钮外观'
        },
    },
    'pulseButtonTextColor': {
        name: '文字颜色',
        type: 'color',
        key: 'pulseButtonTextColor',
        defVal: '#ffffff',
        config: {},
    },
    'pulseButtonFontSize': {
        name: '字体大小',
        type: 'input',
        key: 'pulseButtonFontSize',
        defVal: '14',
        config: {
            type: 'number',
            min: 10,
            max: 50,
            step: 1,
            unit: 'px',
        },
    },
    'pulseButtonRadius': {
        name: '圆角大小',
        type: 'input',
        key: 'pulseButtonRadius',
        defVal: '4',
        config: {
            type: 'number',
            min: 0,
            max: 50,
            step: 1,
            unit: 'px',
        },
    },
};
