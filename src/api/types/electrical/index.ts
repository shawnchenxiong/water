export interface StationTreeNode {
  id: string;
  label: string;
  typeNum?: string;
  children?: StationTreeNode[];
  deviceType?: string;
  graphNum?: string;
}

export interface GraphData {
  graphNum: string;
  graphName: string;
  graphXml?: string;
  // 简化版：直接使用SVG路径或图片URL
  svgContent?: string;
  imageUrl?: string;
}

export interface RefreshConfig {
  refreshTime: number;
}

