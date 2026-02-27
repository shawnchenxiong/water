import type { ElectricQuantityTrendData } from '@/api/types/analysis/energyTrend';
import { generateElectricQuantityData } from '@/api/mock/energyTrend';

export const fetchElectricQuantityTrend = async (params: {
  regionId: string;
  dateType: number;
  dateTime: string;
}): Promise<ElectricQuantityTrendData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateElectricQuantityData(params.dateType, params.dateTime));
    }, 500);
  });
};

