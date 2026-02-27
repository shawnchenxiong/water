export interface ElectricQuantityChartData {
  xAxisData: string[]; // X轴数据（日期或月份）
  series: Array<{
    name: string; // 系列名称
    data: number[]; // Y轴数据
  }>;
}

export interface ElectricQuantityTableItem {
  stationName: string; // 电站名称
  time: string; // 时间 (YYYY-MM or YYYY-MM-DD)
  inverterPower: number | null; // 逆变器发电量 (kWh)
  gridPointPower: number | null; // 并网点发电量 (kWh)
  selfUsePower: number | null; // 自发自用电量 (kWh)
  gridPower: number | null; // 上网电量 (kWh)
}

export interface ElectricQuantityTrendData {
  chartData: ElectricQuantityChartData;
  tableData: ElectricQuantityTableItem[];
}

