import type { StationTreeNode, GraphData, RefreshConfig } from '@/api/types/electrical';

// Mock电站树数据
export const mockStationTree: StationTreeNode[] = [
  {
    id: '1',
    label: '光伏智能运维管理',
    children: [
      {
        id: '1-1',
        label: '安徽省芜湖市',
        children: [
          {
            id: '1-1-1',
            label: '芜湖城南污水厂',
            typeNum: 'wuhuchengnanwushuichang',
            graphNum: 'graph_wuhu_sewage'
          }
        ]
      },
      {
        id: '1-2',
        label: '安徽省六安市',
        children: [
          {
            id: '1-2-1',
            label: '六安凤凰桥二期污水厂',
            typeNum: 'liuanfenghuangqiao',
            graphNum: 'graph_liuan_sewage'
          }
        ]
      },
      {
        id: '1-3',
        label: '安徽省亳州市',
        children: [
          {
            id: '1-3-1',
            label: '亳州利辛县经开区污水厂',
            typeNum: 'bozoulixin',
            graphNum: 'graph_bozhou_sewage'
          }
        ]
      },
      {
        id: '1-4',
        label: '湖南省岳阳市',
        children: [
          {
            id: '1-4-1',
            label: '君山区第一污水处理厂',
            typeNum: 'junshanqu',
            graphNum: 'graph_yueyang_sewage'
          }
        ]
      }
    ]
  }
];

// Mock图形数据
export const mockGraphData: Record<string, GraphData> = {
  graph_wuhu_sewage: {
    graphNum: 'graph_wuhu_sewage',
    graphName: '芜湖城南污水厂电气系统图',
    svgContent: `
      <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#00D4FF;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#0066FF;stop-opacity:0.1" />
          </linearGradient>
        </defs>
        
        <!-- 背景 -->
        <rect width="800" height="600" fill="rgba(0, 20, 40, 0.5)"/>
        
        <!-- 电网 -->
        <rect x="50" y="50" width="120" height="80" rx="5" fill="url(#grad1)" stroke="#00D4FF" stroke-width="2"/>
        <text x="110" y="95" text-anchor="middle" fill="#00D4FF" font-size="16" font-weight="bold">电网</text>
        
        <!-- 变压器 -->
        <rect x="250" y="50" width="120" height="80" rx="5" fill="url(#grad1)" stroke="#00D4FF" stroke-width="2"/>
        <text x="310" y="95" text-anchor="middle" fill="#00D4FF" font-size="16" font-weight="bold">变压器</text>
        
        <!-- 逆变器1 -->
        <rect x="50" y="200" width="120" height="80" rx="5" fill="url(#grad1)" stroke="#00FF88" stroke-width="2"/>
        <text x="110" y="235" text-anchor="middle" fill="#00FF88" font-size="14">逆变器1</text>
        <text x="110" y="255" text-anchor="middle" fill="#FFF" font-size="12">运行中</text>
        
        <!-- 逆变器2 -->
        <rect x="250" y="200" width="120" height="80" rx="5" fill="url(#grad1)" stroke="#00FF88" stroke-width="2"/>
        <text x="310" y="235" text-anchor="middle" fill="#00FF88" font-size="14">逆变器2</text>
        <text x="310" y="255" text-anchor="middle" fill="#FFF" font-size="12">运行中</text>
        
        <!-- 逆变器3 -->
        <rect x="450" y="200" width="120" height="80" rx="5" fill="url(#grad1)" stroke="#FFB800" stroke-width="2"/>
        <text x="510" y="235" text-anchor="middle" fill="#FFB800" font-size="14">逆变器3</text>
        <text x="510" y="255" text-anchor="middle" fill="#FFF" font-size="12">告警</text>
        
        <!-- 光伏阵列1 -->
        <rect x="50" y="350" width="120" height="80" rx="5" fill="url(#grad1)" stroke="#00D4FF" stroke-width="2"/>
        <text x="110" y="385" text-anchor="middle" fill="#00D4FF" font-size="14">光伏阵列1</text>
        <text x="110" y="405" text-anchor="middle" fill="#FFF" font-size="12">250kW</text>
        
        <!-- 光伏阵列2 -->
        <rect x="250" y="350" width="120" height="80" rx="5" fill="url(#grad1)" stroke="#00D4FF" stroke-width="2"/>
        <text x="310" y="385" text-anchor="middle" fill="#00D4FF" font-size="14">光伏阵列2</text>
        <text x="310" y="405" text-anchor="middle" fill="#FFF" font-size="12">250kW</text>
        
        <!-- 光伏阵列3 -->
        <rect x="450" y="350" width="120" height="80" rx="5" fill="url(#grad1)" stroke="#00D4FF" stroke-width="2"/>
        <text x="510" y="385" text-anchor="middle" fill="#00D4FF" font-size="14">光伏阵列3</text>
        <text x="510" y="405" text-anchor="middle" fill="#FFF" font-size="12">250kW</text>
        
        <!-- 连接线 -->
        <line x1="110" y1="130" x2="110" y2="200" stroke="#00D4FF" stroke-width="2"/>
        <line x1="310" y1="130" x2="310" y2="200" stroke="#00D4FF" stroke-width="2"/>
        <line x1="170" y1="90" x2="250" y2="90" stroke="#00D4FF" stroke-width="2"/>
        <line x1="370" y1="240" x2="450" y2="240" stroke="#00D4FF" stroke-width="2"/>
        <line x1="110" y1="280" x2="110" y2="350" stroke="#00D4FF" stroke-width="2"/>
        <line x1="310" y1="280" x2="310" y2="350" stroke="#00D4FF" stroke-width="2"/>
        <line x1="510" y1="280" x2="510" y2="350" stroke="#00D4FF" stroke-width="2"/>
        
        <!-- 电流方向箭头 -->
        <polygon points="110,170 105,180 115,180" fill="#00D4FF"/>
        <polygon points="310,170 305,180 315,180" fill="#00D4FF"/>
        <polygon points="110,320 105,330 115,330" fill="#00D4FF"/>
        <polygon points="310,320 305,330 315,330" fill="#00D4FF"/>
        <polygon points="510,320 505,330 515,330" fill="#00D4FF"/>
      </svg>
    `
  },
  graph_liuan_sewage: {
    graphNum: 'graph_liuan_sewage',
    graphName: '六安凤凰桥二期污水厂电气系统图',
    svgContent: '<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="rgba(0, 20, 40, 0.5)"/><text x="400" y="300" text-anchor="middle" fill="#00D4FF" font-size="24">六安凤凰桥二期污水厂</text><text x="400" y="330" text-anchor="middle" fill="#FFF" font-size="16">系统图加载中...</text></svg>'
  },
  graph_bozhou_sewage: {
    graphNum: 'graph_bozhou_sewage',
    graphName: '亳州利辛县经开区污水厂电气系统图',
    svgContent: '<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="rgba(0, 20, 40, 0.5)"/><text x="400" y="300" text-anchor="middle" fill="#00D4FF" font-size="24">亳州利辛县经开区污水厂</text><text x="400" y="330" text-anchor="middle" fill="#FFF" font-size="16">系统图加载中...</text></svg>'
  },
  graph_yueyang_sewage: {
    graphNum: 'graph_yueyang_sewage',
    graphName: '君山区第一污水处理厂电气系统图',
    svgContent: '<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="rgba(0, 20, 40, 0.5)"/><text x="400" y="300" text-anchor="middle" fill="#00D4FF" font-size="24">君山区第一污水处理厂</text><text x="400" y="330" text-anchor="middle" fill="#FFF" font-size="16">系统图加载中...</text></svg>'
  }
};

// API接口函数
export async function getStationTree(): Promise<StationTreeNode[]> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockStationTree;
}

export async function getGraphData(graphNum: string): Promise<GraphData | null> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockGraphData[graphNum] || null;
}

export async function getRefreshConfig(): Promise<RefreshConfig> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 200));
  return { refreshTime: 30000 }; // 30秒刷新一次
}

