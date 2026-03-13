/**
 * ============================================
 * 时序数据库时间工具库
 * ============================================
 * 提供时间分割、格式化、范围计算等实用功能
 * 专为SCADA系统时序数据查询优化
 * 
 * @author Antigravity AI Assistant
 * @date 2026-02-03
 */

/**
 * 时间常量定义（毫秒）
 */
export const TIME_CONSTANTS = {
    SECOND: 1000,              // 1秒
    MINUTE: 60 * 1000,         // 1分钟
    HOUR: 60 * 60 * 1000,      // 1小时
    DAY: 24 * 60 * 60 * 1000,  // 1天
    WEEK: 7 * 24 * 60 * 60 * 1000,      // 1周
    MONTH: 30 * 24 * 60 * 60 * 1000,    // 1月（按30天计算）
    YEAR: 365 * 24 * 60 * 60 * 1000     // 1年（按365天计算）
};

/**
 * 预设时间范围配置
 * 根据常见使用场景预定义时间范围
 */
export const PRESET_TIME_RANGES = {
    // 实时监控场景
    REALTIME_5MIN: { duration: 5 * TIME_CONSTANTS.MINUTE, label: '最近5分钟', key: 'realtime_5m' },
    REALTIME_15MIN: { duration: 15 * TIME_CONSTANTS.MINUTE, label: '最近15分钟', key: 'realtime_15m' },
    REALTIME_30MIN: { duration: 30 * TIME_CONSTANTS.MINUTE, label: '最近30分钟', key: 'realtime_30m' },

    // 小时级监控
    HOUR_1: { duration: 1 * TIME_CONSTANTS.HOUR, label: '最近1小时', key: 'hour_1' },
    HOUR_6: { duration: 6 * TIME_CONSTANTS.HOUR, label: '最近6小时', key: 'hour_6' },
    HOUR_12: { duration: 12 * TIME_CONSTANTS.HOUR, label: '最近12小时', key: 'hour_12' },
    HOUR_24: { duration: 24 * TIME_CONSTANTS.HOUR, label: '最近24小时', key: 'hour_24' },

    // 天级分析
    DAY_1: { duration: 1 * TIME_CONSTANTS.DAY, label: '最近1天', key: 'day_1' },
    DAY_3: { duration: 3 * TIME_CONSTANTS.DAY, label: '最近3天', key: 'day_3' },
    DAY_7: { duration: 7 * TIME_CONSTANTS.DAY, label: '最近7天', key: 'day_7' },
    DAY_30: { duration: 30 * TIME_CONSTANTS.DAY, label: '最近30天', key: 'day_30' },

    // 周月级分析
    WEEK_2: { duration: 14 * TIME_CONSTANTS.DAY, label: '最近2周', key: 'week_2' },
    MONTH_1: { duration: 30 * TIME_CONSTANTS.DAY, label: '最近1个月', key: 'month_1' },
    MONTH_3: { duration: 90 * TIME_CONSTANTS.DAY, label: '最近3个月', key: 'month_3' },
    MONTH_6: { duration: 180 * TIME_CONSTANTS.DAY, label: '最近6个月', key: 'month_6' },
    YEAR_1: { duration: 365 * TIME_CONSTANTS.DAY, label: '最近1年', key: 'year_1' }
};

/**
 * 获取预设时间范围
 * @param {string} presetKey - 预设键名（如 'hour_1', 'day_7'）
 * @param {number} endTime - 结束时间（默认为当前时间）
 * @returns {Object} { startTime, endTime, label }
 */
export function getPresetTimeRange(presetKey, endTime = Date.now()) {
    const preset = Object.values(PRESET_TIME_RANGES).find(p => p.key === presetKey);
    if (!preset) {
        throw new Error(`未找到预设时间范围: ${presetKey}`);
    }

    return {
        startTime: endTime - preset.duration,
        endTime: endTime,
        label: preset.label,
        duration: preset.duration
    };
}

/**
 * 智能时间分割
 * 根据总时间跨度自动分割成多个合理的查询区间
 * 
 * @param {number} startTime - 开始时间（毫秒）
 * @param {number} endTime - 结束时间（毫秒）
 * @param {Object} options - 配置选项
 * @param {number} options.maxPointsPerQuery - 单次查询最大数据点数（默认10000）
 * @param {number} options.samplingInterval - 采集间隔（毫秒，默认1000）
 * @param {number} options.deviceCount - 设备数量（默认1）
 * @returns {Array} 分割后的时间段数组 [{ startTime, endTime, index }]
 */
export function splitTimeRange(startTime, endTime, options = {}) {
    const {
        maxPointsPerQuery = 10000,
        samplingInterval = 1000,
        deviceCount = 1
    } = options;

    // 计算总时间跨度
    const totalDuration = endTime - startTime;

    // 计算预估总数据点数
    const estimatedPoints = Math.ceil(totalDuration / samplingInterval) * deviceCount;

    // 如果数据量在允许范围内，不需要分割
    if (estimatedPoints <= maxPointsPerQuery) {
        return [{
            startTime,
            endTime,
            index: 0,
            estimatedPoints
        }];
    }

    // 计算需要分割成几段
    const segmentCount = Math.ceil(estimatedPoints / maxPointsPerQuery);

    // 计算每段的时间长度
    const segmentDuration = Math.floor(totalDuration / segmentCount);

    // 生成分割后的时间段
    const segments = [];
    for (let i = 0; i < segmentCount; i++) {
        const segmentStart = startTime + (i * segmentDuration);
        const segmentEnd = (i === segmentCount - 1) ? endTime : segmentStart + segmentDuration;

        segments.push({
            startTime: segmentStart,
            endTime: segmentEnd,
            index: i,
            estimatedPoints: Math.ceil((segmentEnd - segmentStart) / samplingInterval) * deviceCount
        });
    }

    return segments;
}

/**
 * 按固定时间间隔分割
 * @param {number} startTime - 开始时间
 * @param {number} endTime - 结束时间
 * @param {number} interval - 间隔时长（毫秒）
 * @returns {Array} 分割后的时间段数组
 */
export function splitByInterval(startTime, endTime, interval) {
    const segments = [];
    let currentStart = startTime;
    let index = 0;

    while (currentStart < endTime) {
        const currentEnd = Math.min(currentStart + interval, endTime);
        segments.push({
            startTime: currentStart,
            endTime: currentEnd,
            index: index++,
            duration: currentEnd - currentStart
        });
        currentStart = currentEnd;
    }

    return segments;
}

/**
 * 格式化时间戳为可读字符串
 * @param {number} timestamp - 时间戳（毫秒）
 * @param {string} format - 格式类型: 'full'|'date'|'time'|'datetime'
 * @returns {string} 格式化后的时间字符串
 */
export function formatTimestamp(timestamp, format = 'full') {
    if (!timestamp || isNaN(timestamp)) {
        return 'Invalid timestamp';
    }

    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    switch (format) {
        case 'date':
            return `${year}-${month}-${day}`;
        case 'time':
            return `${hours}:${minutes}:${seconds}`;
        case 'datetime':
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        case 'full':
        default:
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
}

/**
 * 格式化时间段
 * @param {number} startTime - 开始时间
 * @param {number} endTime - 结束时间
 * @returns {string} 格式化的时间段描述
 */
export function formatTimeRange(startTime, endTime) {
    const start = formatTimestamp(startTime);
    const end = formatTimestamp(endTime);
    const duration = formatDuration(endTime - startTime);

    return `${start} ~ ${end} (时长: ${duration})`;
}

/**
 * 格式化时长
 * @param {number} duration - 时长（毫秒）
 * @returns {string} 格式化的时长描述
 */
export function formatDuration(duration) {
    if (duration < TIME_CONSTANTS.MINUTE) {
        return `${Math.round(duration / TIME_CONSTANTS.SECOND)}秒`;
    } else if (duration < TIME_CONSTANTS.HOUR) {
        return `${Math.round(duration / TIME_CONSTANTS.MINUTE)}分钟`;
    } else if (duration < TIME_CONSTANTS.DAY) {
        const hours = Math.floor(duration / TIME_CONSTANTS.HOUR);
        const minutes = Math.round((duration % TIME_CONSTANTS.HOUR) / TIME_CONSTANTS.MINUTE);
        return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`;
    } else if (duration < TIME_CONSTANTS.MONTH) {
        const days = Math.floor(duration / TIME_CONSTANTS.DAY);
        const hours = Math.round((duration % TIME_CONSTANTS.DAY) / TIME_CONSTANTS.HOUR);
        return hours > 0 ? `${days}天${hours}小时` : `${days}天`;
    } else {
        const months = Math.floor(duration / TIME_CONSTANTS.MONTH);
        const days = Math.round((duration % TIME_CONSTANTS.MONTH) / TIME_CONSTANTS.DAY);
        return days > 0 ? `${months}个月${days}天` : `${months}个月`;
    }
}

/**
 * 计算采样间隔建议
 * 根据查询的时间范围，建议合适的数据采样/聚合间隔
 * 
 * @param {number} duration - 时间跨度（毫秒）
 * @param {number} targetPoints - 目标数据点数（默认500，适合图表展示）
 * @returns {Object} { interval, intervalMs, description }
 */
export function suggestSamplingInterval(duration, targetPoints = 500) {
    // 计算理想的采样间隔
    const idealInterval = duration / targetPoints;

    // 定义标准间隔档位（毫秒）
    const intervals = [
        { ms: 1000, label: '1秒' },
        { ms: 5000, label: '5秒' },
        { ms: 10000, label: '10秒' },
        { ms: 30000, label: '30秒' },
        { ms: 60000, label: '1分钟' },
        { ms: 300000, label: '5分钟' },
        { ms: 600000, label: '10分钟' },
        { ms: 1800000, label: '30分钟' },
        { ms: 3600000, label: '1小时' },
        { ms: 21600000, label: '6小时' },
        { ms: 86400000, label: '1天' }
    ];

    // 找到最接近的标准间隔
    let selectedInterval = intervals[0];
    for (const interval of intervals) {
        if (interval.ms <= idealInterval) {
            selectedInterval = interval;
        } else {
            break;
        }
    }

    return {
        intervalMs: selectedInterval.ms,
        label: selectedInterval.label,
        estimatedPoints: Math.ceil(duration / selectedInterval.ms),
        description: `建议使用 ${selectedInterval.label} 采样间隔，预计返回约 ${Math.ceil(duration / selectedInterval.ms)} 个数据点`
    };
}

/**
 * 对齐时间到整点/整分
 * @param {number} timestamp - 时间戳
 * @param {string} alignTo - 对齐到: 'hour'|'minute'|'day'
 * @param {string} direction - 方向: 'floor'(向下)|'ceil'(向上)
 * @returns {number} 对齐后的时间戳
 */
export function alignTime(timestamp, alignTo = 'minute', direction = 'floor') {
    const date = new Date(timestamp);

    switch (alignTo) {
        case 'hour':
            date.setMinutes(0, 0, 0);
            if (direction === 'ceil' && date.getTime() < timestamp) {
                date.setHours(date.getHours() + 1);
            }
            break;
        case 'minute':
            date.setSeconds(0, 0);
            if (direction === 'ceil' && date.getTime() < timestamp) {
                date.setMinutes(date.getMinutes() + 1);
            }
            break;
        case 'day':
            date.setHours(0, 0, 0, 0);
            if (direction === 'ceil' && date.getTime() < timestamp) {
                date.setDate(date.getDate() + 1);
            }
            break;
    }

    return date.getTime();
}

/**
 * 获取时间范围的统计信息
 * @param {number} startTime - 开始时间
 * @param {number} endTime - 结束时间
 * @param {Object} options - 配置选项
 * @returns {Object} 统计信息
 */
export function getTimeRangeStats(startTime, endTime, options = {}) {
    const {
        samplingInterval = 1000,
        deviceCount = 1
    } = options;

    const duration = endTime - startTime;
    const estimatedPoints = Math.ceil(duration / samplingInterval) * deviceCount;
    const samplingAdvice = suggestSamplingInterval(duration);

    return {
        startTime,
        endTime,
        duration,
        durationLabel: formatDuration(duration),
        estimatedPoints,
        samplingInterval,
        deviceCount,
        samplingAdvice,
        isSafeRange: estimatedPoints <= 50000, // 是否在安全范围内
        splitAdvice: estimatedPoints > 50000 ?
            `建议分割成 ${Math.ceil(estimatedPoints / 10000)} 个查询` :
            '无需分割'
    };
}

/**
 * 批量时间范围处理器
 * 适用于需要分批查询大量历史数据的场景
 */
export class TimeRangeBatchProcessor {
    constructor(startTime, endTime, options = {}) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.options = {
            maxPointsPerQuery: 10000,
            samplingInterval: 1000,
            deviceCount: 1,
            ...options
        };

        this.segments = splitTimeRange(startTime, endTime, this.options);
        this.currentIndex = 0;
    }

    /**
     * 获取下一个时间段
     */
    next() {
        if (this.currentIndex >= this.segments.length) {
            return null;
        }
        return this.segments[this.currentIndex++];
    }

    /**
     * 是否还有更多时间段
     */
    hasNext() {
        return this.currentIndex < this.segments.length;
    }

    /**
     * 获取进度百分比
     */
    getProgress() {
        return Math.round((this.currentIndex / this.segments.length) * 100);
    }

    /**
     * 重置到开始
     */
    reset() {
        this.currentIndex = 0;
    }

    /**
     * 获取所有时间段
     */
    getAllSegments() {
        return this.segments;
    }
}

/**
 * 默认导出工具对象
 */
export default {
    TIME_CONSTANTS,
    PRESET_TIME_RANGES,
    getPresetTimeRange,
    splitTimeRange,
    splitByInterval,
    formatTimestamp,
    formatTimeRange,
    formatDuration,
    suggestSamplingInterval,
    alignTime,
    getTimeRangeStats,
    TimeRangeBatchProcessor
};
