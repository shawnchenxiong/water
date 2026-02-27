import dayjs from 'dayjs'

/**
 * 格式化日期时间
 * @param date 日期字符串或Date对象
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (date: string | Date | undefined | null, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!date) return '-'
  
  try {
    return dayjs(date).format(format)
  } catch (error) {
    console.error('日期格式化失败:', error)
    return '-'
  }
}

/**
 * 格式化日期
 * @param date 日期字符串或Date对象
 * @returns 格式化后的日期字符串 (YYYY-MM-DD)
 */
export const formatDate = (date: string | Date | undefined | null): string => {
  return formatDateTime(date, 'YYYY-MM-DD')
}

/**
 * 格式化时间
 * @param date 日期字符串或Date对象
 * @returns 格式化后的时间字符串 (HH:mm:ss)
 */
export const formatTime = (date: string | Date | undefined | null): string => {
  return formatDateTime(date, 'HH:mm:ss')
}

/**
 * 相对时间格式化
 * @param date 日期字符串或Date对象
 * @returns 相对时间字符串，如"2小时前"、"3天前"等
 */
export const formatRelativeTime = (date: string | Date | undefined | null): string => {
  if (!date) return '-'
  
  try {
    const now = dayjs()
    const target = dayjs(date)
    const diffInMinutes = now.diff(target, 'minute')
    const diffInHours = now.diff(target, 'hour')
    const diffInDays = now.diff(target, 'day')
    
    if (diffInMinutes < 1) {
      return '刚刚'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`
    } else if (diffInHours < 24) {
      return `${diffInHours}小时前`
    } else if (diffInDays < 30) {
      return `${diffInDays}天前`
    } else {
      return formatDate(date)
    }
  } catch (error) {
    console.error('相对时间格式化失败:', error)
    return '-'
  }
}

/**
 * 获取当前日期时间字符串
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 当前日期时间字符串
 */
export const getCurrentDateTime = (format = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs().format(format)
}

/**
 * 获取今日日期字符串
 * @returns 今日日期字符串 (YYYY-MM-DD)
 */
export const getToday = (): string => {
  return dayjs().format('YYYY-MM-DD')
}

/**
 * 获取昨日日期字符串
 * @returns 昨日日期字符串 (YYYY-MM-DD)
 */
export const getYesterday = (): string => {
  return dayjs().subtract(1, 'day').format('YYYY-MM-DD')
}
