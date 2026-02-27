/**
 * 下载工具函数
 */

import * as XLSX from 'xlsx'

/**
 * 将数据导出为CSV格式并下载
 * @param data 要导出的数据数组
 * @param columns 列定义数组
 * @param filename 文件名（不包括扩展名）
 */
export function downloadCSV<T = any>(
  data: T[],
  columns: Array<{
    prop?: string
    label: string
    formatter?: (row: T) => string | number
    getValue?: (row: T) => string | number
  }>,
  filename = 'export'
) {
  if (!data || data.length === 0) {
    return
  }

  // 创建CSV内容
  const csvContent = generateCSVContent(data, columns)
  
  // 下载文件
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;')
}

/**
 * 将数据导出为JSON格式并下载
 * @param data 要导出的数据数组
 * @param filename 文件名（不包括扩展名）
 */
export function downloadJSON<T = any>(data: T[], filename = 'export') {
  if (!data || data.length === 0) {
    return
  }

  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, `${filename}.json`, 'application/json')
}

/**
 * 将数据导出为Excel格式并下载
 * @param data 要导出的数据数组
 * @param columns 列定义数组
 * @param filename 文件名（不包括扩展名）
 * @param sheetName 工作表名称
 */
export function downloadExcel<T = any>(
  data: T[],
  columns: Array<{
    prop?: string
    label: string
    formatter?: (row: T) => string | number
    getValue?: (row: T) => string | number
    width?: number
  }>,
  filename = 'export',
  sheetName = 'Sheet1'
) {
  if (!data || data.length === 0) {
    return
  }

  try {
    // 转换数据为Excel工作表格式
    const worksheetData = convertDataToWorksheet(data, columns)
    
    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    
    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    
    // 设置列宽
    const columnWidths = columns.map(col => ({
      wch: col.width ? col.width / 7 : 15 // 转换为Excel列宽单位
    }))
    worksheet['!cols'] = columnWidths
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    
    // 生成Excel文件并下载
    XLSX.writeFile(workbook, `${filename}.xlsx`)
    
  } catch (error) {
    throw new Error('Excel导出失败')
  }
}

/**
 * 转换数据为Excel工作表格式（二维数组）
 */
function convertDataToWorksheet<T>(
  data: T[],
  columns: Array<{
    prop?: string
    label: string
    formatter?: (row: T) => string | number
    getValue?: (row: T) => string | number
  }>
): any[][] {
  // 创建表头行
  const headers = columns.map(col => col.label)
  
  // 创建数据行
  const rows = data.map(row => {
    return columns.map(col => {
      let value: any

      // 获取单元格值
      if (col.getValue) {
        value = col.getValue(row)
      } else if (col.formatter) {
        value = col.formatter(row)
      } else if (col.prop) {
        value = (row as any)[col.prop]
      } else {
        value = ''
      }

      // 处理值格式
      if (value === null || value === undefined) {
        return ''
      }

      // 保持原始数据类型，让xlsx库自动处理格式
      return value
    })
  })

  // 返回包含表头和数据的二维数组
  return [headers, ...rows]
}

/**
 * 生成CSV内容
 */
function generateCSVContent<T>(
  data: T[],
  columns: Array<{
    prop?: string
    label: string
    formatter?: (row: T) => string | number
    getValue?: (row: T) => string | number
  }>
): string {
  // CSV标题行
  const headers = columns.map(col => `"${col.label}"`).join(',')
  
  // CSV数据行
  const rows = data.map(row => {
    return columns.map(col => {
      let value: any

      // 获取单元格值
      if (col.getValue) {
        value = col.getValue(row)
      } else if (col.formatter) {
        value = col.formatter(row)
      } else if (col.prop) {
        value = (row as any)[col.prop]
      } else {
        value = ''
      }

      // 处理值格式
      if (value === null || value === undefined) {
        value = ''
      } else if (typeof value === 'string') {
        // 转义CSV中的双引号并用双引号包围含有特殊字符的字段
        value = `"${value.replace(/"/g, '""')}"`
      } else {
        value = `"${value}"`
      }

      return value
    }).join(',')
  })

  return [headers, ...rows].join('\n')
}

/**
 * 下载文件
 * @param content 文件内容
 * @param filename 文件名
 * @param contentType MIME类型
 */
function downloadFile(content: string, filename: string, contentType: string) {
  // 创建Blob对象
  const blob = new Blob(['\uFEFF' + content], { type: contentType }) // \uFEFF是BOM，确保中文正确显示
  
  // 创建下载链接
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  
  // 触发下载
  document.body.appendChild(link)
  link.click()
  
  // 清理
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * 根据当前时间生成文件名
 * @param prefix 文件名前缀
 * @returns 格式化的文件名
 */
export function generateTimestampFilename(prefix = 'export'): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  
  return `${prefix}_${year}${month}${day}_${hours}${minutes}${seconds}`
}

/**
 * 下载Blob文件
 * @param blob Blob对象
 * @param filename 文件名
 */
export function downloadBlobFile(blob: Blob, filename: string) {
  // 创建下载链接
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  
  // 触发下载
  document.body.appendChild(link)
  link.click()
  
  // 清理
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
