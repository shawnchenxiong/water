import type { ElectricQuantityTrendData, ElectricQuantityTableItem } from '@/api/types/analysis/energyTrend';

export function generateElectricQuantityData(
  dateType: number,
  dateTime: string,
  stationName: string = '芜湖城南污水厂'
): ElectricQuantityTrendData {
  let xAxisData: string[];
  let tableData: ElectricQuantityTableItem[];

  if (dateType === 1) {
    // 月视图：01-31
    const daysInMonth = 31;
    xAxisData = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));
    tableData = xAxisData.map(day => {
      const power = Math.random() < 0.7 ? Math.random() * 30000 + 5000 : null;
      return {
        stationName,
        time: `${dateTime}-${day}`,
        inverterPower: power ? parseFloat(power.toFixed(2)) : null,
        gridPointPower: null,
        selfUsePower: null,
        gridPower: null,
      };
    });
  } else if (dateType === 2) {
    // 年视图：01-12
    xAxisData = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    tableData = xAxisData.map(month => {
      const power = parseInt(month) <= 10 ? Math.random() * 600000 + 200000 : null;
      return {
        stationName,
        time: `${dateTime}-${month}`,
        inverterPower: power ? parseFloat(power.toFixed(2)) : null,
        gridPointPower: null,
        selfUsePower: null,
        gridPower: null,
      };
    });
  } else {
    // 总视图：多年数据
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];
    xAxisData = years.map(y => String(y));
    tableData = xAxisData.map(year => {
      const power = Math.random() * 5000000 + 1000000;
      return {
        stationName,
        time: year,
        inverterPower: parseFloat(power.toFixed(2)),
        gridPointPower: null,
        selfUsePower: null,
        gridPower: null,
      };
    });
  }

  const seriesData = tableData.map(item => item.inverterPower || 0);

  return {
    chartData: {
      xAxisData,
      series: [
        {
          name: '逆变器发电量',
          data: seriesData,
        },
      ],
    },
    tableData,
  };
}

