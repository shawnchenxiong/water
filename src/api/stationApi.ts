import request from '@/utils/request';
import type { StationTreeResponse, StationTreeNode } from '@/types/station';

/**
 * 场站列表接口响应
 */
interface FactoryListResponse {
  success: boolean;
  message: string;
  code: number;
  result: {
    records: Array<{
      id: number;
      name: string;
      note?: string;
      website?: string;
      address?: string;
      photo?: string;
      lon?: number;
      lat?: number;
      createBy?: string;
      createBy_dictText?: string;
      createTime?: string;
      updateTime?: string;
    }>;
    total: number;
  };
}

/**
 * 获取区域设备树形结构
 * 注意：deviceType 和 filterModelId 参数保留用于兼容性，但当前实现使用场站列表接口
 */
export async function getRegionDeviceTree(
  _deviceType: string = '0915',
  _filterModelId?: string
): Promise<StationTreeResponse> {
  // 检查是否使用Mock数据
  
  try {
    // 调用场站管理列表接口
    const response: FactoryListResponse = await request.get('/factory/factory/list', {
      params: {
        pageNo: 1,
        pageSize: 1000, // 获取所有场站
        column: 'createTime',
        order: 'desc',
        _t: Date.now()
      }
    });

    if (response.success && response.result?.records) {
      // 将场站列表转换为树形结构
      return convertFactoryListToTree(response.result.records);
    }

    // 如果接口失败，返回空树（但保留顶级节点）
    return convertFactoryListToTree([]);
  } catch (error) {
    console.error('获取场站列表失败:', error);
    // 出错时返回空树（但保留顶级节点）
    return convertFactoryListToTree([]);
  }
}

/**
 * 将场站列表转换为树形结构
 * 保持顶级"智能运维平台"节点不变
 */
function convertFactoryListToTree(factories: any[]): StationTreeResponse {
  // 创建顶级节点 - 智能运维平台
  const rootNode: StationTreeNode = {
    regionId: 'PLATFORM_ROOT',
    regionName: '智能运维平台',
    modelId: '100',
    upRegionId: '0',
    iconPath: '/file/iotcenter/sys/100.png',
    subsystemCode: null,
    gridType: null,
    sort: 1,
    administrationCode: '',
    deviceList: null,
    childList: []
  };

  // 将场站转换为树节点（直接作为根节点的子节点）
  rootNode.childList = factories.map((factory, index) => ({
    regionId: `FACTORY_${factory.id}`,
    regionName: factory.name,
    modelId: '102', // 场站节点
    upRegionId: 'PLATFORM_ROOT',
    iconPath: '/file/iotcenter/sys/102.png',
    subsystemCode: '2',
    gridType: '2',
    sort: index + 1,
    administrationCode: '',
    deviceList: null,
    childList: [],
    // 扩展字段（可选）
    factoryId: factory.id,
    note: factory.note,
    address: factory.address,
    photo: factory.photo,
    lon: factory.lon,
    lat: factory.lat
  }));

  return {
    code: 200,
    message: 'ok',
    data: [rootNode]
  };
}

/**
 * 模拟数据 - 与源站返回格式一致
 */
export function getMockStationTree(): StationTreeResponse {
  return {
    code: 200,
    message: "ok",
    data: [
      {
        regionId: "LHYR98NH00000001",
        regionName: "智能运维平台",
        modelId: "100",
        upRegionId: "0",
        iconPath: "/file/iotcenter/sys/100.png",
        subsystemCode: null,
        gridType: null,
        sort: 1,
        administrationCode: "",
        deviceList: null,
        childList: [
          {
            regionId: "LHYR98NH00000013",
            regionName: "安徽省芜湖市",
            modelId: "101",
            upRegionId: "LHYR98NH00000001",
            iconPath: "/file/iotcenter/sys/101.png",
            subsystemCode: null,
            gridType: null,
            sort: 3,
            administrationCode: "340000 340200",
            deviceList: null,
            childList: [
              {
                regionId: "LHYR98NH00000014",
                regionName: "芜湖城南污水厂",
                modelId: "102",
                upRegionId: "LHYR98NH00000013",
                iconPath: "/file/iotcenter/sys/102.png",
                subsystemCode: "2",
                gridType: "2",
                sort: 8,
                childList: [],
                administrationCode: "340000 340200 340209",
                deviceList: null
              },
              {
                regionId: "LHYR98NH00000015",
                regionName: "芜湖大龙湾污水厂",
                modelId: "102",
                upRegionId: "LHYR98NH00000013",
                iconPath: "/file/iotcenter/sys/102.png",
                subsystemCode: "2",
                gridType: "2",
                sort: 10,
                childList: [],
                administrationCode: "340000 340200 340207",
                deviceList: null
              }
            ]
          },
          {
            regionId: "LHYR98NH00000020",
            regionName: "安徽省六安市",
            modelId: "101",
            upRegionId: "LHYR98NH00000001",
            iconPath: "/file/iotcenter/sys/101.png",
            subsystemCode: null,
            gridType: null,
            sort: 4,
            administrationCode: "340000 341500",
            deviceList: null,
            childList: [
              {
                regionId: "LHYR98NH00000117",
                regionName: "六安城北一期污水厂",
                modelId: "102",
                upRegionId: "LHYR98NH00000020",
                iconPath: "/file/iotcenter/sys/102.png",
                subsystemCode: "2",
                gridType: "2",
                sort: 14,
                childList: [],
                administrationCode: "340000 341500 341502",
                deviceList: null
              }
            ]
          },
          {
            regionId: "LHYR98NH00000021",
            regionName: "安徽省亳州市",
            modelId: "101",
            upRegionId: "LHYR98NH00000001",
            iconPath: "/file/iotcenter/sys/101.png",
            subsystemCode: null,
            gridType: null,
            sort: 5,
            administrationCode: "340000 341600",
            deviceList: null,
            childList: [
              {
                regionId: "LHYR98NH00000003",
                regionName: "亳州利辛县城污水厂",
                modelId: "102",
                upRegionId: "LHYR98NH00000021",
                iconPath: "/file/iotcenter/sys/102.png",
                subsystemCode: "2",
                gridType: "2",
                sort: 21,
                childList: [],
                administrationCode: "340000 341600 341623",
                deviceList: null
              },
              {
                regionId: "LHYR98NH00000002",
                regionName: "亳州利辛县经开区污水厂",
                modelId: "102",
                upRegionId: "LHYR98NH00000021",
                iconPath: "/file/iotcenter/sys/102.png",
                subsystemCode: "2",
                gridType: "2",
                sort: 22,
                childList: [],
                administrationCode: "340000 341600 341623",
                deviceList: null
              }
            ]
          },
          {
            regionId: "LHYR98NH00000022", 
            regionName: "湖南省岳阳市",
            modelId: "101",
            upRegionId: "LHYR98NH00000001",
            iconPath: "/file/iotcenter/sys/101.png",
            subsystemCode: null,
            gridType: null,
            sort: 6,
            administrationCode: "430000 430600",
            deviceList: null,
            childList: [
              {
                regionId: "LHYR98NH00000023",
                regionName: "君山区第一污水处理厂",
                modelId: "102",
                upRegionId: "LHYR98NH00000022",
                iconPath: "/file/iotcenter/sys/102.png",
                subsystemCode: "2",
                gridType: "2",
                sort: 1,
                childList: [],
                administrationCode: "430000 430600 430611",
                deviceList: null
              }
            ]
          },
          {
            regionId: "LHYR98NH00000045",
            regionName: "江西省九江市",
            modelId: "101",
            upRegionId: "LHYR98NH00000001",
            iconPath: "/file/iotcenter/sys/101.png",
            subsystemCode: "",
            gridType: "",
            sort: 11,
            administrationCode: "",
            deviceList: null,
            childList: [
              {
                regionId: "LHYR98NH00000046",
                regionName: "九江鹤问湖污水厂",
                modelId: "102",
                upRegionId: "LHYR98NH00000045",
                iconPath: "/file/iotcenter/sys/102.png",
                subsystemCode: "2",
                gridType: "2",
                sort: 1,
                childList: [],
                administrationCode: "360000 360400 360403",
                deviceList: null
              }
            ]
          }
        ]
      }
    ]
  };
}
