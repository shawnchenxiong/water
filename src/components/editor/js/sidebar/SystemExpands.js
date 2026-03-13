/* eslint-disable */
import {mxCell, mxConstants, mxGeometry, mxPoint, mxResources, mxUtils} from "../../core/mxgraph";
import {Sidebar} from "../Sidebar";

(function () {


  Sidebar.prototype.addGeneralPalette = function (expand) {
    const lineTags = 'line lines connector connectors connection connections arrow arrows ';
    const sb = this;

    const temp = parseInt(this.editorUi.editor.graph.defaultVertexStyle['fontSize']);
    const fontSize = !isNaN(temp) ? 'fontSize=' + Math.min(16, temp) + ';' : '';

    // Reusable cells
    var field = new mxCell('List Item', new mxGeometry(0, 0, 80, 30), `text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;rotatable=0;whiteSpace=wrap;html=1;${fontSize}`);
    field.vertex = true;

    var fns = [
      this.createVertexTemplateEntry('rounded=0;whiteSpace=wrap;html=1;', 120, 60, '', '矩形', null, null, '矩形框'),
      this.createVertexTemplateEntry('rounded=1;whiteSpace=wrap;html=1;', 120, 60, '', '圆角矩形', null, null, '矩形框'),
      this.createVertexTemplateEntry('text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;',
        60, 30, '文字', '文字'),
      this.createVertexTemplateEntry('text;html=1;strokeColor=none;fillColor=none;spacing=5;spacingTop=-10;whiteSpace=wrap;overflow=hidden;rounded=0;', 190, 120,
        '<h1>标题</h1><p>这对他来说将是痛苦的，他将被认为是无助的，但与此同时，他将遭受苦难和巨大的痛苦。</p>',
        '文本框'),
      this.createVertexTemplateEntry('ellipse;whiteSpace=wrap;html=1;', 120, 80, '', '椭圆'),
      this.createVertexTemplateEntry('whiteSpace=wrap;html=1;aspect=fixed;', 80, 80, '', '正方形'),
      this.createVertexTemplateEntry('ellipse;whiteSpace=wrap;html=1;aspect=fixed;', 80, 80, '', '圆形'),
      this.createVertexTemplateEntry('shape=process;whiteSpace=wrap;html=1;backgroundOutline=1;', 120, 60, '', '过程'),
      this.createVertexTemplateEntry('rhombus;whiteSpace=wrap;html=1;', 80, 80, '', '钻石'),
      this.createVertexTemplateEntry('shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fixedSize=1;', 120, 60, '', '平行四边形'),
      this.createVertexTemplateEntry('shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;fixedSize=1;', 120, 80, '', '六角形'),
      this.createVertexTemplateEntry('triangle;whiteSpace=wrap;html=1;', 60, 80, '', '三角形'),
      this.createVertexTemplateEntry('shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;', 60, 80, '', '圆柱'),
      this.createVertexTemplateEntry('ellipse;shape=cloud;whiteSpace=wrap;html=1;', 120, 80, '', '云'),
      this.createVertexTemplateEntry('shape=document;whiteSpace=wrap;html=1;boundedLbl=1;', 120, 80, '', '文件'),
      this.createVertexTemplateEntry('shape=internalStorage;whiteSpace=wrap;html=1;backgroundOutline=1;', 80, 80, '', '内部存储器'),
      this.createVertexTemplateEntry('shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;', 120, 80, '', '立方体'),
      this.createVertexTemplateEntry('shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;', 120, 80, '', '步骤'),
      this.createVertexTemplateEntry('shape=trapezoid;perimeter=trapezoidPerimeter;whiteSpace=wrap;html=1;fixedSize=1;', 120, 60, '', '梯形'),
      this.createVertexTemplateEntry('shape=tape;whiteSpace=wrap;html=1;', 120, 100, '', '磁带'),
      this.createVertexTemplateEntry('shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;', 80, 100, '', '笔记'),
      this.createVertexTemplateEntry('shape=card;whiteSpace=wrap;html=1;', 80, 100, '', '卡片'),
      this.createVertexTemplateEntry('shape=callout;whiteSpace=wrap;html=1;perimeter=calloutPerimeter;', 120, 80, '', '详图索引'),
      this.createVertexTemplateEntry('shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;', 30, 60, '', '男演员'),
      this.createVertexTemplateEntry('shape=xor;whiteSpace=wrap;html=1;', 60, 80, '', '逻辑或'),
      this.createVertexTemplateEntry('shape=or;whiteSpace=wrap;html=1;', 60, 80, '', '逻辑与'),
      this.createVertexTemplateEntry('shape=dataStorage;whiteSpace=wrap;html=1;fixedSize=1;', 100, 80, '', '数据存储'),
      this.createVertexTemplateEntry('swimlane;startSize=0;', 200, 200, '', '容器'),
      this.createVertexTemplateEntry('swimlane;whiteSpace=wrap;html=1;', 200, 200, '', '立式容器'),
      this.createVertexTemplateEntry('swimlane;horizontal=0;whiteSpace=wrap;html=1;', 200, 200, '', '水平容器'),
      this.addEntry('列表组erd表', function () {
        const cell = new mxCell('列表', new mxGeometry(0, 0, 140, 120),
          'swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;' +
          'resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;');
        cell.vertex = true;
        cell.insert(sb.cloneCell(field, '列表项 1'));
        cell.insert(sb.cloneCell(field, '列表项 2'));
        cell.insert(sb.cloneCell(field, '列表项 3'));
        return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, '列表');
      }),
      this.addEntry('列表项条目值组erd表', function () {
        return sb.createVertexTemplateFromCells([sb.cloneCell(field, '列表项')], field.geometry.width, field.geometry.height, '列表项');
      }),
      this.addEntry('曲线', mxUtils.bind(this, function () {
        var cell = new mxCell('', new mxGeometry(0, 0, 50, 50), 'curved=1;endArrow=classic;html=1;');
        cell.geometry.setTerminalPoint(new mxPoint(0, 50), true);
        cell.geometry.setTerminalPoint(new mxPoint(50, 0), false);
        cell.geometry.points = [new mxPoint(50, 50), new mxPoint(0, 0)];
        cell.geometry.relative = true;
        cell.edge = true;
        return this.createEdgeTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, '曲线');
      })),
      this.createEdgeTemplateEntry('shape=flexArrow;endArrow=classic;startArrow=classic;html=1;', 100, 100, '', '双向箭头'),
      this.createEdgeTemplateEntry('shape=flexArrow;endArrow=classic;html=1;', 50, 50, '', '箭头'),
      this.createEdgeTemplateEntry('endArrow=none;dashed=1;html=1;', 50, 50, '', '虚线'),
      this.createEdgeTemplateEntry('endArrow=none;dashed=1;html=1;dashPattern=1 3;strokeWidth=2;', 50, 50, '', '点线'),
      this.createEdgeTemplateEntry('endArrow=none;html=1;', 50, 50, '', '线'),
      this.createEdgeTemplateEntry('endArrow=classic;startArrow=classic;html=1;', 50, 50, '', '双向连接器'),
      this.createEdgeTemplateEntry('endArrow=classic;html=1;', 50, 50, '', '定向连接器'),
      this.createEdgeTemplateEntry('shape=link;html=1;', 100, 0, '', '链接'),
      this.addEntry('', mxUtils.bind(this, function () {
        const edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'endArrow=classic;html=1;');
        edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
        edge.geometry.setTerminalPoint(new mxPoint(100, 0), false);
        edge.geometry.relative = true;
        edge.edge = true;
        const cell0 = new mxCell('标题', new mxGeometry(0, 0, 0, 0), 'edgeLabel;resizable=0;html=1;align=center;verticalAlign=middle;');
        cell0.geometry.relative = true;
        cell0.setConnectable(false);
        cell0.vertex = true;
        edge.insert(cell0);
        return this.createEdgeTemplateFromCells([edge], 100, 0, '带标签的连接器');
      })),
      this.addEntry('', mxUtils.bind(this, function () {
        const edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'endArrow=classic;html=1;');
        edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
        edge.geometry.setTerminalPoint(new mxPoint(160, 0), false);
        edge.geometry.relative = true;
        edge.edge = true;
        const cell0 = new mxCell('Label', new mxGeometry(0, 0, 0, 0), 'edgeLabel;resizable=0;html=1;align=center;verticalAlign=middle;');
        cell0.geometry.relative = true;
        cell0.setConnectable(false);
        cell0.vertex = true;
        edge.insert(cell0);
        const cell1 = new mxCell('Source', new mxGeometry(-1, 0, 0, 0), 'edgeLabel;resizable=0;html=1;align=left;verticalAlign=bottom;');
        cell1.geometry.relative = true;
        cell1.setConnectable(false);
        cell1.vertex = true;
        edge.insert(cell1);

        return this.createEdgeTemplateFromCells([edge], 160, 0, '带有2个标签的连接器');
      })),
      this.addEntry('', mxUtils.bind(this, function () {
        const edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'endArrow=classic;html=1;');
        edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
        edge.geometry.setTerminalPoint(new mxPoint(160, 0), false);
        edge.geometry.relative = true;
        edge.edge = true;
        const cell0 = new mxCell('标签', new mxGeometry(0, 0, 0, 0), 'edgeLabel;resizable=0;html=1;align=center;verticalAlign=middle;');
        cell0.geometry.relative = true;
        cell0.setConnectable(false);
        cell0.vertex = true;
        edge.insert(cell0);
        const cell1 = new mxCell('来源', new mxGeometry(-1, 0, 0, 0), 'edgeLabel;resizable=0;html=1;align=left;verticalAlign=bottom;');
        cell1.geometry.relative = true;
        cell1.setConnectable(false);
        cell1.vertex = true;
        edge.insert(cell1);
        const cell2 = new mxCell('目标', new mxGeometry(1, 0, 0, 0), 'edgeLabel;resizable=0;html=1;align=right;verticalAlign=bottom;');
        cell2.geometry.relative = true;
        cell2.setConnectable(false);
        cell2.vertex = true;
        edge.insert(cell2);
        return this.createEdgeTemplateFromCells([edge], 160, 0, '带有3个标签的连接器');
      })),
      this.addEntry('', mxUtils.bind(this, function () {
        const edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'endArrow=classic;html=1;');
        edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
        edge.geometry.setTerminalPoint(new mxPoint(100, 0), false);
        edge.geometry.relative = true;
        edge.edge = true;
        const cell = new mxCell('', new mxGeometry(0, 0, 20, 14), 'shape=message;html=1;outlineConnect=0;');
        cell.geometry.relative = true;
        cell.vertex = true;
        cell.geometry.offset = new mxPoint(-10, -7);
        edge.insert(cell);
        return this.createEdgeTemplateFromCells([edge], 100, 0, '带符号的连接器');
      }))
    ];

    this.addPaletteFunctions('general', mxResources.get('general'), (expand != null) ? expand : true, fns);
  };

  Sidebar.prototype.addBasicPalette = function (expand = true) {
    const w = 100;
    const h = 100;
    const s = 'whiteSpace=wrap;html=1;shape=mxgraph.basic.';
    const s2 = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=bottom;' + mxConstants.STYLE_VERTICAL_ALIGN + '=top;html=1;shape=mxgraph.basic.';
    const s3 = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=bottom;' + mxConstants.STYLE_VERTICAL_ALIGN + '=top;html=1;shape=';
    const gn = 'mxgraph.basic';
    const dt = '';
    this.addPaletteFunctions('basic', mxResources.get('basic'), (expand != null) ? expand : true, [
      this.createVertexTemplateEntry(s2 + 'rect;fillColor2=none;strokeWidth=1;size=20;indent=5;', w * 1.2, h * 0.6, '', '完整矩形'),
      this.createVertexTemplateEntry('shape=partialRectangle;whiteSpace=wrap;html=1;top=0;bottom=0;fillColor=none;', w * 1.2, h * 0.6, '', '部分矩形'),
      this.createVertexTemplateEntry('shape=partialRectangle;whiteSpace=wrap;html=1;right=0;top=0;bottom=0;fillColor=none;routingCenterX=-0.5;', w * 1.2, h * 0.6, '', '部分矩形'),
      this.createVertexTemplateEntry('shape=partialRectangle;whiteSpace=wrap;html=1;bottom=0;right=0;fillColor=none;', w * 1.2, h * 0.6, '', '部分矩形'),
      this.createVertexTemplateEntry('shape=partialRectangle;whiteSpace=wrap;html=1;top=0;left=0;fillColor=none;', w * 1.2, h * 0.6, '', '部分矩形'),
      this.createVertexTemplateEntry(s2 + 'polygon;polyCoords=[[0.25,0],[0.75,0],[1,0.25],[1,0.75],[0.75,1],[0.25,1],[0,0.75],[0,0.25]];polyline=0;', w, h, '', '多边形'),
      this.createVertexTemplateEntry(s2 + 'polygon;polyCoords=[[0.25,0],[0.75,0],[1,0.25],[1,0.75],[0.75,1],[0.25,1],[0,0.75],[0,0.25]];polyline=1;fillColor=none;', w, h, '', '多段线'),
      this.createVertexTemplateEntry(s2 + 'patternFillRect;fillStyle=diag;step=5;fillStrokeWidth=0.2;fillStrokeColor=#dddddd;', w * 1.2, h * 0.6, '', '带对角线填充的矩形'),
      this.createVertexTemplateEntry(s2 + 'patternFillRect;fillStyle=diagRev;step=5;fillStrokeWidth=0.2;fillStrokeColor=#dddddd;', w * 1.2, h * 0.6, '', '带反向对角线填充的矩形'),
      this.createVertexTemplateEntry(s2 + 'patternFillRect;fillStyle=vert;step=5;fillStrokeWidth=0.2;fillStrokeColor=#dddddd;', w * 1.2, h * 0.6, '', '带垂直填充的矩形'),
      this.createVertexTemplateEntry(s2 + 'patternFillRect;fillStyle=hor;step=5;fillStrokeWidth=0.2;fillStrokeColor=#dddddd;', w * 1.2, h * 0.6, '', '带水平填充的矩形'),
      this.createVertexTemplateEntry(s2 + 'patternFillRect;fillStyle=grid;step=5;fillStrokeWidth=0.2;fillStrokeColor=#dddddd;', w * 1.2, h * 0.6, '', '带网格填充的矩形'),
      this.createVertexTemplateEntry(s2 + 'patternFillRect;fillStyle=diagGrid;step=5;fillStrokeWidth=0.2;fillStrokeColor=#dddddd;', w * 1.2, h * 0.6, '', '带对角线网格填充的矩形'),
      this.createVertexTemplateEntry(s2 + '4_point_star_2;dx=0.8;', w, h, '', '4角星'),
      this.createVertexTemplateEntry(s2 + '6_point_star', w, h * 0.9, '', '6角星'),
      this.createVertexTemplateEntry(s2 + '8_point_star', w, h, '', '8角星'),
      this.createVertexTemplateEntry(s2 + 'banner', w, h * 0.5, '', '横幅'),
      this.createVertexTemplateEntry(s + 'cloud_callout', w * 0.9, h * 0.6, '', '云标注'),
      this.createVertexTemplateEntry(s + 'cloud_rect', w * 1.2, h * 0.9, '', '云矩形'),
      this.createVertexTemplateEntry(s2 + 'cone', w, h, '', '圆锥'),
      this.createVertexTemplateEntry(s2 + 'cone2;dx=0.5;dy=0.9;', w, h, '', '圆锥体（可调节）'),
      this.createVertexTemplateEntry(s + 'document', w, h, '', '文件'),
      this.createVertexTemplateEntry(s2 + 'donut;dx=25;', w, h, '', '甜甜圈'),
      this.createVertexTemplateEntry(s2 + 'drop', w * 0.7, h, '', '下降', null, null, this.getTagsForStencil(gn, 'drop', dt).join(' ')),
      this.createVertexTemplateEntry(s2 + 'flash', w * 0.6, h, '', '闪光'),
      this.createVertexTemplateEntry(s2 + 'half_circle', w, h * 0.5, '', '半圆'),
      this.createVertexTemplateEntry(s2 + 'heart', w, h, '', '心'),
      this.createVertexTemplateEntry('html=1;shape=mxgraph.basic.isocube;isoAngle=15;', w, h, '', '等角立方体'),
      this.createVertexTemplateEntry(s + 'loud_callout', w, h * 0.6, '', '大声标注'),
      this.createVertexTemplateEntry(s2 + 'moon', w * 0.75, h, '', '月亮'),
      this.createVertexTemplateEntry(s2 + 'no_symbol', w, h, '', '无符号'),
      this.createVertexTemplateEntry(s + 'octagon2;align=center;verticalAlign=middle;dx=15;', w, h, '', '八边形'),
      this.createVertexTemplateEntry(s2 + 'orthogonal_triangle', w, h * 0.7, '', '直角三角形'),
      this.createVertexTemplateEntry(s2 + 'acute_triangle;dx=0.5;', w, h * 0.7, '', '锐角三角形'),
      this.createVertexTemplateEntry(s2 + 'obtuse_triangle;dx=0.25;', w, h * 0.7, '', '钝角三角形'),
      this.createVertexTemplateEntry(s + 'oval_callout', w, h * 0.6, '', '椭圆形标注'),
      this.createVertexTemplateEntry(s + 'pentagon', w, h * 0.9, '', '五角形'),
      this.createVertexTemplateEntry(s + 'pointed_oval', w * 0.5, h, '', '椭圆形'),
      this.createVertexTemplateEntry(s2 + 'pyramid;dx1=0.4;dx2=0.6;dy1=0.9;dy2=0.8;', w, h, '', '金字塔'),
      this.createVertexTemplateEntry(s2 + 'diag_snip_rect;dx=6;whiteSpace=wrap;', w, h * 0.6, '', '对角线段矩形'),
      this.createVertexTemplateEntry(s2 + 'diag_round_rect;dx=6;whiteSpace=wrap;', w, h * 0.6, '', '对角线圆角矩形'),
      this.createVertexTemplateEntry(s2 + 'corner_round_rect;dx=6;whiteSpace=wrap;', w, h * 0.6, '', '圆角矩形'),
      this.createVertexTemplateEntry(s2 + 'two_corner_round_rect;dx=6;whiteSpace=wrap;', w, h * 0.6, '', '圆角矩形（两个角）'),
      this.createVertexTemplateEntry(s2 + 'three_corner_round_rect;dx=6;whiteSpace=wrap;', w, h * 0.6, '', '圆角矩形（三个角）'),
      this.createVertexTemplateEntry(s2 + 'plaque;dx=6;whiteSpace=wrap;', w, h * 0.6, '', '斑块'),
      this.createVertexTemplateEntry(s2 + 'frame;dx=10;whiteSpace=wrap;', w, h * 0.6, '', '框架'),
      this.createVertexTemplateEntry(s2 + 'rounded_frame;dx=10;whiteSpace=wrap;', w, h * 0.6, '', '圆形框架'),
      this.createVertexTemplateEntry(s2 + 'plaque_frame;dx=10;whiteSpace=wrap;', w, h * 0.6, '', '斑块框架'),
      this.createVertexTemplateEntry(s2 + 'frame_corner;dx=10;whiteSpace=wrap;', w, h * 0.6, '', '框架转角'),
      this.createVertexTemplateEntry(s2 + 'diag_stripe;dx=10;', w, h * 0.6, '', '斜条纹'),
      this.createVertexTemplateEntry(s + 'rectCallout;dx=30;dy=15;boundedLbl=1;', w, h * 0.6, '', '矩形标注'),
      this.createVertexTemplateEntry(s + 'roundRectCallout;dx=30;dy=15;size=5;boundedLbl=1;', w, h * 0.6, '', '圆角矩形标注'),
      this.createVertexTemplateEntry(s2 + 'layered_rect;dx=10;outlineConnect=0;whiteSpace=wrap;', w, h * 0.6, '', '分层矩形'),
      this.createVertexTemplateEntry(s2 + 'smiley', w, h, '', '笑脸'),
      this.createVertexTemplateEntry(s2 + 'star', w, h * 0.95, '', '星'),
      this.createVertexTemplateEntry(s2 + 'sun', w, h, '', '太阳'),
      this.createVertexTemplateEntry(s2 + 'tick', w * 0.85, h, '', '打上钩'),
      this.createVertexTemplateEntry(s2 + 'wave2;dy=0.3;', w, h * 0.6, '', '波浪'),
      this.createVertexTemplateEntry('labelPosition=center;verticalLabelPosition=middle;align=center;html=1;shape=mxgraph.basic.button;dx=10;whiteSpace=wrap;', w, h * 0.6, '按钮', '按钮'),
      this.createVertexTemplateEntry('labelPosition=center;verticalLabelPosition=middle;align=center;html=1;shape=mxgraph.basic.shaded_button;dx=10;fillColor=#E6E6E6;strokeColor=none;whiteSpace=wrap;', w, h * 0.6, '按钮', '按钮（阴影）'),
      this.createVertexTemplateEntry(s2 + 'x', w, h, '', 'X'),
      this.createVertexTemplateEntry(s2 + 'pie;startAngle=0.2;endAngle=0.9;', w, h, '', '饼状'),
      this.createVertexTemplateEntry(s2 + 'arc;startAngle=0.3;endAngle=0.1;', w, h, '', '弧状'),
      this.createVertexTemplateEntry(s2 + 'partConcEllipse;startAngle=0.25;endAngle=0.1;arcWidth=0.5;', w, h, '', '部分同心椭圆'),
      this.createVertexTemplateEntry('shape=message;html=1;html=1;outlineConnect=0;labelPosition=center;verticalLabelPosition=bottom;align=center;verticalAlign=top;', 60, 40, '', '消息'),
      this.createVertexTemplateEntry('shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;lid=0;', 60, 80, '', '气缸组')
    ]);
  };

  Sidebar.prototype.addMiscPalette = function (expand) {
    const sb = this;
    const lineTags = 'line lines connector connectors connection connections arrow arrows ';
    const fns = [
      this.createVertexTemplateEntry('text;strokeColor=none;fillColor=none;html=1;fontSize=24;fontStyle=1;verticalAlign=middle;align=center;', 100, 40, '标题', '标题'),
      this.createVertexTemplateEntry('text;strokeColor=none;fillColor=none;html=1;whiteSpace=wrap;verticalAlign=middle;overflow=hidden;', 100, 80,
        '<ul><li>Value 1</li><li>Value 2</li><li>Value 3</li></ul>', '无序列表'),
      this.createVertexTemplateEntry('text;strokeColor=none;fillColor=none;html=1;whiteSpace=wrap;verticalAlign=middle;overflow=hidden;', 100, 80,
        '<ol><li>Value 1</li><li>Value 2</li><li>Value 3</li></ol>', '有序列表'),
      this.addDataEntry('table', 180, 120, 'Table 1', '7VnbcpswEP0aXjtcYsd9NUnTh/Yl6Q8o1trSVEiMWAeTr+8KhGlSe2xwJpMSZvCMdtmVteccwY4IkjTb3VmWi5+GgwqS2yBJrTHYjLJdCkoFcSh5kNwEcRzSL4i/Hbkb1XfDnFnQeE5C3CQ8MbWFxtM4CqyUdxSC5W6I7NG5lgUyiw/y2flCsldGI5MaLNlRbSvF8kLW0U2EkIr/YJXZYjtPay3XlO0ni+Zk+/WARdgdral2+YLuwGSAtqKQUnIUPmLR1B0KkBvRpnkwQlY0js0+t4OIBh6lw4glPRG7NyWVJYyVzw4o5TF5jWJRykwxDd+B8VeupeHVPsua35AaZRzaUguw0qGIJvcRCtboh48G0WTesB6G8CBD3Jr8F7MbaEPWUqn2b7TRjvfcSI01cLMlXQRlGn6ZBTOqOCU76my6XLjF1GhaMYnDTQuswBKKwaTHw0i/egPOr87nnFaMkql7WCHTm3rDCMyU3xulkAgPOVu50JJ2fbN/tIvu2DjGsiGE1srp6UZIzkEfJqqfGGpawd4+QcNuNJSf5CQ/8570+Mk6LHvPxhSVphnSHtpqXvzD+X6dZ8lgNslgsAx2L0kbkSrmkyouVcX+xTwiWVxPfcKH6hOql6S/R9uwmJ4Mp+m6Hn3b8HWSwWAZjLdtiMJJFpfKYox9QxRNjcNHbBwW79g4RD2O5T7vsyE6fQz43z8Mepw2TkL4RM3DdCJ5uS5G0D2Q2X0rasL//pT0Bw=='),
      this.addDataEntry('table', 180, 120, 'Table 2', '7ZlLc9owEMc/ja8dP3jlimnSQ3pJOr0reMGayFqPvNSQT9+VLUMCOEDbyaTYM2ZGWq9e/99K7MheFGfrOyPy9DsmoLzoqxfFBpHqUraOQSkv9GXiRTMvDH3+eeFty9ugeuvnwoCmcxqEdYNfQq2gttSGgjbKGYpU5LZI4smapillPM1ZwMUylQSPuZjb9yUvgm0FCUOP8sWafK7PUZOQGoxrM0elRF7IqrPaI5UquRcbXFEzTFOz3qtM33P7wnkbLF9XF9y9Gy0YVcMbfIYYFdoBE1iIlbIduXWCIVi3alWZnFB3gBmQ2bBLKRNKncek1tNPQS7TppkT2RdFbVhu2+6k54JT/ziJ6EISD1haGGjki1VYOT325S9KmSmh4RuIZM80xWTjTIS5KylYkCs+IRFmjexuuf5RhInB/IcwS2hcFlKpBoJGbeMmR6mpEmg45Ycli/0vQ2/IK4u5Huzq/Fh3QzFq5snRY7sFUVAJBZ2ELnUKRp4NPfwz6IN/wHxwwPxnVQz9oBU+T52kUA8wJ6GX5+xI3oHaeu9wHaFzWQQga7pQNgJnqUwS0HtQwr+FEp2EMrqQietsp9vFvQlFYLQg3jgrnRQHoLfzPIv9sJV9+8bvNPv1W1JXFAqj1lCI+lB4JxS2/7tXFAvjPg34VGnA5i30j8gKJq3HwaDjx8H46rOCm1b2w559t7KCwG+NhVEfCx1LC4Kgzws+Y14w+cC8IDi8rGsOhHHHD4Tg9M3df38CHF4QNvQnPf2u5QbtN4c3fTBceXLA1d0Hotr99fej3w=='),
      this.addDataEntry('table title', 180, 150, 'Table with Title 1', '7VnbbtswDP0avw6WXSfda5yue9he2v6AGjGRMFkyZKZO+vWjbOWyJVluQ9G6BmxApChaOudIIOQozYvFveOl/GkF6Ci9i9LcWYttq1jkoHWUxEpE6ThKkpjeKPl2oJc1vXHJHRg8ZUDSDnjheg6t54k/a2i9FS518FaSl76JTW86qpA7fFSv3pfG5JhYg1wZcORgja01LyvVhI+bCKm0+MGXdo6rRCuL0jn7C3KrrR8vYMrn2vunlDV8hQ3IDrMFh7A4uOLGFZZ7D7YAdEsKqZVAGSJuW1RiCWomV8Oy4ORV65itx24ApEbAcD+e6Q6e/4bywda0LGmdevUA6oDVNryNXatCcwPfgYu/XCMrlutR2ygqI8EpjyLaMkRomGJoPltEWwTDBRjivcwJZ8sn7mawCpkqrVefMdZ4QZRWGWyAy0b0EJR5/CWLMlpxTjbb2PT4cIe5NTRjEo1PC7zCGqqLSU/2k74MtARqj2ng5j9I4OZ0CdACUHH9ABPkZtZsLImFDluolgrhseQTH1rTEdFuM+OjN+QcIt0SYFPt5TWWSggw+3k7TxsNy+DuXqAlm11KV3p0jw7OpCck22B5djauaWmGI22puRHVDufreZ4kg6yXwcUyWPxJWodUMehVca0qWNI9WQz7suE9lg3DNywbbvuT4Thdw86XDV97GVwsg+6WDSzuZXGtLLpYNzDWFw7vsXBg7A0rB7Z7idcfDru3gsevBT/8aXDG7WMvhE9UPfRXktfrogPlA5mbP0tt+PaPp98='),
      this.addDataEntry('table title', 180, 120, 'Table with Title 2', '7VhNb6MwEP01XFd8NNnmGtLtHrKXptq7Gw9grbGRmZSkv34HbEJ3CdtklaYoqgSSZxgP+L1nPwkvivPtvWFF9kNzkF5050Wx0RrtKN/GIKUX+oJ70cILQ59uL/w28DRonvoFM6DwmAmhnfDM5AZs5pE9SbDZEnfSZcuMFfUQm6fRvERmcCVe6lzkU2KtFTKhwFAiaGIpWVGKpnzRVGRC8iXb6Q22jdponogt8AddlW620dWSmpVuakLNV+5j/ObtRv+CWEtdv45DwjYS2zr7UcGUYrc4MAjbQYCalEPnHnQOaHZUUgmOmau4tSD6GYg0a6c5ZH1W2kS6n9vhTQMH+WH4ox78/0aeIKJlZdqIlxpvucejY6OJK5FLpuA7MP5Xaq75zqVQF24kIUE3fNKIOneBccv1DxLKjS4emUmhLUmElC0pSqtaJ4UWChuAJnO6CLLY/zLxJrSymOKgi+mqyw3GWhG/pKW6LbASKyixR7pQGRjx36SHh0nfOVoctW9pIDqDBG56EggGNUArQMHkA6yRqbTZiBnm0m2aKhMIq4Kt69KKjhS7LVVd3bF2gKTThKAJ2kTWQlxkgnNQLc1g7p7Bsh2cm6/ozU16cyI/rlmH5cndmKQlK4a0pzaKlz3S9995lA4mPR38bIahP3I9MClS0sDC1s5LeqFQ6dLOnA4I5hLi2P5J5evNfF6xHNXuvGqZfhrHGI1jekHj+NqTwLAGRnFQvPs5ML16k7gdNImRc//xJjEgjms2idmnSYzRJGYXNInA72kgGvdJ8e4HwezqXSIIBm1i5OR/vE0MqOOKbILC7v+iLX/9+/E3'),
      this.addDataEntry('crossfunctional cross-functional cross functional flowchart swimlane table', 400, 400, 'Cross-Functional Flowchart',
        '7ZnfbpswFMafhstN/EnS7nIhS3fRSlO2F3DhNFhzfJB90iR9+tlgkirgFUXtqjIkItmHY2O+84v1yQRJutnfKFYWd5iDCJJvQZIqRKpbm30KQgRxyPMgWQRxHJpfEC89d6PqblgyBZL6DIjrAY9MbKGOmIdr/Wm5lRlxlMwmLwXusoIpqpM1HYRL1gUrbZPYvQ3Ns4KL/JYdcEtNtOnNNZkZfvInmz8JbTIKwUrNq6ELG1GQbZXmj7ACXSfaKOxLJnPXeUDZTBLNTN+tHxTB3qtBFXIC3ABugNTBpOx4TkWdMQlrncIC+LqgsyDTdWB9HHuS1DScqt0KJy2Fv2aEyoSiv8u5wp15vwIVfzLvbApRC6B3fCOYhO/A8rPQHPODCxGWriXggZo8UvgbUhTm8cmCywIUt5W5RyLcNDVw72/bucLyF1NroOfqu/VWfS5EM59EaREokUuq9JrOzWUUTMPP02Bq3i81/ejUN5dNV5SiNEtjvCoXME070O9MTNxNzKEBox7xEkBR/AoATVoA/SiYhm6AHAm9OTkvqA+RDKWEzP3NfaV/x3ol3fXae+t1LE3vernZV1YGuRZwyXxMECjJyJRgK3PdwuC49F5kTL1kxCMZ/ciIZsNEY+ZFIxnR6IdGfD1MNK68hqRj1xgNyYcwJF3b2Ns5kusWQa+/p7T3Dh8sL+wp/7ZMV/+jD/ky8nAZD0N1H1E4EnEZEUM1HVHkdR0dhnR0HR/CdXTB+nauI2qfVY6bSiOw54Rz2L4jap+tjkT0I2KwzqN9Wjoi0Q+JgVgP0z19PqvTn39d+wM='),

      this.addDataEntry('table', 280, 160, 'Table', '7Zpdc6IwFIZ/DfcksSqX1X7sxe6NdvY+ylEyjYQJsWp//QZIrDXSIkUdcZ3pTDiSNHmfHF5yRo8MF+tnSZPojwiBe+TRI0MphCpai/UQOPewz0KPPHgY+/rPw08l36L8Wz+hEmJVpQMuOrxRvoQicp+moNIinKoNN+FpxHj4m27EMhtX0QkHezWQMF3KlL3BCFL2nnXwdTRVUrzCUHAh8yFI0J/M9AzJYMY434nf94ZBB2c9IhqKlQ5mN5mJgVSwLl1cHjIrewaxACU3+pYVC1VkFtgvBPAjYPPIduuaIE2LwHzb90Mr3TByHZaOOBrp+Sdg1RllKxlEQrJ3ESvKt6pQqcY7Kq3YgtMYfgEN90IDEW5MSInEtDjMlGlOhFJiYS6kWV3WDqVIXqicgw1MBec0SdmE2397GBmsExrbacz0tMdmcS5PFkcgmXJpzvJPVYC4HkBCfs6v42z9F6b0arGP3N0v4himOdcvBayo0XbHU87msY5NtSAg90RH5nqn41P+yfaVWvBjEoV8q3NAjpPZDDbKZInnuW5Hjka5XnNMld7oyzhMHXbbeVbCeVeKE98MzvVn8Xd5dBqlW2G0Zul2S+m6j+GW00X9nov3ypO35+D9b64nM9fNZ6Lfei3+udf2Hb5/8+apvfYj6iTvKmIKxgmdZuOt9At4jUTt1XPVLwStkZh7ozWbmEEpuNO66mXAHemf9TlWGK1ZjsgvBXlaA70oyMpWeUUZidAteyWq7pWP90/4gTTjld27il6Jfu6VyK3J2FTtnClVm8hM9H1t5mDyfKFgjVTcG63hVCSlpO5aQOpIN6wPrsJoDYNzaz8WXLc94Cq73zWlnFvmuSH3u9BJMehWdL8GqrLIrfTY1OydKTX3FT/Ji2uxkVtdkUVuVcei7N8CyvZWY1F5PSe4IbJtrMQit+JzQwZ7oeMlsnW2c5wvcXkpyFaJruPtN6jnoFf0tovdWs8W1bkK56dE1d4Tpn1qHiLnPlCvllwLjpj68uPnVsXtu7/G+gc='),

      this.addDataEntry('table', 180, 140, 'Table', '7ZhNc5swEIZ/DXc+HH9cTdv00F7sTu8yWoOmi8QIOUB+fSUjJXEwMbZzgcl4PKNdIVn7PlovkhfFef0oSZH9FhTQi757USyFUG0rr2NA9EKfUS/65oWhr79e+KOnNzj2+gWRwNWQAWE74IngAVpP6yhVg9aRZAzpL9KIg5lRkR2Cs9YSkoMs2RNsoGTPZoCvvWVGqKissWeIsUAhtc0FB9OvpPgHzumFUeybj+6xqwGpoO6N6Oiy4TyCyEHJRj9SMaoy+8SyjdrPgKWZGzazTlK2jvRl7KtAumE1Oq9XdFkvHX0BTqmN0WGdCcmeBVcEnUKKSLV9o1jFciQcfgKh71xrQRvrUqKwLYS9ss2dUErk1pA2XNOmUhR/iEzBORKBSIqS7dD97Hl8UBeEu2Xs9bK3NrgenIOghbdBmy3uZzbrMPt7bIZ+0N3sgnNIjug+1Oh0C1shzmhDkKVcm4kWArR/XWVMwbYgiZmp0nlvtofKzcYIhmoZXdRyfqWUdrKNCZ2nCNfPRlDHx4nS+/XAadnh87LOQcgeepGd+X8aMbL6VOAJEZz3EoymSDAIp4dw8VXa7iltzSmji5Vufn+lW/Ym3WycSbe4rdJ9IOUNSfZuts9NslUvsodJIbuy0o2IYOD3IpxPEeHgUjcmht2TwFetu77WraKBte4TTnVB9+rCpV33xWUUaRdcvtgY+ytl0L0/cdCW04I23ZNd0H+fspokwwmc7bT5eqfcPv72yvk/'),

      this.addDataEntry('table', 180, 140, 'Table', '7ZhLc5swEMc/DXcejh9X3CY9tBe707uM1qCpkBixDpBPX2GkvLBi7LgHmBw8s1okof3/tF4kL1rn9YMiRfZLUuBe9N2L1kpK7Ky8XgPnXugz6kXfvDD09c8L7x1Pg+NTvyAKBA4ZEHYDHgk/QOfpHCU23DiSjHH6kzTy0M6IZMfBtmIFyUGV7BE2ULKndoCvvWVGqKxMY884X0sulW4LKXSf2LwTFELtXPfRZRb9ADIHVI3uUjGKmemx7GLzM2BpZofNjJOUnSN9HvsigzaMEqdVic6romMswOqxaaONM6nYkxRIuNUBicLtK10qlnMi4AcQ+s4VS9oYF8rCWBz2aMydRJS5aSgTbmtTJYvfRKVgHYnknBQl23H72tOQoC6IsMvY62VvTXAOaCUq+Resk4kMFMOhMMPrYM4Wn2c567H8czRDP+hvdSkEJEekH2rn0uKEbISzVOhmorUA7Y+rjCFsC5K0k1U68dudg3m7Z4KhckZn5ZxfqKaZbNNGL1IOl89GuI5PENRb+SBo2UP0vM5B1O6c1E78QY2bWv1W4wlBnDshRhOFGITTo7j4qn3/o/Y1b9mdLYXzz5fCpTMfZ6PNx8V1pfADNa/Iv3ez3Tb/Vk5qd1OjdmEpHBHEwHdSnE+U4uBaOCaM/TPDVzG8XTFcRQOL4Q3OhUH/6sNmZP+LZywZGZy/NRn752jQv5yx3JaT4zbds2HgvpdZTRXjBE6HuvlyOd11f313/Q8='),

      this.createVertexTemplateEntry('text;html=1;whiteSpace=wrap;strokeColor=none;fillColor=none;overflow=fill;', 180, 180,
        '<table border="1" width="100%" height="100%" cellpadding="4" style="width:100%;height:100%;border-collapse:collapse;">' +
        '<tr><th align="center"><b>Title</b></th></tr>' +
        '<tr><td align="center">Section 1.1\nSection 1.2\nSection 1.3</td></tr>' +
        '<tr><td align="center">Section 2.1\nSection 2.2\nSection 2.3</td></tr></table>', 'HTML Table 4'),

      this.addEntry('link hyperlink', mxUtils.bind(this, function () {
        var cell = new mxCell('Link', new mxGeometry(0, 0, 60, 40), 'text;html=1;strokeColor=none;fillColor=none;whiteSpace=wrap;align=center;verticalAlign=middle;fontColor=#0000EE;fontStyle=4;');
        cell.vertex = true;
        this.graph.setLinkForCell(cell, 'https://www.draw.io');

        return this.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Link');
      })),
      this.addEntry('timestamp date time text label', mxUtils.bind(this, function () {
        var cell = new mxCell('%date{ddd mmm dd yyyy HH:MM:ss}%', new mxGeometry(0, 0, 160, 20), 'text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;overflow=hidden;');
        cell.vertex = true;
        this.graph.setAttributeForCell(cell, 'placeholders', '1');

        return this.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Timestamp');
      })),
      this.addEntry('variable placeholder metadata hello world text label', mxUtils.bind(this, function () {
        var cell = new mxCell('%name% Text', new mxGeometry(0, 0, 80, 20), 'text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;overflow=hidden;');
        cell.vertex = true;
        this.graph.setAttributeForCell(cell, 'placeholders', '1');
        this.graph.setAttributeForCell(cell, 'name', 'Variable');

        return this.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Variable');
      })),
      this.createVertexTemplateEntry('shape=ext;double=1;rounded=0;whiteSpace=wrap;html=1;', 120, 80, '', 'Double Rectangle', null, null, 'rect rectangle box double'),
      this.createVertexTemplateEntry('shape=ext;double=1;rounded=1;whiteSpace=wrap;html=1;', 120, 80, '', 'Double Rounded Rectangle', null, null, 'rounded rect rectangle box double'),
      this.createVertexTemplateEntry('ellipse;shape=doubleEllipse;whiteSpace=wrap;html=1;', 100, 60, '', 'Double Ellipse', null, null, 'oval ellipse start end state double'),
      this.createVertexTemplateEntry('shape=ext;double=1;whiteSpace=wrap;html=1;aspect=fixed;', 80, 80, '', 'Double Square', null, null, 'double square'),
      this.createVertexTemplateEntry('ellipse;shape=doubleEllipse;whiteSpace=wrap;html=1;aspect=fixed;', 80, 80, '', 'Double Circle', null, null, 'double circle'),
      this.createVertexTemplateEntry('rounded=1;whiteSpace=wrap;html=1;strokeWidth=2;fillWeight=4;hachureGap=8;hachureAngle=45;fillColor=#1ba1e2;sketch=1;', 120, 60, '', 'Rectangle Sketch', true, null, 'rectangle rect box text sketch comic retro'),
      this.createVertexTemplateEntry('ellipse;whiteSpace=wrap;html=1;strokeWidth=2;fillWeight=2;hachureGap=8;fillColor=#990000;fillStyle=dots;sketch=1;', 120, 60, '', 'Ellipse Sketch', true, null, 'ellipse oval sketch comic retro'),
      this.createVertexTemplateEntry('rhombus;whiteSpace=wrap;html=1;strokeWidth=2;fillWeight=-1;hachureGap=8;fillStyle=cross-hatch;fillColor=#006600;sketch=1;', 120, 60, '', 'Diamond Sketch', true, null, 'diamond sketch comic retro'),
      this.createVertexTemplateEntry('html=1;whiteSpace=wrap;shape=isoCube2;backgroundOutline=1;isoAngle=15;', 90, 100, '', 'Isometric Cube', true, null, 'cube box iso isometric'),
      this.createVertexTemplateEntry('html=1;whiteSpace=wrap;aspect=fixed;shape=isoRectangle;', 150, 90, '', 'Isometric Square', true, null, 'rectangle rect box iso isometric'),
      this.createEdgeTemplateEntry('edgeStyle=isometricEdgeStyle;endArrow=none;html=1;', 50, 100, '', 'Isometric Edge 1'),
      this.createEdgeTemplateEntry('edgeStyle=isometricEdgeStyle;endArrow=none;html=1;elbow=vertical;', 50, 100, '', 'Isometric Edge 2'),
      this.createVertexTemplateEntry('shape=curlyBracket;whiteSpace=wrap;html=1;rounded=1;labelPosition=left;verticalLabelPosition=middle;align=right;verticalAlign=middle;', 20, 120, '', 'Left Curly Bracket'),
      this.createVertexTemplateEntry('shape=curlyBracket;whiteSpace=wrap;html=1;rounded=1;flipH=1;labelPosition=right;verticalLabelPosition=middle;align=left;verticalAlign=middle;', 20, 120, '', 'Right Curly Bracket'),
      this.createVertexTemplateEntry('line;strokeWidth=2;html=1;', 160, 10, '', 'Horizontal Line'),
      this.createVertexTemplateEntry('line;strokeWidth=2;direction=south;html=1;', 10, 160, '', 'Vertical Line'),
      this.createVertexTemplateEntry('line;strokeWidth=4;html=1;perimeter=backbonePerimeter;points=[];outlineConnect=0;', 160, 10, '', 'Horizontal Backbone', false, null, 'backbone bus network'),
      this.createVertexTemplateEntry('line;strokeWidth=4;direction=south;html=1;perimeter=backbonePerimeter;points=[];outlineConnect=0;', 10, 160, '', 'Vertical Backbone', false, null, 'backbone bus network'),
      this.createVertexTemplateEntry('shape=crossbar;whiteSpace=wrap;html=1;rounded=1;', 120, 20, '', 'Horizontal Crossbar', false, null, 'crossbar distance measure dimension unit'),
      this.createVertexTemplateEntry('shape=crossbar;whiteSpace=wrap;html=1;rounded=1;direction=south;', 20, 120, '', 'Vertical Crossbar', false, null, 'crossbar distance measure dimension unit'),
      this.createVertexTemplateEntry('shape=image;html=1;verticalLabelPosition=bottom;verticalAlign=top;imageAspect=1;aspect=fixed;image=' + this.gearImage, 52, 61, '', 'Image (Fixed Aspect)', false, null, 'fixed image icon symbol'),
      this.createVertexTemplateEntry('shape=image;html=1;verticalLabelPosition=bottom;verticalAlign=top;imageAspect=0;image=' + this.gearImage, 50, 60, '', 'Image (Variable Aspect)', false, null, 'strechted image icon symbol'),
      this.createVertexTemplateEntry('icon;html=1;image=' + this.gearImage, 60, 60, 'Icon', 'Icon', false, null, 'icon image symbol'),
      this.createVertexTemplateEntry('label;whiteSpace=wrap;html=1;image=' + this.gearImage, 140, 60, 'Label', 'Label 1', null, null, 'label image icon symbol'),
      this.createVertexTemplateEntry('label;whiteSpace=wrap;html=1;align=center;verticalAlign=bottom;spacingLeft=0;spacingBottom=4;imageAlign=center;imageVerticalAlign=top;image=' + this.gearImage, 120, 80, 'Label', 'Label 2', null, null, 'label image icon symbol'),
      this.addEntry('shape group container', function () {
        const cell = new mxCell('Label', new mxGeometry(0, 0, 160, 70),
          'html=1;whiteSpace=wrap;container=1;recursiveResize=0;collapsible=0;');
        cell.vertex = true;
        const symbol = new mxCell('', new mxGeometry(20, 20, 20, 30), 'triangle;html=1;whiteSpace=wrap;');
        symbol.vertex = true;
        cell.insert(symbol);
        return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Shape Group');
      }),
      this.createVertexTemplateEntry('shape=partialRectangle;whiteSpace=wrap;html=1;left=0;right=0;fillColor=none;', 120, 60, '', 'Partial Rectangle'),
      this.createVertexTemplateEntry('shape=partialRectangle;whiteSpace=wrap;html=1;bottom=0;top=0;fillColor=none;', 120, 60, '', 'Partial Rectangle'),
      this.createVertexTemplateEntry('shape=partialRectangle;whiteSpace=wrap;html=1;bottom=0;right=0;fillColor=none;', 120, 60, '', 'Partial Rectangle'),
      this.createVertexTemplateEntry('shape=partialRectangle;whiteSpace=wrap;html=1;bottom=1;right=1;left=1;top=0;fillColor=none;routingCenterX=-0.5;', 120, 60, '', 'Partial Rectangle'),
      this.createVertexTemplateEntry('shape=waypoint;sketch=0;fillStyle=solid;size=6;pointerEvents=1;points=[];fillColor=none;resizable=0;rotatable=0;perimeter=centerPerimeter;snapToPoint=1;', 20, 20, '', 'Waypoint'),
      this.createEdgeTemplateEntry('edgeStyle=segmentEdgeStyle;endArrow=classic;html=1;curved=0;rounded=0;endSize=8;startSize=8;', 50, 50, '', 'Manual Line', null, lineTags + 'manual'),
      this.createEdgeTemplateEntry('shape=filledEdge;curved=0;rounded=0;fixDash=1;endArrow=none;strokeWidth=10;fillColor=#ffffff;edgeStyle=orthogonalEdgeStyle;html=1;', 60, 40, '', 'Filled Edge'),
      this.createEdgeTemplateEntry('edgeStyle=elbowEdgeStyle;elbow=horizontal;endArrow=classic;html=1;curved=0;rounded=0;endSize=8;startSize=8;', 50, 50, '', 'Horizontal Elbow', null, lineTags + 'elbow horizontal'),
      this.createEdgeTemplateEntry('edgeStyle=elbowEdgeStyle;elbow=vertical;endArrow=classic;html=1;curved=0;rounded=0;endSize=8;startSize=8;', 50, 50, '', 'Vertical Elbow', null, lineTags + 'elbow vertical')
    ];
    this.addPaletteFunctions('misc', mxResources.get('misc'), (expand != null) ? expand : true, fns);
  };

  Sidebar.prototype.addAdvancedPalette = function (expand) {
    this.addPaletteFunctions('advanced', mxResources.get('advanced'), expand != null ? expand : false, this.createAdvancedShapes());
  };

  Sidebar.prototype.createAdvancedShapes = function () {
    // Avoids having to bind all functions to "this"
    const sb = this;

    // Reusable cells
    const field = new mxCell('List Item', new mxGeometry(0, 0, 60, 26), 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;');
    field.vertex = true;

    return [
      this.createVertexTemplateEntry('shape=tapeData;whiteSpace=wrap;html=1;perimeter=ellipsePerimeter;', 80, 80, '', 'Tape Data'),
      this.createVertexTemplateEntry('shape=manualInput;whiteSpace=wrap;html=1;', 80, 80, '', 'Manual Input'),
      this.createVertexTemplateEntry('shape=loopLimit;whiteSpace=wrap;html=1;', 100, 80, '', 'Loop Limit'),
      this.createVertexTemplateEntry('shape=offPageConnector;whiteSpace=wrap;html=1;', 80, 80, '', 'Off Page Connector'),
      this.createVertexTemplateEntry('shape=delay;whiteSpace=wrap;html=1;', 80, 40, '', 'Delay'),
      this.createVertexTemplateEntry('shape=display;whiteSpace=wrap;html=1;', 80, 40, '', 'Display'),
      this.createVertexTemplateEntry('shape=singleArrow;direction=west;whiteSpace=wrap;html=1;', 100, 60, '', 'Arrow Left'),
      this.createVertexTemplateEntry('shape=singleArrow;whiteSpace=wrap;html=1;', 100, 60, '', 'Arrow Right'),
      this.createVertexTemplateEntry('shape=singleArrow;direction=north;whiteSpace=wrap;html=1;', 60, 100, '', 'Arrow Up'),
      this.createVertexTemplateEntry('shape=singleArrow;direction=south;whiteSpace=wrap;html=1;', 60, 100, '', 'Arrow Down'),
      this.createVertexTemplateEntry('shape=doubleArrow;whiteSpace=wrap;html=1;', 100, 60, '', 'Double Arrow'),
      this.createVertexTemplateEntry('shape=doubleArrow;direction=south;whiteSpace=wrap;html=1;', 60, 100, '', 'Double Arrow Vertical', null, null, 'double arrow'),
      this.createVertexTemplateEntry('shape=actor;whiteSpace=wrap;html=1;', 40, 60, '', 'User', null, null, 'user person human'),
      this.createVertexTemplateEntry('shape=cross;whiteSpace=wrap;html=1;', 80, 80, '', 'Cross'),
      this.createVertexTemplateEntry('shape=corner;whiteSpace=wrap;html=1;', 80, 80, '', 'Corner'),
      this.createVertexTemplateEntry('shape=tee;whiteSpace=wrap;html=1;', 80, 80, '', 'Tee'),
      this.createVertexTemplateEntry('shape=datastore;whiteSpace=wrap;html=1;', 60, 60, '', 'Data Store', null, null, 'data store cylinder database'),
      this.createVertexTemplateEntry('shape=orEllipse;perimeter=ellipsePerimeter;whiteSpace=wrap;html=1;backgroundOutline=1;', 80, 80, '', 'Or', null, null, 'or circle oval ellipse'),
      this.createVertexTemplateEntry('shape=sumEllipse;perimeter=ellipsePerimeter;whiteSpace=wrap;html=1;backgroundOutline=1;', 80, 80, '', 'Sum', null, null, 'sum circle oval ellipse'),
      this.createVertexTemplateEntry('shape=lineEllipse;perimeter=ellipsePerimeter;whiteSpace=wrap;html=1;backgroundOutline=1;', 80, 80, '', 'Ellipse with horizontal divider', null, null, 'circle oval ellipse'),
      this.createVertexTemplateEntry('shape=lineEllipse;line=vertical;perimeter=ellipsePerimeter;whiteSpace=wrap;html=1;backgroundOutline=1;', 80, 80, '', 'Ellipse with vertical divider', null, null, 'circle oval ellipse'),
      this.createVertexTemplateEntry('shape=sortShape;perimeter=rhombusPerimeter;whiteSpace=wrap;html=1;', 80, 80, '', 'Sort', null, null, 'sort'),
      this.createVertexTemplateEntry('shape=collate;whiteSpace=wrap;html=1;', 80, 80, '', 'Collate', null, null, 'collate'),
      this.createVertexTemplateEntry('shape=switch;whiteSpace=wrap;html=1;', 60, 60, '', 'Switch', null, null, 'switch router'),
      this.addEntry('process bar', function () {
        return sb.createVertexTemplateFromData('zZXRaoMwFIafJpcDjbNrb2233rRQ8AkyPdPQaCRJV+3T7yTG2rUVBoOtgpDzn/xJzncCIdGyateKNeVW5iBI9EqipZLS9KOqXYIQhAY8J9GKUBrgT+jbRDZ02aBhCmrzEwPtDZ9MHKBXdkpmoDWKCVN9VptO+Kw+8kqwGqMkK7nIN6yTB7uTNizbD1FSSsVPsjYMC1qFKHxwIZZSSIVxLZ1/nJNar5+oQPMT7IYCrqUta1ENzuqGaeOFTArBGs3f3Vmtoo2Se7ja1h00kSoHK4bBIKUNy3hdoPYU0mF91i9mT8EEL2ocZ3gKa00ayWujLZY4IfHKFonVDLsRGgXuQ90zBmWgneyTk3yT1iArMKrDKUeem9L3ajHrbSXwohxsQd/ggOleKM7ese048J2/fwuim1uQGmhQCW8vQMkacP3GCQgBFMftHEsr7cYYe95CnmKTPMFbYD8CQ++DGQy+/M5X4ku5wHYmdIktfvk9tecpavThqS3m/0YtnqIWPTy1cD77K2wYjo+Ay317I74A', 296, 100, 'Process Bar');
      }),
      this.createVertexTemplateEntry('swimlane;', 200, 200, 'Container', 'Container', null, null, 'container swimlane lane pool group'),
      this.addEntry('list group erd table', function () {
        const cell = new mxCell('List', new mxGeometry(0, 0, 140, 110), 'swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=26;fillColor=none;horizontalStack=0;' + 'resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;');
        cell.vertex = true;
        cell.insert(sb.cloneCell(field, 'Item 1'));
        cell.insert(sb.cloneCell(field, 'Item 2'));
        cell.insert(sb.cloneCell(field, 'Item 3'));

        return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'List');
      }),
      this.addEntry('list item entry value group erd table', function () {
        return sb.createVertexTemplateFromCells([sb.cloneCell(field, 'List Item')], field.geometry.width, field.geometry.height, 'List Item');
      }),
    ];
  };

  Sidebar.prototype.addUmlPalette = function (expand) {
    // Avoids having to bind all functions to "this"
    const sb = this;

    // Reusable cells
    const field = new mxCell('+ field: type', new mxGeometry(0, 0, 100, 26), 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;');
    field.vertex = true;

    const divider = new mxCell('', new mxGeometry(0, 0, 40, 8), 'line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;');
    divider.vertex = true;

    // Default tags
    const dt = 'uml static class ';

    const fns = [
      this.createVertexTemplateEntry('html=1;', 110, 50, 'Object', 'Object', null, null, dt + 'object instance'),
      this.createVertexTemplateEntry('html=1;', 110, 50, '&laquo;interface&raquo;<br><b>Name</b>', 'Interface', null, null, dt + 'interface object instance annotated annotation'),
      this.addEntry(dt + 'object instance', function () {
        const cell = new mxCell('Classname', new mxGeometry(0, 0, 160, 90), 'swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;');
        cell.vertex = true;
        cell.insert(field.clone());
        cell.insert(divider.clone());
        cell.insert(sb.cloneCell(field, '+ method(type): type'));

        return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Class');
      }),
      this.addEntry(dt + 'section subsection', function () {
        const cell = new mxCell('Classname', new mxGeometry(0, 0, 140, 110), 'swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=26;fillColor=none;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;');
        cell.vertex = true;
        cell.insert(field.clone());
        cell.insert(field.clone());
        cell.insert(field.clone());

        return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Class 2');
      }),
      this.addEntry(dt + 'item member method function variable field attribute label', function () {
        return sb.createVertexTemplateFromCells([sb.cloneCell(field, '+ item: attribute')], field.geometry.width, field.geometry.height, 'Item 1');
      }),
      this.addEntry(dt + 'item member method function variable field attribute label', function () {
        const cell = new mxCell('item: attribute', new mxGeometry(0, 0, 120, field.geometry.height), 'label;fontStyle=0;strokeColor=none;fillColor=none;align=left;verticalAlign=top;overflow=hidden;' + 'spacingLeft=28;spacingRight=4;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;imageWidth=16;imageHeight=16;image=' + sb.gearImage);
        cell.vertex = true;

        return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Item 2');
      }),
      this.addEntry(dt + 'divider hline line separator', function () {
        return sb.createVertexTemplateFromCells([divider.clone()], divider.geometry.width, divider.geometry.height, 'Divider');
      }),
      this.addEntry(dt + 'spacer space gap separator', function () {
        const cell = new mxCell('', new mxGeometry(0, 0, 20, 14), 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=4;spacingRight=4;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;');
        cell.vertex = true;

        return sb.createVertexTemplateFromCells([cell.clone()], cell.geometry.width, cell.geometry.height, 'Spacer');
      }),
      this.createVertexTemplateEntry('text;align=center;fontStyle=1;verticalAlign=middle;spacingLeft=3;spacingRight=3;strokeColor=none;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;', 80, 26, 'Title', 'Title', null, null, dt + 'title label'),
      this.addEntry(dt + 'component', function () {
        const cell = new mxCell('&laquo;Annotation&raquo;<br/><b>Component</b>', new mxGeometry(0, 0, 180, 90), 'html=1;dropTarget=0;');
        cell.vertex = true;

        const symbol = new mxCell('', new mxGeometry(1, 0, 20, 20), 'shape=component;jettyWidth=8;jettyHeight=4;');
        symbol.vertex = true;
        symbol.geometry.relative = true;
        symbol.geometry.offset = new mxPoint(-27, 7);
        cell.insert(symbol);

        return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Component');
      }),
      this.addEntry(dt + 'component', function () {
        const cell = new mxCell('<p style="margin:0px;margin-top:6px;text-align:center;"><b>Component</b></p>' + '<hr/><p style="margin:0px;margin-left:8px;">+ Attribute1: Type<br/>+ Attribute2: Type</p>', new mxGeometry(0, 0, 180, 90), 'align=left;overflow=fill;html=1;dropTarget=0;');
        cell.vertex = true;

        const symbol = new mxCell('', new mxGeometry(1, 0, 20, 20), 'shape=component;jettyWidth=8;jettyHeight=4;');
        symbol.vertex = true;
        symbol.geometry.relative = true;
        symbol.geometry.offset = new mxPoint(-24, 4);
        cell.insert(symbol);

        return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Component with Attributes');
      }),
      this.createVertexTemplateEntry('verticalAlign=top;align=left;spacingTop=8;spacingLeft=2;spacingRight=12;shape=cube;size=10;direction=south;fontStyle=4;html=1;', 180, 120, 'Block', 'Block', null, null, dt + 'block'),
      this.createVertexTemplateEntry('shape=module;align=left;spacingLeft=20;align=center;verticalAlign=top;', 100, 50, 'Module', 'Module', null, null, dt + 'module component'),
      this.createVertexTemplateEntry('shape=folder;fontStyle=1;spacingTop=10;tabWidth=40;tabHeight=14;tabPosition=left;html=1;', 70, 50, 'package', 'Package', null, null, dt + 'package'),
      this.createVertexTemplateEntry('verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;', 160, 90, '<p style="margin:0px;margin-top:4px;text-align:center;text-decoration:underline;"><b>Object:Type</b></p><hr/>' + '<p style="margin:0px;margin-left:8px;">field1 = value1<br/>field2 = value2<br>field3 = value3</p>', 'Object', null, null, dt + 'object instance'),
      this.createVertexTemplateEntry('verticalAlign=top;align=left;overflow=fill;html=1;', 180, 90, '<div style="box-sizing:border-box;width:100%;background:#e4e4e4;padding:2px;">Tablename</div>' + '<table style="width:100%;font-size:1em;" cellpadding="2" cellspacing="0">' + '<tr><td>PK</td><td>uniqueId</td></tr><tr><td>FK1</td><td>' + 'foreignKey</td></tr><tr><td></td><td>fieldname</td></tr></table>', 'Entity', null, null, 'er entity table'),
      this.addEntry(dt + 'object instance', function () {
        const cell = new mxCell('<p style="margin:0px;margin-top:4px;text-align:center;">' + '<b>Class</b></p>' + '<hr size="1"/><div style="height:2px;"></div>', new mxGeometry(0, 0, 140, 60), 'verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;');
        cell.vertex = true;

        return sb.createVertexTemplateFromCells([cell.clone()], cell.geometry.width, cell.geometry.height, 'Class 3');
      }),
      this.addEntry(dt + 'object instance', function () {
        const cell = new mxCell('<p style="margin:0px;margin-top:4px;text-align:center;">' + '<b>Class</b></p>' + '<hr size="1"/><div style="height:2px;"></div><hr size="1"/><div style="height:2px;"></div>', new mxGeometry(0, 0, 140, 60), 'verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;');
        cell.vertex = true;

        return sb.createVertexTemplateFromCells([cell.clone()], cell.geometry.width, cell.geometry.height, 'Class 4');
      }),
      this.addEntry(dt + 'object instance', function () {
        const cell = new mxCell('<p style="margin:0px;margin-top:4px;text-align:center;">' + '<b>Class</b></p>' + '<hr size="1"/><p style="margin:0px;margin-left:4px;">+ field: Type</p><hr size="1"/>' + '<p style="margin:0px;margin-left:4px;">+ method(): Type</p>', new mxGeometry(0, 0, 160, 90), 'verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;');
        cell.vertex = true;

        return sb.createVertexTemplateFromCells([cell.clone()], cell.geometry.width, cell.geometry.height, 'Class 5');
      }),
      this.addEntry(dt + 'object instance', function () {
        const cell = new mxCell('<p style="margin:0px;margin-top:4px;text-align:center;">' + '<i>&lt;&lt;Interface&gt;&gt;</i><br/><b>Interface</b></p>' + '<hr size="1"/><p style="margin:0px;margin-left:4px;">+ field1: Type<br/>' + '+ field2: Type</p>' + '<hr size="1"/><p style="margin:0px;margin-left:4px;">' + '+ method1(Type): Type<br/>' + '+ method2(Type, Type): Type</p>', new mxGeometry(0, 0, 190, 140), 'verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;');
        cell.vertex = true;

        return sb.createVertexTemplateFromCells([cell.clone()], cell.geometry.width, cell.geometry.height, 'Interface 2');
      }),
      this.createVertexTemplateEntry('shape=providedRequiredInterface;html=1;verticalLabelPosition=bottom;', 20, 20, '', 'Provided/Required Interface', null, null, 'uml provided required interface lollipop notation'),
      this.createVertexTemplateEntry('shape=requiredInterface;html=1;verticalLabelPosition=bottom;', 10, 20, '', 'Required Interface', null, null, 'uml required interface lollipop notation'),
      this.addEntry('uml lollipop notation provided required interface', function () {
        return sb.createVertexTemplateFromData('zVTBrptADPyavVYEkt4b0uQd3pMq5dD2uAUD27dgZJwE8vX1spsQlETtpVWRIjFjex3PmFVJWvc70m31hjlYlXxWSUqI7N/qPgVrVRyZXCUbFceR/FS8fRJdjNGo1QQN/0lB7AuO2h7AM57oeLCBIDw0Obj8SCVrJK6wxEbbV8RWyIWQP4F52Juzq9AHRqEqrm2IQpN/IsKTwAYb8MzWWBuO9B0hL2E2BGsqIQyxvJ9rzApD7QBrYBokhcBqNsf5UbrzsLzmXUu/oJET42jwGat5QYcHyiDkTDLKy03TiRrFfSx08m+FrrQtUkOZvZdbFKThmwMfVhf4fQ43/W3uZriiPPT+KKhjwnf4anKuQv//wsg+NPJ7/9d9Xf7eVykwbeeMOFWGYd/qzEVO8tHP/Suw4a2ujXV/+gXsEdhkOgSC8os44BQt0tggicZHeG1N2QiXibhAV48epRayEDd8MT7Ct06TUaXVWq027tCuhcx5VZjebeeaoDNn/WMcb/p+j0AM/dNr6InLl4Lgzylsk6OCgRWYsuI592gNZh5OhgmcblPv7+1l+ws=', 40, 10, 'Lollipop Notation');
      }),
      this.createVertexTemplateEntry('shape=umlBoundary;whiteSpace=wrap;html=1;', 100, 80, 'Boundary Object', 'Boundary Object', null, null, 'uml boundary object'),
      this.createVertexTemplateEntry('ellipse;shape=umlEntity;whiteSpace=wrap;html=1;', 80, 80, 'Entity Object', 'Entity Object', null, null, 'uml entity object'),
      this.createVertexTemplateEntry('ellipse;shape=umlControl;whiteSpace=wrap;html=1;', 70, 80, 'Control Object', 'Control Object', null, null, 'uml control object'),
      this.createVertexTemplateEntry('shape=umlActor;verticalLabelPosition=bottom;labelBackgroundColor=#ffffff;verticalAlign=top;html=1;', 30, 60, 'Actor', 'Actor', false, null, 'uml actor'),
      this.createVertexTemplateEntry('ellipse;whiteSpace=wrap;html=1;', 140, 70, 'Use Case', 'Use Case', null, null, 'uml use case usecase'),
      this.addEntry('uml activity state start', function () {
        const cell = new mxCell('', new mxGeometry(0, 0, 30, 30), 'ellipse;html=1;shape=startState;fillColor=#000000;strokeColor=#ff0000;');
        cell.vertex = true;

        const edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'edgeStyle=orthogonalEdgeStyle;html=1;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
        edge.geometry.setTerminalPoint(new mxPoint(15, 90), false);
        edge.geometry.relative = true;
        edge.edge = true;

        cell.insertEdge(edge, true);

        return sb.createVertexTemplateFromCells([cell, edge], 30, 90, 'Start');
      }),
      this.addEntry('uml activity state', function () {
        const cell = new mxCell('Activity', new mxGeometry(0, 0, 120, 40), 'rounded=1;whiteSpace=wrap;html=1;arcSize=40;fontColor=#000000;fillColor=#ffffc0;strokeColor=#ff0000;');
        cell.vertex = true;

        const edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'edgeStyle=orthogonalEdgeStyle;html=1;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
        edge.geometry.setTerminalPoint(new mxPoint(60, 100), false);
        edge.geometry.relative = true;
        edge.edge = true;

        cell.insertEdge(edge, true);

        return sb.createVertexTemplateFromCells([cell, edge], 120, 100, 'Activity');
      }),
      this.addEntry('uml activity composite state', function () {
        const cell = new mxCell('Composite State', new mxGeometry(0, 0, 160, 60), 'swimlane;html=1;fontStyle=1;align=center;verticalAlign=middle;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=0;resizeLast=1;container=0;fontColor=#000000;collapsible=0;rounded=1;arcSize=30;strokeColor=#ff0000;fillColor=#ffffc0;swimlaneFillColor=#ffffc0;dropTarget=0;');
        cell.vertex = true;

        const cell1 = new mxCell('Subtitle', new mxGeometry(0, 0, 200, 26), 'text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;spacingLeft=4;spacingRight=4;whiteSpace=wrap;overflow=hidden;rotatable=0;fontColor=#000000;');
        cell1.vertex = true;
        cell.insert(cell1);

        const edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'edgeStyle=orthogonalEdgeStyle;html=1;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
        edge.geometry.setTerminalPoint(new mxPoint(80, 120), false);
        edge.geometry.relative = true;
        edge.edge = true;

        cell.insertEdge(edge, true);

        return sb.createVertexTemplateFromCells([cell, edge], 160, 120, 'Composite State');
      }),
      this.addEntry('uml activity condition', function () {
        const cell = new mxCell('Condition', new mxGeometry(0, 0, 80, 40), 'rhombus;whiteSpace=wrap;html=1;fillColor=#ffffc0;strokeColor=#ff0000;');
        cell.vertex = true;

        const edge1 = new mxCell('no', new mxGeometry(0, 0, 0, 0), 'edgeStyle=orthogonalEdgeStyle;html=1;align=left;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
        edge1.geometry.setTerminalPoint(new mxPoint(180, 20), false);
        edge1.geometry.relative = true;
        edge1.geometry.x = -1;
        edge1.edge = true;

        cell.insertEdge(edge1, true);

        const edge2 = new mxCell('yes', new mxGeometry(0, 0, 0, 0), 'edgeStyle=orthogonalEdgeStyle;html=1;align=left;verticalAlign=top;endArrow=open;endSize=8;strokeColor=#ff0000;');
        edge2.geometry.setTerminalPoint(new mxPoint(40, 100), false);
        edge2.geometry.relative = true;
        edge2.geometry.x = -1;
        edge2.edge = true;

        cell.insertEdge(edge2, true);

        return sb.createVertexTemplateFromCells([cell, edge1, edge2], 180, 100, 'Condition');
      }),
      this.addEntry('uml activity fork join', function () {
        const cell = new mxCell('', new mxGeometry(0, 0, 200, 10), 'shape=line;html=1;strokeWidth=6;strokeColor=#ff0000;');
        cell.vertex = true;

        const edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'edgeStyle=orthogonalEdgeStyle;html=1;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
        edge.geometry.setTerminalPoint(new mxPoint(100, 80), false);
        edge.geometry.relative = true;
        edge.edge = true;

        cell.insertEdge(edge, true);

        return sb.createVertexTemplateFromCells([cell, edge], 200, 80, 'Fork/Join');
      }),
      this.createVertexTemplateEntry('ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#ff0000;', 30, 30, '', 'End', null, null, 'uml activity state end'),
      this.createVertexTemplateEntry('shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;', 100, 300, ':Object', 'Lifeline', null, null, 'uml sequence participant lifeline'),
      this.createVertexTemplateEntry('shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=36;labelBackgroundColor=#ffffff;outlineConnect=0;', 20, 300, '', 'Actor Lifeline', null, null, 'uml sequence participant lifeline actor'),
      this.createVertexTemplateEntry('shape=umlLifeline;participant=umlBoundary;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=36;labelBackgroundColor=#ffffff;outlineConnect=0;', 50, 300, '', 'Boundary Lifeline', null, null, 'uml sequence participant lifeline boundary'),
      this.createVertexTemplateEntry('shape=umlLifeline;participant=umlEntity;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=36;labelBackgroundColor=#ffffff;outlineConnect=0;', 40, 300, '', 'Entity Lifeline', null, null, 'uml sequence participant lifeline entity'),
      this.createVertexTemplateEntry('shape=umlLifeline;participant=umlControl;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=36;labelBackgroundColor=#ffffff;outlineConnect=0;', 40, 300, '', 'Control Lifeline', null, null, 'uml sequence participant lifeline control'),
      this.createVertexTemplateEntry('shape=umlFrame;whiteSpace=wrap;html=1;', 300, 200, 'frame', 'Frame', null, null, 'uml sequence frame'),
      this.createVertexTemplateEntry('shape=umlDestroy;whiteSpace=wrap;html=1;strokeWidth=3;', 30, 30, '', 'Destruction', null, null, 'uml sequence destruction destroy'),
      this.createVertexTemplateEntry('shape=note;whiteSpace=wrap;html=1;size=14;verticalAlign=top;align=left;spacingTop=-6;', 100, 70, 'Note', 'Note', null, null, 'uml note'),
      this.addEntry('uml sequence invoke invocation call activation', function () {
        const cell = new mxCell('', new mxGeometry(0, 0, 10, 80), 'html=1;points=[];perimeter=orthogonalPerimeter;');
        cell.vertex = true;

        const edge = new mxCell('dispatch', new mxGeometry(0, 0, 0, 0), 'html=1;verticalAlign=bottom;startArrow=oval;endArrow=block;startSize=8;');
        edge.geometry.setTerminalPoint(new mxPoint(-60, 0), true);
        edge.geometry.relative = true;
        edge.edge = true;

        cell.insertEdge(edge, false);

        return sb.createVertexTemplateFromCells([cell, edge], 10, 80, 'Found Message');
      }),
      this.addEntry('uml sequence invoke call delegation synchronous invocation activation', function () {
        const cell = new mxCell('', new mxGeometry(0, 0, 10, 80), 'html=1;points=[];perimeter=orthogonalPerimeter;');
        cell.vertex = true;

        const edge1 = new mxCell('dispatch', new mxGeometry(0, 0, 0, 0), 'html=1;verticalAlign=bottom;endArrow=block;entryX=0;entryY=0;');
        edge1.geometry.setTerminalPoint(new mxPoint(-70, 0), true);
        edge1.geometry.relative = true;
        edge1.edge = true;

        cell.insertEdge(edge1, false);

        const edge2 = new mxCell('return', new mxGeometry(0, 0, 0, 0), 'html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;exitX=0;exitY=0.95;');
        edge2.geometry.setTerminalPoint(new mxPoint(-70, 76), false);
        edge2.geometry.relative = true;
        edge2.edge = true;

        cell.insertEdge(edge2, true);

        return sb.createVertexTemplateFromCells([cell, edge1, edge2], 10, 80, 'Synchronous Invocation');
      }),
      this.addEntry('uml sequence self call recursion delegation activation', function () {
        const cell = new mxCell('', new mxGeometry(0, 20, 10, 40), 'html=1;points=[];perimeter=orthogonalPerimeter;');
        cell.vertex = true;

        const edge = new mxCell('self call', new mxGeometry(0, 0, 0, 0), 'edgeStyle=orthogonalEdgeStyle;html=1;align=left;spacingLeft=2;endArrow=block;rounded=0;entryX=1;entryY=0;');
        edge.geometry.setTerminalPoint(new mxPoint(5, 0), true);
        edge.geometry.points = [new mxPoint(30, 0)];
        edge.geometry.relative = true;
        edge.edge = true;

        cell.insertEdge(edge, false);

        return sb.createVertexTemplateFromCells([cell, edge], 10, 60, 'Self Call');
      }),
      this.addEntry('uml sequence invoke call delegation callback activation', function () {
        // TODO: Check if more entries should be converted to compressed XML
        return sb.createVertexTemplateFromData('xZRNT8MwDIZ/Ta6oaymD47rBTkiTuMAxW6wmIm0q19s6fj1OE3V0Y2iCA4dK8euP2I+riGxedUuUjX52CqzIHkU2R+conKpuDtaKNDFKZAuRpgl/In264J303qSRCDVdk5CGhJ20WwhKEFo62ChoqritxURkReNMTa2X80LkC68AmgoIkEWHpF3pamlXR7WIFwASdBeb7KXY4RIc5+KBQ/ZGkY4RYY5Egyl1zLqLmmyDXQ6Zx4n5EIf+HkB2BmAjrV3LzftPIPw4hgNn1pQ1a2tH5Cp2QK1miG7vNeu4iJe4pdeY2BtvbCQDGlAljMCQxBJotJ8rWCFYSWY3LvUdmZi68rvkkLiU6QnL1m1xAzHoBOdw61WEb88II9AW67/ydQ2wq1Cy1aAGvOrFfPh6997qDA3g+dxzv3nIL6MPU/8T+kMw8+m4QPgdfrEJNo8PSQj/+s58Ag==', 10, 60, 'Callback');
      }),
      this.createVertexTemplateEntry('html=1;points=[];perimeter=orthogonalPerimeter;', 10, 80, '', 'Activation', null, null, 'uml sequence activation'),
      this.createEdgeTemplateEntry('html=1;verticalAlign=bottom;startArrow=oval;startFill=1;endArrow=block;startSize=8;', 60, 0, 'dispatch', 'Found Message 1', null, 'uml sequence message call invoke dispatch'),
      this.createEdgeTemplateEntry('html=1;verticalAlign=bottom;startArrow=circle;startFill=1;endArrow=open;startSize=6;endSize=8;', 80, 0, 'dispatch', 'Found Message 2', null, 'uml sequence message call invoke dispatch'),
      this.createEdgeTemplateEntry('html=1;verticalAlign=bottom;endArrow=block;', 80, 0, 'dispatch', 'Message', null, 'uml sequence message call invoke dispatch'),
      this.addEntry('uml sequence return message', function () {
        const edge = new mxCell('return', new mxGeometry(0, 0, 0, 0), 'html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;');
        edge.geometry.setTerminalPoint(new mxPoint(80, 0), true);
        edge.geometry.setTerminalPoint(new mxPoint(0, 0), false);
        edge.geometry.relative = true;
        edge.edge = true;

        return sb.createEdgeTemplateFromCells([edge], 80, 0, 'Return');
      }),
      this.addEntry('uml relation', function () {
        const edge = new mxCell('name', new mxGeometry(0, 0, 0, 0), 'endArrow=block;endFill=1;html=1;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=top;');
        edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
        edge.geometry.setTerminalPoint(new mxPoint(160, 0), false);
        edge.geometry.relative = true;
        edge.geometry.x = -1;
        edge.edge = true;

        const cell = new mxCell('1', new mxGeometry(-1, 0, 0, 0), 'resizable=0;html=1;align=left;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10;');
        cell.geometry.relative = true;
        cell.setConnectable(false);
        cell.vertex = true;
        edge.insert(cell);

        return sb.createEdgeTemplateFromCells([edge], 160, 0, 'Relation 1');
      }),
      this.addEntry('uml association', function () {
        const edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'endArrow=none;html=1;edgeStyle=orthogonalEdgeStyle;');
        edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
        edge.geometry.setTerminalPoint(new mxPoint(160, 0), false);
        edge.geometry.relative = true;
        edge.edge = true;

        const cell1 = new mxCell('parent', new mxGeometry(-1, 0, 0, 0), 'resizable=0;html=1;align=left;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10;');
        cell1.geometry.relative = true;
        cell1.setConnectable(false);
        cell1.vertex = true;
        edge.insert(cell1);

        const cell2 = new mxCell('child', new mxGeometry(1, 0, 0, 0), 'resizable=0;html=1;align=right;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10;');
        cell2.geometry.relative = true;
        cell2.setConnectable(false);
        cell2.vertex = true;
        edge.insert(cell2);

        return sb.createEdgeTemplateFromCells([edge], 160, 0, 'Association 1');
      }),
      this.addEntry('uml aggregation', function () {
        const edge = new mxCell('1', new mxGeometry(0, 0, 0, 0), 'endArrow=open;html=1;endSize=12;startArrow=diamondThin;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=bottom;');
        edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
        edge.geometry.setTerminalPoint(new mxPoint(160, 0), false);
        edge.geometry.relative = true;
        edge.geometry.x = -1;
        edge.geometry.y = 3;
        edge.edge = true;

        return sb.createEdgeTemplateFromCells([edge], 160, 0, 'Aggregation 1');
      }),
      this.addEntry('uml composition', function () {
        const edge = new mxCell('1', new mxGeometry(0, 0, 0, 0), 'endArrow=open;html=1;endSize=12;startArrow=diamondThin;startSize=14;startFill=1;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=bottom;');
        edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
        edge.geometry.setTerminalPoint(new mxPoint(160, 0), false);
        edge.geometry.relative = true;
        edge.geometry.x = -1;
        edge.geometry.y = 3;
        edge.edge = true;

        return sb.createEdgeTemplateFromCells([edge], 160, 0, 'Composition 1');
      }),
      this.addEntry('uml relation', function () {
        const edge = new mxCell('Relation', new mxGeometry(0, 0, 0, 0), 'endArrow=open;html=1;endSize=12;startArrow=diamondThin;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;');
        edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
        edge.geometry.setTerminalPoint(new mxPoint(160, 0), false);
        edge.geometry.relative = true;
        edge.edge = true;

        const cell1 = new mxCell('0..n', new mxGeometry(-1, 0, 0, 0), 'resizable=0;html=1;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;');
        cell1.geometry.relative = true;
        cell1.setConnectable(false);
        cell1.vertex = true;
        edge.insert(cell1);

        const cell2 = new mxCell('1', new mxGeometry(1, 0, 0, 0), 'resizable=0;html=1;align=right;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;');
        cell2.geometry.relative = true;
        cell2.setConnectable(false);
        cell2.vertex = true;
        edge.insert(cell2);

        return sb.createEdgeTemplateFromCells([edge], 160, 0, 'Relation 2');
      }),
      this.createEdgeTemplateEntry('endArrow=open;endSize=12;dashed=1;html=1;', 160, 0, 'Use', 'Dependency', null, 'uml dependency use'),
      this.createEdgeTemplateEntry('endArrow=block;endSize=16;endFill=0;html=1;', 160, 0, 'Extends', 'Generalization', null, 'uml generalization extend'),
      this.createEdgeTemplateEntry('endArrow=block;startArrow=block;endFill=1;startFill=1;html=1;', 160, 0, '', 'Association 2', null, 'uml association'),
      this.createEdgeTemplateEntry('endArrow=open;startArrow=circlePlus;endFill=0;startFill=0;endSize=8;html=1;', 160, 0, '', 'Inner Class', null, 'uml inner class'),
      this.createEdgeTemplateEntry('endArrow=open;startArrow=cross;endFill=0;startFill=0;endSize=8;startSize=10;html=1;', 160, 0, '', 'Terminate', null, 'uml terminate'),
      this.createEdgeTemplateEntry('endArrow=block;dashed=1;endFill=0;endSize=12;html=1;', 160, 0, '', 'Implementation', null, 'uml realization implementation'),
      this.createEdgeTemplateEntry('endArrow=diamondThin;endFill=0;endSize=24;html=1;', 160, 0, '', 'Aggregation 2', null, 'uml aggregation'),
      this.createEdgeTemplateEntry('endArrow=diamondThin;endFill=1;endSize=24;html=1;', 160, 0, '', 'Composition 2', null, 'uml composition'),
      this.createEdgeTemplateEntry('endArrow=open;endFill=1;endSize=12;html=1;', 160, 0, '', 'Association 3', null, 'uml association'),
    ];

    this.addPaletteFunctions('uml', mxResources.get('uml'), expand || false, fns);
  };

  Sidebar.prototype.addBpmnPalette = function () {
    // Avoids having to bind all functions to "this"
    const sb = this;

    const fns = [
      this.createVertexTemplateEntry('shape=ext;rounded=1;html=1;whiteSpace=wrap;', 120, 80, 'Task', 'Process', null, null, 'bpmn task process'),
      this.createVertexTemplateEntry('shape=ext;rounded=1;html=1;whiteSpace=wrap;double=1;', 120, 80, 'Transaction', 'Transaction', null, null, 'bpmn transaction'),
      this.createVertexTemplateEntry('shape=ext;rounded=1;html=1;whiteSpace=wrap;dashed=1;dashPattern=1 4;', 120, 80, 'Event\nSub-Process', 'Event Sub-Process', null, null, 'bpmn event subprocess sub process sub-process'),
      this.createVertexTemplateEntry('shape=ext;rounded=1;html=1;whiteSpace=wrap;strokeWidth=3;', 120, 80, 'Call Activity', 'Call Activity', null, null, 'bpmn call activity'),
      this.addEntry('bpmn subprocess sub process sub-process', function () {
        const cell = new mxCell('Sub-Process', new mxGeometry(0, 0, 120, 80), 'html=1;whiteSpace=wrap;rounded=1;dropTarget=0;');
        cell.vertex = true;

        const cell1 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=1;shape=plus;outlineConnect=0;');
        cell1.vertex = true;
        cell1.geometry.relative = true;
        cell1.geometry.offset = new mxPoint(-7, -14);
        cell.insert(cell1);

        return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Sub-Process');
      }),
      this.addEntry(this.getTagsForStencil('mxgraph.bpmn', 'loop', 'subprocess sub process sub-process looped').join(' '), function () {
        const cell = new mxCell('Looped\nSub-Process', new mxGeometry(0, 0, 120, 80), 'html=1;whiteSpace=wrap;rounded=1;dropTarget=0;');
        cell.vertex = true;

        const cell1 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=1;shape=mxgraph.bpmn.loop;outlineConnect=0;');
        cell1.vertex = true;
        cell1.geometry.relative = true;
        cell1.geometry.offset = new mxPoint(-15, -14);
        cell.insert(cell1);

        const cell2 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=1;shape=plus;');
        cell2.vertex = true;
        cell2.geometry.relative = true;
        cell2.geometry.offset = new mxPoint(1, -14);
        cell.insert(cell2);

        return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Looped Sub-Process');
      }),
      this.addEntry('bpmn receive task', function () {
        const cell = new mxCell('Receive', new mxGeometry(0, 0, 120, 80), 'html=1;whiteSpace=wrap;rounded=1;dropTarget=0;');
        cell.vertex = true;

        const cell1 = new mxCell('', new mxGeometry(0, 0, 20, 14), 'html=1;shape=message;outlineConnect=0;');
        cell1.vertex = true;
        cell1.geometry.relative = true;
        cell1.geometry.offset = new mxPoint(7, 7);
        cell.insert(cell1);

        return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Receive Task');
      }),
      this.addEntry(this.getTagsForStencil('mxgraph.bpmn', 'user_task').join(' '), function () {
        const cell = new mxCell('User', new mxGeometry(0, 0, 120, 80), 'html=1;whiteSpace=wrap;rounded=1;dropTarget=0;');
        cell.vertex = true;

        const cell1 = new mxCell('', new mxGeometry(0, 0, 14, 14), 'html=1;shape=mxgraph.bpmn.user_task;outlineConnect=0;');
        cell1.vertex = true;
        cell1.geometry.relative = true;
        cell1.geometry.offset = new mxPoint(7, 7);
        cell.insert(cell1);

        const cell2 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=1;shape=plus;outlineConnect=0;');
        cell2.vertex = true;
        cell2.geometry.relative = true;
        cell2.geometry.offset = new mxPoint(-7, -14);
        cell.insert(cell2);

        return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'User Task');
      }),
      this.addEntry(this.getTagsForStencil('mxgraph.bpmn', 'timer_start', 'attached').join(' '), function () {
        const cell = new mxCell('Process', new mxGeometry(0, 0, 120, 80), 'html=1;whiteSpace=wrap;rounded=1;dropTarget=0;');
        cell.vertex = true;

        const cell1 = new mxCell('', new mxGeometry(1, 1, 30, 30), 'shape=mxgraph.bpmn.timer_start;perimeter=ellipsePerimeter;html=1;verticalLabelPosition=bottom;labelBackgroundColor=#ffffff;verticalAlign=top;outlineConnect=0;');
        cell1.vertex = true;
        cell1.geometry.relative = true;
        cell1.geometry.offset = new mxPoint(-40, -15);
        cell.insert(cell1);

        return sb.createVertexTemplateFromCells([cell], 120, 95, 'Attached Timer Event 1');
      }),
      this.addEntry(this.getTagsForStencil('mxgraph.bpmn', 'timer_start', 'attached').join(' '), function () {
        const cell = new mxCell('Process', new mxGeometry(0, 0, 120, 80), 'html=1;whiteSpace=wrap;rounded=1;dropTarget=0;');
        cell.vertex = true;

        const cell1 = new mxCell('', new mxGeometry(1, 0, 30, 30), 'shape=mxgraph.bpmn.timer_start;perimeter=ellipsePerimeter;html=1;labelPosition=right;labelBackgroundColor=#ffffff;align=left;outlineConnect=0;');
        cell1.vertex = true;
        cell1.geometry.relative = true;
        cell1.geometry.offset = new mxPoint(-15, 10);
        cell.insert(cell1);

        return sb.createVertexTemplateFromCells([cell], 135, 80, 'Attached Timer Event 2');
      }),
      this.createVertexTemplateEntry('swimlane;html=1;horizontal=0;startSize=20;', 320, 240, 'Pool', 'Pool', null, null, 'bpmn pool'),
      this.createVertexTemplateEntry('swimlane;html=1;horizontal=0;swimlaneLine=0;', 300, 120, 'Lane', 'Lane', null, null, 'bpmn lane'),
      this.createVertexTemplateEntry('shape=hexagon;html=1;whiteSpace=wrap;perimeter=hexagonPerimeter;rounded=0;', 60, 50, '', 'Conversation', null, null, 'bpmn conversation'),
      this.createVertexTemplateEntry('shape=hexagon;html=1;whiteSpace=wrap;perimeter=hexagonPerimeter;strokeWidth=4;rounded=0;', 60, 50, '', 'Call Conversation', null, null, 'bpmn call conversation'),
      this.addEntry('bpmn subconversation sub conversation sub-conversation', function () {
        const cell = new mxCell('', new mxGeometry(0, 0, 60, 50), 'shape=hexagon;whiteSpace=wrap;html=1;perimeter=hexagonPerimeter;rounded=0;dropTarget=0;');
        cell.vertex = true;

        const cell1 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=1;shape=plus;');
        cell1.vertex = true;
        cell1.geometry.relative = true;
        cell1.geometry.offset = new mxPoint(-7, -14);
        cell.insert(cell1);

        return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Sub-Conversation');
      }),
      this.addEntry('bpmn data object', function () {
        const cell = new mxCell('', new mxGeometry(0, 0, 40, 60), 'shape=note;whiteSpace=wrap;size=16;html=1;dropTarget=0;');
        cell.vertex = true;

        const cell1 = new mxCell('', new mxGeometry(0, 0, 14, 14), 'html=1;shape=singleArrow;arrowWidth=0.4;arrowSize=0.4;outlineConnect=0;');
        cell1.vertex = true;
        cell1.geometry.relative = true;
        cell1.geometry.offset = new mxPoint(2, 2);
        cell.insert(cell1);

        const cell2 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=1;whiteSpace=wrap;shape=parallelMarker;outlineConnect=0;');
        cell2.vertex = true;
        cell2.geometry.relative = true;
        cell2.geometry.offset = new mxPoint(-7, -14);
        cell.insert(cell2);

        return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Data Object');
      }),
      this.createVertexTemplateEntry('shape=datastore;whiteSpace=wrap;html=1;', 60, 60, '', 'Data Store', null, null, 'bpmn data store'),
      this.createVertexTemplateEntry('shape=plus;html=1;outlineConnect=0;', 14, 14, '', 'Sub-Process Marker', null, null, 'bpmn subprocess sub process sub-process marker'),
      this.createVertexTemplateEntry('shape=mxgraph.bpmn.loop;html=1;outlineConnect=0;', 14, 14, '', 'Loop Marker', null, null, 'bpmn loop marker'),
      this.createVertexTemplateEntry('shape=parallelMarker;html=1;outlineConnect=0;', 14, 14, '', 'Parallel MI Marker', null, null, 'bpmn parallel mi marker'),
      this.createVertexTemplateEntry('shape=parallelMarker;direction=south;html=1;outlineConnect=0;', 14, 14, '', 'Sequential MI Marker', null, null, 'bpmn sequential mi marker'),
      this.createVertexTemplateEntry('shape=mxgraph.bpmn.ad_hoc;fillColor=#000000;html=1;outlineConnect=0;', 14, 14, '', 'Ad Hoc Marker', null, null, 'bpmn ad hoc marker'),
      this.createVertexTemplateEntry('shape=mxgraph.bpmn.compensation;html=1;outlineConnect=0;', 14, 14, '', 'Compensation Marker', null, null, 'bpmn compensation marker'),
      this.createVertexTemplateEntry('shape=message;whiteSpace=wrap;html=1;outlineConnect=0;fillColor=#000000;strokeColor=#ffffff;strokeWidth=2;', 40, 30, '', 'Send Task', null, null, 'bpmn send task'),
      this.createVertexTemplateEntry('shape=message;whiteSpace=wrap;html=1;outlineConnect=0;', 40, 30, '', 'Receive Task', null, null, 'bpmn receive task'),
      this.createVertexTemplateEntry('shape=mxgraph.bpmn.user_task;html=1;outlineConnect=0;', 14, 14, '', 'User Task', null, null, this.getTagsForStencil('mxgraph.bpmn', 'user_task').join(' ')),
      this.createVertexTemplateEntry('shape=mxgraph.bpmn.manual_task;html=1;outlineConnect=0;', 14, 14, '', 'Manual Task', null, null, this.getTagsForStencil('mxgraph.bpmn', 'user_task').join(' ')),
      this.createVertexTemplateEntry('shape=mxgraph.bpmn.business_rule_task;html=1;outlineConnect=0;', 14, 14, '', 'Business Rule Task', null, null, this.getTagsForStencil('mxgraph.bpmn', 'business_rule_task').join(' ')),
      this.createVertexTemplateEntry('shape=mxgraph.bpmn.service_task;html=1;outlineConnect=0;', 14, 14, '', 'Service Task', null, null, this.getTagsForStencil('mxgraph.bpmn', 'service_task').join(' ')),
      this.createVertexTemplateEntry('shape=mxgraph.bpmn.script_task;html=1;outlineConnect=0;', 14, 14, '', 'Script Task', null, null, this.getTagsForStencil('mxgraph.bpmn', 'script_task').join(' ')),
      this.createVertexTemplateEntry('html=1;shape=mxgraph.flowchart.annotation_2;align=left;labelPosition=right;', 50, 100, '', 'Annotation', null, null, this.getTagsForStencil('bpmn', 'annotation_1', 'bpmn business process model ').join(' ')),
      this.addDataEntry('container swimlane pool horizontal', 480, 380, 'Horizontal Pool 1', 'zZRLbsIwEIZP4709TlHXhJYNSEicwCIjbNWJkWNKwumZxA6IlrRUaisWlmb+eX8LM5mXzdyrnV66Ai2TL0zm3rkQrbLJ0VoG3BRMzhgAp8fgdSQq+ijfKY9VuKcAYsG7snuMyso5G8U6tDaJ9cGUVlXkTXUoacuZIHOjjS0WqnX7blYd1OZt8KYea3PE1bCI+CAtVUMq7/o5b46uCmroSn18WFMm+XCdse5GpLq0OPqAzejxvZQun6MrMfiWUg6mCDpmZM8RENdotjqVyUFUdRS259oLSzISztto5Se0i44gcHEn3i9A/IQB3GbQpmi69DskAn4BSTaGBB4Jicj+k8nTGBP5SExg8odMyL38eH3s6kM8AQ=='),
      this.addDataEntry('container swimlane pool horizontal', 480, 360, 'Horizontal Pool 2', 'zZTBbsIwDIafJvfU6dDOlI0LSEg8QUQtEi1tUBJGy9PPbcJQWTsxaZs4VLJ//07sT1WYKKpm6eRBrW2JhokXJgpnbYhR1RRoDAOuSyYWDIDTx+B1opr1VX6QDutwTwPEhndpjhiVjbUmij60Jon+pCsja8rmKlQ05SKjcKe0KVeytcfuLh/k7u2SzR16fcbNZZDsRlrLhlTenWedPts6SJMEOseFLTkph6Fj212RbGlwdAGbyeV7KW2+RFthcC1ZTroMKjry5wiIK9R7ldrELInSR2H/2XtlSUHCOY5WfEG76ggCz+7E+w2InzCAcQapIf0fAySzESQZ/AKSfAoJPCKS9mbzf0H0NIVIPDAiyP8QEaXX97CvDZ7LDw=='),
      this.createVertexTemplateEntry('swimlane;startSize=20;horizontal=0;', 320, 120, 'Lane', 'Horizontal Swimlane', null, null, 'swimlane lane pool'),
      this.addDataEntry('container swimlane pool horizontal', 360, 480, 'Vertical Pool 1', 'xZRBbsIwEEVP4709ThFrQssGJKSewCIjbNXGyDEl4fSdxKa0NJFQVTULSzP/e+T5b2EmS9esgjrqja/QMvnMZBm8j6lyTYnWMuCmYnLJADgdBi8jruhdflQBD/GRAUgD78qeMClb720S69jaLNZn46w6ULfQ0dGWS0HlThtbrVXrT91bdVS7t2u3CFibC26vi4g7aaMaUjmpNBbiKxnUQyfkjTBEbEZT9VKOtELvMIaWrpxNFXW6IWcpOddo9jqPFfMsqjoJ+8/ZGyQqMqdhZvIHs3WHBrh4kNvvIsNw5Da7OdgXAgKGCMz+gEAxRgCmINDcxZ2CyNMYETkhESj+jwi1t1+r9759ah8='),
      this.addDataEntry('container swimlane pool vertical', 380, 480, 'Vertical Pool 2', 'xZTPbsIwDMafJvf86dDOlI0LSEg8QUQtEi1pUBJGy9PPbdJ1G1TqhXGoZH/219g/RSGitM3ay5PaugoMEW9ElN65mCLblGAM4VRXRKwI5xQ/wt8nqqyv0pP0UMc5Bp4Mn9KcISk750wSQ2xNFsNFWyNrzJYqWpxyxTA8KG2qjWzduTsrRHn4GLKlh6CvsBsGYX+krWxQpaiizcc9FjDnnaCc11dXR2lyxyjsuyPy3/Lg4CM0k8v3Ut58Dc5C9C22XHQVVeoQrwkQVaCPKtuKQZQhCcdv78gSg4zzPlpxg3bTEeSUzcR7Q2bWyvz+ytmQr8NPAow/ikAxRYA/kQAr/hPByxQC8cxLsHggAkzH56uv/XrdvgA='),
      this.createVertexTemplateEntry('swimlane;startSize=20;', 120, 320, 'Lane', 'Vertical Swimlane', null, null, 'swimlane lane pool'),
      this.createVertexTemplateEntry('rounded=1;arcSize=10;dashed=1;strokeColor=#000000;fillColor=none;gradientColor=none;dashPattern=8 3 1 3;strokeWidth=2;', 200, 200, '', 'Group', null, null, this.getTagsForStencil('bpmn', 'group', 'bpmn business process model ').join(' ')),
      this.createEdgeTemplateEntry('endArrow=block;endFill=1;endSize=6;html=1;', 100, 0, '', 'Sequence Flow', null, 'bpmn sequence flow'),
      this.createEdgeTemplateEntry('startArrow=dash;startSize=8;endArrow=block;endFill=1;endSize=6;html=1;', 100, 0, '', 'Default Flow', null, 'bpmn default flow'),
      this.createEdgeTemplateEntry('startArrow=diamondThin;startFill=0;startSize=14;endArrow=block;endFill=1;endSize=6;html=1;', 100, 0, '', 'Conditional Flow', null, 'bpmn conditional flow'),
      this.createEdgeTemplateEntry('startArrow=oval;startFill=0;startSize=7;endArrow=block;endFill=0;endSize=10;dashed=1;html=1;', 100, 0, '', 'Message Flow 1', null, 'bpmn message flow'),
      this.addEntry('bpmn message flow', function () {
        const edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'startArrow=oval;startFill=0;startSize=7;endArrow=block;endFill=0;endSize=10;dashed=1;html=1;');
        edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
        edge.geometry.setTerminalPoint(new mxPoint(100, 0), false);
        edge.geometry.relative = true;
        edge.edge = true;

        const cell = new mxCell('', new mxGeometry(0, 0, 20, 14), 'shape=message;html=1;outlineConnect=0;');
        cell.geometry.relative = true;
        cell.vertex = true;
        cell.geometry.offset = new mxPoint(-10, -7);
        edge.insert(cell);

        return sb.createEdgeTemplateFromCells([edge], 100, 0, 'Message Flow 2');
      }),
      this.createEdgeTemplateEntry('shape=link;html=1;', 100, 0, '', 'Link', null, 'bpmn link'),
    ];

    this.addPaletteFunctions('bpmn', 'BPMN ' + mxResources.get('general'), false, fns);
  };


  Sidebar.prototype.addArrows2Palette = function (expand) {
    const s = 'html=1;shadow=0;dashed=0;align=center;verticalAlign=middle;shape=mxgraph.arrows2.';
    const s2 = 'html=1;shadow=0;dashed=0;fillColor=none;strokeColor=none;shape=mxgraph.arrows2.';
    const gn = 'mxgraph.arrows2';
    const dt = 'arrow ';
    const sb = this;
    const fns = [
      this.createVertexTemplateEntry(s + 'arrow;dy=0.6;dx=40;notch=0;',
        100, 70, '', 'Arrow Right', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'right').join(' ')),
      this.createVertexTemplateEntry(s + 'arrow;dy=0.6;dx=40;flipH=1;notch=0;',
        100, 70, '', 'Arrow Left', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'left').join(' ')),
      this.createVertexTemplateEntry(s + 'arrow;dy=0.6;dx=40;direction=north;notch=0;',
        70, 100, '', 'Arrow Up', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'up').join(' ')),
      this.createVertexTemplateEntry(s + 'arrow;dy=0.6;dx=40;direction=south;notch=0;',
        70, 100, '', 'Arrow Down', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'down').join(' ')),
      this.createVertexTemplateEntry(s + 'arrow;dy=0;dx=30;notch=30;',
        100, 60, '', 'Chevron Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'chevron').join(' ')),
      this.createVertexTemplateEntry(s + 'arrow;dy=0.6;dx=40;notch=15;',
        100, 70, '', 'Notched Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'notched').join(' ')),
      this.createVertexTemplateEntry(s + 'arrow;dy=0;dx=10;notch=10;',
        100, 30, '', 'Notched Signal-In Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'notched signal in').join(' ')),
      this.createVertexTemplateEntry(s + 'arrow;dy=0;dx=10;notch=0;',
        100, 30, '', 'Signal-In Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'signal in').join(' ')),
      this.createVertexTemplateEntry(s + 'arrow;dy=0.67;dx=20;notch=0;',
        100, 60, '', 'Slender Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'slender').join(' ')),
      this.createVertexTemplateEntry(s + 'twoWayArrow;dy=0.6;dx=35;',
        100, 60, '', 'Two Way Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'two way').join(' ')),
      this.createVertexTemplateEntry(s + 'twoWayArrow;dy=0.65;dx=22;',
        100, 60, '', 'Slender Two Way Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'slender two way').join(' ')),
      this.createVertexTemplateEntry(s + 'stylisedArrow;dy=0.6;dx=40;notch=15;feather=0.4;',
        100, 60, '', 'Stylised Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'stylised notch notched').join(' ')),
      this.createVertexTemplateEntry(s + 'sharpArrow;dy1=0.67;dx1=18;dx2=18;notch=0;',
        100, 60, '', 'Sharp Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'sharp').join(' ')),
      this.createVertexTemplateEntry(s + 'sharpArrow2;dy1=0.67;dx1=18;dx2=18;dy3=0.15;dx3=27;notch=0;',
        100, 60, '', 'Sharp Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'sharp').join(' ')),
      this.createVertexTemplateEntry(s + 'calloutArrow;dy=10;dx=20;notch=60;arrowHead=10;',
        100, 60, '', 'Callout with Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'callout').join(' ')),
      this.createVertexTemplateEntry(s + 'bendArrow;dy=15;dx=38;notch=0;arrowHead=55;rounded=0;',
        100, 100, '', 'Bend Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'bend').join(' ')),
      this.createVertexTemplateEntry(s + 'bendArrow;dy=15;dx=38;notch=0;arrowHead=55;rounded=1;',
        100, 100, '', 'Bend Arrow (rounded)', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'bend rounded').join(' ')),
      this.createVertexTemplateEntry(s + 'bendDoubleArrow;dy=15;dx=38;arrowHead=55;rounded=0;',
        100, 100, '', 'Bend Double Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'bend double two way').join(' ')),
      this.createVertexTemplateEntry(s + 'bendDoubleArrow;dy=15;dx=38;arrowHead=55;rounded=1;',
        100, 100, '', 'Bend Double Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'bend double two way').join(' ')),
      this.createVertexTemplateEntry(s + 'calloutDoubleArrow;dy=10;dx=20;notch=24;arrowHead=10;',
        100, 50, '', 'Callout with Double Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'callout double two way').join(' ')),
      this.createVertexTemplateEntry(s + 'calloutQuadArrow;dy=10;dx=20;notch=24;arrowHead=10;',
        100, 100, '', 'Callout with Quad Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'callout quad four war').join(' ')),
      this.createVertexTemplateEntry(s + 'calloutDouble90Arrow;dy1=10;dx1=20;dx2=70;dy2=70;arrowHead=10;',
        100, 100, '', 'Callout with Double Arrow 90' + String.fromCharCode(176), null, null, this.getTagsForStencil(gn, 'arrow', dt + 'callout double two way orthogonal').join(' ')),
      this.createVertexTemplateEntry(s + 'quadArrow;dy=10;dx=20;notch=24;arrowHead=10;',
        100, 100, '', 'Quad Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'four way quad').join(' ')),
      this.createVertexTemplateEntry(s + 'triadArrow;dy=10;dx=20;arrowHead=40;',
        100, 70, '', 'Triad Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'three way triad').join(' ')),
      this.createVertexTemplateEntry(s + 'tailedArrow;dy1=10;dx1=20;notch=0;arrowHead=20;dx2=25;dy2=30;',
        100, 60, '', 'Tailed Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'tailed').join(' ')),
      this.createVertexTemplateEntry(s + 'tailedNotchedArrow;dy1=10;dx1=20;notch=20;arrowHead=20;dx2=25;dy2=30;',
        100, 60, '', 'Tailed Arrow with Notch', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'tailed notch notched').join(' ')),
      this.createVertexTemplateEntry(s + 'stripedArrow;dy=0.6;dx=40;notch=25;',
        100, 70, '', 'Striped Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'striped').join(' ')),
      this.createVertexTemplateEntry(s + 'jumpInArrow;dy=15;dx=38;arrowHead=55;',
        100, 100, '', 'Jump-In Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'jump in').join(' ')),
      this.createVertexTemplateEntry(s + 'uTurnArrow;dy=11;arrowHead=43;dx2=25;',
        100, 100, '', 'U Turn Arrow', null, null, this.getTagsForStencil(gn, 'arrow', dt + 'u turn uturn').join(' ')),
      this.createEdgeTemplateEntry('shape=mxgraph.arrows2.wedgeArrow;html=1;bendable=0;startWidth=50;fillColor=strokeColor;defaultFillColor=invert;defaultGradientColor=invert;', 100, 100, '', 'Wedge Arrow', null, this.getTagsForStencil(gn, 'wedge arrow', dt).join(' ')),
      this.createEdgeTemplateEntry('shape=mxgraph.arrows2.wedgeArrowDashed2;html=1;bendable=0;startWidth=50;stepSize=15;', 100, 100, '', 'Wedge Arrow Dashed', null, this.getTagsForStencil(gn, 'wedge arrow dashed', dt).join(' '))
    ];
    this.addPalette('arrows2', mxResources.get('arrows'), null == expand || expand, mxUtils.bind(this, function (content) {
      for (var i = 0; i < fns.length; i++) {
        content.appendChild(fns[i](content));
      }
    }));
  };

  Sidebar.prototype.addInfographicPalette = function (expand) {
    var sb = this;
    var w = 100;
    var h = 100;
    var s = 'whiteSpace=wrap;html=1;shape=mxgraph.infographic.';
    var s2 = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=bottom;' + mxConstants.STYLE_VERTICAL_ALIGN + '=top;html=1;shape=mxgraph.infographic.';
    var s3 = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=bottom;' + mxConstants.STYLE_VERTICAL_ALIGN + '=top;html=1;shape=';
    var s4 = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=bottom;' + mxConstants.STYLE_VERTICAL_ALIGN + '=top;html=1;shape=mxgraph.basic.';
    var gn = 'mxgraph.infographic';
    var dt = '';
    this.addPaletteFunctions('infographic', '信息图表', null == expand || expand, [
      this.createVertexTemplateEntry(s4 + 'pie;fillColor=#10739E;strokeColor=none;startAngle=0.2;endAngle=0.9;', w, h, '', 'Pie', null, null, this.getTagsForStencil(gn, 'pie', dt).join(' ')),
      this.createVertexTemplateEntry(s4 + 'arc;strokeColor=#10739E;strokeWidth=6;startAngle=0.3;endAngle=0.1;', w, h, '', 'Arc', null, null, this.getTagsForStencil(gn, 'arc', dt).join(' ')),
      this.createVertexTemplateEntry(s4 + 'partConcEllipse;fillColor=#10739E;strokeColor=none;startAngle=0.25;endAngle=0.1;arcWidth=0.5;', w, h, '', 'Partial Concentric Ellipse', null, null, this.getTagsForStencil(gn, 'partConcEllipse', dt).join(' ')),
      this.createVertexTemplateEntry(s2 + 'parallelogram;dx=15;fillColor=#10739E;strokeColor=none;', w, h * 0.7, '', 'Trapezoid', null, null, this.getTagsForStencil(gn, 'partConcEllipse', dt).join(' ')),
      this.createVertexTemplateEntry(
        'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=20;notch2=20;fillColor=#10739E;strokeColor=none;align=center;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;',
        w * 2, h * 0.4, 'Label', 'Ribbon', null, null, this.getTagsForStencil(gn, 'ribbonRolled', dt).join(' ')),
      this.createVertexTemplateEntry(
        'html=1;shape=mxgraph.infographic.ribbonRolled;dx=185;dy=15;fillColor=#10739E;strokeColor=none;align=center;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;',
        w * 2, h * 0.7, 'Label', 'Ribbon (rolled)', null, null, this.getTagsForStencil(gn, 'ribbonRolled', dt).join(' ')),
      this.createVertexTemplateEntry(
        'html=1;shape=mxgraph.infographic.ribbonDoubleFolded;dx=25;dy=15;fillColor=#10739E;strokeColor=none;align=center;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;',
        w * 2, h * 0.7, 'Label', 'Ribbon (double folded)', null, null, this.getTagsForStencil(gn, 'ribbonDoubleFolded', dt).join(' ')),
      this.createVertexTemplateEntry(
        'html=1;shape=mxgraph.infographic.ribbonFrontFolded;dx=25;dy=15;notch=15;fillColor=#10739E;strokeColor=none;align=center;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingTop=10;',
        w * 2, h * 0.55, 'Label', 'Ribbon (front folded)', null, null, this.getTagsForStencil(gn, 'ribbonFrontFolded', dt).join(' ')),
      this.createVertexTemplateEntry(
        'html=1;shape=mxgraph.infographic.ribbonBackFolded;dx=25;dy=15;notch=15;fillColor=#10739E;strokeColor=none;align=center;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingTop=10;',
        w * 2, h * 0.55, 'Label', 'Ribbon (back folded)', null, null, this.getTagsForStencil(gn, 'ribbonBackFolded', dt).join(' ')),
      this.createVertexTemplateEntry(
        'html=1;shape=mxgraph.infographic.banner;dx=32;dy=17;notch=15;fillColor=#10739E;strokeColor=none;align=center;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingBottom=15;',
        w * 2.6, h * 0.7, 'Label', 'Banner', null, null, this.getTagsForStencil(gn, 'banner', dt).join(' ')),
      this.createVertexTemplateEntry(
        'html=1;shape=mxgraph.infographic.bannerSingleFold;dx=32;dx2=20;dy=17;notch=15;fillColor=#10739E;strokeColor=none;align=left;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingBottom=15;spacingLeft=25;',
        w * 2.6, h * 0.7, 'Label', 'Banner (single fold)', null, null, this.getTagsForStencil(gn, 'bannerSingleFold', dt).join(' ')),
      this.createVertexTemplateEntry(
        'html=1;shape=mxgraph.infographic.bannerHalfFold;dx=40;dx2=20;notch=15;fillColor=#10739E;strokeColor=none;align=left;verticalAlign=top;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingLeft=25;spacingTop=5;',
        w * 2, h * 2, 'Label', 'Banner (half fold)', null, null, this.getTagsForStencil(gn, 'bannerHalfFold', dt).join(' ')),
      this.createVertexTemplateEntry(
        'html=1;shape=mxgraph.infographic.barCallout;dx=100;dy=30;fillColor=#10739E;strokeColor=none;align=center;verticalAlign=top;fontColor=#ffffff;fontSize=14;fontStyle=1;shadow=0;spacingTop=5;',
        w * 2, h * 0.7, 'Label', 'Bar with callout', null, null, this.getTagsForStencil(gn, 'ribbonRolled', dt).join(' ')),
      this.createVertexTemplateEntry(
        'html=1;shape=mxgraph.infographic.flag;dx=30;dy=20;fillColor=#10739E;strokeColor=none;align=center;verticalAlign=top;fontColor=#ffffff;fontSize=14;fontStyle=1;shadow=0;spacingTop=5;',
        w * 2, h * 0.7, 'Label', 'Flag', null, null, this.getTagsForStencil(gn, 'flag', dt).join(' ')),
      this.createVertexTemplateEntry(s2 + 'shadedTriangle;fillColor=#10739E;strokeColor=none;', w * 0.8, h, '', 'Triangle', null, null, this.getTagsForStencil(gn, 'shadedTriangle', dt).join(' ')),
      this.createVertexTemplateEntry(s2 + 'shadedPyramid;fillColor=#10739E;strokeColor=none;', w * 0.6, h, '', 'Pyramid', null, null, this.getTagsForStencil(gn, 'shadedTriangle', dt).join(' ')),
      this.createVertexTemplateEntry(s2 + 'pyramidStep;fillColor=#10739E;strokeColor=none;', w * 0.6, h, '', 'Pyramid step', null, null, this.getTagsForStencil(gn, 'pyramidStep', dt).join(' ')),
      this.createVertexTemplateEntry(s2 + 'cylinder;fillColor=#10739E;strokeColor=none;', w * 0.6, h, '', 'Cylinder', null, null, this.getTagsForStencil(gn, 'cylinder', dt).join(' ')),
      this.createVertexTemplateEntry(s2 + 'shadedCube;isoAngle=15;fillColor=#10739E;strokeColor=none;', w, h, '', 'Cube', null, null, this.getTagsForStencil(gn, 'shaded cube', dt).join(' ')),
      this.createVertexTemplateEntry(
        'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.partConcEllipse;fillColor=#10739E;strokeColor=none;startAngle=0;endAngle=0.75;arcWidth=0.4;fontSize=20;fontColor=#10739E;align=center;fontStyle=1;',
        w, h, '75%', 'Partial Concentric Ellipse', null, null, this.getTagsForStencil(gn, 'partConcEllipse', dt).join(' ')),
      this.createVertexTemplateEntry(
        'verticalLabelPosition=middle;verticalAlign=bottom;html=1;shape=mxgraph.infographic.circularDial;dy=15;fillColor=#10739E;strokeColor=none;labelPosition=center;align=center;fontStyle=1;fontSize=15;spacingBottom=5;whiteSpace=wrap;',
        w * 0.8, h * 1.1, 'Label', 'Circular Dial', null, null, this.getTagsForStencil(gn, 'circularDial', dt).join(' ')),
      this.addEntry(dt + 'chevron list', function () {
        var button1 = new mxCell('LABEL', new mxGeometry(0, 0, 200, 30), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#10739E;strokeColor=none;fontSize=17;fontStyle=1;align=center;');
        button1.vertex = true;
        var button2 = new mxCell('&nbsp;- Lorem ipsum dolor sit amet<br>' +
          '&nbsp;- consectetur adipisicing elit<br>' +
          '&nbsp;- sed do eiusmod tempor<br>' +
          '&nbsp;- incididunt ut labore et dolore<br>' +
          '&nbsp;- magna aliqua.',
          new mxGeometry(0, 40, 190, 120), 'shape=rect;fillColor=#B1DDF0;strokeColor=none;fontSize=12;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacing=5;');
        button2.vertex = true;
        return sb.createVertexTemplateFromCells([button1, button2], 200, 160, 'Chevron list');
      }),
      this.addEntry(dt + 'roadmap vertical', function () {
        var chevron1 = new mxCell('', new mxGeometry(0, 0, 70, 80), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;direction=south;fillColor=#10739E;strokeColor=none;rounded=0;');
        chevron1.vertex = true;

        var label1 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#10739E"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(100, 0, 200, 70), 'rounded=1;strokeColor=none;fillColor=#DDDDDD;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label1.vertex = true;

        return sb.createVertexTemplateFromCells([chevron1, label1], 300, 70, 'Roadmap (vertical)');
      }),

      this.addEntry(dt + 'numbered entry', function () {
        var rect1 = new mxCell('Label', new mxGeometry(30, 10, 170, 40), 'shape=rect;rounded=1;whiteSpace=wrap;html=1;shadow=0;strokeColor=none;fillColor=#B1DDF0;arcSize=30;fontSize=14;spacingLeft=42;fontStyle=1;fontColor=#FFFFFF;align=left;');
        rect1.vertex = true;
        var ellipse1 = new mxCell('1', new mxGeometry(0, 0, 60, 60), 'shape=ellipse;perimeter=ellipsePerimeter;fontSize=22;fontStyle=1;shadow=0;strokeColor=#ffffff;fillColor=#10739E;strokeWidth=4;fontColor=#ffffff;align=center;whiteSpace=wrap;html=1;');
        ellipse1.vertex = true;

        return sb.createVertexTemplateFromCells([rect1, ellipse1], 200, 60, 'Numbered Entry');
      }),

      this.createVertexTemplateEntry(mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=middle;' + mxConstants.STYLE_VERTICAL_ALIGN + '=top;html=1;shape=mxgraph.infographic.numberedEntryVert;dy=25;fillColor=#10739E;strokeColor=none;fontSize=17;fontColor=#FFFFFF;align=center;labelPosition=center;spacingTop=32;fontStyle=1;whiteSpace=wrap;', w * 0.8, h * 1.6, 'Label', 'Numbered Entry (vertical)', null, null, this.getTagsForStencil(gn, 'numberedEntryVert', dt).join(' ')),
      this.createVertexTemplateEntry('verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.bendingArch;startAngle=0.75;endAngle=0.25;arcWidth=0.25;fillColor=#10739E;strokeColor=none;fontSize=19;fontColor=#FFFFFF;labelPosition=center;align=center;fontStyle=1;whiteSpace=wrap;', w, h, '50%', 'Bending Arch', null, null, this.getTagsForStencil(gn, 'bendingArch', dt).join(' ')),
      this.createVertexTemplateEntry(
        'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.circularCallout;dy=15;fillColor=#10739E;strokeColor=none;labelPosition=center;align=center;fontColor=#10739E;fontStyle=1;fontSize=24;whiteSpace=wrap;',
        w, h, '50%', 'Circular Callout', null, null, this.getTagsForStencil(gn, 'circularCallout', dt).join(' ')),
      this.createVertexTemplateEntry(
        'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.circularCallout2;dy=15;strokeColor=#10739E;labelPosition=center;align=center;fontColor=#10739E;fontStyle=1;fontSize=24;',
        w * 0.6, h * 1.4, '', 'Circular Callout', null, null, this.getTagsForStencil(gn, 'circularCallout2', dt).join(' ')),

      this.addEntry(dt + 'circular dial', function () {
        var part1 = new mxCell('', new mxGeometry(0, 0, 100, 100), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.basic.donut;dx=10;strokeColor=none;fillColor=#10739E;fontSize=10;align=center;fillOpacity=20;');
        part1.vertex = true;
        var part2 = new mxCell('65%', new mxGeometry(0, 0, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.basic.partConcEllipse;startAngle=0;endAngle=0.65;arcWidth=0.2;strokeColor=none;fillColor=#10739E;fontSize=22;fontColor=#10739E;align=center;fontStyle=1;whiteSpace=wrap;');
        part2.vertex = true;
        part1.insert(part2);
        return sb.createVertexTemplateFromCells([part1], part1.geometry.width, part1.geometry.height, 'Circular Dial');
      }),

      this.addEntry(dt + 'angled entry', function () {
        var part1 = new mxCell('1', new mxGeometry(0, 0, 50, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;fillColor=#10739E;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;whiteSpace=wrap;');
        part1.vertex = true;
        var part2 = new mxCell('Label', new mxGeometry(45, 0, 95, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;;html=1;fillColor=#B1DDF0;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;whiteSpace=wrap;');
        part2.vertex = true;
        return sb.createVertexTemplateFromCells([part1, part2], 140, 30, 'Angled Entry');
      }),

      this.addEntry(dt + 'chevron list', function () {

        var str1 = '&nbsp;- Lorem ipsum dolor sit amet<br>' +
          '&nbsp;- consectetur adipisicing elit<br>' +
          '&nbsp;- sed do eiusmod tempor<br>' +
          '&nbsp;- incididunt ut labore et dolore<br>' +
          '&nbsp;- magna aliqua.';

        var chrevron1 = new mxCell('LABEL', new mxGeometry(0, 0, 200, 30), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#10739E;strokeColor=none;fontSize=17;fontColor=#FFFFFF;fontStyle=1;align=center;rounded=0;');
        chrevron1.vertex = true;
        var process1 = new mxCell(str1, new mxGeometry(0, 40, 190, 120),
          'shape=rect;fillColor=#B1DDF0;strokeColor=none;fontSize=12;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacing=5;rounded=0;');
        process1.vertex = true;
        var process2 = new mxCell(str1,
          new mxGeometry(0, 170, 190, 120), 'shape=rect;fillColor=#B1DDF0;strokeColor=none;fontSize=12;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacing=5;rounded=0;');
        process2.vertex = true;
        var process3 = new mxCell(str1,
          new mxGeometry(0, 300, 190, 120), 'shape=rect;fillColor=#B1DDF0;strokeColor=none;fontSize=12;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacing=5;rounded=0;');
        process3.vertex = true;
        var chrevron2 = new mxCell('LABEL', new mxGeometry(200, 0, 200, 30), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#F2931E;strokeColor=none;fontSize=17;fontColor=#FFFFFF;fontStyle=1;align=center;rounded=0;');
        chrevron2.vertex = true;
        var process4 = new mxCell(str1,
          new mxGeometry(200, 40, 190, 120), 'shape=rect;fillColor=#FCE7CD;strokeColor=none;fontSize=12;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacing=5;rounded=0;');
        process4.vertex = true;
        var process5 = new mxCell(str1,
          new mxGeometry(200, 170, 190, 120), 'shape=rect;fillColor=#FCE7CD;strokeColor=none;fontSize=12;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacing=5;rounded=0;');
        process5.vertex = true;
        var process6 = new mxCell(str1,
          new mxGeometry(200, 300, 190, 120), 'shape=rect;fillColor=#FCE7CD;strokeColor=none;fontSize=12;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacing=5;rounded=0;');
        process6.vertex = true;
        var chrevron3 = new mxCell('LABEL', new mxGeometry(400, 0, 200, 30), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#AE4132;strokeColor=none;fontSize=17;fontColor=#FFFFFF;fontStyle=1;align=center;rounded=0;');
        chrevron3.vertex = true;
        var process7 = new mxCell(str1,
          new mxGeometry(400, 40, 190, 120), 'shape=rect;fillColor=#FAD9D5;strokeColor=none;fontSize=12;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacing=5;rounded=0;');
        process7.vertex = true;
        var process8 = new mxCell(str1,
          new mxGeometry(400, 170, 190, 120), 'shape=rect;fillColor=#FAD9D5;strokeColor=none;fontSize=12;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacing=5;rounded=0;');
        process8.vertex = true;
        var process9 = new mxCell(str1,
          new mxGeometry(400, 300, 190, 120), 'shape=rect;fillColor=#FAD9D5;strokeColor=none;fontSize=12;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacing=5;rounded=0;');
        process9.vertex = true;
        var chrevron4 = new mxCell('LABEL', new mxGeometry(600, 0, 200, 30), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#23445D;strokeColor=none;fontSize=17;fontColor=#FFFFFF;fontStyle=1;align=center;rounded=0;');
        chrevron4.vertex = true;
        var process10 = new mxCell(str1,
          new mxGeometry(600, 40, 190, 120), 'shape=rect;fillColor=#BAC8D3;strokeColor=none;fontSize=12;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacing=5;rounded=0;');
        process10.vertex = true;
        var process11 = new mxCell(str1,
          new mxGeometry(600, 170, 190, 120), 'shape=rect;fillColor=#BAC8D3;strokeColor=none;fontSize=12;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacing=5;rounded=0;');
        process11.vertex = true;
        var process12 = new mxCell(str1,
          new mxGeometry(600, 300, 190, 120), 'shape=rect;fillColor=#BAC8D3;strokeColor=none;fontSize=12;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacing=5;rounded=0;');
        process12.vertex = true;
        var chrevron5 = new mxCell('LABEL', new mxGeometry(800, 0, 200, 30), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#12AAB5;strokeColor=none;fontSize=17;fontColor=#FFFFFF;fontStyle=1;align=center;rounded=0;');
        chrevron5.vertex = true;
        var process13 = new mxCell(str1,
          new mxGeometry(800, 40, 190, 120), 'shape=rect;fillColor=#B0E3E6;strokeColor=none;fontSize=12;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacing=5;rounded=0;');
        process13.vertex = true;
        var process14 = new mxCell(str1,
          new mxGeometry(800, 170, 190, 120), 'shape=rect;fillColor=#B0E3E6;strokeColor=none;fontSize=12;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacing=5;rounded=0;');
        process14.vertex = true;
        var process15 = new mxCell(str1,
          new mxGeometry(800, 300, 190, 120), 'shape=rect;fillColor=#B0E3E6;strokeColor=none;fontSize=12;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacing=5;rounded=0;');
        process15.vertex = true;

        return sb.createVertexTemplateFromCells([chrevron1, chrevron2, chrevron3, chrevron4, chrevron5, process1, process2, process3, process4, process5, process6, process7, process8, process9, process10, process11, process12, process13, process14, process15], 1000, 420, 'Chevron list');
      }),

      this.addEntry(dt + 'roadmap vertical', function () {
        var chevron1 = new mxCell('', new mxGeometry(0, 0, 70, 80), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;direction=south;fillColor=#10739E;strokeColor=none;rounded=0;');
        chevron1.vertex = true;

        var label1 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#10739E"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(100, 0, 200, 70), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label1.vertex = true;

        var chevron2 = new mxCell('', new mxGeometry(0, 80, 70, 80), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;direction=south;fillColor=#F2931E;strokeColor=none;rounded=0;');
        chevron2.vertex = true;

        var label2 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#F2931E"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(100, 80, 200, 70), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label2.vertex = true;

        var chevron3 = new mxCell('', new mxGeometry(0, 160, 70, 80), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;direction=south;fillColor=#AE4132;strokeColor=none;rounded=0;');
        chevron3.vertex = true;

        var label3 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#AE4132"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(100, 160, 200, 70), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label3.vertex = true;

        var chevron4 = new mxCell('', new mxGeometry(0, 240, 70, 80), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;direction=south;fillColor=#23445D;strokeColor=none;rounded=0;');
        chevron4.vertex = true;

        var label4 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#23445D"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(100, 240, 200, 70), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label4.vertex = true;

        var chevron5 = new mxCell('', new mxGeometry(0, 320, 70, 80), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;direction=south;fillColor=#12AAB5;strokeColor=none;rounded=0;');
        chevron5.vertex = true;

        var label5 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#12AAB5"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(100, 320, 200, 70), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label5.vertex = true;

        return sb.createVertexTemplateFromCells([chevron1, chevron2, chevron3, chevron4, chevron5, label1, label2, label3, label4, label5], 300, 400, 'Roadmap (vertical)');
      }),

      this.addEntry(dt + 'numbered list', function () {
        var rect1 = new mxCell('Label', new mxGeometry(30, 10, 220, 40), 'shape=rect;rounded=1;whiteSpace=wrap;html=1;shadow=0;strokeColor=none;fillColor=#64BBE2;arcSize=30;fontSize=14;spacingLeft=42;fontStyle=1;fontColor=#FFFFFF;align=left;');
        rect1.vertex = true;
        var ellipse1 = new mxCell('1', new mxGeometry(0, 0, 60, 60), 'shape=ellipse;perimeter=ellipsePerimeter;fontSize=22;fontStyle=1;shadow=0;strokeColor=#ffffff;fillColor=#10739E;strokeWidth=4;fontColor=#ffffff;align=center;whiteSpace=wrap;html=1;');
        ellipse1.vertex = true;

        var rect2 = new mxCell('Label', new mxGeometry(30, 75, 220, 40), 'shape=rect;rounded=1;whiteSpace=wrap;html=1;shadow=0;strokeColor=none;fillColor=#F8C382;arcSize=30;fontSize=14;spacingLeft=42;fontStyle=1;fontColor=#FFFFFF;align=left;');
        rect2.vertex = true;
        var ellipse2 = new mxCell('2', new mxGeometry(0, 65, 60, 60), 'shape=ellipse;perimeter=ellipsePerimeter;fontSize=22;fontStyle=1;shadow=0;strokeColor=#ffffff;fillColor=#F2931E;strokeWidth=4;fontColor=#ffffff;align=center;whiteSpace=wrap;html=1;');
        ellipse2.vertex = true;

        var rect3 = new mxCell('Label', new mxGeometry(30, 140, 220, 40), 'shape=rect;rounded=1;whiteSpace=wrap;html=1;shadow=0;strokeColor=none;fillColor=#F08E81;arcSize=30;fontSize=14;spacingLeft=42;fontStyle=1;fontColor=#FFFFFF;align=left;');
        rect3.vertex = true;
        var ellipse3 = new mxCell('3', new mxGeometry(0, 130, 60, 60), 'shape=ellipse;perimeter=ellipsePerimeter;fontSize=22;fontStyle=1;shadow=0;strokeColor=#ffffff;fillColor=#AE4132;strokeWidth=4;fontColor=#ffffff;align=center;whiteSpace=wrap;html=1;');
        ellipse3.vertex = true;

        var rect4 = new mxCell('Label', new mxGeometry(30, 205, 220, 40), 'shape=rect;rounded=1;whiteSpace=wrap;html=1;shadow=0;strokeColor=none;fillColor=#5D7F99;arcSize=30;fontSize=14;spacingLeft=42;fontStyle=1;fontColor=#FFFFFF;align=left;');
        rect4.vertex = true;
        var ellipse4 = new mxCell('4', new mxGeometry(0, 195, 60, 60), 'shape=ellipse;perimeter=ellipsePerimeter;fontSize=22;fontStyle=1;shadow=0;strokeColor=#ffffff;fillColor=#23445D;strokeWidth=4;fontColor=#ffffff;align=center;whiteSpace=wrap;html=1;');
        ellipse4.vertex = true;

        var rect5 = new mxCell('Label', new mxGeometry(30, 270, 220, 40), 'shape=rect;rounded=1;whiteSpace=wrap;html=1;shadow=0;strokeColor=none;fillColor=#61C6CE;arcSize=30;fontSize=14;spacingLeft=42;fontStyle=1;fontColor=#FFFFFF;align=left;');
        rect5.vertex = true;
        var ellipse5 = new mxCell('5', new mxGeometry(0, 260, 60, 60), 'shape=ellipse;perimeter=ellipsePerimeter;fontSize=22;fontStyle=1;shadow=0;strokeColor=#ffffff;fillColor=#12AAB5;strokeWidth=4;fontColor=#ffffff;align=center;whiteSpace=wrap;html=1;');
        ellipse5.vertex = true;

        return sb.createVertexTemplateFromCells([rect1, ellipse1, rect2, ellipse2, rect3, ellipse3, rect4, ellipse4, rect5, ellipse5], 200, 320, 'Numbered List');
      }),

      this.addEntry(dt + 'list', function () {

        var st1 = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=middle;' + mxConstants.STYLE_VERTICAL_ALIGN + '=top;html=1;shape=mxgraph.infographic.numberedEntryVert;dy=25;strokeColor=none;fontSize=17;fontColor=#FFFFFF;align=center;labelPosition=center;spacingTop=32;fontStyle=1;whiteSpace=wrap;fillColor=#'

        var item1 = new mxCell('Label', new mxGeometry(0, 0, 80, 160), st1 + '10739E;');
        item1.vertex = true;
        var item2 = new mxCell('Label', new mxGeometry(85, 0, 80, 160), st1 + 'F2931E;');
        item2.vertex = true;
        var item3 = new mxCell('Label', new mxGeometry(170, 0, 80, 160), st1 + 'AE4132;');
        item3.vertex = true;
        var item4 = new mxCell('Label', new mxGeometry(255, 0, 80, 160), st1 + '23445D;');
        item4.vertex = true;
        var item5 = new mxCell('Label', new mxGeometry(340, 0, 80, 160), st1 + '12AAB5;');
        item5.vertex = true;

        return sb.createVertexTemplateFromCells([item1, item2, item3, item4, item5], 420, 160, 'List');
      }),

      this.addEntry(dt + 'rodmap horizontal', function () {
        var arch1 = new mxCell('', new mxGeometry(0, 90, 120, 120), s4 + 'partConcEllipse;startAngle=0.25;endAngle=0.75;arcWidth=0.25;fillColor=#10739E;strokeColor=none;');
        arch1.vertex = true;
        var arch2 = new mxCell('', new mxGeometry(105, 90, 120, 120), s4 + 'partConcEllipse;startAngle=0.75;endAngle=0.25;arcWidth=0.25;fillColor=#F2931E;strokeColor=none;');
        arch2.vertex = true;
        var arch3 = new mxCell('', new mxGeometry(210, 90, 120, 120), s4 + 'partConcEllipse;startAngle=0.25;endAngle=0.75;arcWidth=0.25;fillColor=#AE4132;strokeColor=none;');
        arch3.vertex = true;
        var arch4 = new mxCell('', new mxGeometry(315, 90, 120, 120), s4 + 'partConcEllipse;startAngle=0.75;endAngle=0.25;arcWidth=0.25;fillColor=#23445D;strokeColor=none;');
        arch4.vertex = true;
        var arch5 = new mxCell('', new mxGeometry(420, 90, 120, 120), s4 + 'partConcEllipse;startAngle=0.25;endAngle=0.75;arcWidth=0.25;fillColor=#15AA96;strokeColor=none;');
        arch5.vertex = true;

        var circle1 = new mxCell('1', new mxGeometry(35, 125, 50, 50), 'shape=ellipse;strokeWidth=6;strokeColor=#10739E;fontSize=15;html=1;whiteSpace=wrap;fontStyle=1;fontColor=#10739E;');
        circle1.vertex = true;
        var circle2 = new mxCell('2', new mxGeometry(140, 125, 50, 50), 'shape=ellipse;strokeWidth=6;strokeColor=#F2931E;fontSize=15;html=1;whiteSpace=wrap;fontStyle=1;fontColor=#F2931E;');
        circle2.vertex = true;
        var circle3 = new mxCell('3', new mxGeometry(245, 125, 50, 50), 'shape=ellipse;strokeWidth=6;strokeColor=#AE4132;fontSize=15;html=1;whiteSpace=wrap;fontStyle=1;fontColor=#AE4132;');
        circle3.vertex = true;
        var circle4 = new mxCell('4', new mxGeometry(350, 125, 50, 50), 'shape=ellipse;strokeWidth=6;strokeColor=#23445D;fontSize=15;html=1;whiteSpace=wrap;fontStyle=1;fontColor=#23445D;');
        circle4.vertex = true;
        var circle5 = new mxCell('5', new mxGeometry(455, 125, 50, 50), 'shape=ellipse;strokeWidth=6;strokeColor=#12AAB5;fontSize=15;html=1;whiteSpace=wrap;fontStyle=1;fontColor=#12AAB5;');
        circle5.vertex = true;

        var label1 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#10739E"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(0, 220, 120, 80), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label1.vertex = true;
        var label2 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#F2931E"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(105, 0, 120, 80), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label2.vertex = true;
        var label3 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#AE4132"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(210, 220, 120, 80), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label3.vertex = true;
        var label4 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#23445D"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(315, 0, 120, 80), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label4.vertex = true;
        var label5 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#12AAB5"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(420, 220, 120, 80), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label5.vertex = true;

        return sb.createVertexTemplateFromCells([arch1, arch2, arch3, arch4, arch5, circle1, circle2, circle3, circle4, circle5, label1, label2, label3, label4, label5], 540, 300, 'Roadmap (horizontal)');
      }),

      this.addEntry(dt + 'roadmap diagonal', function () {
        var arch1 = new mxCell('', new mxGeometry(190, 0, 120, 120), s4 + 'partConcEllipse;startAngle=0.75;endAngle=0.5;arcWidth=0.25;fillColor=#10739E;strokeColor=none;shadow=0;');
        arch1.vertex = true;
        var arch2 = new mxCell('', new mxGeometry(190, 105, 120, 120), s4 + 'partConcEllipse;startAngle=0.25;endAngle=0;arcWidth=0.25;fillColor=#F2931E;strokeColor=none;shadow=0;');
        arch2.vertex = true;
        var arch3 = new mxCell('', new mxGeometry(295, 105, 120, 120), s4 + 'partConcEllipse;startAngle=0.75;endAngle=0.5;arcWidth=0.25;fillColor=#AE4132;strokeColor=none;shadow=0;');
        arch3.vertex = true;
        var arch4 = new mxCell('', new mxGeometry(295, 210, 120, 120), s4 + 'partConcEllipse;startAngle=0.25;endAngle=0;arcWidth=0.25;fillColor=#23445D;strokeColor=none;shadow=0;');
        arch4.vertex = true;
        var arch5 = new mxCell('', new mxGeometry(400, 210, 120, 120), s4 + 'partConcEllipse;startAngle=0.75;endAngle=0.5;arcWidth=0.25;fillColor=#12AAB5;strokeColor=none;shadow=0;');
        arch5.vertex = true;

        var circle1 = new mxCell('1', new mxGeometry(225, 35, 50, 50), 'shape=ellipse;strokeWidth=6;strokeColor=#10739E;fontSize=15;html=1;whiteSpace=wrap;fontStyle=1;fontColor=#10739E;shadow=1;');
        circle1.vertex = true;
        var circle2 = new mxCell('2', new mxGeometry(225, 140, 50, 50), 'shape=ellipse;strokeWidth=6;strokeColor=#F2931E;fontSize=15;html=1;whiteSpace=wrap;fontStyle=1;fontColor=#F2931E;shadow=1;');
        circle2.vertex = true;
        var circle3 = new mxCell('3', new mxGeometry(330, 140, 50, 50), 'shape=ellipse;strokeWidth=6;strokeColor=#AE4132;fontSize=15;html=1;whiteSpace=wrap;fontStyle=1;fontColor=#AE4132;shadow=1;');
        circle3.vertex = true;
        var circle4 = new mxCell('4', new mxGeometry(330, 245, 50, 50), 'shape=ellipse;strokeWidth=6;strokeColor=#23445D;fontSize=15;html=1;whiteSpace=wrap;fontStyle=1;fontColor=#23445D;shadow=1;');
        circle4.vertex = true;
        var circle5 = new mxCell('5', new mxGeometry(435, 245, 50, 50), 'shape=ellipse;strokeWidth=6;strokeColor=#12AAB5;fontSize=15;html=1;whiteSpace=wrap;fontStyle=1;fontColor=#12AAB5;shadow=1;');
        circle5.vertex = true;

        var label1 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#10739E"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(320, 20, 180, 70), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;spacing=3;shadow=0;');
        label1.vertex = true;
        var label2 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#F2931E"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(0, 130, 180, 70), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;spacing=3;shadow=0;');
        label2.vertex = true;
        var label3 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#AE4132"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(425, 130, 180, 70), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;spacing=3;shadow=0;');
        label3.vertex = true;
        var label4 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#23445D"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(105, 235, 180, 70), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;spacing=3;shadow=0;');
        label4.vertex = true;
        var label5 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#12AAB5"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(530, 235, 180, 70), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;spacing=3;shadow=0;');
        label5.vertex = true;

        return sb.createVertexTemplateFromCells([arch1, arch2, arch3, arch4, arch5, circle1, circle2, circle3, circle4, circle5, label1, label2, label3, label4, label5], 710, 330, 'Roadmap (diagonal)');
      }),

      this.addEntry(dt + 'arrow list', function () {
        var part1 = new mxCell('1', new mxGeometry(0, 0, 40, 40), 'html=1;whiteSpace=wrap;fillColor=#10739E;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;rounded=0;');
        part1.vertex = true;
        var part2 = new mxCell('Label', new mxGeometry(45, 0, 95, 40), 'shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=10;notch=0;html=1;whiteSpace=wrap;fillColor=#64BBE2;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;');
        part2.vertex = true;
        var part3 = new mxCell('2', new mxGeometry(0, 45, 40, 40), 'html=1;whiteSpace=wrap;fillColor=#F2931E;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;rounded=0;');
        part3.vertex = true;
        var part4 = new mxCell('Label', new mxGeometry(45, 45, 115, 40), 'shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=10;notch=0;html=1;whiteSpace=wrap;fillColor=#F8C382;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;');
        part4.vertex = true;
        var part5 = new mxCell('3', new mxGeometry(0, 90, 40, 40), 'html=1;whiteSpace=wrap;fillColor=#AE4132;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;rounded=0;');
        part5.vertex = true;
        var part6 = new mxCell('Label', new mxGeometry(45, 90, 135, 40), 'shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=10;notch=0;html=1;whiteSpace=wrap;fillColor=#F08E81;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;');
        part6.vertex = true;
        var part7 = new mxCell('4', new mxGeometry(0, 135, 40, 40), 'html=1;whiteSpace=wrap;fillColor=#23445D;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;rounded=0;');
        part7.vertex = true;
        var part8 = new mxCell('Label', new mxGeometry(45, 135, 155, 40), 'shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=10;notch=0;html=1;whiteSpace=wrap;fillColor=#5D7F99;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;');
        part8.vertex = true;
        var part9 = new mxCell('5', new mxGeometry(0, 180, 40, 40), 'html=1;whiteSpace=wrap;fillColor=#12AAB5;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;rounded=0;');
        part9.vertex = true;
        var part10 = new mxCell('Label', new mxGeometry(45, 180, 175, 40), 'shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=10;notch=0;html=1;whiteSpace=wrap;fillColor=#61C6CE;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;');
        part10.vertex = true;
        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, part6, part7, part8, part9, part10], 220, 220, 'Arrow List');
      }),

      this.addEntry(dt + 'angled list', function () {
        var part1 = new mxCell('1', new mxGeometry(0, 0, 50, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#10739E;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;');
        part1.vertex = true;
        var part2 = new mxCell('Label', new mxGeometry(45, 0, 95, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#64BBE2;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;');
        part2.vertex = true;
        var part3 = new mxCell('2', new mxGeometry(0, 35, 50, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#F2931E;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;');
        part3.vertex = true;
        var part4 = new mxCell('Label', new mxGeometry(45, 35, 115, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#F8C382;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;');
        part4.vertex = true;
        var part5 = new mxCell('3', new mxGeometry(0, 70, 50, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#AE4132;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;');
        part5.vertex = true;
        var part6 = new mxCell('Label', new mxGeometry(45, 70, 135, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#F08E81;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;');
        part6.vertex = true;
        var part7 = new mxCell('4', new mxGeometry(0, 105, 50, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#23445D;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;');
        part7.vertex = true;
        var part8 = new mxCell('Label', new mxGeometry(45, 105, 155, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#5D7F99;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;');
        part8.vertex = true;
        var part9 = new mxCell('5', new mxGeometry(0, 140, 50, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#12AAB5;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;');
        part9.vertex = true;
        var part10 = new mxCell('Label', new mxGeometry(45, 140, 175, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#61C6CE;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;');
        part10.vertex = true;
        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, part6, part7, part8, part9, part10], 220, 170, 'Angled List');
      }),

      this.addEntry(dt + 'angled list', function () {
        var part1 = new mxCell('1', new mxGeometry(200, 0, 50, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#10739E;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;');
        part1.vertex = true;
        var part2 = new mxCell('Label', new mxGeometry(245, 0, 145, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#64BBE2;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;');
        part2.vertex = true;
        var part3 = new mxCell('2', new mxGeometry(150, 35, 50, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#F2931E;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;');
        part3.vertex = true;
        var part4 = new mxCell('Label', new mxGeometry(195, 35, 145, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#F8C382;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;');
        part4.vertex = true;
        var part5 = new mxCell('3', new mxGeometry(100, 70, 50, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#AE4132;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;');
        part5.vertex = true;
        var part6 = new mxCell('Label', new mxGeometry(145, 70, 145, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#F08E81;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;');
        part6.vertex = true;
        var part7 = new mxCell('4', new mxGeometry(50, 105, 50, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#23445D;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;');
        part7.vertex = true;
        var part8 = new mxCell('Label', new mxGeometry(95, 105, 145, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#5D7F99;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;');
        part8.vertex = true;
        var part9 = new mxCell('5', new mxGeometry(0, 140, 50, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#12AAB5;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;');
        part9.vertex = true;
        var part10 = new mxCell('Label', new mxGeometry(45, 140, 145, 30), 'shape=mxgraph.infographic.parallelogram;dx=5;html=1;whiteSpace=wrap;fillColor=#61C6CE;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;');
        part10.vertex = true;
        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, part6, part7, part8, part9, part10], 390, 170, 'Angled List');
      }),

      this.addEntry(dt + 'matrix', function () {
        var part1 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(35, 35, 100, 100), 'html=1;fillColor=#10739E;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part1.vertex = true;
        var part2 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(140, 35, 100, 100), 'html=1;fillColor=#F2931E;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part2.vertex = true;
        var part3 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(35, 140, 100, 100), 'html=1;fillColor=#AE4132;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part3.vertex = true;
        var part4 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(140, 140, 100, 100), 'html=1;fillColor=#23445D;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part4.vertex = true;

        var part5 = new mxCell('Label', new mxGeometry(0, 35, 30, 100), 'html=1;fillColor=#CCCCCC;strokeColor=none;shadow=0;fontSize=14;fontColor=#FFFFFF;align=center;fontStyle=1;whiteSpace=wrap;horizontal=0;rounded=0;');
        part5.vertex = true;
        var part6 = new mxCell('Label', new mxGeometry(0, 140, 30, 100), 'html=1;fillColor=#CCCCCC;strokeColor=none;shadow=0;fontSize=14;fontColor=#FFFFFF;align=center;fontStyle=1;whiteSpace=wrap;horizontal=0;rounded=0;');
        part6.vertex = true;
        var part7 = new mxCell('Label', new mxGeometry(35, 0, 100, 30), 'html=1;fillColor=#CCCCCC;strokeColor=none;shadow=0;fontSize=14;fontColor=#FFFFFF;align=center;fontStyle=1;whiteSpace=wrap;rounded=0;');
        part7.vertex = true;
        var part8 = new mxCell('Label', new mxGeometry(140, 0, 100, 30), 'html=1;fillColor=#CCCCCC;strokeColor=none;shadow=0;fontSize=14;fontColor=#FFFFFF;align=center;fontStyle=1;whiteSpace=wrap;rounded=0;');
        part8.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, part6, part7, part8], 240, 240, 'Matrix (2x2)');
      }),

      this.addEntry(dt + 'matrix', function () {
        var part1 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(35, 35, 100, 100), 'shape=mxgraph.basic.three_corner_round_rect;dx=18;flipH=1;html=1;fillColor=#10739E;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part1.vertex = true;
        var part2 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(140, 35, 100, 100), 'shape=mxgraph.basic.three_corner_round_rect;dx=18;html=1;fillColor=#F2931E;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part2.vertex = true;
        var part3 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(35, 140, 100, 100), 'shape=mxgraph.basic.three_corner_round_rect;dx=18;flipH=1;flipV=1;html=1;fillColor=#AE4132;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part3.vertex = true;
        var part4 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(140, 140, 100, 100), 'shape=mxgraph.basic.three_corner_round_rect;dx=18;flipV=1;html=1;fillColor=#23445D;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part4.vertex = true;

        var part5 = new mxCell('Label', new mxGeometry(0, 45, 30, 80), 'rounded=1;arcSize=50;html=1;fillColor=#CCCCCC;strokeColor=none;shadow=0;fontSize=14;fontColor=#FFFFFF;align=center;fontStyle=1;whiteSpace=wrap;horizontal=0;');
        part5.vertex = true;
        var part6 = new mxCell('Label', new mxGeometry(0, 150, 30, 80), 'rounded=1;arcSize=50;html=1;fillColor=#CCCCCC;strokeColor=none;shadow=0;fontSize=14;fontColor=#FFFFFF;align=center;fontStyle=1;whiteSpace=wrap;horizontal=0;');
        part6.vertex = true;
        var part7 = new mxCell('Label', new mxGeometry(45, 0, 80, 30), 'rounded=1;arcSize=50;html=1;fillColor=#CCCCCC;strokeColor=none;shadow=0;fontSize=14;fontColor=#FFFFFF;align=center;fontStyle=1;whiteSpace=wrap;');
        part7.vertex = true;
        var part8 = new mxCell('Label', new mxGeometry(150, 0, 80, 30), 'rounded=1;arcSize=50;html=1;fillColor=#CCCCCC;strokeColor=none;shadow=0;fontSize=14;fontColor=#FFFFFF;align=center;fontStyle=1;whiteSpace=wrap;');
        part8.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, part6, part7, part8], 240, 240, 'Matrix (2x2)');
      }),

      this.addEntry(dt + 'matrix', function () {
        var part11 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(35, 35, 100, 100), 'html=1;fillColor=#F2931E;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part11.vertex = true;
        var part12 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(140, 35, 100, 100), 'html=1;fillColor=#F5AB50;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part12.vertex = true;
        var part13 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(245, 35, 100, 100), 'html=1;fillColor=#F8C382;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part13.vertex = true;
        var part21 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(35, 140, 100, 100), 'html=1;fillColor=#444444;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part21.vertex = true;
        var part22 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(140, 140, 100, 100), 'html=1;fillColor=#777777;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part22.vertex = true;
        var part23 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(245, 140, 100, 100), 'html=1;fillColor=#909090;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part23.vertex = true;
        var part31 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(35, 245, 100, 100), 'html=1;fillColor=#23445D;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part31.vertex = true;
        var part32 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(140, 245, 100, 100), 'html=1;fillColor=#2F5B7C;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part32.vertex = true;
        var part33 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(245, 245, 100, 100), 'html=1;fillColor=#5D7F99;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;rounded=0;');
        part33.vertex = true;

        var label1 = new mxCell('Label', new mxGeometry(0, 35, 30, 100), 'html=1;fillColor=#CCCCCC;strokeColor=none;shadow=0;fontSize=14;fontColor=#FFFFFF;align=center;fontStyle=1;whiteSpace=wrap;horizontal=0;rounded=0;');
        label1.vertex = true;
        var label2 = new mxCell('Label', new mxGeometry(0, 140, 30, 100), 'html=1;fillColor=#CCCCCC;strokeColor=none;shadow=0;fontSize=14;fontColor=#FFFFFF;align=center;fontStyle=1;whiteSpace=wrap;horizontal=0;rounded=0;');
        label2.vertex = true;
        var label3 = new mxCell('Label', new mxGeometry(0, 245, 30, 100), 'html=1;fillColor=#CCCCCC;strokeColor=none;shadow=0;fontSize=14;fontColor=#FFFFFF;align=center;fontStyle=1;whiteSpace=wrap;horizontal=0;rounded=0;');
        label3.vertex = true;
        var label4 = new mxCell('Label', new mxGeometry(35, 0, 100, 30), 'html=1;fillColor=#CCCCCC;strokeColor=none;shadow=0;fontSize=14;fontColor=#FFFFFF;align=center;fontStyle=1;whiteSpace=wrap;rounded=0;');
        label4.vertex = true;
        var label5 = new mxCell('Label', new mxGeometry(140, 0, 100, 30), 'html=1;fillColor=#CCCCCC;strokeColor=none;shadow=0;fontSize=14;fontColor=#FFFFFF;align=center;fontStyle=1;whiteSpace=wrap;rounded=0;');
        label5.vertex = true;
        var label6 = new mxCell('Label', new mxGeometry(245, 0, 100, 30), 'html=1;fillColor=#CCCCCC;strokeColor=none;shadow=0;fontSize=14;fontColor=#FFFFFF;align=center;fontStyle=1;whiteSpace=wrap;rounded=0;');
        label6.vertex = true;

        return sb.createVertexTemplateFromCells([part11, part12, part13, part21, part22, part23, part31, part32, part33, label1, label2, label3, label4, label5, label6], 345, 345, 'Matrix (3x3)');
      }),

      this.addEntry(dt + 'hex loop', function () {
        var part1 = new mxCell('Lorem ipsum<br> dolor sit amet, consectetur adipisicing elit', new mxGeometry(0, 51, 112, 102), 'shape=hexagon;strokeWidth=4;html=1;fillColor=#F5AB50;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;rounded=0;');
        part1.vertex = true;
        var part2 = new mxCell('Lorem ipsum<br> dolor sit amet, consectetur adipisicing elit', new mxGeometry(0, 153, 112, 102), 'shape=hexagon;strokeWidth=4;html=1;fillColor=#E85642;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;rounded=0;');
        part2.vertex = true;
        var part3 = new mxCell('Lorem ipsum<br> dolor sit amet, consectetur adipisicing elit', new mxGeometry(84, 102, 112, 102), 'shape=hexagon;strokeWidth=4;html=1;fillColor=#12AAB5;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;rounded=0;');
        part3.vertex = true;
        var part4 = new mxCell('Lorem ipsum<br> dolor sit amet, consectetur adipisicing elit', new mxGeometry(84, 0, 112, 102), 'shape=hexagon;strokeWidth=4;html=1;fillColor=#1699D3;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;rounded=0;');
        part4.vertex = true;
        var part5 = new mxCell('Lorem ipsum<br> dolor sit amet, consectetur adipisicing elit', new mxGeometry(168, 51, 112, 102), 'shape=hexagon;strokeWidth=4;html=1;fillColor=#736CA8;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;rounded=0;');
        part5.vertex = true;
        var part6 = new mxCell('Lorem ipsum<br> dolor sit amet, consectetur adipisicing elit', new mxGeometry(168, 153, 112, 102), 'shape=hexagon;strokeWidth=4;html=1;fillColor=#2F5B7C;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;rounded=0;');
        part6.vertex = true;
        var part7 = new mxCell('Lorem ipsum<br> dolor sit amet, consectetur adipisicing elit', new mxGeometry(84, 204, 112, 102), 'shape=hexagon;strokeWidth=4;html=1;fillColor=#777777;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;rounded=0;');
        part7.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, part6, part7], 284, 312, 'Hex Loop');
      }),

      this.addEntry(dt + 'target', function () {
        var part1 = new mxCell('', new mxGeometry(0, 0, 350, 350), 'ellipse;html=1;strokeWidth=4;fillColor=#F2931E;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part1.vertex = true;
        var part2 = new mxCell('', new mxGeometry(25, 25, 300, 300), 'ellipse;html=1;strokeWidth=4;fillColor=#F8C382;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part2.vertex = true;
        var part3 = new mxCell('', new mxGeometry(50, 50, 250, 250), 'ellipse;html=1;strokeWidth=4;fillColor=#FCE7CD;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part3.vertex = true;
        var part4 = new mxCell('', new mxGeometry(75, 75, 200, 200), 'ellipse;html=1;strokeWidth=4;fillColor=#BAC8D3;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part4.vertex = true;
        var part5 = new mxCell('', new mxGeometry(100, 100, 150, 150), 'ellipse;html=1;strokeWidth=4;fillColor=#5D7F99;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part5.vertex = true;
        var part6 = new mxCell('', new mxGeometry(125, 125, 100, 100), 'ellipse;html=1;strokeWidth=4;fillColor=#2F5B7C;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part6.vertex = true;
        var part7 = new mxCell('', new mxGeometry(150, 150, 50, 50), 'ellipse;html=1;strokeWidth=4;fillColor=#23445D;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part7.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, part6, part7], 350, 350, 'Target');
      }),

      this.addEntry(dt + 'target simple', function () {
        var part1 = new mxCell('', new mxGeometry(0, 0, 350, 350), 'ellipse;html=1;strokeWidth=4;fillColor=#10739E;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part1.vertex = true;
        var part2 = new mxCell('', new mxGeometry(50, 50, 250, 250), 'ellipse;html=1;strokeWidth=4;fillColor=#F2931E;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part2.vertex = true;
        var part3 = new mxCell('', new mxGeometry(100, 100, 150, 150), 'ellipse;html=1;strokeWidth=4;fillColor=#AE4132;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part3.vertex = true;
        var part4 = new mxCell('', new mxGeometry(150, 150, 50, 50), 'ellipse;html=1;strokeWidth=4;fillColor=#23445D;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part4.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4], 350, 350, 'Target (simple)');
      }),

      this.addEntry(dt + 'onion', function () {
        var part1 = new mxCell('', new mxGeometry(0, 0, 350, 350), 'ellipse;html=1;strokeWidth=4;fillColor=#F5AB50;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part1.vertex = true;
        var part2 = new mxCell('', new mxGeometry(25, 50, 300, 300), 'ellipse;html=1;strokeWidth=4;fillColor=#F8C382;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part2.vertex = true;
        var part3 = new mxCell('', new mxGeometry(50, 100, 250, 250), 'ellipse;html=1;strokeWidth=4;fillColor=#FCE7CD;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part3.vertex = true;
        var part4 = new mxCell('', new mxGeometry(75, 150, 200, 200), 'ellipse;html=1;strokeWidth=4;fillColor=#BAC8D3;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part4.vertex = true;
        var part5 = new mxCell('', new mxGeometry(100, 200, 150, 150), 'ellipse;html=1;strokeWidth=4;fillColor=#5D7F99;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part5.vertex = true;
        var part6 = new mxCell('', new mxGeometry(125, 250, 100, 100), 'ellipse;html=1;strokeWidth=4;fillColor=#2F5B7C;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part6.vertex = true;
        var part7 = new mxCell('', new mxGeometry(150, 300, 50, 50), 'ellipse;html=1;strokeWidth=4;fillColor=#23445D;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part7.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, part6, part7], 350, 350, 'Onion');
      }),

      this.addEntry(dt + 'onion simple', function () {
        var part1 = new mxCell('', new mxGeometry(0, 0, 350, 350), 'ellipse;html=1;strokeWidth=4;fillColor=#10739E;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part1.vertex = true;
        var part2 = new mxCell('', new mxGeometry(50, 100, 250, 250), 'ellipse;html=1;strokeWidth=4;fillColor=#F2931E;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part2.vertex = true;
        var part3 = new mxCell('', new mxGeometry(100, 200, 150, 150), 'ellipse;html=1;strokeWidth=4;fillColor=#AE4132;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part3.vertex = true;
        var part4 = new mxCell('', new mxGeometry(150, 300, 50, 50), 'ellipse;html=1;strokeWidth=4;fillColor=#23445D;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part4.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4], 350, 350, 'Onion (simple)');
      }),

      this.addEntry(dt + 'triangle', function () {
        var part1 = new mxCell('', new mxGeometry(0, 0, 350, 350), 'triangle;direction=north;html=1;strokeWidth=4;fillColor=#F2931E;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part1.vertex = true;
        var part2 = new mxCell('', new mxGeometry(25, 0, 300, 300), 'triangle;direction=north;html=1;strokeWidth=4;fillColor=#F8C382;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part2.vertex = true;
        var part3 = new mxCell('', new mxGeometry(50, 0, 250, 250), 'triangle;direction=north;html=1;strokeWidth=4;fillColor=#FCE7CD;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part3.vertex = true;
        var part4 = new mxCell('', new mxGeometry(75, 0, 200, 200), 'triangle;direction=north;html=1;strokeWidth=4;fillColor=#BAC8D3;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part4.vertex = true;
        var part5 = new mxCell('', new mxGeometry(100, 0, 150, 150), 'triangle;direction=north;html=1;strokeWidth=4;fillColor=#5D7F99;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part5.vertex = true;
        var part6 = new mxCell('', new mxGeometry(125, 0, 100, 100), 'triangle;direction=north;html=1;strokeWidth=4;fillColor=#2F5B7C;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part6.vertex = true;
        var part7 = new mxCell('', new mxGeometry(150, 0, 50, 50), 'triangle;direction=north;html=1;strokeWidth=4;fillColor=#23445D;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part7.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, part6, part7], 350, 350, 'Triangle');
      }),

      this.addEntry(dt + 'triangle simple', function () {
        var part1 = new mxCell('', new mxGeometry(0, 0, 350, 350), 'triangle;direction=north;strokeWidth=4;html=1;fillColor=#10739E;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part1.vertex = true;
        var part2 = new mxCell('', new mxGeometry(50, 0, 250, 250), 'triangle;direction=north;strokeWidth=4;html=1;fillColor=#F2931E;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part2.vertex = true;
        var part3 = new mxCell('', new mxGeometry(100, 0, 150, 150), 'triangle;direction=north;strokeWidth=4;html=1;fillColor=#AE4132;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part3.vertex = true;
        var part4 = new mxCell('', new mxGeometry(150, 0, 50, 50), 'triangle;direction=north;strokeWidth=4;html=1;fillColor=#23445D;strokeColor=#ffffff;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part4.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4], 350, 350, 'Triangle (simple)');
      }),

      this.addEntry(dt + 'percent percentage list', function () {
        var chevron1 = new mxCell('30%', new mxGeometry(0, 0, 60, 40), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#4A5768;strokeColor=none;fontSize=16;fontColor=#ffffff;fontStyle=1;rounded=0;');
        chevron1.vertex = true;
        var bg1 = new mxCell('', new mxGeometry(70, 10, 300, 20), 'whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#B1DDF0;strokeColor=none;');
        bg1.vertex = true;
        var bar1 = new mxCell('', new mxGeometry(70, 10, 90, 20), 'whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#10739E;strokeColor=none;shadow=0;');
        bar1.vertex = true;

        var chevron2 = new mxCell('75%', new mxGeometry(0, 50, 60, 40), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#4A5768;strokeColor=none;fontSize=16;fontColor=#ffffff;fontStyle=1;rounded=0;');
        chevron2.vertex = true;
        var bg2 = new mxCell('', new mxGeometry(70, 60, 300, 20), 'whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#FCE7CD;strokeColor=none;');
        bg2.vertex = true;
        var bar2 = new mxCell('', new mxGeometry(70, 60, 225, 20), 'whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#F2931E;strokeColor=none;shadow=0;');
        bar2.vertex = true;

        var chevron3 = new mxCell('90%', new mxGeometry(0, 100, 60, 40), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#4A5768;strokeColor=none;fontSize=16;fontColor=#ffffff;fontStyle=1;rounded=0;');
        chevron3.vertex = true;
        var bg3 = new mxCell('', new mxGeometry(70, 110, 300, 20), 'whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#FAD9D5;strokeColor=none;');
        bg3.vertex = true;
        var bar3 = new mxCell('', new mxGeometry(70, 110, 270, 20), 'whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#AE4132;strokeColor=none;shadow=0;');
        bar3.vertex = true;

        var chevron4 = new mxCell('25%', new mxGeometry(0, 150, 60, 40), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#4A5768;strokeColor=none;fontSize=16;fontColor=#ffffff;fontStyle=1;rounded=0;');
        chevron4.vertex = true;
        var bg4 = new mxCell('', new mxGeometry(70, 160, 300, 20), 'whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#BAC8D3;strokeColor=none;');
        bg4.vertex = true;
        var bar4 = new mxCell('', new mxGeometry(70, 160, 75, 20), 'whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#23445D;strokeColor=none;shadow=0;');
        bar4.vertex = true;

        return sb.createVertexTemplateFromCells([chevron1, bg1, bar1, chevron2, bg2, bar2, chevron3, bg3, bar3, chevron4, bg4, bar4], 370, 190, 'Percentage list');
      }),

      this.addEntry(dt + 'percent percentage list', function () {
        var bg1 = new mxCell('', new mxGeometry(0, 0, 400, 40), 'whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#dddddd;strokeColor=none;rounded=0;');
        bg1.vertex = true;
        var bar1 = new mxCell('65%', new mxGeometry(0, 0, 260, 40), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=20;fillColor=#10739E;strokeColor=none;align=left;verticalAlign=middle;fontColor=#ffffff;fontSize=18;spacingLeft=10;fontStyle=1;shadow=0;');
        bar1.vertex = true;
        var label1 = new mxCell('Label', new mxGeometry(320, 0, 80, 40), 'text;html=1;strokeColor=none;fillColor=none;align=right;verticalAlign=middle;whiteSpace=wrap;rounded=0;shadow=0;fontSize=18;spacingRight=10;');
        label1.vertex = true;

        var bg2 = new mxCell('', new mxGeometry(0, 50, 400, 40), 'whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#dddddd;strokeColor=none;rounded=0;');
        bg2.vertex = true;
        var bar2 = new mxCell('45%', new mxGeometry(0, 50, 180, 40), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=20;fillColor=#F2931E;strokeColor=none;align=left;verticalAlign=middle;fontColor=#ffffff;fontSize=18;spacingLeft=10;fontStyle=1;shadow=0;');
        bar2.vertex = true;
        var label2 = new mxCell('Label', new mxGeometry(320, 50, 80, 40), 'text;html=1;strokeColor=none;fillColor=none;align=right;verticalAlign=middle;whiteSpace=wrap;rounded=0;shadow=0;fontSize=18;spacingRight=10;');
        label2.vertex = true;

        var bg3 = new mxCell('', new mxGeometry(0, 100, 400, 40), 'whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#dddddd;strokeColor=none;rounded=0;');
        bg3.vertex = true;
        var bar3 = new mxCell('30%', new mxGeometry(0, 100, 120, 40), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=20;fillColor=#AE4132;strokeColor=none;align=left;verticalAlign=middle;fontColor=#ffffff;fontSize=18;spacingLeft=10;fontStyle=1;shadow=0;');
        bar3.vertex = true;
        var label3 = new mxCell('Label', new mxGeometry(320, 100, 80, 40), 'text;html=1;strokeColor=none;fillColor=none;align=right;verticalAlign=middle;whiteSpace=wrap;rounded=0;shadow=0;fontSize=18;spacingRight=10;');
        label3.vertex = true;

        var bg4 = new mxCell('', new mxGeometry(0, 150, 400, 40), 'whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#dddddd;strokeColor=none;rounded=0;');
        bg4.vertex = true;
        var bar4 = new mxCell('60%', new mxGeometry(0, 150, 240, 40), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=20;fillColor=#23445D;strokeColor=none;align=left;verticalAlign=middle;fontColor=#ffffff;fontSize=18;spacingLeft=10;fontStyle=1;shadow=0;');
        bar4.vertex = true;
        var label4 = new mxCell('Label', new mxGeometry(320, 150, 80, 40), 'text;html=1;strokeColor=none;fillColor=none;align=right;verticalAlign=middle;whiteSpace=wrap;rounded=0;shadow=0;fontSize=18;spacingRight=10;');
        label4.vertex = true;

        var bg5 = new mxCell('', new mxGeometry(0, 200, 400, 40), 'whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#dddddd;strokeColor=none;rounded=0;');
        bg5.vertex = true;
        var bar5 = new mxCell('85%', new mxGeometry(0, 200, 340, 40), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=20;fillColor=#12AAB5;strokeColor=none;align=left;verticalAlign=middle;fontColor=#ffffff;fontSize=18;spacingLeft=10;fontStyle=1;shadow=0;');
        bar5.vertex = true;
        var label5 = new mxCell('Label', new mxGeometry(320, 200, 80, 40), 'text;html=1;strokeColor=none;fillColor=none;align=right;verticalAlign=middle;whiteSpace=wrap;rounded=0;shadow=0;fontSize=18;spacingRight=10;');
        label5.vertex = true;

        return sb.createVertexTemplateFromCells([bg1, bar1, bg2, bar2, bg3, bar3, bg4, bar4, bg5, bar5, label1, label2, label3, label4, label5], 400, 250, 'Percentage list');
      }),

      this.addEntry(dt + 'arc list', function () {
        var arc1 = new mxCell('', new mxGeometry(0, 0, 260, 260), s4 + 'partConcEllipse;fillColor=#10739E;strokeColor=#ffffff;startAngle=0.75;endAngle=0.08;arcWidth=0.16;strokeWidth=3;');
        arc1.vertex = true;
        var arc2 = new mxCell('', new mxGeometry(20, 20, 220, 220), s4 + 'partConcEllipse;fillColor=#F2931E;strokeColor=#ffffff;startAngle=0.91;endAngle=0.17;arcWidth=0.18;strokeWidth=3;');
        arc2.vertex = true;
        var arc3 = new mxCell('', new mxGeometry(40, 40, 180, 180), s4 + 'partConcEllipse;fillColor=#AE4132;strokeColor=#ffffff;startAngle=0.75;endAngle=0.11;arcWidth=0.22;strokeWidth=3;');
        arc3.vertex = true;
        var arc4 = new mxCell('', new mxGeometry(60, 60, 140, 140), s4 + 'partConcEllipse;fillColor=#12AAB5;strokeColor=#ffffff;startAngle=0.02;endAngle=0.25;arcWidth=0.29;strokeWidth=3;');
        arc4.vertex = true;
        var arc5 = new mxCell('', new mxGeometry(80, 80, 100, 100), s4 + 'partConcEllipse;fillColor=#CCCCCC;strokeColor=#ffffff;startAngle=0.75;endAngle=0.25;arcWidth=0.4;strokeWidth=3;');
        arc5.vertex = true;
        var part1 = new mxCell('2018', new mxGeometry(100, 100, 60, 60), 'html=1;shape=mxgraph.basic.pie;fillColor=#23445D;strokeColor=#ffffff;startAngle=0.75;endAngle=0.25;fontSize=16;fontColor=#FFFFFF;verticalAlign=top;fontStyle=1;strokeWidth=3;');
        part1.vertex = true;

        return sb.createVertexTemplateFromCells([arc1, arc2, arc3, arc4, arc5, part1], 200, 200, 'Arc list');
      }),

      this.addEntry(dt + 'arc list', function () {
        var circle1 = new mxCell('', new mxGeometry(0, 0, 250, 250), 'ellipse;fillColor=none;strokeColor=#444444;');
        circle1.vertex = true;
        var circle2 = new mxCell('', new mxGeometry(20, 20, 210, 210), 'ellipse;fillColor=none;strokeColor=#444444;');
        circle2.vertex = true;
        var circle3 = new mxCell('', new mxGeometry(40, 40, 170, 170), 'ellipse;fillColor=none;strokeColor=#444444;');
        circle3.vertex = true;
        var circle4 = new mxCell('', new mxGeometry(60, 60, 130, 130), 'ellipse;fillColor=none;strokeColor=#444444;');
        circle4.vertex = true;
        var circle5 = new mxCell('', new mxGeometry(80, 80, 90, 90), 'ellipse;fillColor=none;strokeColor=#444444;');
        circle5.vertex = true;

        var arc1 = new mxCell('', new mxGeometry(0, 0, 250, 250), s4 + 'arc;fillColor=none;strokeColor=#10739E;startAngle=0.75;endAngle=0.08;strokeWidth=16;');
        arc1.vertex = true;
        var arc2 = new mxCell('', new mxGeometry(20, 20, 210, 210), s4 + 'arc;fillColor=none;strokeColor=#F2931E;startAngle=0.91;endAngle=0.17;strokeWidth=16;');
        arc2.vertex = true;
        var arc3 = new mxCell('', new mxGeometry(40, 40, 170, 170), s4 + 'arc;fillColor=none;strokeColor=#AE4132;startAngle=0.75;endAngle=0.11;strokeWidth=16;');
        arc3.vertex = true;
        var arc4 = new mxCell('', new mxGeometry(60, 60, 130, 130), s4 + 'arc;fillColor=none;strokeColor=#12AAB5;startAngle=0.02;endAngle=0.25;strokeWidth=16;');
        arc4.vertex = true;
        var arc5 = new mxCell('', new mxGeometry(80, 80, 90, 90), s4 + 'arc;fillColor=none;strokeColor=#CCCCCC;startAngle=0.75;endAngle=0.25;strokeWidth=16;');
        arc5.vertex = true;
        var part1 = new mxCell('2018', new mxGeometry(92, 92, 66, 66), 'html=1;shape=mxgraph.basic.pie;fillColor=#23445D;strokeColor=none;startAngle=0.75;endAngle=0.25;fontSize=16;fontColor=#FFFFFF;verticalAlign=top;spacingTop=8;fontStyle=1;');
        part1.vertex = true;

        return sb.createVertexTemplateFromCells([circle1, circle2, circle3, circle4, circle5, arc1, arc2, arc3, arc4, arc5, part1], 200, 200, 'Arc list');
      }),

      this.addEntry(dt + 'triangle graph', function () {
        var part1 = new mxCell('Label', new mxGeometry(0, 70, 80, 70), 'verticalLabelPosition=middle;verticalAlign=bottom;html=1;whiteSpace=wrap;shape=mxgraph.infographic.shadedTriangle;fillColor=#10739E;strokeColor=none;fontSize=10;labelPosition=center;align=center;fontColor=#FFFFFF;fontStyle=1;shadow=0;');
        part1.vertex = true;
        var part2 = new mxCell('Label', new mxGeometry(60, 10, 80, 130), 'verticalLabelPosition=middle;verticalAlign=bottom;html=1;whiteSpace=wrap;shape=mxgraph.infographic.shadedTriangle;fillColor=#F2931E;strokeColor=none;fontSize=10;labelPosition=center;align=center;fontColor=#FFFFFF;fontStyle=1;shadow=0;');
        part2.vertex = true;
        var part3 = new mxCell('Label', new mxGeometry(120, 0, 80, 140), 'verticalLabelPosition=middle;verticalAlign=bottom;html=1;whiteSpace=wrap;shape=mxgraph.infographic.shadedTriangle;fillColor=#AE4132;strokeColor=none;fontSize=10;labelPosition=center;align=center;fontColor=#FFFFFF;fontStyle=1;shadow=0;');
        part3.vertex = true;
        var part4 = new mxCell('Label', new mxGeometry(180, 40, 80, 100), 'verticalLabelPosition=middle;verticalAlign=bottom;html=1;whiteSpace=wrap;shape=mxgraph.infographic.shadedTriangle;fillColor=#12AAB5;strokeColor=none;fontSize=10;labelPosition=center;align=center;fontColor=#FFFFFF;fontStyle=1;shadow=0;');
        part4.vertex = true;
        var part5 = new mxCell('Label', new mxGeometry(240, 60, 80, 80), 'verticalLabelPosition=middle;verticalAlign=bottom;html=1;whiteSpace=wrap;shape=mxgraph.infographic.shadedTriangle;fillColor=#23445D;strokeColor=none;fontSize=10;labelPosition=center;align=center;fontColor=#FFFFFF;fontStyle=1;shadow=0;');
        part5.vertex = true;

        return sb.createVertexTemplateFromCells([part5, part4, part3, part2, part1], 320, 140, 'Triangle Graph');
      }),

      this.addEntry(dt + 'pyramid graph', function () {
        var part1 = new mxCell('Label', new mxGeometry(0, 70, 80, 70), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.infographic.shadedPyramid;fillColor=#10739E;strokeColor=none;fontSize=10;labelPosition=center;align=center;shadow=0;');
        part1.vertex = true;
        var part2 = new mxCell('Label', new mxGeometry(60, 10, 80, 130), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.infographic.shadedPyramid;fillColor=#F2931E;strokeColor=none;fontSize=10;labelPosition=center;align=center;shadow=0;');
        part2.vertex = true;
        var part3 = new mxCell('Label', new mxGeometry(120, 0, 80, 140), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.infographic.shadedPyramid;fillColor=#AE4132;strokeColor=none;fontSize=10;labelPosition=center;align=center;shadow=0;');
        part3.vertex = true;
        var part4 = new mxCell('Label', new mxGeometry(180, 40, 80, 100), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.infographic.shadedPyramid;fillColor=#12AAB5;strokeColor=none;fontSize=10;labelPosition=center;align=center;shadow=0;');
        part4.vertex = true;
        var part5 = new mxCell('Label', new mxGeometry(240, 60, 80, 80), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.infographic.shadedPyramid;fillColor=#23445D;strokeColor=none;fontSize=10;labelPosition=center;align=center;shadow=0;');
        part5.vertex = true;

        return sb.createVertexTemplateFromCells([part5, part4, part3, part2, part1], 320, 140, 'Pyramid Graph');
      }),

      this.addEntry(dt + 'change graph', function () {
        var part1 = new mxCell('', new mxGeometry(0, 30, 30, 100), 'fillColor=#10739E;strokeColor=none;');
        part1.vertex = true;
        var arrow1 = new mxCell('', new mxGeometry(3, 30, 24, 70), 'shape=mxgraph.arrows2.arrow;dy=0.4;dx=16;notch=0;direction=north;fillColor=#1699D3;strokeColor=none;');
        arrow1.vertex = true;
        part1.insert(arrow1);
        var text1 = new mxCell('Label', new mxGeometry(0, 0, 30, 20), 'text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;fontColor=#FFFFFF;fontSize=10;strokeColor=none;fillColor=none;');
        text1.vertex = true;
        part1.insert(text1);

        var part2 = new mxCell('', new mxGeometry(35, 10, 30, 120), 'fillColor=#F2931E;strokeColor=none;');
        part2.vertex = true;
        var arrow2 = new mxCell('', new mxGeometry(3, 0, 24, 80), 'shape=mxgraph.arrows2.arrow;dy=0.4;dx=16;notch=0;direction=south;fillColor=#F5AB50;strokeColor=none;');
        arrow2.vertex = true;
        part2.insert(arrow2);
        var text2 = new mxCell('Label', new mxGeometry(0, 0, 30, 20), 'text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;fontColor=#FFFFFF;fontSize=10;strokeColor=none;fillColor=none;');
        text2.vertex = true;
        part2.insert(text2);

        var part3 = new mxCell('', new mxGeometry(70, 0, 30, 130), 'fillColor=#AE4132;strokeColor=none;');
        part3.vertex = true;
        var arrow3 = new mxCell('', new mxGeometry(3, 80, 24, 50), 'shape=mxgraph.arrows2.arrow;dy=0.4;dx=16;notch=0;direction=north;fillColor=#E85642;strokeColor=none;');
        arrow3.vertex = true;
        part3.insert(arrow3);
        var text3 = new mxCell('Label', new mxGeometry(0, 0, 30, 20), 'text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;fontColor=#FFFFFF;fontSize=10;strokeColor=none;fillColor=none;');
        text3.vertex = true;
        part3.insert(text3);

        var part4 = new mxCell('', new mxGeometry(105, 50, 30, 80), 'fillColor=#12AAB5;strokeColor=none;');
        part4.vertex = true;
        var arrow4 = new mxCell('', new mxGeometry(3, 0, 24, 30), 'shape=mxgraph.arrows2.arrow;dy=0.4;dx=16;notch=0;direction=south;fillColor=#64BBE2;strokeColor=none;');
        arrow4.vertex = true;
        part4.insert(arrow4);
        var text4 = new mxCell('Label', new mxGeometry(0, 0, 30, 20), 'text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;fontColor=#FFFFFF;fontSize=10;strokeColor=none;fillColor=none;');
        text4.vertex = true;
        part4.insert(text4);

        var part5 = new mxCell('', new mxGeometry(140, 60, 30, 70), 'fillColor=#23445D;strokeColor=none;');
        part5.vertex = true;
        var arrow5 = new mxCell('', new mxGeometry(3, 10, 24, 60), 'shape=mxgraph.arrows2.arrow;dy=0.4;dx=16;notch=0;direction=north;fillColor=#2F5B7C;strokeColor=none;');
        arrow5.vertex = true;
        part5.insert(arrow5);
        var text5 = new mxCell('Label', new mxGeometry(0, 0, 30, 20), 'text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;fontColor=#FFFFFF;fontSize=10;strokeColor=none;fillColor=none;');
        text5.vertex = true;
        part5.insert(text5);

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5], 170, 130, 'Change Graph');
      }),

      this.addEntry(dt + 'step pyramid', function () {
        var part1 = new mxCell('', new mxGeometry(70, 0, 20, 95), 'html=1;shape=mxgraph.infographic.pyramidStep;fillColor=#F2931E;strokeColor=none;shadow=0;');
        part1.vertex = true;
        var part2 = new mxCell('', new mxGeometry(60, 10, 40, 85), 'html=1;shape=mxgraph.infographic.pyramidStep;fillColor=#F8C382;strokeColor=none;shadow=0;');
        part2.vertex = true;
        var part3 = new mxCell('', new mxGeometry(50, 20, 60, 75), 'html=1;shape=mxgraph.infographic.pyramidStep;fillColor=#FCE7CD;strokeColor=none;shadow=0;');
        part3.vertex = true;
        var part4 = new mxCell('', new mxGeometry(40, 30, 80, 65), 'html=1;shape=mxgraph.infographic.pyramidStep;fillColor=#BAC8D3;strokeColor=none;shadow=0;');
        part4.vertex = true;
        var part5 = new mxCell('', new mxGeometry(30, 40, 100, 55), 'html=1;shape=mxgraph.infographic.pyramidStep;fillColor=#5D7F99;strokeColor=none;shadow=0;');
        part5.vertex = true;
        var part6 = new mxCell('', new mxGeometry(20, 50, 120, 45), 'html=1;shape=mxgraph.infographic.pyramidStep;fillColor=#2F5B7C;strokeColor=none;shadow=0;');
        part6.vertex = true;
        var part7 = new mxCell('', new mxGeometry(10, 60, 140, 35), 'html=1;shape=mxgraph.infographic.pyramidStep;fillColor=#23445D;strokeColor=none;shadow=0;');
        part7.vertex = true;
        var part8 = new mxCell('', new mxGeometry(0, 70, 160, 25), 'html=1;shape=mxgraph.infographic.pyramidStep;fillColor=#333333;strokeColor=none;shadow=0;');
        part8.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, part6, part7, part8], 160, 95, 'Step Pyramid');
      }),

      this.addEntry(dt + 'circular dial list horizontal', function () {
        var part1 = new mxCell('Label', new mxGeometry(0, 0, 100, 100), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.basic.donut;dx=10;strokeColor=none;fillColor=#B1DDF0;fontSize=12;fontColor=#10739E;align=center;fontStyle=1;');
        part1.vertex = true;
        var part2 = new mxCell('65%', new mxGeometry(0, 0, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.basic.partConcEllipse;startAngle=0;endAngle=0.65;arcWidth=0.2;strokeColor=none;fillColor=#10739E;fontSize=22;fontColor=#10739E;align=center;fontStyle=1');
        part2.vertex = true;
        part1.insert(part2);

        var part3 = new mxCell('Label', new mxGeometry(110, 0, 100, 100), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.basic.donut;dx=10;strokeColor=none;fillColor=#F8C382;fontSize=12;fontColor=#F2931E;align=center;fontStyle=1;');
        part3.vertex = true;
        var part4 = new mxCell('40%', new mxGeometry(0, 0, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.basic.partConcEllipse;startAngle=0;endAngle=0.4;arcWidth=0.2;strokeColor=none;fillColor=#F2931E;fontSize=22;fontColor=#F2931E;align=center;fontStyle=1');
        part4.vertex = true;
        part3.insert(part4);

        var part5 = new mxCell('Label', new mxGeometry(220, 0, 100, 100), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.basic.donut;dx=10;strokeColor=none;fillColor=#F08E81;fontSize=12;fontColor=#AE4132;align=center;fontStyle=1;');
        part5.vertex = true;
        var part6 = new mxCell('25%', new mxGeometry(0, 0, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.basic.partConcEllipse;startAngle=0;endAngle=0.25;arcWidth=0.2;strokeColor=none;fillColor=#AE4132;fontSize=22;fontColor=#AE4132;align=center;fontStyle=1');
        part6.vertex = true;
        part5.insert(part6);

        var part7 = new mxCell('Label', new mxGeometry(330, 0, 100, 100), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.basic.donut;dx=10;strokeColor=none;fillColor=#5D7F99;fontSize=12;fontColor=#23445D;align=center;fontStyle=1;');
        part7.vertex = true;
        var part8 = new mxCell('60%', new mxGeometry(0, 0, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.basic.partConcEllipse;startAngle=0;endAngle=0.6;arcWidth=0.2;strokeColor=none;fillColor=#23445D;fontSize=22;fontColor=#23445D;align=center;fontStyle=1');
        part8.vertex = true;
        part7.insert(part8);

        var part9 = new mxCell('Label', new mxGeometry(440, 0, 100, 100), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.basic.donut;dx=10;strokeColor=none;fillColor=#61C6CE;fontSize=12;fontColor=#12AAB5;align=center;fontStyle=1;');
        part9.vertex = true;
        var part10 = new mxCell('80%', new mxGeometry(0, 0, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.basic.partConcEllipse;startAngle=0;endAngle=0.8;arcWidth=0.2;strokeColor=none;fillColor=#12AAB5;fontSize=22;fontColor=#12AAB5;align=center;fontStyle=1');
        part10.vertex = true;
        part9.insert(part10);

        return sb.createVertexTemplateFromCells([part1, part3, part5, part7, part9], 540, 100, 'Circular Dial List (horizontal)');
      }),

      this.addEntry(dt + 'circular dial list vertical', function () {
        var part1 = new mxCell('Label', new mxGeometry(0, 0, 100, 100), 'labelPosition=right;spacingLeft=10;html=1;shape=mxgraph.basic.donut;dx=10;strokeColor=none;fillColor=#B1DDF0;fontSize=12;fontColor=#10739E;align=left;fontStyle=1;');
        part1.vertex = true;
        var part2 = new mxCell('65%', new mxGeometry(0, 0, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.basic.partConcEllipse;startAngle=0;endAngle=0.65;arcWidth=0.2;strokeColor=none;fillColor=#10739E;fontSize=22;fontColor=#10739E;align=center;fontStyle=1');
        part2.vertex = true;
        part1.insert(part2);

        var part3 = new mxCell('Label', new mxGeometry(0, 110, 100, 100), 'labelPosition=right;spacingLeft=10;html=1;shape=mxgraph.basic.donut;dx=10;strokeColor=none;fillColor=#F8C382;fontSize=12;fontColor=#F2931E;align=left;fontStyle=1;');
        part3.vertex = true;
        var part4 = new mxCell('40%', new mxGeometry(0, 0, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.basic.partConcEllipse;startAngle=0;endAngle=0.4;arcWidth=0.2;strokeColor=none;fillColor=#F2931E;fontSize=22;fontColor=#F2931E;align=center;fontStyle=1');
        part4.vertex = true;
        part3.insert(part4);

        var part5 = new mxCell('Label', new mxGeometry(0, 220, 100, 100), 'labelPosition=right;spacingLeft=10;html=1;shape=mxgraph.basic.donut;dx=10;strokeColor=none;fillColor=#F08E81;fontSize=12;fontColor=#AE4132;align=left;fontStyle=1;');
        part5.vertex = true;
        var part6 = new mxCell('25%', new mxGeometry(0, 0, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.basic.partConcEllipse;startAngle=0;endAngle=0.25;arcWidth=0.2;strokeColor=none;fillColor=#AE4132;fontSize=22;fontColor=#AE4132;align=center;fontStyle=1');
        part6.vertex = true;
        part5.insert(part6);

        var part7 = new mxCell('Label', new mxGeometry(0, 330, 100, 100), 'labelPosition=right;spacingLeft=10;html=1;shape=mxgraph.basic.donut;dx=10;strokeColor=none;fillColor=#5D7F99;fontSize=12;fontColor=#23445D;align=left;fontStyle=1;');
        part7.vertex = true;
        var part8 = new mxCell('60%', new mxGeometry(0, 0, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.basic.partConcEllipse;startAngle=0;endAngle=0.6;arcWidth=0.2;strokeColor=none;fillColor=#23445D;fontSize=22;fontColor=#23445D;align=center;fontStyle=1');
        part8.vertex = true;
        part7.insert(part8);

        var part9 = new mxCell('Label', new mxGeometry(0, 440, 100, 100), 'labelPosition=right;spacingLeft=10;html=1;shape=mxgraph.basic.donut;dx=10;strokeColor=none;fillColor=#61C6CE;fontSize=12;fontColor=#12AAB5;align=left;fontStyle=1;');
        part9.vertex = true;
        var part10 = new mxCell('80%', new mxGeometry(0, 0, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.basic.partConcEllipse;startAngle=0;endAngle=0.8;arcWidth=0.2;strokeColor=none;fillColor=#12AAB5;fontSize=22;fontColor=#12AAB5;align=center;fontStyle=1');
        part10.vertex = true;
        part9.insert(part10);

        return sb.createVertexTemplateFromCells([part1, part3, part5, part7, part9], 100, 540, 'Circular Dial List (vertical)');
      }),

      this.addEntry(dt + 'circular dial list horizontal', function () {
        var label1 = new mxCell('Label', new mxGeometry(0, 0, 100, 30), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;fillColor=none;strokeColor=none;fontSize=15;fontColor=#10739E;align=center;fontStyle=1;');
        label1.vertex = true;
        var part1 = new mxCell('65%', new mxGeometry(0, 30, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.infographic.partConcEllipse;startAngle=0;endAngle=0.65;arcWidth=0.4;strokeColor=none;fillColor=#10739E;fontSize=22;fontColor=#10739E;align=center;fontStyle=1;');
        part1.vertex = true;
        var text1 = new mxCell(
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          new mxGeometry(0, 140, 100, 120),
          'verticalLabelPosition=middle;verticalAlign=middle;html=1;fillColor=#EEEEEE;strokeColor=none;fontSize=10;align=left;fontStyle=0;rounded=1;whiteSpace=wrap;arcSize=8;spacing=5;');
        text1.vertex = true;

        var label2 = new mxCell('Label', new mxGeometry(110, 0, 100, 30), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;fillColor=none;strokeColor=none;fontSize=15;fontColor=#F2931E;align=center;fontStyle=1;');
        label2.vertex = true;
        var part2 = new mxCell('40%', new mxGeometry(110, 30, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.infographic.partConcEllipse;startAngle=0;endAngle=0.4;arcWidth=0.4;strokeColor=none;fillColor=#F2931E;fontSize=22;fontColor=#F2931E;align=center;fontStyle=1;');
        part2.vertex = true;
        var text2 = new mxCell(
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          new mxGeometry(110, 140, 100, 120),
          'verticalLabelPosition=middle;verticalAlign=middle;html=1;fillColor=#EEEEEE;strokeColor=none;fontSize=10;align=left;fontStyle=0;rounded=1;whiteSpace=wrap;arcSize=8;spacing=5;');
        text2.vertex = true;

        var label3 = new mxCell('Label', new mxGeometry(220, 0, 100, 30), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;fillColor=none;strokeColor=none;fontSize=15;fontColor=#AE4132;align=center;fontStyle=1;');
        label3.vertex = true;
        var part3 = new mxCell('25%', new mxGeometry(220, 30, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.infographic.partConcEllipse;startAngle=0;endAngle=0.25;arcWidth=0.4;strokeColor=none;fillColor=#AE4132;fontSize=22;fontColor=#AE4132;align=center;fontStyle=1;');
        part3.vertex = true;
        var text3 = new mxCell(
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          new mxGeometry(220, 140, 100, 120),
          'verticalLabelPosition=middle;verticalAlign=middle;html=1;fillColor=#EEEEEE;strokeColor=none;fontSize=10;align=left;fontStyle=0;rounded=1;whiteSpace=wrap;arcSize=8;spacing=5;');
        text3.vertex = true;

        var label4 = new mxCell('Label', new mxGeometry(330, 0, 100, 30), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;fillColor=none;strokeColor=none;fontSize=15;fontColor=#23445D;align=center;fontStyle=1;');
        label4.vertex = true;
        var part4 = new mxCell('60%', new mxGeometry(330, 30, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.infographic.partConcEllipse;startAngle=0;endAngle=0.6;arcWidth=0.4;strokeColor=none;fillColor=#23445D;fontSize=22;fontColor=#23445D;align=center;fontStyle=1;');
        part4.vertex = true;
        var text4 = new mxCell(
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          new mxGeometry(330, 140, 100, 120),
          'verticalLabelPosition=middle;verticalAlign=middle;html=1;fillColor=#EEEEEE;strokeColor=none;fontSize=10;align=left;fontStyle=0;rounded=1;whiteSpace=wrap;arcSize=8;spacing=5;');
        text4.vertex = true;

        var label5 = new mxCell('Label', new mxGeometry(440, 0, 100, 30), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;fillColor=none;strokeColor=none;fontSize=15;fontColor=#12AAB5;align=center;fontStyle=1;');
        label5.vertex = true;
        var part5 = new mxCell('80%', new mxGeometry(440, 30, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.infographic.partConcEllipse;startAngle=0;endAngle=0.8;arcWidth=0.4;strokeColor=none;fillColor=#12AAB5;fontSize=22;fontColor=#12AAB5;align=center;fontStyle=1;');
        part5.vertex = true;
        var text5 = new mxCell(
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          new mxGeometry(440, 140, 100, 120),
          'verticalLabelPosition=middle;verticalAlign=middle;html=1;fillColor=#EEEEEE;strokeColor=none;fontSize=10;align=left;fontStyle=0;rounded=1;whiteSpace=wrap;arcSize=8;spacing=5;');
        text5.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, label1, label2, label3, label4, label5, text1, text2, text3, text4, text5], 540, 260, 'Circular Dial List (horizontal)');
      }),

      this.addEntry(dt + 'circular dial list vertical', function () {
        var part1 = new mxCell('65%', new mxGeometry(0, 0, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.infographic.partConcEllipse;startAngle=0;endAngle=0.65;arcWidth=0.4;strokeColor=none;fillColor=#10739E;fontSize=22;fontColor=#10739E;align=center;fontStyle=1;');
        part1.vertex = true;
        var label1 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#10739E"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</font></font>',
          new mxGeometry(110, 0, 210, 100), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=left;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;spacing=8;');
        label1.vertex = true;

        var part2 = new mxCell('40%', new mxGeometry(0, 110, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.infographic.partConcEllipse;startAngle=0;endAngle=0.4;arcWidth=0.4;strokeColor=none;fillColor=#F2931E;fontSize=22;fontColor=#F2931E;align=center;fontStyle=1;');
        part2.vertex = true;
        var label2 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#F2931E"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</font></font>',
          new mxGeometry(110, 110, 210, 100), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=left;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;spacing=8;');
        label2.vertex = true;

        var part3 = new mxCell('25%', new mxGeometry(0, 220, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.infographic.partConcEllipse;startAngle=0;endAngle=0.25;arcWidth=0.4;strokeColor=none;fillColor=#AE4132;fontSize=22;fontColor=#AE4132;align=center;fontStyle=1;');
        part3.vertex = true;
        var label3 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#AE4132"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</font></font>',
          new mxGeometry(110, 220, 210, 100), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=left;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;spacing=8;');
        label3.vertex = true;

        var part4 = new mxCell('60%', new mxGeometry(0, 330, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.infographic.partConcEllipse;startAngle=0;endAngle=0.6;arcWidth=0.4;strokeColor=none;fillColor=#23445D;fontSize=22;fontColor=#23445D;align=center;fontStyle=1;');
        part4.vertex = true;
        var label4 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#23445D"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</font></font>',
          new mxGeometry(110, 330, 210, 100), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=left;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;spacing=8;');
        label4.vertex = true;

        var part5 = new mxCell('80%', new mxGeometry(0, 440, 100, 100), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;whiteSpace=wrap;shape=mxgraph.infographic.partConcEllipse;startAngle=0;endAngle=0.8;arcWidth=0.4;strokeColor=none;fillColor=#12AAB5;fontSize=22;fontColor=#12AAB5;align=center;fontStyle=1;');
        part5.vertex = true;
        var label5 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#12AAB5"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</font></font>',
          new mxGeometry(110, 440, 210, 100), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=left;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;spacing=8;');
        label5.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, label1, label2, label3, label4, label5], 320, 540, 'Circular Dial List (vertical)');
      }),


      this.addEntry(dt + 'bar graph', function () {
        var part1 = new mxCell('Label', new mxGeometry(0, 20, 40, 80), s2 + 'shadedCube;isoAngle=15;fillColor=#10739E;strokeColor=none;fontStyle=1;fontColor=#10739E;fontSize=12;shadow=0;');
        part1.vertex = true;

        var part2 = new mxCell('Label', new mxGeometry(50, 0, 40, 100), s2 + 'shadedCube;isoAngle=15;fillColor=#F2931E;strokeColor=none;fontStyle=1;fontColor=#F2931E;fontSize=12;shadow=0;');
        part2.vertex = true;

        var part3 = new mxCell('Label', new mxGeometry(100, 10, 40, 90), s2 + 'shadedCube;isoAngle=15;fillColor=#AE4132;strokeColor=none;fontStyle=1;fontColor=#AE4132;fontSize=12;shadow=0;');
        part3.vertex = true;

        var part4 = new mxCell('Label', new mxGeometry(150, 50, 40, 50), s2 + 'shadedCube;isoAngle=15;fillColor=#23445D;strokeColor=none;fontStyle=1;fontColor=#23445D;fontSize=12;shadow=0;');
        part4.vertex = true;

        var part5 = new mxCell('Label', new mxGeometry(200, 30, 40, 70), s2 + 'shadedCube;isoAngle=15;fillColor=#12AAB5;strokeColor=none;fontStyle=1;fontColor=#12AAB5;fontSize=12;shadow=0;');
        part5.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5], 240, 100, 'Bar Graph');
      }),

      this.addEntry(dt + 'bar graph', function () {
        var part1 = new mxCell('Label', new mxGeometry(0, 40, 40, 80), s2 + 'shadedCube;isoAngle=15;fillColor=#10739E;strokeColor=none;fontStyle=1;fontColor=#10739E;fontSize=12;shadow=0;');
        part1.vertex = true;
        var bg1 = new mxCell('', new mxGeometry(0, 0, 40, 60), 'verticalLabelPosition=top;verticalAlign=bottom;html=1;shape=mxgraph.infographic.shadedCube;isoAngle=15;fillColor=#CCCCCC;strokeColor=none;fontStyle=1;fontColor=#10739E;fontSize=12;shadow=0;align=left;opacity=70;');
        bg1.vertex = true;

        var part2 = new mxCell('Label', new mxGeometry(50, 20, 40, 100), s2 + 'shadedCube;isoAngle=15;fillColor=#F2931E;strokeColor=none;fontStyle=1;fontColor=#F2931E;fontSize=12;shadow=0;');
        part2.vertex = true;
        var bg2 = new mxCell('', new mxGeometry(50, 0, 40, 40), 'verticalLabelPosition=top;verticalAlign=bottom;html=1;shape=mxgraph.infographic.shadedCube;isoAngle=15;fillColor=#CCCCCC;strokeColor=none;fontStyle=1;fontColor=#F19A19;fontSize=12;shadow=0;align=left;opacity=70;');
        bg2.vertex = true;

        var part3 = new mxCell('Label', new mxGeometry(100, 30, 40, 90), s2 + 'shadedCube;isoAngle=15;fillColor=#AE4132;strokeColor=none;fontStyle=1;fontColor=#AE4132;fontSize=12;shadow=0;');
        part3.vertex = true;
        var bg3 = new mxCell('', new mxGeometry(100, 0, 40, 50), 'verticalLabelPosition=top;verticalAlign=bottom;html=1;shape=mxgraph.infographic.shadedCube;isoAngle=15;fillColor=#CCCCCC;strokeColor=none;fontStyle=1;fontColor=#D82A23;fontSize=12;shadow=0;align=left;opacity=70;');
        bg3.vertex = true;

        var part4 = new mxCell('Label', new mxGeometry(150, 70, 40, 50), s2 + 'shadedCube;isoAngle=15;fillColor=#23445D;strokeColor=none;fontStyle=1;fontColor=#23445D;fontSize=12;shadow=0;');
        part4.vertex = true;
        var bg4 = new mxCell('', new mxGeometry(150, 0, 40, 90), 'verticalLabelPosition=top;verticalAlign=bottom;html=1;shape=mxgraph.infographic.shadedCube;isoAngle=15;fillColor=#CCCCCC;strokeColor=none;fontStyle=1;fontColor=#4A5768;fontSize=12;shadow=0;align=left;opacity=70;');
        bg4.vertex = true;

        var part5 = new mxCell('Label', new mxGeometry(200, 50, 40, 70), s2 + 'shadedCube;isoAngle=15;fillColor=#12AAB5;strokeColor=none;fontStyle=1;fontColor=#12AAB5;fontSize=12;shadow=0;');
        part5.vertex = true;
        var bg5 = new mxCell('', new mxGeometry(200, 0, 40, 70), 'verticalLabelPosition=top;verticalAlign=bottom;html=1;shape=mxgraph.infographic.shadedCube;isoAngle=15;fillColor=#CCCCCC;strokeColor=none;fontStyle=1;fontColor=#15AA96;fontSize=12;shadow=0;align=left;opacity=70;');
        bg5.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, bg1, bg2, bg3, bg4, bg5], 240, 120, 'Bar Graph');
      }),

      this.addEntry(dt + 'bar graph', function () {
        var part1 = new mxCell('', new mxGeometry(0, 38, 40, 80), s2 + 'shadedCube;isoAngle=15;fillColor=#10739E;strokeColor=none;shadow=0;');
        part1.vertex = true;

        var part2 = new mxCell('', new mxGeometry(25, 6, 40, 100), s2 + 'shadedCube;isoAngle=15;fillColor=#F2931E;strokeColor=none;shadow=0;');
        part2.vertex = true;

        var part3 = new mxCell('', new mxGeometry(50, 4, 40, 90), s2 + 'shadedCube;isoAngle=15;fillColor=#AE4132;strokeColor=none;shadow=0;');
        part3.vertex = true;

        var part4 = new mxCell('', new mxGeometry(75, 32, 40, 50), s2 + 'shadedCube;isoAngle=15;fillColor=#23445D;strokeColor=none;shadow=0;');
        part4.vertex = true;

        var part5 = new mxCell('', new mxGeometry(100, 0, 40, 70), s2 + 'shadedCube;isoAngle=15;fillColor=#12AAB5;strokeColor=none;shadow=0;');
        part5.vertex = true;

        return sb.createVertexTemplateFromCells([part5, part4, part3, part2, part1], 140, 100, 'Bar Graph');
      }),

      this.addEntry(dt + 'bar graph', function () {
        var part1 = new mxCell('Label', new mxGeometry(0, 40, 40, 80), s2 + 'cylinder;isoAngle=15;fillColor=#10739E;strokeColor=none;fontStyle=1;fontColor=#10739E;fontSize=12;shadow=0;');
        part1.vertex = true;
        var bg1 = new mxCell('', new mxGeometry(0, 0, 40, 60), 'verticalLabelPosition=top;verticalAlign=bottom;html=1;shape=mxgraph.infographic.cylinder;isoAngle=15;fillColor=#CCCCCC;strokeColor=none;fontStyle=1;fontColor=#10739E;fontSize=12;shadow=0;align=left;opacity=70;');
        bg1.vertex = true;

        var part2 = new mxCell('Label', new mxGeometry(50, 20, 40, 100), s2 + 'cylinder;isoAngle=15;fillColor=#F2931E;strokeColor=none;fontStyle=1;fontColor=#F2931E;fontSize=12;shadow=0;');
        part2.vertex = true;
        var bg2 = new mxCell('', new mxGeometry(50, 0, 40, 40), 'verticalLabelPosition=top;verticalAlign=bottom;html=1;shape=mxgraph.infographic.cylinder;isoAngle=15;fillColor=#CCCCCC;strokeColor=none;fontStyle=1;fontColor=#F2931E;fontSize=12;shadow=0;align=left;opacity=70;');
        bg2.vertex = true;

        var part3 = new mxCell('Label', new mxGeometry(100, 30, 40, 90), s2 + 'cylinder;isoAngle=15;fillColor=#AE4132;strokeColor=none;fontStyle=1;fontColor=#AE4132;fontSize=12;shadow=0;');
        part3.vertex = true;
        var bg3 = new mxCell('', new mxGeometry(100, 0, 40, 50), 'verticalLabelPosition=top;verticalAlign=bottom;html=1;shape=mxgraph.infographic.cylinder;isoAngle=15;fillColor=#CCCCCC;strokeColor=none;fontStyle=1;fontColor=#AE4132;fontSize=12;shadow=0;align=left;opacity=70;');
        bg3.vertex = true;

        var part4 = new mxCell('Label', new mxGeometry(150, 70, 40, 50), s2 + 'cylinder;isoAngle=15;fillColor=#23445D;strokeColor=none;fontStyle=1;fontColor=#23445D;fontSize=12;shadow=0;');
        part4.vertex = true;
        var bg4 = new mxCell('', new mxGeometry(150, 0, 40, 90), 'verticalLabelPosition=top;verticalAlign=bottom;html=1;shape=mxgraph.infographic.cylinder;isoAngle=15;fillColor=#CCCCCC;strokeColor=none;fontStyle=1;fontColor=#23445D;fontSize=12;shadow=0;align=left;opacity=70;');
        bg4.vertex = true;

        var part5 = new mxCell('Label', new mxGeometry(200, 50, 40, 70), s2 + 'cylinder;isoAngle=15;fillColor=#12AAB5;strokeColor=none;fontStyle=1;fontColor=#12AAB5;fontSize=12;shadow=0;');
        part5.vertex = true;
        var bg5 = new mxCell('', new mxGeometry(200, 0, 40, 70), 'verticalLabelPosition=top;verticalAlign=bottom;html=1;shape=mxgraph.infographic.cylinder;isoAngle=15;fillColor=#CCCCCC;strokeColor=none;fontStyle=1;fontColor=#12AAB5;fontSize=12;shadow=0;align=left;opacity=70;');
        bg5.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, bg1, bg2, bg3, bg4, bg5], 240, 120, 'Bar Graph');
      }),

      this.addEntry(dt + 'folded banners', function () {
        var part1 = new mxCell('Label', new mxGeometry(0, 0, 200, 100),
          'html=1;shape=mxgraph.infographic.bannerHalfFold;dx=40;dx2=20;notch=15;fillColor=#10739E;strokeColor=none;align=left;verticalAlign=top;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingLeft=25;spacingTop=5;');
        part1.vertex = true;

        var part2 = new mxCell('Label', new mxGeometry(0, 60, 200, 100),
          'html=1;shape=mxgraph.infographic.bannerHalfFold;dx=40;dx2=20;notch=15;fillColor=#F2931E;strokeColor=none;align=left;verticalAlign=top;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingLeft=25;spacingTop=5;');
        part2.vertex = true;

        var part3 = new mxCell('Label', new mxGeometry(0, 120, 200, 100),
          'html=1;shape=mxgraph.infographic.bannerHalfFold;dx=40;dx2=20;notch=15;fillColor=#AE4132;strokeColor=none;align=left;verticalAlign=top;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingLeft=25;spacingTop=5;');
        part3.vertex = true;

        var part4 = new mxCell('Label', new mxGeometry(0, 180, 200, 100),
          'html=1;shape=mxgraph.infographic.bannerHalfFold;dx=40;dx2=20;notch=15;fillColor=#23445D;strokeColor=none;align=left;verticalAlign=top;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingLeft=25;spacingTop=5;');
        part4.vertex = true;

        var part5 = new mxCell('Label', new mxGeometry(0, 240, 200, 120),
          'html=1;shape=mxgraph.infographic.bannerHalfFold;dx=40;dx2=20;notch=15;fillColor=#12AAB5;strokeColor=none;align=left;verticalAlign=top;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingLeft=25;spacingTop=5;');
        part5.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5], 200, 360, 'Folded Banners');
      }),

      this.addEntry(dt + 'cylinder graph', function () {
        var part1 = new mxCell('Label', new mxGeometry(0, 0, 100, 85), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.cylinder;fillColor=#10739E;strokeColor=none;shadow=0;align=left;labelPosition=right;spacingLeft=10;fontStyle=1;fontColor=#10739E;');
        part1.vertex = true;

        var part2 = new mxCell('Label', new mxGeometry(0, 75, 100, 55), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.cylinder;fillColor=#F2931E;strokeColor=none;shadow=0;align=left;labelPosition=right;spacingLeft=10;fontStyle=1;fontColor=#F2931E;');
        part2.vertex = true;

        var part3 = new mxCell('Label', new mxGeometry(0, 120, 100, 110), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.cylinder;fillColor=#AE4132;strokeColor=none;shadow=0;align=left;labelPosition=right;spacingLeft=10;fontStyle=1;fontColor=#AE4132;');
        part3.vertex = true;

        var part4 = new mxCell('Label', new mxGeometry(0, 220, 100, 150), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.cylinder;fillColor=#23445D;strokeColor=none;shadow=0;align=left;labelPosition=right;spacingLeft=10;fontStyle=1;fontColor=#23445D;');
        part4.vertex = true;

        var part5 = new mxCell('Label', new mxGeometry(0, 360, 100, 90), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.cylinder;fillColor=#12AAB5;strokeColor=none;shadow=0;align=left;labelPosition=right;spacingLeft=10;fontStyle=1;fontColor=#12AAB5;');
        part5.vertex = true;

        return sb.createVertexTemplateFromCells([part5, part4, part3, part2, part1], 100, 460, 'Cylinder Graph');
      }),

      this.addEntry(dt + 'cylinder graph', function () {
        var part1 = new mxCell('Label', new mxGeometry(0, 0, 100, 85), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.cylinder;fillColor=#10739E;strokeColor=none;shadow=0;align=left;labelPosition=right;spacingLeft=10;fontStyle=1;fontColor=#10739E;');
        part1.vertex = true;

        var part2 = new mxCell('Label', new mxGeometry(0, 65, 100, 55), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.cylinder;fillColor=#F2931E;strokeColor=none;shadow=0;align=left;labelPosition=right;spacingLeft=10;fontStyle=1;fontColor=#F2931E;');
        part2.vertex = true;

        var part3 = new mxCell('Label', new mxGeometry(0, 100, 100, 110), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.cylinder;fillColor=#AE4132;strokeColor=none;shadow=0;align=left;labelPosition=right;spacingLeft=10;fontStyle=1;fontColor=#AE4132;');
        part3.vertex = true;

        var part4 = new mxCell('Label', new mxGeometry(0, 190, 100, 150), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.cylinder;fillColor=#23445D;strokeColor=none;shadow=0;align=left;labelPosition=right;spacingLeft=10;fontStyle=1;fontColor=#23445D;');
        part4.vertex = true;

        var part5 = new mxCell('Label', new mxGeometry(0, 320, 100, 90), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.cylinder;fillColor=#12AAB5;strokeColor=none;shadow=0;align=left;labelPosition=right;spacingLeft=10;fontStyle=1;fontColor=#12AAB5;');
        part5.vertex = true;

        return sb.createVertexTemplateFromCells([part5, part4, part3, part2, part1], 100, 410, 'Cylinder Graph');
      }),

      this.addEntry(dt + 'ribbon list', function () {
        var ribbon1 = new mxCell('', new mxGeometry(0, 0, 500, 100), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=20;notch2=0;fillColor=#10739E;strokeColor=none;shadow=1;');
        ribbon1.vertex = true;
        var item1 = new mxCell('Label', new mxGeometry(410, 50, 100, 60), 'shape=manualInput;whiteSpace=wrap;html=1;shadow=1;strokeColor=none;fillColor=#dddddd;fontSize=15;fontColor=#444444;align=right;direction=south;flipH=1;shadow=1;spacing=10;fontStyle=1;');
        item1.vertex = true;
        var chevron1 = new mxCell('', new mxGeometry(0, 0.5, 30, 40), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;shadow=0;strokeColor=none;strokeWidth=6;fillColor=#CCCCCC;size=20;');
        chevron1.vertex = true;
        chevron1.geometry.relative = true;
        chevron1.geometry.offset = new mxPoint(150, -20);
        ribbon1.insert(chevron1);
        var text1 = new mxCell(
          '<b>Heading</b><br><font style="font-size: 11px">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</font>',
          new mxGeometry(0, 0, 230, 100), 'text;strokeColor=none;fillColor=none;spacing=5;spacingTop=0;whiteSpace=wrap;overflow=hidden;rounded=0;shadow=0;fontSize=15;fontColor=#FFFFFF;align=left;html=1;');
        text1.vertex = true;
        text1.geometry.relative = true;
        text1.geometry.offset = new mxPoint(200, 0);
        ribbon1.insert(text1);
        var icon1 = new mxCell('', new mxGeometry(50, 32, 50, 37), 'shadow=0;dashed=0;html=1;strokeColor=none;shape=mxgraph.mscae.intune.user_group;fontSize=15;fontColor=#FFFFFF;align=left;');
        icon1.vertex = true;

        var ribbon2 = new mxCell('', new mxGeometry(0, 120, 500, 100), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=20;notch2=0;fillColor=#F2931E;strokeColor=none;shadow=1;');
        ribbon2.vertex = true;
        var item2 = new mxCell('Label', new mxGeometry(410, 170, 100, 60), 'shape=manualInput;whiteSpace=wrap;html=1;shadow=1;strokeColor=none;fillColor=#dddddd;fontSize=15;fontColor=#444444;align=right;direction=south;flipH=1;shadow=1;spacing=10;fontStyle=1;');
        item2.vertex = true;
        var chevron2 = new mxCell('', new mxGeometry(0, 0.5, 30, 40), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;shadow=0;strokeColor=none;strokeWidth=6;fillColor=#CCCCCC;size=20;');
        chevron2.vertex = true;
        chevron2.geometry.relative = true;
        chevron2.geometry.offset = new mxPoint(150, -20);
        ribbon2.insert(chevron2);
        var text2 = new mxCell(
          '<b>Heading</b><br><font style="font-size: 11px">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</font>',
          new mxGeometry(0, 0, 230, 100), 'text;strokeColor=none;fillColor=none;spacing=5;spacingTop=0;whiteSpace=wrap;overflow=hidden;rounded=0;shadow=0;fontSize=15;fontColor=#FFFFFF;align=left;html=1;');
        text2.vertex = true;
        text2.geometry.relative = true;
        text2.geometry.offset = new mxPoint(200, 0);
        ribbon2.insert(text2);
        var icon2 = new mxCell('', new mxGeometry(50, 152, 50, 37), 'shadow=0;dashed=0;html=1;strokeColor=none;shape=mxgraph.mscae.intune.user_group;fontSize=15;fontColor=#FFFFFF;align=left;');
        icon2.vertex = true;

        var ribbon3 = new mxCell('', new mxGeometry(0, 240, 500, 100), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=20;notch2=0;fillColor=#AE4132;strokeColor=none;shadow=1;');
        ribbon3.vertex = true;
        var item3 = new mxCell('Label', new mxGeometry(410, 290, 100, 60), 'shape=manualInput;whiteSpace=wrap;html=1;shadow=1;strokeColor=none;fillColor=#dddddd;fontSize=15;fontColor=#444444;align=right;direction=south;flipH=1;shadow=1;spacing=10;fontStyle=1;');
        item3.vertex = true;
        var chevron3 = new mxCell('', new mxGeometry(0, 0.5, 30, 40), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;shadow=0;strokeColor=none;strokeWidth=6;fillColor=#CCCCCC;size=20;');
        chevron3.vertex = true;
        chevron3.geometry.relative = true;
        chevron3.geometry.offset = new mxPoint(150, -20);
        ribbon3.insert(chevron3);
        var text3 = new mxCell(
          '<b>Heading</b><br><font style="font-size: 11px">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</font>',
          new mxGeometry(0, 0, 230, 100), 'text;strokeColor=none;fillColor=none;spacing=5;spacingTop=0;whiteSpace=wrap;overflow=hidden;rounded=0;shadow=0;fontSize=15;fontColor=#FFFFFF;align=left;html=1;');
        text3.vertex = true;
        text3.geometry.relative = true;
        text3.geometry.offset = new mxPoint(200, 0);
        ribbon3.insert(text3);
        var icon3 = new mxCell('', new mxGeometry(50, 272, 50, 37), 'shadow=0;dashed=0;html=1;strokeColor=none;shape=mxgraph.mscae.intune.user_group;fontSize=15;fontColor=#FFFFFF;align=left;');
        icon3.vertex = true;

        var ribbon4 = new mxCell('', new mxGeometry(0, 360, 500, 100), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=20;notch2=0;fillColor=#23445D;strokeColor=none;shadow=1;');
        ribbon4.vertex = true;
        var item4 = new mxCell('Label', new mxGeometry(410, 410, 100, 60), 'shape=manualInput;whiteSpace=wrap;html=1;shadow=1;strokeColor=none;fillColor=#dddddd;fontSize=15;fontColor=#444444;align=right;direction=south;flipH=1;shadow=1;spacing=10;fontStyle=1;');
        item4.vertex = true;
        var chevron4 = new mxCell('', new mxGeometry(0, 0.5, 30, 40), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;shadow=0;strokeColor=none;strokeWidth=6;fillColor=#CCCCCC;size=20;');
        chevron4.vertex = true;
        chevron4.geometry.relative = true;
        chevron4.geometry.offset = new mxPoint(150, -20);
        ribbon4.insert(chevron4);
        var text4 = new mxCell(
          '<b>Heading</b><br><font style="font-size: 11px">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</font>',
          new mxGeometry(0, 0, 230, 100), 'text;strokeColor=none;fillColor=none;spacing=5;spacingTop=0;whiteSpace=wrap;overflow=hidden;rounded=0;shadow=0;fontSize=15;fontColor=#FFFFFF;align=left;html=1;');
        text4.vertex = true;
        text4.geometry.relative = true;
        text4.geometry.offset = new mxPoint(200, 0);
        ribbon4.insert(text4);
        var icon4 = new mxCell('', new mxGeometry(50, 392, 50, 37), 'shadow=0;dashed=0;html=1;strokeColor=none;shape=mxgraph.mscae.intune.user_group;fontSize=15;fontColor=#FFFFFF;align=left;');
        icon4.vertex = true;

        var ribbon5 = new mxCell('', new mxGeometry(0, 480, 500, 100), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=20;notch2=0;fillColor=#12AAB5;strokeColor=none;shadow=1;');
        ribbon5.vertex = true;
        var item5 = new mxCell('Label', new mxGeometry(410, 530, 100, 60), 'shape=manualInput;whiteSpace=wrap;html=1;shadow=1;strokeColor=none;fillColor=#dddddd;fontSize=15;fontColor=#444444;align=right;direction=south;flipH=1;shadow=1;spacing=10;fontStyle=1;');
        item5.vertex = true;
        var chevron5 = new mxCell('', new mxGeometry(0, 0.5, 30, 40), 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;shadow=0;strokeColor=none;strokeWidth=6;fillColor=#CCCCCC;size=20;');
        chevron5.vertex = true;
        chevron5.geometry.relative = true;
        chevron5.geometry.offset = new mxPoint(150, -20);
        ribbon5.insert(chevron5);
        var text5 = new mxCell(
          '<b>Heading</b><br><font style="font-size: 11px">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</font>',
          new mxGeometry(0, 0, 230, 100), 'text;strokeColor=none;fillColor=none;spacing=5;spacingTop=0;whiteSpace=wrap;overflow=hidden;rounded=0;shadow=0;fontSize=15;fontColor=#FFFFFF;align=left;html=1;');
        text5.vertex = true;
        text5.geometry.relative = true;
        text5.geometry.offset = new mxPoint(200, 0);
        ribbon5.insert(text5);
        var icon5 = new mxCell('', new mxGeometry(50, 512, 50, 37), 'shadow=0;dashed=0;html=1;strokeColor=none;shape=mxgraph.mscae.intune.user_group;fontSize=15;fontColor=#FFFFFF;align=left;');
        icon5.vertex = true;

        return sb.createVertexTemplateFromCells([ribbon1, item1, icon1, ribbon2, item2, icon2, ribbon3, item3, icon3, ribbon4, item4, icon4, ribbon5, item5, icon5], 550, 590, 'Ribbon List');
      }),

      this.addEntry(dt + 'bar graph', function () {
        var part1 = new mxCell('Label', new mxGeometry(0, 0, 120, 70), 'html=1;whiteSpace=wrap;shape=mxgraph.infographic.barCallout;dx=60;dy=30;fillColor=#10739E;strokeColor=none;align=center;verticalAlign=top;fontColor=#ffffff;fontSize=14;fontStyle=1;shadow=0;spacingTop=5;');
        part1.vertex = true;
        var dial1 = new mxCell('12', new mxGeometry(40, 75, 40, 40), 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;shadow=0;strokeColor=#10739E;strokeWidth=6;fontSize=16;align=center;fontStyle=1');
        dial1.vertex = true;

        var part2 = new mxCell('Label', new mxGeometry(120, 0, 160, 70), 'html=1;whiteSpace=wrap;shape=mxgraph.infographic.barCallout;dx=80;dy=30;fillColor=#F2931E;strokeColor=none;align=center;verticalAlign=top;fontColor=#ffffff;fontSize=14;fontStyle=1;shadow=0;spacingTop=5;');
        part2.vertex = true;
        var dial2 = new mxCell('16', new mxGeometry(180, 75, 40, 40), 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;shadow=0;strokeColor=#F2931E;strokeWidth=6;fontSize=16;align=center;fontStyle=1');
        dial2.vertex = true;

        var part3 = new mxCell('Label', new mxGeometry(280, 0, 80, 70), 'html=1;whiteSpace=wrap;shape=mxgraph.infographic.barCallout;dx=40;dy=30;fillColor=#AE4132;strokeColor=none;align=center;verticalAlign=top;fontColor=#ffffff;fontSize=14;fontStyle=1;shadow=0;spacingTop=5;');
        part3.vertex = true;
        var dial3 = new mxCell('8', new mxGeometry(300, 75, 40, 40), 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;shadow=0;strokeColor=#AE4132;strokeWidth=6;fontSize=16;align=center;fontStyle=1');
        dial3.vertex = true;

        var part4 = new mxCell('Label', new mxGeometry(360, 0, 200, 70), 'html=1;whiteSpace=wrap;shape=mxgraph.infographic.barCallout;dx=100;dy=30;fillColor=#23445D;strokeColor=none;align=center;verticalAlign=top;fontColor=#ffffff;fontSize=14;fontStyle=1;shadow=0;spacingTop=5;');
        part4.vertex = true;
        var dial4 = new mxCell('20', new mxGeometry(440, 75, 40, 40), 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;shadow=0;strokeColor=#23445D;strokeWidth=6;fontSize=16;align=center;fontStyle=1');
        dial4.vertex = true;

        var part5 = new mxCell('Label', new mxGeometry(560, 0, 140, 70), 'html=1;whiteSpace=wrap;shape=mxgraph.infographic.barCallout;dx=70;dy=30;fillColor=#12AAB5;strokeColor=none;align=center;verticalAlign=top;fontColor=#ffffff;fontSize=14;fontStyle=1;shadow=0;spacingTop=5;');
        part5.vertex = true;
        var dial5 = new mxCell('14', new mxGeometry(610, 75, 40, 40), 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;shadow=0;strokeColor=#12AAB5;strokeWidth=6;fontSize=16;align=center;fontStyle=1');
        dial5.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, dial1, dial2, dial3, dial4, dial5], 700, 115, 'Bar Graph');
      }),

      this.addEntry(dt + 'arrow graph', function () {
        var part1 = new mxCell('Label', new mxGeometry(0, 40, 90, 160), 'html=1;shadow=0;dashed=0;align=center;verticalAlign=top;shape=mxgraph.arrows2.arrow;dy=0.4;dx=60;direction=north;notch=0;strokeColor=#FFFFFF;strokeWidth=6;fillColor=#10739E;fontSize=14;labelPosition=center;verticalLabelPosition=bottom;fontStyle=1');
        part1.vertex = true;

        var part2 = new mxCell('Label', new mxGeometry(50, 0, 90, 200), 'html=1;shadow=0;dashed=0;align=center;verticalAlign=top;shape=mxgraph.arrows2.arrow;dy=0.4;dx=60;direction=north;notch=0;strokeColor=#FFFFFF;strokeWidth=6;fillColor=#F2931E;fontSize=14;labelPosition=center;verticalLabelPosition=bottom;fontStyle=1');
        part2.vertex = true;

        var part3 = new mxCell('Label', new mxGeometry(100, 20, 90, 180), 'html=1;shadow=0;dashed=0;align=center;verticalAlign=top;shape=mxgraph.arrows2.arrow;dy=0.4;dx=60;direction=north;notch=0;strokeColor=#FFFFFF;strokeWidth=6;fillColor=#AE4132;fontSize=14;labelPosition=center;verticalLabelPosition=bottom;fontStyle=1');
        part3.vertex = true;

        var part4 = new mxCell('Label', new mxGeometry(150, 90, 90, 110), 'html=1;shadow=0;dashed=0;align=center;verticalAlign=top;shape=mxgraph.arrows2.arrow;dy=0.4;dx=60;direction=north;notch=0;strokeColor=#FFFFFF;strokeWidth=6;fillColor=#23445D;fontSize=14;labelPosition=center;verticalLabelPosition=bottom;fontStyle=1');
        part4.vertex = true;

        var part5 = new mxCell('Label', new mxGeometry(200, 60, 90, 140), 'html=1;shadow=0;dashed=0;align=center;verticalAlign=top;shape=mxgraph.arrows2.arrow;dy=0.4;dx=60;direction=north;notch=0;strokeColor=#FFFFFF;strokeWidth=6;fillColor=#12AAB5;fontSize=14;labelPosition=center;verticalLabelPosition=bottom;fontStyle=1');
        part5.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5], 300, 200, 'Arrow Graph');
      }),

      this.addEntry(dt + 'triangular diagram', function () {
        var part1 = new mxCell('Label', new mxGeometry(120, 0, 240, 180), 'triangle;whiteSpace=wrap;html=1;shadow=0;strokeColor=#FFFFFF;strokeWidth=6;fillColor=#10739E;fontSize=16;fontColor=#FFFFFF;align=center;direction=north;fontStyle=1');
        part1.vertex = true;
        var part2 = new mxCell('Label', new mxGeometry(0, 180, 240, 180), 'triangle;whiteSpace=wrap;html=1;shadow=0;strokeColor=#FFFFFF;strokeWidth=6;fillColor=#F2931E;fontSize=16;fontColor=#FFFFFF;align=center;direction=north;fontStyle=1');
        part2.vertex = true;
        var part3 = new mxCell('Label', new mxGeometry(120, 180, 240, 180), 'triangle;whiteSpace=wrap;html=1;shadow=0;strokeColor=#FFFFFF;strokeWidth=6;fillColor=#AE4132;fontSize=16;fontColor=#FFFFFF;align=center;direction=south;fontStyle=1');
        part3.vertex = true;
        var part4 = new mxCell('Label', new mxGeometry(240, 180, 240, 180), 'triangle;whiteSpace=wrap;html=1;shadow=0;strokeColor=#FFFFFF;strokeWidth=6;fillColor=#23445D;fontSize=16;fontColor=#FFFFFF;align=center;direction=north;fontStyle=1');
        part4.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4], 480, 360, 'Triangular Diagram');
      }),

      this.addEntry(dt + 'roll', function () {
        var part1 = new mxCell('', new mxGeometry(0, 0, 400, 400), 'ellipse;html=1;strokeWidth=4;fillColor=#23445D;strokeColor=none;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part1.vertex = true;
        var part2 = new mxCell('', new mxGeometry(25, 25, 350, 350), 'ellipse;html=1;strokeWidth=4;fillColor=#2F5B7C;strokeColor=none;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part2.vertex = true;
        var part3 = new mxCell('', new mxGeometry(50, 50, 300, 300), 'ellipse;html=1;strokeWidth=4;fillColor=#5D7F99;strokeColor=none;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part3.vertex = true;
        var part4 = new mxCell('', new mxGeometry(75, 75, 250, 250), 'ellipse;html=1;strokeWidth=4;fillColor=#BAC8D3;strokeColor=none;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part4.vertex = true;
        var part5 = new mxCell('', new mxGeometry(100, 100, 200, 200), 'ellipse;html=1;strokeWidth=4;fillColor=#FCE7CD;strokeColor=none;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part5.vertex = true;
        var part6 = new mxCell('', new mxGeometry(125, 125, 150, 150), 'ellipse;html=1;strokeWidth=4;fillColor=#F8C382;strokeColor=none;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;spacing=10;');
        part6.vertex = true;
        var part7 = new mxCell('Label', new mxGeometry(150, 150, 100, 100), 'ellipse;html=1;strokeWidth=4;fillColor=#F5AB50;strokeColor=none;shadow=0;fontSize=20;fontColor=#FFFFFF;align=center;fontStyle=1;whiteSpace=wrap;spacing=10;');
        part7.vertex = true;

        var ribbon1 = new mxCell('Label', new mxGeometry(200, 225, 300, 25), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=20;fillColor=#F5AB50;strokeColor=none;align=right;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;shadow=0;spacingRight=25;');
        ribbon1.vertex = true;
        var ribbon2 = new mxCell('Label', new mxGeometry(200, 250, 340, 25), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=20;fillColor=#F8C382;strokeColor=none;align=right;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;shadow=0;spacingRight=25;');
        ribbon2.vertex = true;
        var ribbon3 = new mxCell('Label', new mxGeometry(200, 275, 380, 25), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=20;fillColor=#FCE7CD;strokeColor=none;align=right;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;shadow=0;spacingRight=25;');
        ribbon3.vertex = true;
        var ribbon4 = new mxCell('Label', new mxGeometry(200, 300, 420, 25), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=20;fillColor=#BAC8D3;strokeColor=none;align=right;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;shadow=0;spacingRight=25;');
        ribbon4.vertex = true;
        var ribbon5 = new mxCell('Label', new mxGeometry(200, 325, 460, 25), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=20;fillColor=#5D7F99;strokeColor=none;align=right;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;shadow=0;spacingRight=25;');
        ribbon5.vertex = true;
        var ribbon6 = new mxCell('Label', new mxGeometry(200, 350, 500, 25), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=20;fillColor=#2F5B7C;strokeColor=none;align=right;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;shadow=0;spacingRight=25;');
        ribbon6.vertex = true;
        var ribbon7 = new mxCell('Label', new mxGeometry(200, 375, 540, 25), 'html=1;shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=20;fillColor=#23445D;strokeColor=none;align=right;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;shadow=0;spacingRight=25;');
        ribbon7.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, part6, part7, ribbon1, ribbon2, ribbon3, ribbon4, ribbon5, ribbon6, ribbon7], 740, 400, 'Roll');
      }),

      this.addEntry(dt + 'cylinder graph', function () {
        var part1 = new mxCell('', new mxGeometry(315, 160, 100, 25), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.cylinder;fillColor=#10739E;strokeColor=none;shadow=0;align=left;labelPosition=right;spacingLeft=10;fontStyle=1;fontColor=#10739E;');
        part1.vertex = true;
        var part2 = new mxCell('', new mxGeometry(315, 180, 100, 25), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.cylinder;fillColor=#F2931E;strokeColor=none;shadow=0;align=left;labelPosition=right;spacingLeft=10;fontStyle=1;fontColor=#F2931E;');
        part2.vertex = true;
        var part3 = new mxCell('', new mxGeometry(315, 200, 100, 25), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.cylinder;fillColor=#AE4132;strokeColor=none;shadow=0;align=left;labelPosition=right;spacingLeft=10;fontStyle=1;fontColor=#AE4132;');
        part3.vertex = true;
        var part4 = new mxCell('', new mxGeometry(315, 220, 100, 25), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.cylinder;fillColor=#23445D;strokeColor=none;shadow=0;align=left;labelPosition=right;spacingLeft=10;fontStyle=1;fontColor=#23445D;');
        part4.vertex = true;
        var part5 = new mxCell('', new mxGeometry(315, 240, 100, 25), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.cylinder;fillColor=#12AAB5;strokeColor=none;shadow=0;align=left;labelPosition=right;spacingLeft=10;fontStyle=1;fontColor=#12AAB5;');
        part5.vertex = true;

        var callout1 = new mxCell('Label', new mxGeometry(175, 0, 130, 160), 'strokeWidth=1;shadow=0;dashed=0;align=center;html=1;shape=mxgraph.mockup.text.callout;linkText=;textSize=17;textColor=#666666;callDir=NW;callStyle=line;fontSize=17;fontColor=#10739E;align=left;verticalAlign=top;strokeColor=#666666;fillColor=#4D9900;flipV=0;fontStyle=1;');
        callout1.vertex = true;
        var callout2 = new mxCell('Label', new mxGeometry(175, 80, 130, 110), 'strokeWidth=1;shadow=0;dashed=0;align=center;html=1;shape=mxgraph.mockup.text.callout;linkText=;textSize=17;textColor=#666666;callDir=NW;callStyle=line;fontSize=17;fontColor=#F2931E;align=left;verticalAlign=top;strokeColor=#666666;fillColor=#4D9900;flipV=0;fontStyle=1;');
        callout2.vertex = true;
        var callout3 = new mxCell('Label', new mxGeometry(175, 160, 130, 50), 'strokeWidth=1;shadow=0;dashed=0;align=center;html=1;shape=mxgraph.mockup.text.callout;linkText=;textSize=17;textColor=#666666;callDir=NW;callStyle=line;fontSize=17;fontColor=#AE4132;align=left;verticalAlign=top;strokeColor=#666666;fillColor=#4D9900;flipV=0;fontStyle=1;');
        callout3.vertex = true;
        var callout4 = new mxCell('Label', new mxGeometry(175, 230, 130, 50), 'strokeWidth=1;shadow=0;dashed=0;align=center;html=1;shape=mxgraph.mockup.text.callout;linkText=;textSize=17;textColor=#666666;callDir=SW;callStyle=line;fontSize=17;fontColor=#23445D;align=left;verticalAlign=bottom;strokeColor=#666666;fillColor=#4D9900;flipV=0;fontStyle=1;');
        callout4.vertex = true;
        var callout5 = new mxCell('Label', new mxGeometry(175, 250, 130, 120), 'strokeWidth=1;shadow=0;dashed=0;align=center;html=1;shape=mxgraph.mockup.text.callout;linkText=;textSize=17;textColor=#666666;callDir=SW;callStyle=line;fontSize=17;fontColor=#12AAB5;align=left;verticalAlign=bottom;strokeColor=#666666;fillColor=#4D9900;flipV=0;fontStyle=1;');
        callout5.vertex = true;

        var text1 = new mxCell(
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          new mxGeometry(0, 30, 240, 50), 'rounded=0;whiteSpace=wrap;shadow=0;strokeColor=none;strokeWidth=6;fillColor=none;fontSize=12;align=right;html=1;');
        text1.vertex = true;
        var text2 = new mxCell(
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          new mxGeometry(0, 110, 240, 50), 'rounded=0;whiteSpace=wrap;shadow=0;strokeColor=none;strokeWidth=6;fillColor=none;fontSize=12;align=right;html=1;');
        text2.vertex = true;
        var text3 = new mxCell(
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          new mxGeometry(0, 190, 240, 50), 'rounded=0;whiteSpace=wrap;shadow=0;strokeColor=none;strokeWidth=6;fillColor=none;fontSize=12;align=right;html=1;');
        text3.vertex = true;
        var text4 = new mxCell(
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          new mxGeometry(0, 290, 240, 50), 'rounded=0;whiteSpace=wrap;shadow=0;strokeColor=none;strokeWidth=6;fillColor=none;fontSize=12;align=right;html=1;');
        text4.vertex = true;
        var text5 = new mxCell(
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          new mxGeometry(0, 380, 240, 50), 'rounded=0;whiteSpace=wrap;shadow=0;strokeColor=none;strokeWidth=6;fillColor=none;fontSize=12;align=right;html=1;');
        text5.vertex = true;

        return sb.createVertexTemplateFromCells([part5, part4, part3, part2, part1, callout1, callout2, callout3, callout4, callout5, text1, text2, text3, text4, text5], 415, 430, 'Cylinder Graph');
      }),

      this.addEntry(dt + 'swirl', function () {
        var part1 = new mxCell('', new mxGeometry(0, 0, 300, 140), 'html=1;shadow=0;dashed=0;align=center;verticalAlign=middle;shape=mxgraph.arrows2.uTurnArrow;dy=22;arrowHead=70;dx2=35;strokeColor=#ffffff;fillColor=#10739E;fontSize=12;fontColor=#3333FF;flipH=1;flipV=1;strokeWidth=4;');
        part1.vertex = true;
        var part2 = new mxCell('', new mxGeometry(0, 79, 230, 140), 'html=1;shadow=0;dashed=0;align=center;verticalAlign=middle;shape=mxgraph.arrows2.uTurnArrow;dy=22;arrowHead=70;dx2=35;strokeColor=#ffffff;fillColor=#F2931E;fontSize=12;fontColor=#3333FF;flipV=1;strokeWidth=4;');
        part2.vertex = true;
        var part3 = new mxCell('', new mxGeometry(70, 158, 230, 140), 'html=1;shadow=0;dashed=0;align=center;verticalAlign=middle;shape=mxgraph.arrows2.uTurnArrow;dy=22;arrowHead=70;dx2=35;strokeColor=#ffffff;fillColor=#AE4132;fontSize=12;fontColor=#3333FF;flipH=1;flipV=1;strokeWidth=4;');
        part3.vertex = true;
        var part4 = new mxCell('', new mxGeometry(0, 237, 230, 140), 'html=1;shadow=0;dashed=0;align=center;verticalAlign=middle;shape=mxgraph.arrows2.uTurnArrow;dy=22;arrowHead=70;dx2=35;strokeColor=#ffffff;fillColor=#23445D;fontSize=12;fontColor=#3333FF;flipV=1;strokeWidth=4;');
        part4.vertex = true;
        var part5 = new mxCell('', new mxGeometry(70, 316, 230, 140), 'html=1;shadow=0;dashed=0;align=center;verticalAlign=middle;shape=mxgraph.arrows2.uTurnArrow;dy=22;arrowHead=70;dx2=35;strokeColor=#ffffff;fillColor=#12AAB5;fontSize=12;fontColor=#3333FF;flipH=1;flipV=1;strokeWidth=4;');
        part5.vertex = true;

        var text1 = new mxCell(
          '<b style="font-size: 7px">LABEL</b><br style="font-size: 7px">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          new mxGeometry(50, 0, 150, 40), 'rounded=0;whiteSpace=wrap;shadow=0;strokeColor=none;strokeWidth=6;fillColor=none;fontSize=7;fontColor=#FFFFFF;align=left;html=1;spacingLeft=5;');
        text1.vertex = true;
        var text2 = new mxCell(
          '<b style="font-size: 7px">LABEL</b><br style="font-size: 7px">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          new mxGeometry(50, 79, 150, 40), 'rounded=0;whiteSpace=wrap;shadow=0;strokeColor=none;strokeWidth=6;fillColor=none;fontSize=7;fontColor=#FFFFFF;align=left;html=1;spacingLeft=5;');
        text2.vertex = true;
        var text3 = new mxCell(
          '<b style="font-size: 7px">LABEL</b><br style="font-size: 7px">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          new mxGeometry(100, 158, 150, 40), 'rounded=0;whiteSpace=wrap;shadow=0;strokeColor=none;strokeWidth=6;fillColor=none;fontSize=7;fontColor=#FFFFFF;align=left;html=1;spacingLeft=5;');
        text3.vertex = true;
        var text4 = new mxCell(
          '<b style="font-size: 7px">LABEL</b><br style="font-size: 7px">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          new mxGeometry(50, 237, 150, 40), 'rounded=0;whiteSpace=wrap;shadow=0;strokeColor=none;strokeWidth=6;fillColor=none;fontSize=7;fontColor=#FFFFFF;align=left;html=1;spacingLeft=5;');
        text4.vertex = true;
        var text5 = new mxCell(
          '<b style="font-size: 7px">LABEL</b><br style="font-size: 7px">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          new mxGeometry(100, 316, 150, 40), 'rounded=0;whiteSpace=wrap;shadow=0;strokeColor=none;strokeWidth=6;fillColor=none;fontSize=7;fontColor=#FFFFFF;align=left;html=1;spacingLeft=5;');
        text5.vertex = true;

        return sb.createVertexTemplateFromCells([part5, part4, part3, part2, part1, text1, text2, text3, text4, text5], 300, 456, 'Swirl');
      }),

      this.addEntry(dt + 'swirl', function () {
        var part1 = new mxCell('Label', new mxGeometry(60, 0, 120, 15), 'shape=manualInput;whiteSpace=wrap;html=1;shadow=0;fillColor=#10739E;strokeColor=none;fontSize=12;fontColor=#FFFFFF;align=center;direction=north;flipV=1;rounded=0;');
        part1.vertex = true;
        var part2 = new mxCell('Label', new mxGeometry(30, 15, 150, 15), 'shape=manualInput;whiteSpace=wrap;html=1;shadow=0;fillColor=#F2931E;strokeColor=none;fontSize=12;fontColor=#FFFFFF;align=center;direction=north;flipV=1;rounded=0;');
        part2.vertex = true;
        var part3 = new mxCell('Label', new mxGeometry(0, 30, 180, 15), 'shape=manualInput;whiteSpace=wrap;html=1;shadow=0;fillColor=#AE4132;strokeColor=none;fontSize=12;fontColor=#FFFFFF;align=center;direction=north;flipV=1;rounded=0;');
        part3.vertex = true;

        var arc1 = new mxCell('', new mxGeometry(114, 0, 130, 130), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.basic.partConcEllipse;fillColor=#10739E;strokeColor=none;startAngle=0;endAngle=0.5;arcWidth=0.23;shadow=0;fontSize=7;fontColor=#FFFFFF;align=left;');
        arc1.vertex = true;
        var arc2 = new mxCell('', new mxGeometry(129, 15, 100, 100), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.basic.partConcEllipse;fillColor=#F2931E;strokeColor=none;startAngle=0;endAngle=0.5;arcWidth=0.3;shadow=0;fontSize=7;fontColor=#FFFFFF;align=left;');
        arc2.vertex = true;
        var arc3 = new mxCell('', new mxGeometry(144, 30, 70, 70), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.basic.partConcEllipse;fillColor=#AE4132;strokeColor=none;startAngle=0;endAngle=0.5;arcWidth=0.43;shadow=0;fontSize=7;fontColor=#FFFFFF;align=left;');
        arc3.vertex = true;

        var arc4 = new mxCell('', new mxGeometry(115, 85, 130, 130), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.basic.partConcEllipse;fillColor=#AE4132;strokeColor=none;startAngle=0.5;endAngle=0.00001;arcWidth=0.23;shadow=0;fontSize=7;fontColor=#FFFFFF;align=left;');
        arc4.vertex = true;
        var arc5 = new mxCell('', new mxGeometry(130, 100, 100, 100), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.basic.partConcEllipse;fillColor=#F2931E;strokeColor=none;startAngle=0.5;endAngle=0.00001;arcWidth=0.3;shadow=0;fontSize=7;fontColor=#FFFFFF;align=left;');
        arc5.vertex = true;
        var arc6 = new mxCell('', new mxGeometry(145, 115, 70, 70), 'verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.basic.partConcEllipse;fillColor=#10739E;strokeColor=none;startAngle=0.5;endAngle=0.00001;arcWidth=0.43;shadow=0;fontSize=7;fontColor=#FFFFFF;align=left;');
        arc6.vertex = true;

        var part4 = new mxCell('', new mxGeometry(179, 170, 181, 15), 'shape=manualInput;whiteSpace=wrap;html=1;shadow=0;fillColor=#10739E;strokeColor=none;fontSize=12;fontColor=#FFFFFF;align=center;direction=north;flipH=1;rounded=0;');
        part4.vertex = true;
        var part5 = new mxCell('', new mxGeometry(179, 185, 151, 15), 'shape=manualInput;whiteSpace=wrap;html=1;shadow=0;fillColor=#F2931E;strokeColor=none;fontSize=12;fontColor=#FFFFFF;align=center;direction=north;flipH=1;rounded=0;');
        part5.vertex = true;
        var part6 = new mxCell('', new mxGeometry(179, 200, 121, 15), 'shape=manualInput;whiteSpace=wrap;html=1;shadow=0;fillColor=#AE4132;strokeColor=none;fontSize=12;fontColor=#FFFFFF;align=center;direction=north;flipH=1;rounded=0;');
        part6.vertex = true;

        var marker1 = new mxCell('1', new mxGeometry(0, 60, 30, 30), 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;shadow=0;strokeColor=none;fillColor=#10739E;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;rounded=0;');
        marker1.vertex = true;
        var marker2 = new mxCell('2', new mxGeometry(40, 60, 30, 30), 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;shadow=0;strokeColor=none;fillColor=#F2931E;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;rounded=0;');
        marker2.vertex = true;
        var marker3 = new mxCell('3', new mxGeometry(80, 60, 30, 30), 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;shadow=0;strokeColor=none;fillColor=#AE4132;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;rounded=0;');
        marker3.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, arc1, arc2, arc3, arc4, arc5, arc6, part4, part5, part6, marker1, marker2, marker3], 360, 215, 'Swirl');
      }),

      this.addEntry(dt + 'callout', function () {
        var edge1 = new mxCell('Label', new mxGeometry(0, 0, 0, 0), 'endArrow=oval;html=1;fontSize=16;fontColor=#10739E;endFill=0;endSize=24;strokeWidth=5;labelBackgroundColor=none;verticalAlign=top;fontStyle=1;strokeColor=#10739E;');
        edge1.geometry.setTerminalPoint(new mxPoint(0, 100), true);
        edge1.geometry.setTerminalPoint(new mxPoint(100, 0), false);
        edge1.geometry.x = -1;
        edge1.geometry.relative = true;
        edge1.edge = true;

        return sb.createVertexTemplateFromCells([edge1], 100, 100, 'Callout');
      }),

      this.addEntry(dt + 'roadmap vertical', function () {
        var startPoint = new mxCell('', new mxGeometry(234, 0, 12, 12), 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;shadow=0;fillColor=none;strokeColor=#333333;fontSize=16;align=center;strokeWidth=2;');
        startPoint.vertex = true;
        var endPoint = new mxCell('', new mxGeometry(234, 498, 12, 12), 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;shadow=0;fillColor=none;strokeColor=#333333;fontSize=16;align=center;strokeWidth=2;');
        endPoint.vertex = true;

        var edge1 = new mxCell('', new mxGeometry(0, 0, 0, 0), 'endArrow=none;html=1;strokeWidth=3;strokeColor=#CCCCCC;labelBackgroundColor=none;fontSize=16');
        edge1.geometry.relative = true;
        edge1.edge = true;
        startPoint.insertEdge(edge1, true);
        endPoint.insertEdge(edge1, false);

        var item1 = new mxCell('', new mxGeometry(0, 30, 246, 60), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.circularCallout2;dy=15;strokeColor=#10739E;labelPosition=center;align=center;fontColor=#10739E;fontStyle=1;fontSize=24;shadow=0;direction=north;');
        item1.vertex = true;
        var item2 = new mxCell('', new mxGeometry(234, 100, 246, 60), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.circularCallout2;dy=15;strokeColor=#F2931E;labelPosition=center;align=center;fontColor=#F2931E;fontStyle=1;fontSize=24;shadow=0;direction=north;flipH=1;');
        item2.vertex = true;
        var item3 = new mxCell('', new mxGeometry(0, 170, 246, 60), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.circularCallout2;dy=15;strokeColor=#AE4132;labelPosition=center;align=center;fontColor=#10739E;fontStyle=1;fontSize=24;shadow=0;direction=north;');
        item3.vertex = true;
        var item4 = new mxCell('', new mxGeometry(234, 240, 246, 60), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.circularCallout2;dy=15;strokeColor=#23445D;labelPosition=center;align=center;fontColor=#10739E;fontStyle=1;fontSize=24;shadow=0;direction=north;flipH=1;');
        item4.vertex = true;
        var item5 = new mxCell('', new mxGeometry(0, 310, 246, 60), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.circularCallout2;dy=15;strokeColor=#12AAB5;labelPosition=center;align=center;fontColor=#10739E;fontStyle=1;fontSize=24;shadow=0;direction=north;');
        item5.vertex = true;
        var item6 = new mxCell('', new mxGeometry(234, 380, 246, 60), 'verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=mxgraph.infographic.circularCallout2;dy=15;strokeColor=#56517E;labelPosition=center;align=center;fontColor=#10739E;fontStyle=1;fontSize=24;shadow=0;direction=north;flipH=1;');
        item6.vertex = true;

        var label1 = new mxCell('Label', new mxGeometry(70, 20, 160, 30), 'fillColor=#10739E;strokecolor=none;rounded=1;fontColor=#FFFFFF;strokeColor=none;fontStyle=1;fontSize=14;whiteSpace=wrap;html=1;');
        label1.vertex = true;
        var label2 = new mxCell('Label', new mxGeometry(250, 85, 160, 30), 'fillColor=#F2931E;strokecolor=none;rounded=1;fontColor=#FFFFFF;strokeColor=none;fontStyle=1;fontSize=14;whiteSpace=wrap;html=1;');
        label2.vertex = true;
        var label3 = new mxCell('Label', new mxGeometry(70, 160, 160, 30), 'fillColor=#AE4132;strokecolor=none;rounded=1;fontColor=#FFFFFF;strokeColor=none;fontStyle=1;fontSize=14;whiteSpace=wrap;html=1;');
        label3.vertex = true;
        var label4 = new mxCell('Label', new mxGeometry(250, 225, 160, 30), 'fillColor=#23445D;strokecolor=none;rounded=1;fontColor=#FFFFFF;strokeColor=none;fontStyle=1;fontSize=14;whiteSpace=wrap;html=1;');
        label4.vertex = true;
        var label5 = new mxCell('Label', new mxGeometry(70, 300, 160, 30), 'fillColor=#12AAB5;strokecolor=none;rounded=1;fontColor=#FFFFFF;strokeColor=none;fontStyle=1;fontSize=14;whiteSpace=wrap;html=1;');
        label5.vertex = true;
        var label6 = new mxCell('Label', new mxGeometry(250, 365, 160, 30), 'fillColor=#56517E;strokecolor=none;rounded=1;fontColor=#FFFFFF;strokeColor=none;fontStyle=1;fontSize=14;whiteSpace=wrap;html=1;');
        label6.vertex = true;

        var label7 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#10739E"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(70, 70, 160, 70), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label7.vertex = true;
        var label8 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#F2931E"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(250, 140, 160, 70), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label8.vertex = true;
        var label9 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#AE4132"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(70, 210, 160, 70), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label9.vertex = true;
        var label10 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#23445D"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(250, 280, 160, 70), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label10.vertex = true;
        var label11 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#12AAB5"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(70, 350, 160, 70), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label11.vertex = true;
        var label12 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#56517E"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(250, 420, 160, 70), 'rounded=1;strokeColor=none;fillColor=#EEEEEE;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label12.vertex = true;
        return sb.createVertexTemplateFromCells(
          [edge1, startPoint, endPoint, item1, item2, item3, item4, item5, item6, label1, label2, label3, label4, label5, label6, label7, label8, label9, label10, label11, label12],
          480, 510, 'Roadmap (vertical)');
      }),

      this.addEntry(dt + 'roadmap horizontal', function () {
        var part1 = new mxCell('', new mxGeometry(0, 90, 840, 30), 'fillColor=#dddddd;rounded=0;strokeColor=none;');
        part1.vertex = true;
        var part2 = new mxCell('Label', new mxGeometry(40, 80, 120, 50), 'shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=10;notch=0;html=1;fillColor=#10739E;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;whiteSpace=wrap;');
        part2.vertex = true;
        var part3 = new mxCell('Label', new mxGeometry(200, 80, 120, 50), 'shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=10;notch=0;html=1;fillColor=#F2931E;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;whiteSpace=wrap;');
        part3.vertex = true;
        var part4 = new mxCell('Label', new mxGeometry(360, 80, 120, 50), 'shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=10;notch=0;html=1;fillColor=#AE4132;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;whiteSpace=wrap;');
        part4.vertex = true;
        var part5 = new mxCell('Label', new mxGeometry(520, 80, 120, 50), 'shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=10;notch=0;html=1;fillColor=#23445D;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;whiteSpace=wrap;');
        part5.vertex = true;
        var part6 = new mxCell('Label', new mxGeometry(680, 80, 120, 50), 'shape=mxgraph.infographic.ribbonSimple;notch1=0;notch2=10;notch=0;html=1;fillColor=#12AAB5;strokeColor=none;shadow=0;fontSize=17;fontColor=#FFFFFF;align=left;spacingLeft=10;fontStyle=1;whiteSpace=wrap;');
        part6.vertex = true;

        var label1 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#10739E"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(0, 0, 200, 70), 'rounded=1;strokeColor=none;fillColor=#DDDDDD;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label1.vertex = true;

        var label2 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#F2931E"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(160, 140, 200, 70), 'rounded=1;strokeColor=none;fillColor=#DDDDDD;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label2.vertex = true;

        var label3 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#AE4132"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(320, 0, 200, 70), 'rounded=1;strokeColor=none;fillColor=#DDDDDD;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label3.vertex = true;

        var label4 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#23445D"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(480, 140, 200, 70), 'rounded=1;strokeColor=none;fillColor=#DDDDDD;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label4.vertex = true;

        var label5 = new mxCell('<font style="font-size: 10px"><font style="font-size: 12px" color="#12AAB5"><b>Label</b></font><br><br><font size="1">' +
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit</font></font>',
          new mxGeometry(640, 0, 200, 70), 'rounded=1;strokeColor=none;fillColor=#DDDDDD;align=center;arcSize=12;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=12;');
        label5.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4, part5, part6, label1, label2, label3, label4, label5], 840, 210, 'Roadmap (horizontal)');
      }),

      this.addEntry(dt + 'flower', function () {
        var part1 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(0, 0, 150, 150), 'shape=mxgraph.basic.diag_round_rect;dx=37;flipH=1;html=1;fillColor=#10739E;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;strokeWidth=8;');
        part1.vertex = true;
        var part2 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(160, 0, 150, 150), 'shape=mxgraph.basic.diag_round_rect;dx=37;html=1;fillColor=#F2931E;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;strokeWidth=8;');
        part2.vertex = true;
        var part3 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(0, 160, 150, 150), 'shape=mxgraph.basic.diag_round_rect;dx=37;flipH=1;flipV=1;html=1;fillColor=#AE4132;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;strokeWidth=8;');
        part3.vertex = true;
        var part4 = new mxCell('Lorem ipsum dolor sit amet, consectetur adipisicing elit', new mxGeometry(160, 160, 150, 150), 'shape=mxgraph.basic.diag_round_rect;dx=37;flipV=1;html=1;fillColor=#23445D;strokeColor=none;shadow=0;fontSize=12;fontColor=#FFFFFF;align=center;fontStyle=0;whiteSpace=wrap;strokeWidth=8;');
        part4.vertex = true;

        return sb.createVertexTemplateFromCells([part1, part2, part3, part4], 310, 310, 'Flower');
      })
    ]);
  };

  Sidebar.prototype.addCabinetsPalette = function () {
    var s = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=bottom;dashed=0;shadow=0;html=1;align=center;' + mxConstants.STYLE_VERTICAL_ALIGN + '=top;shape=mxgraph.cabinets.';
    var s2 = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=middle;dashed=0;shadow=0;html=1;shape=mxgraph.cabinets.';
    var inh = 'strokeColor=inherit;fillColor=inherit;gradientColor=inherit;';
    var w = 50;
    var h = 50;
    var gn = 'mxgraph.cabinets';
    var dt = 'cabinet ';
    var sb = this;

    var fns = [
      this.createVertexTemplateEntry(s + 'cabinet;hasStand=1',
        w * 5, h * 10, '', 'Cabinet', null, null, this.getTagsForStencil(gn, 'cabinet', dt).join(' ')),
      this.createVertexTemplateEntry(s2 + 'dimension;verticalAlign=top;align=center;',
        w * 5, 40, '100', 'Dimension', null, null, this.getTagsForStencil(gn, 'dimension', dt).join(' ')),
      this.createVertexTemplateEntry(s2 + 'dimensionBottom;verticalAlign=bottom;align=center;',
        w * 5, 40, '100', 'Dimension', null, null, this.getTagsForStencil(gn, 'dimensionBottom', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'coverPlate',
        w * 4.4, h * 2.5, '', 'Cover Plate', null, null, this.getTagsForStencil(gn, 'coverPlate', dt).join(' ')),
      this.createVertexTemplateEntry('shape=rect;dashed=0;shadow=0;html=1;whiteSpace=wrap;',
        w * 4.4, h * 0.25, '25x40', 'Panel Wiring System 25x40mm', null, null, this.getTagsForStencil(gn, '', dt + 'panel wiring system').join(' ')),
      this.createVertexTemplateEntry('shape=rect;dashed=0;shadow=0;html=1;whiteSpace=wrap;',
        w * 4.4, h * 0.4, '40x40', 'Panel Wiring System 40x40mm', null, null, this.getTagsForStencil(gn, '', dt + 'panel wiring system').join(' ')),
      this.createVertexTemplateEntry('shape=rect;dashed=0;shadow=0;html=1;whiteSpace=wrap;',
        w * 4.4, h * 0.6, '60x40', 'Panel Wiring System 60x40mm', null, null, this.getTagsForStencil(gn, '', dt + 'panel wiring system').join(' ')),
      this.createVertexTemplateEntry('shape=rect;dashed=0;shadow=0;html=1;whiteSpace=wrap;',
        w * 4.4, h * 0.8, '80x40', 'Panel Wiring System 80x40mm', null, null, this.getTagsForStencil(gn, '', dt + 'panel wiring system').join(' ')),
      this.createVertexTemplateEntry('shape=rect;dashed=0;shadow=0;html=1;whiteSpace=wrap;',
        w * 4.4, h, '100x40', 'Panel Wiring System 100x40mm', null, null, this.getTagsForStencil(gn, '', dt + 'panel wiring system').join(' ')),
      this.createVertexTemplateEntry('shape=rect;dashed=0;shadow=0;html=1;whiteSpace=wrap;direction=south;horizontal=0;',
        w * 0.25, h * 7, '25x40', 'Panel Wiring System 25x40mm (Vertical)', null, null, this.getTagsForStencil(gn, '', dt + 'panel wiring system').join(' ')),
      this.createVertexTemplateEntry('shape=rect;dashed=0;shadow=0;html=1;whiteSpace=wrap;direction=south;horizontal=0;',
        w * 0.4, h * 7, '40x40', 'Panel Wiring System 40x40mm (Vertical)', null, null, this.getTagsForStencil(gn, '', dt + 'panel wiring system').join(' ')),
      this.createVertexTemplateEntry('shape=rect;dashed=0;shadow=0;html=1;whiteSpace=wrap;direction=south;horizontal=0;',
        w * 0.6, h * 7, '60x40', 'Panel Wiring System 60x40mm (Vertical)', null, null, this.getTagsForStencil(gn, '', dt + 'panel wiring system').join(' ')),
      this.createVertexTemplateEntry('shape=rect;dashed=0;shadow=0;html=1;whiteSpace=wrap;direction=south;horizontal=0;',
        w * 0.8, h * 7, '80x40', 'Panel Wiring System 80x40mm (Vertical)', null, null, this.getTagsForStencil(gn, '', dt + 'panel wiring system').join(' ')),
      this.createVertexTemplateEntry('shape=rect;dashed=0;shadow=0;html=1;whiteSpace=wrap;direction=south;horizontal=0;',
        w, h * 7, '100x40', 'Panel Wiring System 100x40mm (Vertical)', null, null, this.getTagsForStencil(gn, '', dt + 'panel wiring system').join(' ')),
      this.createVertexTemplateEntry(s + 'cb_1p;',
        w * 0.18, h, '', 'Circuit Breaker (1P)', null, null, this.getTagsForStencil(gn, 'cb_1p', dt).join(' ')),

      this.addEntry(dt + 'circuit breaker row', function () {
        var bg1 = new mxCell('', new mxGeometry(0, 0, w * 0.18, h), s + 'cb_1p;');
        bg1.vertex = true;
        var bg2 = new mxCell('', new mxGeometry(w * 0.18, 0, w * 0.18, h), s + 'cb_1p;');
        bg2.vertex = true;
        var bg3 = new mxCell('', new mxGeometry(w * 0.36, 0, w * 0.18, h), s + 'cb_1p;');
        bg3.vertex = true;
        var bg4 = new mxCell('', new mxGeometry(w * 0.54, 0, w * 0.18, h), s + 'cb_1p;');
        bg4.vertex = true;
        var bg5 = new mxCell('', new mxGeometry(w * 0.72, 0, w * 0.18, h), s + 'cb_1p;');
        bg5.vertex = true;
        var bg6 = new mxCell('', new mxGeometry(w * 0.9, 0, w * 0.18, h), s + 'cb_1p;');
        bg6.vertex = true;
        var bg7 = new mxCell('', new mxGeometry(w * 1.08, 0, w * 0.18, h), s + 'cb_1p;');
        bg7.vertex = true;
        var bg8 = new mxCell('', new mxGeometry(w * 1.26, 0, w * 0.18, h), s + 'cb_1p;');
        bg8.vertex = true;
        var bg9 = new mxCell('', new mxGeometry(w * 1.44, 0, w * 0.18, h), s + 'cb_1p;');
        bg9.vertex = true;
        var bg10 = new mxCell('', new mxGeometry(w * 1.62, 0, w * 0.18, h), s + 'cb_1p;');
        bg10.vertex = true;

        return sb.createVertexTemplateFromCells([bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8, bg9, bg10], w * 1.8, h, 'Circuit Breaker (1P x 10)');
      }),

      this.createVertexTemplateEntry(s + 'cb_2p;', w * 0.36, h, '', 'Circuit Breaker (2P)', null, null, this.getTagsForStencil(gn, 'cb_2p', dt).join(' ')),

      this.addEntry(dt + 'circuit breaker row', function () {
        var bg1 = new mxCell('', new mxGeometry(0, 0, w * 0.36, h), s + 'cb_2p;');
        bg1.vertex = true;
        var bg2 = new mxCell('', new mxGeometry(w * 0.36, 0, w * 0.36, h), s + 'cb_2p;');
        bg2.vertex = true;
        var bg3 = new mxCell('', new mxGeometry(w * 0.72, 0, w * 0.36, h), s + 'cb_2p;');
        bg3.vertex = true;
        var bg4 = new mxCell('', new mxGeometry(w * 1.08, 0, w * 0.36, h), s + 'cb_2p;');
        bg4.vertex = true;
        var bg5 = new mxCell('', new mxGeometry(w * 1.44, 0, w * 0.36, h), s + 'cb_2p;');
        bg5.vertex = true;
        var bg6 = new mxCell('', new mxGeometry(w * 1.8, 0, w * 0.36, h), s + 'cb_2p;');
        bg6.vertex = true;
        var bg7 = new mxCell('', new mxGeometry(w * 2.16, 0, w * 0.36, h), s + 'cb_2p;');
        bg7.vertex = true;
        var bg8 = new mxCell('', new mxGeometry(w * 2.52, 0, w * 0.36, h), s + 'cb_2p;');
        bg8.vertex = true;
        var bg9 = new mxCell('', new mxGeometry(w * 2.88, 0, w * 0.36, h), s + 'cb_2p;');
        bg9.vertex = true;
        var bg10 = new mxCell('', new mxGeometry(w * 3.24, 0, w * 0.36, h), s + 'cb_2p;');
        bg10.vertex = true;

        return sb.createVertexTemplateFromCells([bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8, bg9, bg10], w * 3.6, h, 'Circuit Breaker (2P x 10)');
      }),

      this.createVertexTemplateEntry(s + 'cb_3p;', w * 0.54, h, '', 'Circuit Breaker (3P)', null, null, this.getTagsForStencil(gn, 'cb_3p', dt).join(' ')),

      this.addEntry(dt + 'circuit breaker row', function () {
        var bg1 = new mxCell('', new mxGeometry(0, 0, w * 0.54, h), s + 'cb_3p;');
        bg1.vertex = true;
        var bg2 = new mxCell('', new mxGeometry(w * 0.54, 0, w * 0.54, h), s + 'cb_3p;');
        bg2.vertex = true;
        var bg3 = new mxCell('', new mxGeometry(w * 1.08, 0, w * 0.54, h), s + 'cb_3p;');
        bg3.vertex = true;
        var bg4 = new mxCell('', new mxGeometry(w * 1.62, 0, w * 0.54, h), s + 'cb_3p;');
        bg4.vertex = true;
        var bg5 = new mxCell('', new mxGeometry(w * 2.16, 0, w * 0.54, h), s + 'cb_3p;');
        bg5.vertex = true;

        return sb.createVertexTemplateFromCells([bg1, bg2, bg3, bg4, bg5], w * 2.7, h, 'Circuit Breaker (3P x 5)');
      }),

      this.createVertexTemplateEntry(s + 'cb_4p;', w * 0.72, h, '', 'Circuit Breaker (4P)', null, null, this.getTagsForStencil(gn, 'cb_4p', dt).join(' ')),

      this.addEntry(dt + 'circuit breaker row', function () {
        var bg1 = new mxCell('', new mxGeometry(0, 0, w * 0.72, h), s + 'cb_4p;');
        bg1.vertex = true;
        var bg2 = new mxCell('', new mxGeometry(w * 0.72, 0, w * 0.72, h), s + 'cb_4p;');
        bg2.vertex = true;
        var bg3 = new mxCell('', new mxGeometry(w * 1.44, 0, w * 0.72, h), s + 'cb_4p;');
        bg3.vertex = true;
        var bg4 = new mxCell('', new mxGeometry(w * 2.16, 0, w * 0.72, h), s + 'cb_4p;');
        bg4.vertex = true;
        var bg5 = new mxCell('', new mxGeometry(w * 2.88, 0, w * 0.72, h), s + 'cb_4p;');
        bg5.vertex = true;

        return sb.createVertexTemplateFromCells([bg1, bg2, bg3, bg4, bg5], w * 3.6, h, 'Circuit Breaker (4P x 5)');
      }),

      this.createVertexTemplateEntry(s + 'cb_auxiliary_contact;',
        w * 0.09, h, '', 'Auxiliary Contact (Circuit Breaker)', null, null, this.getTagsForStencil(gn, 'cb_auxiliary_contact', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'contactor_1_32a;',
        w * 0.54, h * 0.86, '', 'Contactor (1-32A)', null, null, this.getTagsForStencil(gn, 'contactor_1_32a', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'auxiliary_contact_contactor_1_32a;',
        w * 0.09, h * 0.86, '', 'Auxiliary Contact (Contactor 1-32A)', null, null, this.getTagsForStencil(gn, 'auxiliary_contact_contactor_1_32a', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'contactor_32_125a;',
        w * 0.6, h, '', 'Contactor 32 to 125A', null, null, this.getTagsForStencil(gn, 'contactor_32_125a', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'auxiliary_contact_contactor_32_125a;',
        w * 0.09, h, '', 'Auxiliary Contact (Contactor 32-125A)', null, null, this.getTagsForStencil(gn, 'auxiliary_contact_contactor_32_125a', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'contactor_125_400a;',
        w * 1.1, h * 1.8, '', 'Contactor 125 to 400A', null, null, this.getTagsForStencil(gn, 'contactor_125_400a', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'distribution_block_4p_125a_11_connections;',
        w * 2, h * 1.2, '', 'Distribution Block 4P 125A 11 Connections', null, null, this.getTagsForStencil(gn, 'distribution_block_4p_125a_11_connections', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'distribution_block_4p_125a_11_connections_2;',
        w * 2, h, '', 'Distribution Block 4P 125A 11 Connections', null, null, this.getTagsForStencil(gn, 'distribution_block_4p_125a_11_connections_2', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'mccb_25_63a_3p;',
        w * 1.2, h * 1.8, '', 'MCCB 25-63A 3P', null, null, this.getTagsForStencil(gn, 'mccb_25_63a_3p', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'mccb_25_63a_4p;',
        w * 1.6, h * 1.8, '', 'MCCB 25-63A 4P', null, null, this.getTagsForStencil(gn, 'mccb_25_63a_4p', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'mccb_63_250a_3p;',
        w * 1.4, h * 2.1, '', 'MCCB 63-250A 3P', null, null, this.getTagsForStencil(gn, 'mccb_63_250a_3p', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'mccb_63_250a_4p;',
        w * 1.9, h * 2.1, '', 'MCCB 63-250A 4P', null, null, this.getTagsForStencil(gn, 'mccb_63_250a_4p', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'motorized_switch_3p;',
        w * 1.7, h * 1.4, '', 'Motorized Switch 3P', null, null, this.getTagsForStencil(gn, 'motorized_switch_3p', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'motorized_switch_4p;',
        w * 2, h * 1.4, '', 'Motorized Switch 4P', null, null, this.getTagsForStencil(gn, 'motorized_switch_4p', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'motor_cb_1_32a;',
        w * 0.54, h * 0.86, '', 'Motor Circuit Breaker 1-32A', null, null, this.getTagsForStencil(gn, 'motor_cb_1_32a', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'motor_cb_32_125a;',
        w * 0.6, h, '', 'Motor Circuit Breaker 32-125A', null, null, this.getTagsForStencil(gn, 'motor_cb_32_125a', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'motor_cb_125_400a;',
        w * 1.1, h * 1.8, '', 'Motor Circuit Breaker 125-400A', null, null, this.getTagsForStencil(gn, 'motor_cb_125_400a', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'motor_protection_cb;',
        w * 0.54, h, '', 'Motor Protection CB', null, null, this.getTagsForStencil(gn, 'motor_protection_cb', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'motor_starter_1_32a;',
        w * 0.54, h * 0.86, '', 'Motor Circuit Breaker 1-32A', null, null, this.getTagsForStencil(gn, 'motor_starter_1_32a', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'motor_starter_32_125a;',
        w * 0.6, h, '', 'Motor Circuit Breaker 32-125A', null, null, this.getTagsForStencil(gn, 'motor_starter_32_125a', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'motor_starter_125_400a;',
        w * 1.1, h * 1.8, '', 'Motor Circuit Breaker 125-400A', null, null, this.getTagsForStencil(gn, 'motor_starter_125_400a', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'overcurrent_relay_1_32a;',
        w * 0.54, h * 0.3, '', 'Overcurrent Relay 1-32A', null, null, this.getTagsForStencil(gn, 'overcurrent_relay_1_32a', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'overcurrent_relay_32_125a;',
        w * 0.6, h * 0.33, '', 'Overcurrent Relay 32-125A', null, null, this.getTagsForStencil(gn, 'overcurrent_relay_32_125a', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'overcurrent_relay_125_400a;',
        w * 1.1, h * 0.6, '', 'Overcurrent Relay 125-400A', null, null, this.getTagsForStencil(gn, 'overcurrent_relay_125_400a', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'plugin_relay_1;',
        w * 0.06, h * 0.8, '', 'Plugin Relay', null, null, this.getTagsForStencil(gn, 'plugin_relay_1', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'plugin_relay_2;',
        w * 0.24, h * 0.8, '', 'Plugin Relay', null, null, this.getTagsForStencil(gn, 'plugin_relay_2', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'din_rail;',
        w * 10, h * 0.5, '', 'DIN Rail', null, null, this.getTagsForStencil(gn, 'din_rail', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'residual_current_device_2p;',
        w * 0.36, h, '', 'Residual Current Device 2p', null, null, this.getTagsForStencil(gn, 'residual_current_device_2p', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'residual_current_device_4p;',
        w * 0.72, h, '', 'Residual Current Device 4p', null, null, this.getTagsForStencil(gn, 'residual_current_device_4p', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'surge_protection_1p;',
        w * 0.18, h, '', 'Surge Protection 1p', null, null, this.getTagsForStencil(gn, 'surge_protection_1p', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'surge_protection_2p;',
        w * 0.36, h, '', 'Surge Protection 2p', null, null, this.getTagsForStencil(gn, 'surge_protection_2p', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'surge_protection_3p;',
        w * 0.54, h, '', 'Surge Protection 3p', null, null, this.getTagsForStencil(gn, 'surge_protection_3p', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'surge_protection_4p;',
        w * 0.72, h, '', 'Surge Protection 4p', null, null, this.getTagsForStencil(gn, 'surge_protection_4p', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'terminal_4mm2;',
        w * 0.05, h * 0.5, '', 'Terminal 4mm2', null, null, this.getTagsForStencil(gn, 'terminal_4mm2', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'terminal_4mm2_x10;',
        w * 0.5, h * 0.5, '', 'Terminal 4mm2 x10', null, null, this.getTagsForStencil(gn, 'terminal_4mm2_x10', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'terminal_4_6mm2;',
        w * 0.05, h * 0.6, '', 'Terminal 4-6mm2', null, null, this.getTagsForStencil(gn, 'terminal_4_6mm2', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'terminal_4_6mm2_x10;',
        w * 0.5, h * 0.6, '', 'Terminal 4-6mm2 x10', null, null, this.getTagsForStencil(gn, 'terminal_4_6mm2_x10', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'terminal_6_25mm2;',
        w * 0.1, h * 0.75, '', 'Terminal 6-25mm2', null, null, this.getTagsForStencil(gn, 'terminal_6_25mm2', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'terminal_6_25mm2_x10;',
        w, h * 0.75, '', 'Terminal 6-25mm2 x10', null, null, this.getTagsForStencil(gn, 'terminal_6_25mm2_x10', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'terminal_40mm2;',
        w * 0.22, h, '', 'Terminal 40mm2', null, null, this.getTagsForStencil(gn, 'terminal_40mm2', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'terminal_40mm2_x10;',
        w * 2.2, h, '', 'Terminal 40mm2 x10', null, null, this.getTagsForStencil(gn, 'terminal_40mm2_x10', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'terminal_50mm2;',
        w * 0.25, h * 1.1, '', 'Terminal 50mm2', null, null, this.getTagsForStencil(gn, 'terminal_50mm2', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'terminal_50mm2_x10;',
        w * 2.5, h * 1.1, '', 'Terminal 50mm2 x10', null, null, this.getTagsForStencil(gn, 'terminal_50mm2_x10', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'terminal_75mm2;',
        w * 0.3, h * 1.4, '', 'Terminal 75mm2', null, null, this.getTagsForStencil(gn, 'terminal_75mm2', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'terminal_75mm2_x10;',
        w * 3, h * 1.4, '', 'Terminal 75mm2 x10', null, null, this.getTagsForStencil(gn, 'terminal_75mm2_x10', dt).join(' '))
    ];

    this.addPalette('cabinets', mxResources.get('cabinets'), false, mxUtils.bind(this, function (content) {
      for (var i = 0; i < fns.length; i++) {
        content.appendChild(fns[i](content));
      }
    }));
  };

  Sidebar.prototype.addFloorplanPalette = function () {
    var sb = this;
    var w = 100;
    var h = 100;
    var s = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=bottom;html=1;' + mxConstants.STYLE_VERTICAL_ALIGN + '=top;align=center;shape=mxgraph.floorplan.';
    var s2 = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=center;html=1;' + mxConstants.STYLE_VERTICAL_ALIGN + '=top;align=center;shape=mxgraph.floorplan.';
    var gn = 'mxgraph.floorplan';
    var dt = 'floorplan ';
    var fns = [
      this.createVertexTemplateEntry(s + 'wall;fillColor=strokeColor;',
        w, 10, '', 'Wall (Horizontal)', null, null, this.getTagsForStencil(gn, 'wall', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'wall;fillColor=strokeColor;direction=south;',
        10, h, '', 'Wall (Vertical)', null, null, this.getTagsForStencil(gn, 'wall', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'wallCorner;fillColor=strokeColor;',
        w, h, '', 'Wall (Corner NW)', null, null, this.getTagsForStencil(gn, 'wallCorner', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'wallCorner;fillColor=strokeColor;direction=south;',
        w, h, '', 'Wall (Corner NE)', null, null, this.getTagsForStencil(gn, 'wallCorner', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'wallCorner;fillColor=strokeColor;direction=west',
        w, h, '', 'Wall (Corner SE)', null, null, this.getTagsForStencil(gn, 'wallCorner', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'wallCorner;fillColor=strokeColor;direction=north',
        w, h, '', 'Wall (Corner SW)', null, null, this.getTagsForStencil(gn, 'wallCorner', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'wallU;fillColor=strokeColor;',
        w, h, '', 'Wall (U)', null, null, this.getTagsForStencil(gn, 'wallU', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'room;fillColor=strokeColor;',
        w, h, '', 'Room', null, null, this.getTagsForStencil(gn, 'room', dt).join(' ')),
      this.createVertexTemplateEntry('shape=dimension;whiteSpace=wrap;html=1;align=center;points=[];verticalAlign=bottom;spacingBottom=3;labelBackgroundColor=none;', 100, 40, 'Label', 'Horizontal Dimension', null, null, 'horizontal dimension measure distance unit'),
      this.createVertexTemplateEntry('shape=dimension;direction=west;whiteSpace=wrap;html=1;align=center;points=[];verticalAlign=top;spacingTop=-15;labelBackgroundColor=none;', 100, 40, 'Label', 'Horizontal Dimension', null, null, 'horizontal dimension measure distance unit'),
      this.createVertexTemplateEntry('shape=dimension;direction=north;whiteSpace=wrap;html=1;align=center;points=[];verticalAlign=bottom;labelBackgroundColor=none;horizontal=0;spacingBottom=3;', 40, 100, 'Label', 'Vertical Dimension', null, null, 'vertical dimension measure distance unit'),
      this.createVertexTemplateEntry('shape=dimension;direction=south;whiteSpace=wrap;html=1;align=center;points=[];verticalAlign=top;labelBackgroundColor=none;horizontal=0;spacingTop=-15;', 40, 100, 'Label', 'Vertical Dimension', null, null, 'vertical dimension measure distance unit'),
      this.createVertexTemplateEntry(s + 'window;',
        w, 10, '', 'Window', null, null, this.getTagsForStencil(gn, 'window', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'windowGlider;dx=0.25;',
        100, 10, '', 'Window, Glider', null, null, this.getTagsForStencil(gn, 'windowGlider', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'windowGarden;dx=0.25;',
        100, 20, '', 'Window, Garden', null, null, this.getTagsForStencil(gn, 'windowGarden', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'windowBow;strokeWidth=3;',
        100, 20, '', 'Window, Bow', null, null, this.getTagsForStencil(gn, 'windowBow', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'windowBay;strokeWidth=3;aspect=fixed;',
        100, 40, '', 'Window, Bay', null, null, this.getTagsForStencil(gn, 'windowBay', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'stairs;',
        300, 100, '', 'Stairs', null, null, this.getTagsForStencil(gn, 'stairs', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'stairs;direction=south;',
        100, 300, '', 'Stairs', null, null, this.getTagsForStencil(gn, 'stairs', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'stairsRest;',
        300, 200, '', 'Stairs', null, null, this.getTagsForStencil(gn, 'stairsRest', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'doorLeft;aspect=fixed;',
        80, 85, '', 'Door', null, null, this.getTagsForStencil(gn, 'doorLeft', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'doorRight;aspect=fixed;',
        80, 85, '', 'Door', null, null, this.getTagsForStencil(gn, 'doorRight', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'doorDouble;aspect=fixed;',
        160, 85, '', 'Door, Double', null, null, this.getTagsForStencil(gn, 'doorDouble', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'doorUneven;dx=0.5;',
        160, 85, '', 'Door, Uneven', null, null, this.getTagsForStencil(gn, 'doorUneven', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'doorOpposing;dx=0.5;',
        160, 165, '', 'Door, Opposing', null, null, this.getTagsForStencil(gn, 'doorOpposing', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'doorRevolving;aspect=fixed;',
        80, 85, '', 'Door, Revolving', null, null, this.getTagsForStencil(gn, 'doorLeft', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'doorPocket;dx=0.5;',
        104, 10, '', 'Door, Pocket', null, null, this.getTagsForStencil(gn, 'doorPocket', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'doorDoublePocket;dx=0.25;',
        104, 10, '', 'Door, Double Pocket', null, null, this.getTagsForStencil(gn, 'doorDoublePocket', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'doorBypass;dx=0.25;',
        104, 10, '', 'Door, By-pass', null, null, this.getTagsForStencil(gn, 'doorBypass', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'doorBifold;dx=0.3;',
        160, 40, '', 'Door, Bi-fold', null, null, this.getTagsForStencil(gn, 'doorBifold', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'doorSlidingGlass;dx=0.25;',
        104, 10, '', 'Door, SlidingGlass', null, null, this.getTagsForStencil(gn, 'doorSlidingGlass', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'doorOverhead;',
        104, 30, '', 'Door, Overhead', null, null, this.getTagsForStencil(gn, 'doorOverhead', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'doorAccordion;dx=0.6;',
        160, 30, '', 'Door, Accordion', null, null, this.getTagsForStencil(gn, 'accordion', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'doorDoubleAction;aspect=fixed;',
        80, 165, '', 'Door, Double Action', null, null, this.getTagsForStencil(gn, 'doorDoubleAction', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'opening;',
        50, 10, '', 'Opening', null, null, this.getTagsForStencil(gn, 'opening', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'bathtub2;',
        180, 60, '', 'Bathtub', null, null, this.getTagsForStencil(gn, 'bathtub', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'bed_double;',
        200, 180, '', 'Bed, Double', null, null, this.getTagsForStencil(gn, 'bed_double', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'bed_single;',
        100, 180, '', 'Bed Single', null, null, this.getTagsForStencil(gn, 'bed_single', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'bookcase;',
        120, 30, '', 'Bookcase', null, null, this.getTagsForStencil(gn, 'bookcase', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'chair;',
        41, 52, '', 'Chair', null, null, this.getTagsForStencil(gn, 'chair', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'copier;',
        110, 60, '', 'Copier', null, null, this.getTagsForStencil(gn, 'copier', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'couch;',
        150, 80, '', 'Couch', null, null, this.getTagsForStencil(gn, 'couch', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'crt_tv;',
        60, 40, '', 'CRT TV', null, null, this.getTagsForStencil(gn, 'crt_tv', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'desk_corner;',
        150, 150, '', 'Desk Corner', null, null, this.getTagsForStencil(gn, 'desk_corner', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'desk_corner_2;',
        150, 120, '', 'Desk Corner 2', null, null, this.getTagsForStencil(gn, 'desk_corner_2', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'dresser;',
        100, 65, '', 'Dresser', null, null, this.getTagsForStencil(gn, 'dresser', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'elevator;',
        100, 100, '', 'Elevator', null, null, this.getTagsForStencil(gn, 'elevator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'fireplace;',
        304, 200, '', 'Fireplace', null, null, this.getTagsForStencil(gn, 'fireplace', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'flat_tv;',
        70, 10, '', 'Flat TV', null, null, this.getTagsForStencil(gn, 'flat_tv', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'floor_lamp;',
        50, 50, '', 'Floor Lamp', null, null, this.getTagsForStencil(gn, 'floor_lamp', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'laptop;',
        40, 35, '', 'Laptop', null, null, this.getTagsForStencil(gn, 'laptop', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'office_chair;',
        40, 43, '', 'Office Chair', null, null, this.getTagsForStencil(gn, 'office_chair', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'piano;',
        135, 143, '', 'Piano', null, null, this.getTagsForStencil(gn, 'piano', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'plant;',
        47, 51, '', 'Plant', null, null, this.getTagsForStencil(gn, 'plant', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'printer;',
        40, 47, '', 'Printer', null, null, this.getTagsForStencil(gn, 'printer', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'range_1;',
        50, 62, '', 'Range 1', null, null, this.getTagsForStencil(gn, 'range_1', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'range_2;',
        75, 62, '', 'Range 2', null, null, this.getTagsForStencil(gn, 'range_2', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'refrigerator;',
        60, 62, '', 'Refrigerator', null, null, this.getTagsForStencil(gn, 'refrigerator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'shower2;',
        100, 100, '', 'Shower', null, null, this.getTagsForStencil(gn, 'shower', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'sink_1;',
        40, 35, '', 'Sink 1', null, null, this.getTagsForStencil(gn, 'sink_1', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'sink_22;',
        40, 35, '', 'Sink 2', null, null, this.getTagsForStencil(gn, 'sink_2', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'sink_double2;',
        80, 35, '', 'Sink Double', null, null, this.getTagsForStencil(gn, 'sink_double', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'sofa;',
        90, 80, '', 'Sofa', null, null, this.getTagsForStencil(gn, 'sofa', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'spiral_stairs;',
        200, 200, '', 'Spiral Stairs', null, null, this.getTagsForStencil(gn, 'spiral_stairs', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'table;',
        90, 50, '', 'Table', null, null, this.getTagsForStencil(gn, 'table', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'toilet;',
        50, 67, '', 'Toilet', null, null, this.getTagsForStencil(gn, 'toilet', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'water_cooler;',
        40, 40, '', 'Water Cooler', null, null, this.getTagsForStencil(gn, 'water_cooler', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'workstation;',
        50, 40, '', 'Workstation', null, null, this.getTagsForStencil(gn, 'workstation', dt).join(' ')),

      this.addEntry(dt + 'kitchen table small', function () {
        var table = new mxCell('', new mxGeometry(0, 20, 80, 80), 'shape=rect;shadow=0;html=1;');
        table.vertex = true;
        var chair1 = new mxCell('', new mxGeometry(20, 0, 40, 52), s + 'chair;shadow=0;');
        chair1.vertex = true;
        var chair2 = new mxCell('', new mxGeometry(20, 68, 40, 52), s + 'chair;shadow=0;rotation=180;');
        chair2.vertex = true;

        return sb.createVertexTemplateFromCells([chair1, chair2, table], 80, 120, 'Small kitchen table');
      }),
      this.addEntry(dt + 'kitchen table', function () {
        var table = new mxCell('', new mxGeometry(20, 20, 100, 100), 'shape=rect;shadow=0;html=1;');
        table.vertex = true;
        var chair1 = new mxCell('', new mxGeometry(50, 0, 40, 52), s + 'chair;shadow=0;');
        chair1.vertex = true;
        var chair2 = new mxCell('', new mxGeometry(50, 88, 40, 52), s + 'chair;shadow=0;direction=west;');
        chair2.vertex = true;
        var chair3 = new mxCell('', new mxGeometry(0, 50, 52, 40), s + 'chair;shadow=0;direction=north;');
        chair3.vertex = true;
        var chair4 = new mxCell('', new mxGeometry(88, 50, 52, 40), s + 'chair;shadow=0;direction=south');
        chair4.vertex = true;

        return sb.createVertexTemplateFromCells([chair1, chair2, chair3, chair4, table], 140, 140, 'Kitchen table');
      }),

      this.addEntry(dt + 'kitchen table round', function () {
        var table = new mxCell('', new mxGeometry(20, 20, 100, 100), 'shape=ellipse;shadow=0;html=1;');
        table.vertex = true;
        var chair1 = new mxCell('', new mxGeometry(50, 0, 40, 52), s + 'chair;shadow=0;');
        chair1.vertex = true;
        var chair2 = new mxCell('', new mxGeometry(50, 88, 40, 52), s + 'chair;shadow=0;direction=west;');
        chair2.vertex = true;
        var chair3 = new mxCell('', new mxGeometry(0, 50, 52, 40), s + 'chair;shadow=0;direction=north;');
        chair3.vertex = true;
        var chair4 = new mxCell('', new mxGeometry(88, 50, 52, 40), s + 'chair;shadow=0;direction=south');
        chair4.vertex = true;

        return sb.createVertexTemplateFromCells([chair1, chair2, chair3, chair4, table], 140, 140, 'Round kitchen table');
      }),

      this.addEntry(dt + 'kitchen table large', function () {
        var table = new mxCell('', new mxGeometry(20, 20, 160, 100), 'shape=rect;shadow=0;html=1;');
        table.vertex = true;
        var chair1 = new mxCell('', new mxGeometry(50, 0, 40, 52), s + 'chair;shadow=0;');
        chair1.vertex = true;
        var chair2 = new mxCell('', new mxGeometry(50, 88, 40, 52), s + 'chair;shadow=0;direction=west;');
        chair2.vertex = true;
        var chair3 = new mxCell('', new mxGeometry(0, 50, 52, 40), s + 'chair;shadow=0;direction=north;');
        chair3.vertex = true;
        var chair4 = new mxCell('', new mxGeometry(148, 50, 52, 40), s + 'chair;shadow=0;direction=south');
        chair4.vertex = true;
        var chair5 = new mxCell('', new mxGeometry(110, 0, 40, 52), s + 'chair;shadow=0;');
        chair5.vertex = true;
        var chair6 = new mxCell('', new mxGeometry(110, 88, 40, 52), s + 'chair;shadow=0;direction=west;');
        chair6.vertex = true;

        return sb.createVertexTemplateFromCells([chair1, chair2, chair3, chair4, chair5, chair6, table], 200, 140, 'Large kitchen table');
      }),

      this.addEntry(dt + 'kitchen table large oval', function () {
        var table = new mxCell('', new mxGeometry(20, 20, 160, 100), 'shape=ellipse;shadow=0;html=1;');
        table.vertex = true;
        var chair1 = new mxCell('', new mxGeometry(50, 0, 40, 52), s + 'chair;shadow=0;');
        chair1.vertex = true;
        var chair2 = new mxCell('', new mxGeometry(50, 88, 40, 52), s + 'chair;shadow=0;direction=west;');
        chair2.vertex = true;
        var chair3 = new mxCell('', new mxGeometry(0, 50, 52, 40), s + 'chair;shadow=0;direction=north;');
        chair3.vertex = true;
        var chair4 = new mxCell('', new mxGeometry(148, 50, 52, 40), s + 'chair;shadow=0;direction=south');
        chair4.vertex = true;
        var chair5 = new mxCell('', new mxGeometry(110, 0, 40, 52), s + 'chair;shadow=0;');
        chair5.vertex = true;
        var chair6 = new mxCell('', new mxGeometry(110, 88, 40, 52), s + 'chair;shadow=0;direction=west;');
        chair6.vertex = true;

        return sb.createVertexTemplateFromCells([chair1, chair2, chair3, chair4, chair5, chair6, table], 200, 140, 'Large oval kitchen table');
      }),

      this.addEntry(dt + 'office table', function () {
        var table = new mxCell('', new mxGeometry(0, 20, 80, 50), 'shape=rect;shadow=0;html=1;');
        table.vertex = true;
        var chair1 = new mxCell('', new mxGeometry(20, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair1.vertex = true;
        var item1 = new mxCell('', new mxGeometry(15, 30, 50, 40), s + 'workstation;shadow=0;flipV=1;');
        item1.vertex = true;

        return sb.createVertexTemplateFromCells([chair1, table, item1], 80, 70, 'Office table');
      }),

      this.addEntry(dt + 'office table', function () {
        var table = new mxCell('', new mxGeometry(20, 20, 100, 100), 'shape=rect;shadow=0;html=1;');
        table.vertex = true;
        var chair1 = new mxCell('', new mxGeometry(50, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair1.vertex = true;
        var chair2 = new mxCell('', new mxGeometry(50, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair2.vertex = true;
        var chair3 = new mxCell('', new mxGeometry(0, 50, 43, 40), s + 'office_chair;shadow=0;direction=north;');
        chair3.vertex = true;
        var chair4 = new mxCell('', new mxGeometry(97, 50, 43, 40), s + 'office_chair;shadow=0;direction=south');
        chair4.vertex = true;

        return sb.createVertexTemplateFromCells([chair1, chair2, chair3, chair4, table], 140, 140, 'Office table');
      }),

      this.addEntry(dt + 'office table large', function () {
        var table = new mxCell('', new mxGeometry(20, 20, 160, 100), 'shape=rect;shadow=0;html=1;');
        table.vertex = true;
        var chair1 = new mxCell('', new mxGeometry(50, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair1.vertex = true;
        var chair2 = new mxCell('', new mxGeometry(50, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair2.vertex = true;
        var chair3 = new mxCell('', new mxGeometry(0, 50, 43, 40), s + 'office_chair;shadow=0;direction=north;');
        chair3.vertex = true;
        var chair4 = new mxCell('', new mxGeometry(157, 50, 43, 40), s + 'office_chair;shadow=0;direction=south');
        chair4.vertex = true;
        var chair5 = new mxCell('', new mxGeometry(110, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair5.vertex = true;
        var chair6 = new mxCell('', new mxGeometry(110, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair6.vertex = true;

        return sb.createVertexTemplateFromCells([chair1, chair2, chair3, chair4, chair5, chair6, table], 200, 140, 'Large office table');
      }),

      this.addEntry(dt + 'office table large oval', function () {
        var table = new mxCell('', new mxGeometry(20, 20, 160, 100), 'shape=ellipse;shadow=0;html=1;');
        table.vertex = true;
        var chair1 = new mxCell('', new mxGeometry(50, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair1.vertex = true;
        var chair2 = new mxCell('', new mxGeometry(50, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair2.vertex = true;
        var chair3 = new mxCell('', new mxGeometry(0, 50, 43, 40), s + 'office_chair;shadow=0;direction=north;');
        chair3.vertex = true;
        var chair4 = new mxCell('', new mxGeometry(157, 50, 43, 40), s + 'office_chair;shadow=0;direction=south');
        chair4.vertex = true;
        var chair5 = new mxCell('', new mxGeometry(110, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair5.vertex = true;
        var chair6 = new mxCell('', new mxGeometry(110, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair6.vertex = true;

        return sb.createVertexTemplateFromCells([chair1, chair2, chair3, chair4, chair5, chair6, table], 200, 140, 'Large oval office table');
      }),

      this.addEntry(dt + 'office table large oval', function () {
        var table = new mxCell('', new mxGeometry(20, 20, 280, 100), 'shape=ellipse;shadow=0;html=1;');
        table.vertex = true;
        var chair1 = new mxCell('', new mxGeometry(50, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair1.vertex = true;
        var chair2 = new mxCell('', new mxGeometry(50, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair2.vertex = true;
        var chair3 = new mxCell('', new mxGeometry(0, 50, 43, 40), s + 'office_chair;shadow=0;direction=north;');
        chair3.vertex = true;
        var chair4 = new mxCell('', new mxGeometry(277, 50, 43, 40), s + 'office_chair;shadow=0;direction=south');
        chair4.vertex = true;
        var chair5 = new mxCell('', new mxGeometry(110, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair5.vertex = true;
        var chair6 = new mxCell('', new mxGeometry(110, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair6.vertex = true;
        var chair7 = new mxCell('', new mxGeometry(170, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair7.vertex = true;
        var chair8 = new mxCell('', new mxGeometry(170, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair8.vertex = true;
        var chair9 = new mxCell('', new mxGeometry(230, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair9.vertex = true;
        var chair10 = new mxCell('', new mxGeometry(230, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair10.vertex = true;

        return sb.createVertexTemplateFromCells([chair1, chair2, chair3, chair4, chair5, chair6, chair7, chair8, chair9, chair10, table], 320, 140, 'Large oval office table');
      }),

      this.addEntry(dt + 'office table conference large huge', function () {
        var table = new mxCell('', new mxGeometry(20, 20, 520, 100), 'shape=ellipse;shadow=0;html=1;');
        table.vertex = true;
        var chair1 = new mxCell('', new mxGeometry(50, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair1.vertex = true;
        var chair2 = new mxCell('', new mxGeometry(50, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair2.vertex = true;
        var chair3 = new mxCell('', new mxGeometry(0, 50, 43, 40), s + 'office_chair;shadow=0;direction=north;');
        chair3.vertex = true;
        var chair4 = new mxCell('', new mxGeometry(517, 50, 43, 40), s + 'office_chair;shadow=0;direction=south');
        chair4.vertex = true;
        var chair5 = new mxCell('', new mxGeometry(110, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair5.vertex = true;
        var chair6 = new mxCell('', new mxGeometry(110, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair6.vertex = true;
        var chair7 = new mxCell('', new mxGeometry(170, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair7.vertex = true;
        var chair8 = new mxCell('', new mxGeometry(170, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair8.vertex = true;
        var chair9 = new mxCell('', new mxGeometry(230, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair9.vertex = true;
        var chair10 = new mxCell('', new mxGeometry(230, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair10.vertex = true;
        var chair11 = new mxCell('', new mxGeometry(290, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair11.vertex = true;
        var chair12 = new mxCell('', new mxGeometry(290, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair12.vertex = true;
        var chair13 = new mxCell('', new mxGeometry(350, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair13.vertex = true;
        var chair14 = new mxCell('', new mxGeometry(350, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair14.vertex = true;
        var chair15 = new mxCell('', new mxGeometry(410, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair15.vertex = true;
        var chair16 = new mxCell('', new mxGeometry(410, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair16.vertex = true;
        var chair17 = new mxCell('', new mxGeometry(470, 0, 40, 43), s + 'office_chair;shadow=0;');
        chair17.vertex = true;
        var chair18 = new mxCell('', new mxGeometry(470, 97, 40, 43), s + 'office_chair;shadow=0;direction=west;');
        chair18.vertex = true;

        return sb.createVertexTemplateFromCells([chair1, chair2, chair3, chair4, chair5, chair6, chair7, chair8, chair9, chair10, chair11, chair12, chair13, chair14, chair15, chair16, chair17, chair18, table], 560, 140, 'Conference table');
      })
    ];

    this.addPalette('floorplan', mxResources.get('floorplans'), false, mxUtils.bind(this, function (content) {
      for (var i = 0; i < fns.length; i++) {
        content.appendChild(fns[i](content));
      }
    }));
  };

  Sidebar.prototype.addFluidPowerPalette = function () {
    var w = 2;
    var h = 2;
    var s = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=bottom;aspect=fixed;html=1;' + mxConstants.STYLE_VERTICAL_ALIGN + '=top;fillColor=strokeColor;align=center;outlineConnect=0;shape=mxgraph.fluid_power.';
    var gn = 'mxgraph.fluid_power';
    var dt = '';
    this.addPaletteFunctions('fluid_power', '流体动力 (ISO 1219)', false, [
      this.createVertexTemplateEntry(s + 'x10010;points=[[0,0.68,0],[0.78,0,0],[1,0.51,0],[1,0.84,0]]', w * 20.95, h * 14.24, '', 'X10010 Control mechanism with detachable grip and detent', null, null, this.getTagsForStencil(gn, 'x10010 control mechanism with detachable grip and detent', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10020;points=[[0,0.5,0],[1,0.39,0],[1,0.61,0]]', w * 18.59, h * 21.42, '', 'X10020 Plunger with adjustable stroke limiter', null, null, this.getTagsForStencil(gn, 'x10020 plunger with adjustable stroke limiter', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10030;points=[[0,0.35,0],[0,1,0],[0.74,0,0],[1,0.5,0],[1,0.84,0]]', w * 17.62, h * 14.22, '', 'X10030 Push/pull control mechanism with detent', null, null, this.getTagsForStencil(gn, 'x10030 push pull control mechanism with detent', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10040;points=[[1,0.6,0]]', w * 9.35, h * 13.18, '', 'X10040 Control mechanism with locking manual override', null, null, this.getTagsForStencil(gn, 'x10040 control mechanism with locking manual override', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10050;points=[[1,0.64,0],[1,0.88,0]]', w * 17.67, h * 19.61, '', 'X10050 Turning control mechanism with five detent positions', null, null, this.getTagsForStencil(gn, 'x10050 turning control mechanism with five detent positions', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10060;points=[[1,0.72,0],[1,1,0]]', w * 31.3, h * 17.69, '', 'X10060 Roller lever for actuation in one direction of travel', null, null, this.getTagsForStencil(gn, 'x10060 roller lever for actuation in one direction of travel', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10070;points=[[1,0.38,0],[1,0.5,0],[1,0.62,0]]', w * 32.6, h * 18.64, '', 'X10070 Control mechanism using an electric stepping motor', null, null, this.getTagsForStencil(gn, 'x10070 control mechanism using an electric stepping motor', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10080;points=[[0,0,0],[0,0.5,0],[0,1,0],[1,0,0],[1,0.5,0],[1,1,0]]', w * 14.04, h * 9.35, '', 'X10080 Pneumatic spring, internal pressure supply using the valve-inlet port', null, null, this.getTagsForStencil(gn, 'x10080 pneumatic spring internal pressure supply using the valve inlet port', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10090;points=[[0,0,0],[0,0.5,0],[0,1,0],[1,0,0],[1,0.5,0],[1,1,0]]', w * 14.04, h * 9.35, '', 'X10090 Pneumatic spring, internal pressure supply using the pilot-supply port', null, null, this.getTagsForStencil(gn, 'X10090 pneumatic spring internal pressure supply using the pilot supply port', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10100;points=[[0,0,0],[0,0.5,0],[0,1,0],[1,0,0],[1,0.5,0],[1,1,0]]', w * 14.04, h * 9.35, '', 'X10100 Pneumatic spring, external pressure supply', null, null, this.getTagsForStencil(gn, 'X10090 pneumatic spring external pressure supply', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10110;points=[[0,0,0],[0,0.5,0],[0,1,0],[1,0,0],[1,0.5,0],[1,1,0],[0.5,0,0],[0.5,1,0]]', w * 13.94, h * 9.33, '', 'X10110 Solenoid coil with one winding, direction of actuation towards the valving element', null, null, this.getTagsForStencil(gn, 'x10110 solenoid coil with one winding direction of actuation towards the valving element', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10120;points=[[0,0,0],[0,0.5,0],[0,1,0],[1,0,0],[1,0.5,0],[1,1,0],[0.5,0,0],[0.5,1,0]]', w * 13.94, h * 9.33, '', 'X10120 Solenoid coil with one winding, direction of actuation away from the valving element', null, null, this.getTagsForStencil(gn, 'x10120 solenoid coil with one winding direction of actuation away from the valving element', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10130;points=[[0,0,0],[0,0.5,0],[0,1,0],[1,0,0],[1,0.5,0],[1,1,0],[0.5,0,0],[0.5,1,0]]', w * 13.94, h * 9.33, '', 'X10130 Electrical control mechanism with two coils, one acting towards the valving element and the other acting away from the valving element', null, null, this.getTagsForStencil(gn, 'x10130 electrical control mechanism with two coils one acting towards the valving element and the other acting away from the valving element', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10140;points=[[0,0.39,0],[0,0.605,0],[0,0.82,0]]', w * 17.84, h * 27.62, '', 'X10140 Solenoid coil with one winding, direction of actuation towards the valving element, continuously controlled', null, null, this.getTagsForStencil(gn, 'x10140 solenoid coil with one winding direction of actuation towards the valving element continuously controlled', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10150;points=[[0,0.39,0],[0,0.605,0],[0,0.82,0]]', w * 17.84, h * 27.62, '', 'X10150 Solenoid coil with one winding, direction of actuation away from the valving element, continuously controlled', null, null, this.getTagsForStencil(gn, 'x10150 solenoid coil with one winding direction of actuation away from the valving element continuously controlled', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10160;points=[[0,0.39,0],[0,0.605,0],[0,0.82,0]]', w * 17.84, h * 27.62, '', 'X10160 Electrical control mechanism with two coils, acting in both directions towards and away from the valving element, continuously controlled', null, null, this.getTagsForStencil(gn, 'x10160 electrical control mechanism with two coils acting in both directions towards and away from the valving element continuously controlled', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10170;points=[[0,0,0],[0,0.5,0],[0,1,0],[1,0,0],[1,0.5,0],[1,1,0],[0.5,0,0],[0.5,1,0]]', w * 27.97, h * 9.31, '', 'X10170 Electrically operated pneumatic control mechanism', null, null, this.getTagsForStencil(gn, 'X10170 electrically operated pneumatic control mechanism', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10180;points=[[0,0,0],[0,0.25,0],[0,0.5,0],[1,0,0],[1,0.25,0],[1,0.5,0],[0.5,0,0],[0.5,1,0]]', w * 27.97, h * 18.61, '', 'X10180 Electrically operated hydraulic pilot stage with external pilot supply', null, null, this.getTagsForStencil(gn, 'x10180 electrically operated hydraulic pilot stage with external pilot supply', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10190;points=[[0.1,0.8,0],[0.55,0,0],[1,1,0]]', w * 15.54, h * 18.66, '', 'X10190 Mechanical feedback', null, null, this.getTagsForStencil(gn, 'x10190 mechanical feedback', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10200;points=[[0,0.31,0],[0,0.48,0],[0,0.65,0],[1,0.31,0],[1,0.48,0],[1,0.65,0],[0.43,1,0],[0.715,1,0]]', w * 32.41, h * 26.93, '', 'X10200 Hydraulic control mechanism with two successive pilot stages with external pilot supply and continuously controlled solenoid with two windings, working in both directions, in one assembly', null, null, this.getTagsForStencil(gn, 'x10200 hydraulic control mechanism with two successive pilot stages with external pilot supply and continuously controlled solenoid with two windings working in both directions in one assembly', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10210;points=[[0.67,0,0],[0.67,1,0],[0,0.62,0],[0.37,0.25,0],[0.37,0.75,0]]', w * 62.77, h * 37.61, '', 'X10210 2/2 (two-port, two-position) directional control valve, two ports, two shift positions for two directions of flow, a push control mechanism, spring return, normally closed', null, null, this.getTagsForStencil(gn, 'x10210 two port position directional control valve ports positions for two directions of flow push control mechanism spring return normally closed', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10220;points=[[0.665,0,0],[0.665,1,0],[0,0.62,0],[0.37,0.25,0],[0.37,0.75,0]]', w * 62.77, h * 37.3, '', 'X10220 2/2 directional control vavle, two ports, two shift positions, normally open, solenoid-actuated, spring return', null, null, this.getTagsForStencil(gn, 'x10220 directional control vavle two ports two shift positions normally open solenoid actuated spring return', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10230;points=[[0.59,0,0],[0.74,0,0],[0.59,1,0],[0.74,1,0],[0,0.5,0],[0,0.625,0],[0,0.75,0],[0.295,0.25,0],[0.295,0.75,0],[0.445,0.25,0],[0.445,0.75,0]]', w * 62.77, h * 37.24, '', 'X10230 4/2 directional control valve, solenoid-actuated, spring return', null, null, this.getTagsForStencil(gn, 'x10230 directional control valve solenoid-actuated spring return', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10240;points=[[0.725,0,0],[0.725,1,0],[0,0.5,0],[0,0.625,0],[0,0.75,0],[0.28,0.5,0],[0.28,0.75,0],[0.485,0.25,0],[0.485,0.75,0],[0.09,0.5,0],[0.09,0.75,0]]', w * 76.66, h * 37.33, '', 'X10240 Pneumatic soft-start valve, solenoidoperated, with internal pilot supply', null, null, this.getTagsForStencil(gn, 'X10240 pneumatic soft start valve solenoidoperated with internal pilot supply', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10250;points=[[0.665,0,0],[0.665,1,0]]', w * 83.63, h * 71.89, '', 'X10250 Pneumatic slow-start valve that is fitted at the inlet to a system, which allows fluid to enter the system at a reduced flow rate, until a pre-set pressure level is achieved, causing the valve to open to a full-flow condition', null, null, this.getTagsForStencil(gn, 'X10250 pneumatic slow start valve that is fitted at the inlet to system which allows fluid to enter the system at reduced flow rate until pre set pressure level is achieved causing the valve to open to full flow condition', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10260;points=[[0.645,0,0],[0.645,1,0],[0.76,1,0],[0.41,0.25,0],[0.41,0.75,0],[0.53,0.75,0],[1,0.5,0],[1,0.625,0],[1,0.75,0]]', w * 78.82, h * 37.24, '', 'X10260 3/2 lockout valve with a padlock', null, null, this.getTagsForStencil(gn, 'x10260 lockout valve with padlock', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10270;points=[[0.68,0,0],[0.68,1,0],[0.795,1,0],[0.445,0.25,0],[0.445,0.75,0],[0.56,0.75,0]]', w * 80.08, h * 37.24, '', 'X10270 3/2 directional control valve controlled by a roller lever in one direction of travel and spring return', null, null, this.getTagsForStencil(gn, 'x10270 directional control valve controlled by roller lever in one direction of travel and spring return', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10280;points=[[0.59,0,0],[0.59,1,0],[0.74,1,0],[0.44,0.75,0],[0.295,0.25,0],[0.295,0.75,0]]', w * 62.8, h * 37.24, '', 'X10280 3/2 directional control valve, with three ports and two positions, controlled by a solenoid and spring return', null, null, this.getTagsForStencil(gn, 'x10280 directional control valve with three ports and two positions controlled by solenoid and spring return', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10290;points=[[0.59,0,0],[0.59,1,0],[0.74,1,0],[0.44,0.75,0],[0.295,0.25,0],[0.295,0.75,0]]', w * 62.8, h * 37.24, '', 'X10290 3/2 directional control valve with single solenoid, directly controlled, spring return, and manual override with detent', null, null, this.getTagsForStencil(gn, 'X10290', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10300;points=[[0.745,0,0],[0.745,1,0],[0.835,1,0],[0,0.5,0],[0.558,0.25,0],[0.558,0.75,0],[0.65,0.75,0]]', w * 100.14, h * 37.24, '', 'X10300 Pulse counter with pneumatic output signal', null, null, this.getTagsForStencil(gn, 'x10300 pulse counter with pneumatic output signal', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10310;points=[[0.55,0,0],[0.55,1,0],[0,0.62,0],[1,0.62,0],[0.35,0.25,0],[0.35,0.75,0],[0.45,0.75,0],[0.65,1,0]]', w * 93.24, h * 37.24, '', 'X10310 3/2 directional control valve, differential pilot', null, null, this.getTagsForStencil(gn, 'x10310 3/2 directional control valve differential pilot', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10320;points=[[0.59,0,0],[0.59,1,0],[0.74,0,0],[0.74,1,0],[0,0.5,0],[0,0.625,0],[0,0.75,0],[0.3,0.25,0],[0.3,0.75,0],[0.44,0.25,0],[0.44,0.75,0]]', w * 62.8, h * 37.24, '', 'X10320 4/2 directional control valve with single solenoid, directly controlled, spring return, and manual override with detent', null, null, this.getTagsForStencil(gn, 'x10320 directional control valve with single solenoid directly controlled spring return and manual override with detent', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10330;points=[[0.57,0,0],[0.57,1,0],[0.71,0,0],[0.71,1,0],[0.285,0.25,0],[0.285,0.75,0],[0.43,0.25,0],[0.43,0.75,0],[0,0.5,0],[0,0.625,0],[0,0.75,0],[1,0.25,0],[1,0.5,0],[1,0.75,0]]', w * 65.09, h * 37.24, '', 'X10330 4/2 directional control valve, directly controlled by two solenoids, with detent (impulse valve)', null, null, this.getTagsForStencil(gn, 'x10330 directional control valve directly controlled by two solenoids with detent impulse valve', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10340;points=[[0.685,0,0],[0.685,1,0],[0.455,0.25,0],[0.455,0.75,0],[0.57,0.75,0],[0.8,1,0],[0,0.625,0]]', w * 81.61, h * 37.24, '', 'X10340 3/2 directional control valve with three ports, two distinct positions, controlled by pneumatic pilot control and torsion bar, spring return', null, null, this.getTagsForStencil(gn, 'x10340 directional control valve with three ports two distinct positions controlled by pneumatic pilot control and torsion bar spring return', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10350;points=[[0.665,0,0],[0.665,1,0],[0.785,0,0],[0.785,1,0],[0,0.5,0],[0,0.625,0],[0,0.75,0],[0.42,0.25,0],[0.42,0.75,0],[0.545,0.25,0],[0.545,0.75,0]]', w * 76.69, h * 37.24, '', 'X10350 4/2 directional control valve, two distinct positions, controlled by solenoid and hydraulic pilot, spring return', null, null, this.getTagsForStencil(gn, 'x10350 directional control valve two distinct positions controlled by solenoid and hydraulic pilot spring return', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10360;points=[[0.46,0,0],[0.46,1,0],[0.54,0,0],[0.54,1,0],[0,0.5,0],[0,0.625,0],[0,0.75,0],[0.29,0.25,0],[0.29,0.75,0],[0.375,0.25,0],[0.375,0.75,0],[1,0.5,0],[1,0.625,0],[1,0.75,0],[0.625,0.25,0],[0.625,0.75,0],[0.71,0.25,0],[0.71,0.75,0],[0.125,1,0],[0.79,1,0]]', w * 111.3, h * 37.51, '', 'X10360 4/3 directional control valve, with electrical operation of the pilot stage and hydraulic operation of the main stage, main stage and pilot stage with spring-centering, external pilot supply and pilot drain', null, null, this.getTagsForStencil(gn, 'x10360 directional control valve with electrical operation of the pilot stage and hydraulic operation of the main stage main stage and pilot stage with spring-centering external pilot supply and pilot drain', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10370;points=[[0.445,0,0],[0.445,1,0],[0.555,0,0],[0.555,1,0],[0,0.5,0],[0,0.625,0],[0,0.75,0],[1,0.5,0],[1,0.625,0],[1,0.75,0],[0.222,0.25,0],[0.222,0.75,0],[0.335,0.25,0],[0.335,0.75,0],[0.665,0.25,0],[0.665,0.75,0],[0.777,0.25,0],[0.777,0.75,0]]', w * 83.58, h * 37.24, '', 'X10370 4/3 directional control valve, directly controlled by two solenoids with spring-centered central position', null, null, this.getTagsForStencil(gn, 'x10370 directional control valve directly controlled by two solenoids with spring centered central position', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10380;points=[[0.66,0,0],[0.66,1,0],[0.785,0,0],[0.785,1,0],[0,1,0],[0.415,0.25,0],[0.415,0.75,0],[0.54,0.25,0],[0.54,0.75,0]]', w * 75.37, h * 37.53, '', 'X10380 4/2 directional control valve, hydraulically controlled, spring return', null, null, this.getTagsForStencil(gn, 'x10380 directional control valve hydraulically controlled spring return', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10390;points=[[0.457,0,0],[0.457,1,0],[0.545,0,0],[0.545,1,0],[0,1,0],[1,1,0],[0.287,0.25,0],[0.287,0.75,0],[0.373,0.25,0],[0.373,0.75,0],[0.627,0.25,0],[0.627,0.75,0],[0.713,0.25,0],[0.713,0.75,0]]', w * 109.23, h * 37.51, '', 'X10390 4/3 directional control valve, hydraulically controlled, spring-centered', null, null, this.getTagsForStencil(gn, 'x10390 directional control valve hydraulically controlled spring centered', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10400;points=[[0.68,0,0],[0.68,1,0],[0.938,0,0],[0.938,1,0],[0.81,1,0],[0.3,0.25,0],[0.425,0.75,0],[0.553,0.25,0],[0.553,0.75,0],[0.3,0.75,0]]', w * 72.6, h * 37.51, '', 'X10400 5/2 directional control valve, treadle-controlled', null, null, this.getTagsForStencil(gn, 'x10400 directional control valve treadle controlled', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10410;points=[[0.62,0,0],[0.62,1,0],[0.808,0,0],[0.808,1,0],[0.713,1,0],[0.335,0.25,0],[0.333,0.75,0],[0.427,0.75,0],[0.522,0.25,0],[0.522,0.75,0],[0,0.5,0],[0,0.625,0],[0,0.75,0],[1,0.5,0],[1,0.625,0],[1,0.75,0]]', w * 97.5, h * 37.51, '', 'X10410 5/2 pneumatic directional control valve, pilot-operated, piezo-electric-controlled, return by pneumatic spring', null, null, this.getTagsForStencil(gn, 'x10410 pneumatic directional control valve pilot operated piezo electric controlled return by pneumatic spring', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10420;points=[[0.425,0,0],[0.425,1,0],[0.578,0,0],[0.578,1,0],[0.5,1,0],[0.195,0.25,0],[0.195,0.75,0],[0.27,0.75,0],[0.348,0.25,0],[0.348,0.75,0],[0.655,0.25,0],[0.655,0.75,0],[0.808,0.25,0],[0.732,0.75,0],[0.808,0.75,0]]', w * 121.13, h * 37.53, '', 'X10420 5/3 directional control valve, lever-controlled to each position, with detent', null, null, this.getTagsForStencil(gn, 'x10420 directional control valve lever controlled to each position with detent', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10430;points=[[0.634,0,0],[0.634,1,0],[0.83,0,0],[0.732,1,0],[0.83,1,0],[0.343,0.25,0],[0.341,0.75,0],[0.537,0.25,0],[0.537,0.75,0],[0.44,0.75,0],[0.145,1,0],[0,0.5,0],[0,0.625,0],[0,0.75,0]]', w * 95.18, h * 37.47, '', 'X10430 5/2 pneumatic directional control valve, single solenoid, pilot-operated with an external pilot supply, spring return, manual override', null, null, this.getTagsForStencil(gn, 'x10430 pneumatic directional control valve single solenoid pilot operated with an external pilot supply spring return manual override', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10440;points=[[0.62,0,0],[0.62,1,0],[0.81,0,0],[0.81,1,0],[0.715,1,0],[0.337,0.25,0],[0.335,0.75,0],[0.525,0.25,0],[0.525,0.75,0],[0.43,0.75,0],[0.145,1,0],[0,0.5,0],[0,0.625,0],[0,0.75,0],[1,0.5,0],[1,0.625,0],[1,0.75,0]]', w * 97.47, h * 37.47, '', 'X10440 5/2 pneumatic directional control valve with five ports and two distinct positions, control by solenoid and pneumatic pilot control, with external pilot supply, return by pneumatic spring, auxiliary manual control. Internal pressure supply using the valve supply port', null, null, this.getTagsForStencil(gn, 'x10440 pneumatic directional control valve with five ports and two distinct positions control by solenoid and pneumatic pilot control with external pilot supply return by pneumatic spring auxiliary manual control internal pressure supply using the valve supply port', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10441;points=[[0.62,0,0],[0.62,1,0],[0.81,0,0],[0.81,1,0],[0.715,1,0],[0.337,0.25,0],[0.335,0.75,0],[0.525,0.25,0],[0.525,0.75,0],[0.43,0.75,0],[0.145,1,0],[0,0.5,0],[0,0.625,0],[0,0.75,0],[1,0.5,0],[1,0.625,0],[1,0.75,0]]', w * 97.47, h * 37.47, '', 'X10441 5/2 pneumatic directional control valve with five ports and two distinct positions, control by solenoid and pneumatic pilot control, with external pilot supply, return by pneumatic spring, auxiliary manual control. Internal pressure supply using the pilot supply port', null, null, this.getTagsForStencil(gn, 'x10441 pneumatic directional control valve with five ports and two distinct positions control by solenoid and pneumatic pilot control with external pilot supply return by pneumatic spring auxiliary manual control internal pressure supply using the pilot supply port', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10442;points=[[0.62,0,0],[0.62,1,0],[0.81,0,0],[0.81,1,0],[0.715,1,0],[0.337,0.25,0],[0.335,0.75,0],[0.525,0.25,0],[0.525,0.75,0],[0.43,0.75,0],[0.145,1,0],[0,0.5,0],[0,0.625,0],[0,0.75,0],[1,0.5,0],[1,0.625,0],[1,0.75,0],[1,1,0]]', w * 97.47, h * 37.47, '', 'X10442 5/2 pneumatic directional control valve with five ports and two distinct positions, control by solenoid and pneumatic pilot control, with external pilot supply, return by pneumatic spring, auxiliary manual control. External pressure supply', null, null, this.getTagsForStencil(gn, 'x10442 pneumatic directional control valve with five ports and two distinct positions control by solenoid and pneumatic pilot control with external pilot supply return by pneumatic spring auxiliary manual control. External pressure supply', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10450;points=[[0.433,0,0],[0.433,1,0],[0.5,1,0],[0.567,0,0],[0.567,1,0],[0.233,0.25,0],[0.233,0.75,0],[0.298,0.75,0],[0.365,0.25,0],[0.365,0.75,0],[0.632,0.25,0],[0.632,0.75,0],[0.764,0.25,0],[0.7,0.75,0],[0.767,0.75,0],[0,0.5,0],[0,0.625,0],[0,0.75,0],[1,0.5,0],[1,0.625,0],[1,0.75,0]]', w * 139.22, h * 37.52, '', 'X10450 5/3 pneumatic directional control valve, closed centre position, controlled by solenoid pilots with internal pilot supply and manual overrides on both sides. Spring return to the centre position', null, null, this.getTagsForStencil(gn, 'x10450 pneumatic directional control valve closed centre position controlled by solenoid pilots with internal pilot supply and manual overrides on both sides spring return to the centre position', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10460;points=[[0.6,0,0],[0.6,1,0],[0.8,0,0],[0.8,1,0],[0.7,1,0],[0.3,0.25,0],[0.3,0.75,0],[0.4,0.75,0],[0.5,0.25,0],[0.5,0.75,0],[0,0.625,0],[1,0.5,0],[1,0.625,0],[1,0.75,0]]', w * 93, h * 37.54, '', 'X10460 Directly operated 5/2 pneumatic directional control valve, mechanical spring and air spring returned', null, null, this.getTagsForStencil(gn, 'x10460 directly operated pneumatic directional control valve mechanical spring and air spring returned', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10470;points=[[0.43,0,0],[0.572,0,0],[0.43,1,0],[0.5,1,0],[0.572,1,0],[0,0.625,0],[1,0.625,0],[0.217,0.25,0],[0.215,0.75,0],[0.287,0.75,0],[0.358,0.25,0],[0.358,0.75,0],[0.643,0.25,0],[0.643,0.75,0],[0.785,0.25,0],[0.715,0.75,0],[0.786,0.75,0]]', w * 130.19, h * 37.34, '', 'X10470 Directly operated 5/3 pneumatic directional control valve, spring centred, with outlet ports open to exhaust in the centre position', null, null, this.getTagsForStencil(gn, 'x10470 directly operated pneumatic directional control valve spring centred with outlet ports open to exhaust in the centre position', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10480;points=[[0.57,0,0],[0.57,1,0],[0.283,0.255,0],[0.425,0.75,0],[0.283,0.75,0],[0.712,1,0],[0,0.5,0],[0,0.625,0],[0,0.75,0]]', w * 65, h * 37.77, '', 'X10480 3/2 solenoid-actuated poppet valve, with limit switch', null, null, this.getTagsForStencil(gn, 'x10480 solenoid actuated poppet valve with limit switch', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10490;points=[[0.59,0,0],[0.59,1,0],[0.297,0.255,0],[0.442,0.75,0],[0.297,0.75,0],[0.74,1,0],[0,0.5,0],[0,0.625,0],[0,0.75,0]]', w * 62.79, h * 37.77, '', 'X10490 3/2 solenoid-actuated poppet valve', null, null, this.getTagsForStencil(gn, 'x10490 solenoid actuated poppet valve', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10500;points=[[0.47,0,0],[0.47,1,0]]', w * 39.53, h * 37.77, '', 'X10500 Directly controlled pressure-relief valve, in which the opening pressure is adjusted by means of a spring', null, null, this.getTagsForStencil(gn, 'x10500 directly controlled pressure relief valve in which the opening pressure is adjusted by means of spring', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10510;points=[[0.445,0,0],[0.445,1,0],[0.887,1,0]]', w * 41.78, h * 37.77, '', 'X10510 Sequence valve with manually adjustable set point', null, null, this.getTagsForStencil(gn, 'x10510 Sequence valve with manually adjustable set point', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10520;points=[[0.57,0,0],[0.57,1,0],[0.856,1,0]]', w * 65.04, h * 65.51, '', 'X10520 Sequence valve, with bypass valve', null, null, this.getTagsForStencil(gn, 'x10520 sequence valve with bypass valve', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10530;points=[[0.61,0,0],[0.61,1,0],[0,0.62,0]]', w * 53.94, h * 37.77, '', 'X10530 Sequence valve, externally controlled', null, null, this.getTagsForStencil(gn, 'x10530 sequence valve externally controlled', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10540;points=[[0.35,0,0],[0.35,1,0]]', w * 39.59, h * 37.77, '', 'X10540 Pressure regulator, with internal reversible flow', null, null, this.getTagsForStencil(gn, 'x10540 pressure regulator with internal reversible flow', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10550;points=[[0.44,0,0],[0.44,1,0],[0.885,1,0]]', w * 41.78, h * 37.77, '', 'X10550 Directly controlled two-port pressure-reducing valve with external drain', null, null, this.getTagsForStencil(gn, 'x10550 directly controlled two port pressure reducing valve with external drain', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10560;points=[[0.348,0,0],[0.348,1,0],[0.778,1,0]]', w * 53.64, h * 37.77, '', 'X10560 Pitot-operated two-port pressure-reducing valve with external drain', null, null, this.getTagsForStencil(gn, 'x10560 pitot operated two port pressure reducing valve with external drain', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10570;points=[[0.335,0,0],[0.335,1,0],[1,1,0]]', w * 41.76, h * 37.72, '', 'X10570 Pressure regulator, remote pilot adjusted, relieving, forward flow only', null, null, this.getTagsForStencil(gn, 'x10570 pressure regulator remote pilot adjusted relieving forward flow only', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10580;points=[[0,0.355,0],[1,0.355,0],[0.5,1,0]]', w * 130.47, h * 71.93, '', 'X10580  Pressure-relief and anti-cavitation valves for protecting two supply lines', null, null, this.getTagsForStencil(gn, 'x10580 pressure relief and anti cavitation valves for protecting two supply lines', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10590;points=[[0.117,0,0],[0.117,1,0],[0.94,0.545,0]]', w * 79.01, h * 102.73, '', 'X10590 Accumulator-charging valve with a fixed switching-pressure differential', null, null, this.getTagsForStencil(gn, 'x10590 accumulator charging valve with fixed switching pressure differential', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10600;points=[[0.218,0,0],[0.218,1,0],[0.927,1,0]]', w * 127.79, h * 116.31, '', 'X10600 Hydraulic pilot-controlled pressure-relief valve with electrically operated activation to a set pressure', null, null, this.getTagsForStencil(gn, 'x10600 hydraulic pilot controlled pressure relief valve with electrically operated activation to set pressure', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10610;points=[[0.35,0,0],[0.35,1,0],[0.585,1,0]]', w * 39.53, h * 37.35, '', 'X10610 Three-port pressure-reducing valve', null, null, this.getTagsForStencil(gn, 'x10610 three port pressure reducing valve', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10620;points=[[0.5,0,0],[0,0.66,0],[1,0.66,0]]', w * 56.05, h * 27.92, '', 'X10620 Dual pressure valve (AND function), in which an output signal is only obtained when both inlets are under pressure. The weaker signal is fed to the output.', null, null, this.getTagsForStencil(gn, 'x10620 dual pressure valve and function in which an output signal is only obtained when both inlets are under pressure the weaker signal is fed to the output', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10630;points=[[0.36,0,0],[0.36,1,0]]', w * 16.99, h * 37.57, '', 'X10630 Flow-control valve, adjustable', null, null, this.getTagsForStencil(gn, 'x10630 flow control valve adjustable', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10640;points=[[0.25,0,0],[0.25,1,0]]', w * 37.03, h * 55.98, '', 'X10640 Flow-control valve, adjustable, with free flow in one direction', null, null, this.getTagsForStencil(gn, 'x10640 flow control valve adjustable with free flow in one direction', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10650;points=[[0.695,0,0],[0.695,1,0]]', w * 68.5, h * 37.46, '', 'X10650 Flow-control valve, operated by roller plunger, spring-returned', null, null, this.getTagsForStencil(gn, 'x10650 flow control valve operated by roller plunger spring returned', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10660;points=[[0.33,0,0],[0.33,1,0]]', w * 41.87, h * 74.67, '', 'X10660 Two-port flow-control valve, preset, for one direction of flow, largely independent of viscosity and pressure differential, adjustable, with bypass check valve', null, null, this.getTagsForStencil(gn, 'x10660 two port flow control valve preset for one direction of flow largely independent of viscosity and pressure differential adjustable with bypass check valve', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10670;points=[[0.372,0,0],[0.372,1,0],[0.812,0,0]]', w * 37.05, h * 60.4, '', 'X10670 Three-port flow-control valve, adjustable, that divides the inlet flow into a fixed flow and a residual flow', null, null, this.getTagsForStencil(gn, 'x10670 three port flow control valve adjustable that divides the inlet flow into a fixed flow and a residual flow', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10680;points=[[0.3,0,0],[0.7,0,0],[0.5,1,0]]', w * 46.39, h * 56.08, '', 'X10680 Flow divider that divides the inlet flow into two outlet flows', null, null, this.getTagsForStencil(gn, 'x10680 flow divider that divides the inlet into two outlet flows', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10690;points=[[0.5,0,0],[0.3,1,0],[0.7,1,0]]', w * 46.39, h * 56.08, '', 'X10690 Flow-combining valve that maintains the two inlet flows constant in relation to each other', null, null, this.getTagsForStencil(gn, 'x10690 flow combining valve that maintains the two inlet flows constant in relation to each other', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10700;points=[[0.5,0,0],[0.5,1,0]]', w * 9.48, h * 28.02, '', 'X10700 Non-return valve, free flow possible in only one direction', null, null, this.getTagsForStencil(gn, 'x10700 non return valve free flow possible in only one direction', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10710;points=[[0.5,0,0],[0.5,1,0]]', w * 9.48, h * 37.4, '', 'X10710 Non-return valve with spring, free flow possible in only one direction, normally closed', null, null, this.getTagsForStencil(gn, 'x10710 non return valve with spring, free flow possible in only one direction, normally closed', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10720;points=[[0.395,0,0],[0.395,1,0],[0.795,1,0]]', w * 23.2, h * 46.79, '', 'X10720 Pilot-operated non-return valve with spring, in which pilot pressure allows free flow in both directions', null, null, this.getTagsForStencil(gn, 'x10720 pilot operated non return valve with spring, in which pilot pressure allows free flow in both directions', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10730;points=[[0.248,0,0],[0.248,1,0],[0.75,0,0],[0.75,1,0]]', w * 36.92, h * 46.73, '', 'X10730 Double non-return valve, pilot-operated', null, null, this.getTagsForStencil(gn, 'x10730 double non return valve pilot operated', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10740;points=[[0,0.665,0],[1,0.665,0],[0.498,0,0]]', w * 55.86, h * 28, '', 'X10740 Shuttle valve (OR function), in which the inlet that experiences the higher pressure is automatically connected to the outlet', null, null, this.getTagsForStencil(gn, 'x10740 shuttle valve or function in which the inlet that experiences the higher pressure is automatically connected to the outlet', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10750;points=[[0.355,0,0],[0,0.75,0]]', w * 78.47, h * 37.33, '', 'X10750 Quick-exhaust valve', null, null, this.getTagsForStencil(gn, 'x10750 quick exhaust valve', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10760;points=[[0.445,0.01,0],[0.555,0.01,0],[0.445,1,0],[0.555,1,0],[0,0.5,0],[0,0.625,0],[0,0.75,0],[1,0.5,0],[1,0.625,0],[1,0.75,0]]', w * 83.62, h * 37.51, '', 'X10760 Proportional directional control valve, directly controlled', null, null, this.getTagsForStencil(gn, 'x10760 proportional directional control valve, directly controlled', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10770;points=[[0.258,0,0],[0.258,1,0],[0.405,0,0],[0.405,1,0],[1,0.5,0],[1,0.625,0],[1,0.75,0]]', w * 62.72, h * 37.22, '', 'X10770 Proportional directional control valve, directly controlled', null, null, this.getTagsForStencil(gn, 'x10770 proportional directional control valve, directly controlled', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10780;points=[[0.407,0.2,0],[0.48,0.2,0],[0.407,1,0],[0.48,1,0],[0,0.6,0],[0,0.7,0],[0,0.8,0]]', w * 125.57, h * 46.52, '', 'X10780 Proportional directional control valve, pilot operated, with closed-loop position control of the main and pilot stages, with integrated electronics', null, null, this.getTagsForStencil(gn, 'x10780 proportional directional control valve pilot operated with closed loop position control of the main and pilot stages with integrated electronics', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10790;points=[[0.332,0.055,0],[0.416,0.055,0],[0.332,1,0],[0.416,1,0],[0,0.5,0],[0,0.625,0],[0,0.75,0]]', w * 125.57, h * 46.52, '', 'X10790 Servo-valve, pilot-operated, with closed-loop position control of the main and pilot stages, with integrated electronics', null, null, this.getTagsForStencil(gn, 'x10790 servo valve pilot operated with closed loop position control of the main and pilot stages with integrated electronics', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10800;points=[[0.332,0.055,0],[0.416,0.055,0],[0.332,1,0],[0.416,1,0],[0,0.5,0],[0,0.625,0],[0,0.75,0]]', w * 111.51, h * 37.21, '', 'X10800 Servo-valve, pilot-operated, pilot stage with electrical control mechanism with two coils, continuously controlled in both directions, with mechanical feedback of the valve-spool position to the pilot stage, with integrated electronics', null, null, this.getTagsForStencil(gn, 'x10800 servo valve pilot operated pilot stage with electrical control mechanism with two coils continuously controlled in both directions with mechanical feedback of the valve spool position to the pilot stage with integrated electronics', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10810;points=[[0.272,1,0],[0.364,1,0]]', w * 102.1, h * 78.82, '', 'X10810 Electro-hydraulic linear drive consisting of cylinder with servo-valve and stepping motor, mechanical feedback of the cylinder position', null, null, this.getTagsForStencil(gn, 'x10810 electro hydraulic linear drive consisting of cylinder with servo valve and stepping motor mechanical feedback of the cylinder position', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10820;points=[[0.143,0,0],[0.225,0,0],[0.143,1,0],[0.225,1,0]]', w * 113.78, h * 37.51, '', 'X10820 Servo-valve with preferred position in case of a power failure, electrical feedback and integral electronics', null, null, this.getTagsForStencil(gn, 'x10820 servo valve with preferred position in case of a power failure electrical feedback and integral electronics', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10830;points=[[0.35,0,0],[0.35,1,0],[1,0.5,0],[1,0.625,0],[1,0.75,0]]', w * 53.33, h * 37.41, '', 'X10830 Proportional pressure-relief valve, directly controlled, in which the solenoid controls the valve poppet by means of a spring', null, null, this.getTagsForStencil(gn, 'x10830 proportional pressure relief valve directly controlled in which the solenoid controls the valve poppet by means of a spring', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10840;points=[[0.335,0,0],[0.335,1,0]]', w * 55.74, h * 37.41, '', 'X10840 Proportional pressure-relief valve, directly controlled by a solenoid acting on a valve poppet, with integral electronics', null, null, this.getTagsForStencil(gn, 'x10840 proportional pressure relief valve directly controlled by a solenoid acting on a valve poppet with integral electronics', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10850;points=[[0.277,0,0],[0.277,1,0]]', w * 67.36, h * 37.41, '', 'X10850 Proportional pressure-relief valve, directly controlled, with closed-loop position control of the solenoid and with integral electronics', null, null, this.getTagsForStencil(gn, 'x10850 proportional pressure relief valve directly controlled with closed loop position control of the solenoid and with integral electronics', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10860;points=[[0.23,0,0],[0.23,1,0],[0.515,1,0]]', w * 81.17, h * 37.5, '', 'X10860 Proportional pressure-relief valve, pilot-operated with electrical sensing of the solenoid position, with external pilot drain', null, null, this.getTagsForStencil(gn, 'x10860 proportional pressure relief valve pilot operated with electrical sensing of the solenoid position with external pilot drain', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10870;points=[[0.23,0,0],[0.17,1,0],[0.285,1,0]]', w * 81.19, h * 37.46, '', 'X10870 Three-port proportional pressure-reducing valve with closed-loop position control of the solenoid and integrated electronics', null, null, this.getTagsForStencil(gn, 'x10870 three port proportional pressure reducing valve with closed-loop position control of the solenoid and integrated electronics', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10880;points=[[0.267,0.15,0],[0.267,1,0],[0.6,1,0]]', w * 69.57, h * 44.21, '', 'X10880 Proportional pressure-relief valve, pilotoperated, with integral electronics and additional pilot stage for manual pressure adjustment or maximum pressure-relief function, with external drain', null, null, this.getTagsForStencil(gn, 'x10880 proportional pressure relief valve pilotoperated with integral electronics and additional pilot stage for manual pressure adjustment or maximum pressure relief function with external drain', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10890;points=[[0.667,0,0],[0.667,1,0]]', w * 62.7, h * 37.51, '', 'X10890 Proportional flow-control valve, directly controlled', null, null, this.getTagsForStencil(gn, 'x10890 proportional flow control valve directly controlled', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10900;points=[[0.665,0,0],[0.665,1,0],[0.785,0,0],[0.785,1,0]]', w * 76.63, h * 37.58, '', 'X10900 Proportional flow-control valve, directly controlled, with closed-loop position control of the solenoid and integrated electronics', null, null, this.getTagsForStencil(gn, 'x10900 proportional flow control valve directly controlled with closed-loop position control of the solenoid and integrated electronics', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10910;points=[[0.768,0.197,0],[0.768,1,0]]', w * 90.65, h * 46.72, '', 'X10910 Proportional flow-control valve, pilot-operated, with position control of the main and pilot stage, integrated electronics', null, null, this.getTagsForStencil(gn, 'x10910 proportional flow control valve pilot operated with position control of the main and pilot stage integrated electronics', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10920;points=[[0.77,0,0],[0.77,0.673,0]]', w * 30.2, h * 55.47, '', 'X10920 Adjustable-orifice flow-control valve using a proportional solenoid that is not affected by changes in viscosity', null, null, this.getTagsForStencil(gn, 'x10920 adjustable orifice flow control valve using a proportional solenoid that is not affected by changes in viscosity', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10930;points=[[0.335,1,0],[1,0.6,0]]', w * 28.05, h * 46.64, '', 'X10930 Pressure-control and directional control valve cartridge, poppet design, area ratio 1:1', null, null, this.getTagsForStencil(gn, 'x10930', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10940;points=[[0.335,1,0],[1,0.6,0]]', w * 28.05, h * 46.64, '', 'X10940 Pressure-control and directional control valve cartridge, poppet design, normally open, area ratio 1:1', null, null, this.getTagsForStencil(gn, 'x10940 pressure control and directional control valve cartridge poppet design normally open area ratio', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10950;points=[[0.335,1,0],[1,0.6,0]]', w * 28.05, h * 46.64, '', 'X10950 Directional control valve cartridge, poppet design, with throttle nose, area ratio <= 0,7', null, null, this.getTagsForStencil(gn, 'x10950 directional control valve cartridge poppet design with throttle nose area ratio', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10960;points=[[0.335,1,0],[1,0.6,0]]', w * 28.05, h * 46.64, '', 'X10960 Directional control valve cartridge, poppet design, with throttle nose, area ratio > 0,7', null, null, this.getTagsForStencil(gn, 'x10960 directional control valve cartridge poppet design with throttle nose area ratio', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10970;points=[[0.335,1,0],[1,0.6,0]]', w * 28.05, h * 46.64, '', 'X10970 Directional control valve cartridge, poppet design, area ratio <= 0,7', null, null, this.getTagsForStencil(gn, 'x10970 directional control valve cartridge poppet design area ratio', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10980;points=[[0.335,1,0],[1,0.6,0]]', w * 28.05, h * 46.64, '', 'X10980 Directional control valve cartridge, poppet design, area ratio < 0,7', null, null, this.getTagsForStencil(gn, 'x10980 directional control valve cartridge poppet design area ratio', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x10990;points=[[0.37,1,0],[1,0.39,0],[0.878,0.653,0]]', w * 37.18, h * 53.69, '', 'X10990 Active-control, directional control valve cartridge, poppet design, opened by pilot pressure', null, null, this.getTagsForStencil(gn, 'x10990 active control directional control valve cartridge poppet design opened by pilot pressure', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11000;points=[[0.37,1,0],[1,0.39,0],[0.878,0.653,0]]', w * 37.18, h * 53.69, '', 'X11000 Active-control, directional control valve cartridge without area difference on side B', null, null, this.getTagsForStencil(gn, 'x11000 active control directional control valve cartridge without area difference on side', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11010;points=[[0.335,1,0],[1,0.6,0]]', w * 28.03, h * 46.6, '', 'X11010 Directional control valve cartridge, non-return function, poppet design, internal pilot supply, with replaceable orifice (restrictor)', null, null, this.getTagsForStencil(gn, 'x11010 directional control valve cartridge non return function poppet design internal pilot supply with replaceable orifice restrictor', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11020;points=[[0.33,1,0],[1,0.5,0]]', w * 28.03, h * 46.6, '', 'X11020 Cartridge for pressure-relief and limitation functions, spool design, normally closed', null, null, this.getTagsForStencil(gn, 'x110020 cartridge for pressure relief and limitation functions spool design normally closed', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11030;points=[[0.33,1,0],[1,0.5,0]]', w * 28.03, h * 46.6, '', 'X11030 Pressure-reducing valve cartridge, spool design, normally closed, with integrated non-return valve', null, null, this.getTagsForStencil(gn, 'x11030 pressure reducing valve cartridge spool design normally closed with integrated non return valve', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11040;points=[[0.33,1,0],[1,0.6,0]]', w * 28.06, h * 46.6, '', 'X11040 Pressure-reducing valve cartridge, spool design, normally open, with integrated non-return valve', null, null, this.getTagsForStencil(gn, 'x11040 pressure reducing valve cartridge spool design normally open with integrated non return valve', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11050;', w * 148.47, h * 27.76, '', 'X11050 Control cover without ports', null, null, this.getTagsForStencil(gn, 'x11050 control cover without ports', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11060;points=[[0.061,1,0],[0.499,0.75,0]]', w * 148.47, h * 37.39, '', 'X11060 Control cover with pilot port', null, null, this.getTagsForStencil(gn, 'x11060 control cover with pilot port', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11070;points=[[0.13,1,0],[0.497,0.84,0]]', w * 177.75, h * 57.56, '', 'X11070 Control cover with pilot port, with adjustable stroke limiter and remote-control port', null, null, this.getTagsForStencil(gn, 'x11070 control cover with pilot port with adjustable stroke limiter and remote control port', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11080;points=[[0.062,1,0],[0.187,1,0],[0.5,0.76,0],[0.814,1,0],[0.937,1,0]]', w * 148.47, h * 37.46, '', 'X11080 Control cover for mounting additional elements', null, null, this.getTagsForStencil(gn, 'x11080 control cover for mounting additional elements', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11090;points=[[0.062,1,0],[0.187,1,0],[0.5,0.875,0],[0.814,1,0]]', w * 148.47, h * 74.46, '', 'X11090 Control cover with hydraulically controlled shuttle valve', null, null, this.getTagsForStencil(gn, 'x11090 control cover with hydraulically controlled shuttle valve', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11100;points=[[0.062,1,0],[0.187,1,0],[0.5,0.875,0],[0.814,1,0]]', w * 148.47, h * 74.46, '', 'X11100 Control cover with shuttle valve', null, null, this.getTagsForStencil(gn, 'x11100 control cover with shuttle valve', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11110;points=[[0.062,1,0],[0.187,1,0],[0.5,0.875,0],[0.814,1,0],[0.94,1,0]]', w * 148.47, h * 74.74, '', 'X11110 Control cover with shuttle valve for mounting additional elements', null, null, this.getTagsForStencil(gn, 'x11110 control cover with shuttle valve for mounting additional elements', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11120;points=[[0.062,1,0],[0.187,1,0],[0.5,0.86,0],[0.94,1,0]]', w * 148.47, h * 65.4, '', 'X11120 Control cover with pressure-relief function', null, null, this.getTagsForStencil(gn, 'x11120 control cover with pressure-relief function', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11130;points=[[0.062,1,0],[0.187,1,0],[0.5,0.88,0],[0.94,1,0]]', w * 148.47, h * 74.46, '', 'X11130 Control cover with pressure-relief function and hydraulic unloading', null, null, this.getTagsForStencil(gn, 'x11130 control cover with pressure relief function and hydraulic unloading', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11140;points=[[0.062,1,0],[0.187,1,0],[0.5,0.88,0],[0.94,1,0]]', w * 148.47, h * 74.46, '', 'X11140 Control cover with pressure-relief function with a flow-control valve for limiting the pilot flow', null, null, this.getTagsForStencil(gn, 'x11140 control cover with pressure-relief function with a flow-control valve for limiting the pilot flow', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11150;points=[[0,0.307,0],[0.13,0.61,0],[0.497,1,0],[0.603,0.803,0]]', w * 177.75, h * 94.56, '', 'X11150 Two-port cartridge valve with stroke limiter', null, null, this.getTagsForStencil(gn, 'x11150 two port cartridge valve with stroke limiter', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11160;points=[[0.062,0.733,0],[0.188,0.733,0],[0.5,1,0],[0.627,0.867,0],[0.812,0.733,0],[0.937,0.733,0]]', w * 148.55, h * 139.44, '', 'X11160 Two-port cartridge valve with builtin directional control valve', null, null, this.getTagsForStencil(gn, 'x11160 two port cartridge valve with builtin directional control valve', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11170;points=[[0.062,0.867,0],[0.5,1,0],[0.627,0.867,0],[0.937,0.867,0]]', w * 148.55, h * 139.44, '', 'X11170 Two-port cartridge valve with active control, with built-in directional control valve', null, null, this.getTagsForStencil(gn, 'x11170 two port cartridge valve with active control with built-in directional control valve', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11180;points=[[0,0.25,0],[0.543,1,0],[0.656,0.748,0],[0.943,0.58,0],[0.257,0.58,0]]', w * 162.55, h * 111.61, '', 'X11180 Two-port cartridge valve with pressure-relief function', null, null, this.getTagsForStencil(gn, 'x11180 two port cartridge valve with pressure relief function', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11190;points=[[0,0.624,0],[1,0.624,0],[0.5,1,0],[0.607,0.873,0],[0.86,0.79,0],[0.868,0.79,0]]', w * 176.51, h * 223.31, '', 'X11190 Two-port cartridge valve with pressure-relief function and selectable second pressure stage', null, null, this.getTagsForStencil(gn, 'x11190 two port cartridge valve with pressure relief function and selectable second pressure stage', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11200;points=[[0,0.5,0],[1,0.5,0],[0.5,1,0],[0.606,0.832,0],[0.868,0.722,0]]', w * 176.51, h * 167.41, '', 'X11200 Two-port cartridge valve with proportional pressure adjustment and manual maximum pressure relief function', null, null, this.getTagsForStencil(gn, 'x11200 two port cartridge valve with proportional pressure adjustment and manual maximum pressure relief function', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11210;points=[[0,0.843,0],[0.5,1,0],[0.936,0.693,0]]', w * 148.69, h * 120.85, '', 'X11210 Two-port cartridge valve with pressure-reducing function and flow-control valve, controlled by high pressure', null, null, this.getTagsForStencil(gn, 'x11210 two port cartridge valve with pressure reducing function and flow control valve controlled by high pressure', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11220;points=[[0.5,1,0],[0.625,0.784,0],[0.937,0.643,0]]', w * 148.69, h * 130.29, '', 'X11220 Two-port cartridge valve with pressure-reducing function, controlled by low pressure', null, null, this.getTagsForStencil(gn, 'x11220 two port cartridge valve with pressure reducing function controlled by low pressure', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11230;points=[[0.5,0,0],[0.5,1,0]]', w * 42.27, h * 46.97, '', 'X11230 Variable-displacement pump and one direction of rotation (clockwise)', null, null, this.getTagsForStencil(gn, 'x11230 variable displacement pump and one direction of rotation clockwise', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11240;points=[[0.567,0,0],[0.567,1,0],[0.95,1,0]]', w * 48.85, h * 46.97, '', 'X11240 Variable-displacement pump with two directions of flow, external drain line, and one direction of rotation (clockwise)', null, null, this.getTagsForStencil(gn, 'x11240 variable displacement pump with two directions of flow external drain line and one direction of rotation clockwise', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11250;points=[[0.567,0,0],[0.567,1,0],[0.95,1,0]]', w * 48.85, h * 46.97, '', 'X11250 Reversible pump/motor unit with two directions of flow and variable displacement, external drain line, and two directions of rotation', null, null, this.getTagsForStencil(gn, 'x11250 reversible pump motor unit with two directions of flow and variable displacement external drain line and two directions of rotation', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11260;points=[[0.57,0,0],[0.57,1,0]]', w * 48.42, h * 46.97, '', 'X11260 Fixed displacement pump/motor unit with one direction of rotation (clockwise)', null, null, this.getTagsForStencil(gn, 'x11260 fixed displacement pump motor unit with one direction of rotation clockwise', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11270;points=[[1,0.25,0],[1,0.75,0]]', w * 42.3, h * 27.87, '', 'X11270 Pump with a limited swivel angle, lever-operated', null, null, this.getTagsForStencil(gn, 'x11270 pump with a limited swivel angle lever operated', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11280;points=[[0,0.25,0],[0,0.75,0]]', w * 37.31, h * 27.87, '', 'X11280 Rotary actuator/swivel drive with a limited swivel angle and two directions of flow', null, null, this.getTagsForStencil(gn, 'x11280 rotary actuator swivel drive with a limited swivel angle and two directions of flow', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11290;points=[[0.053,0.25,0]]', w * 39.41, h * 27.87, '', 'X11290 Semi-rotary actuator/swivel drive, single-acting', null, null, this.getTagsForStencil(gn, 'x11290 semi rotary actuator swivel drive  single acting', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11300;points=[[0.03,0.895,0],[0.742,0,0],[0.742,0.815,0],[0.871,0.833,0]]', w * 143.98, h * 114.54, '', 'X11300 Variable-displacement pump, pilot-operated, with pressure compensation, one direction of rotation (clockwise) and an external drain line', null, null, this.getTagsForStencil(gn, 'x11300 variable displacement pump pilot operated with pressure compensation one direction of rotation clockwise and an external drain line', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11310;points=[[0.03,0.91,0],[0.75,0,0],[0.75,0.98,0],[0.874,1,0]]', w * 148.8, h * 133.09, '', 'X11310 Variable-displacement pump with combined pressure/flow control (load-sensing type), one drive direction (clockwise) and an external drain line', null, null, this.getTagsForStencil(gn, 'x11310 variable displacement pump with combined pressure flow control load sensing type, one drive direction clockwise and an external drain line', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11320;points=[[0.575,0,0],[0.575,1,0],[0.79,0.93,0]]', w * 88.39, h * 102.61, '', 'X11320 Variable-displacement pump with mechanical/hydraulic servo-control, one drive direction (counter-clockwise) and an external drain line', null, null, this.getTagsForStencil(gn, 'x11320 variable displacement pump with mechanical hydraulic servo control, one drive direction counter clockwise and an external drain line', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11330;points=[[0.575,0,0],[0.575,1,0],[0.79,0.93,0]]', w * 88.39, h * 102.61, '', 'X11330 Variable-displacement hydraulic pump with electro-hydraulic servo control, one drive direction (counter-clockwise) and an external drain line', null, null, this.getTagsForStencil(gn, 'x11330 variable displacement hydraulic pump with electro hydraulic servo control one drive direction counter clockwise and an external drain line', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11340;points=[[0.6,0,0],[0.6,1,0],[0.8,1,0]]', w * 92.92, h * 102.61, '', 'X11340 Variable-displacement pump with power control, one drive direction (clockwise) and an external drain line', null, null, this.getTagsForStencil(gn, 'x11340 variable displacement pump with power control one drive direction clockwise and an external drain line', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11350;points=[[0.69,0,0],[0.69,0.98,0],[0.845,1,0]]', w * 120.78, h * 104.8, '', 'X11350 Variable-displacement pump with a two-stage adjustable stroke limited pressure/flow control, internal pilot-operated, one drive direction (clockwise) and an external drain line', null, null, this.getTagsForStencil(gn, 'x11350 variable displacement pump with a two stage adjustable stroke limited pressure flow control internal pilot operated one drive direction clockwise and an external drain line', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11360;points=[[0.75,0,0],[0.75,0.982,0],[0.875,1,0]]', w * 148.69, h * 123.33, '', 'X11360 Variable-displacement pump with a two-stage adjustable limited-stroke pressure/flow-control element, electrical switchover, one drive direction (clockwise) and an external drain line', null, null, this.getTagsForStencil(gn, 'x11360', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11370;points=[[0.5,0,0],[0.5,1,0]]', w * 111.29, h * 83.91, '', 'X11370 Hydrostatic transmission (simplified representation), drive unit consisting of one reversible, variable-displacement pump with one input direction of rotation and one fixed displacement motor with two output directions of rotation', null, null, this.getTagsForStencil(gn, 'x11370 hydrostatic transmission simplified representation drive unit consisting of one reversible variable displacement pump with one input direction of rotation and one fixed displacement motor with two output directions of rotation', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11380;points=[[0.645,0,0],[0.645,0.74,0]]', w * 61.19, h * 62.84, '', 'X11380 Variable-displacement pump with one drive direction (clockwise)', null, null, this.getTagsForStencil(gn, 'x11380 variable displacement pump with one drive direction clockwise', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11390;points=[[0.334,0,0],[0.334,1,0]]', w * 41.69, h * 46.45, '', 'X11390 Motor', null, null, this.getTagsForStencil(gn, 'x11390 motor', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11400;points=[[0.666,0,0],[0.666,1,0]]', w * 41.61, h * 46.97, '', 'X11400 Compressor', null, null, this.getTagsForStencil(gn, 'x11400 compressor', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11410;points=[[0.387,0,0],[0.387,1,0]]', w * 52.95, h * 46.45, '', 'X11410 Motor with alternate directions of flow, fixed displacement and two directions of rotation', null, null, this.getTagsForStencil(gn, 'x11410 motor with alternate directions of flow fixed displacement and two directions of rotation', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11420;points=[[0.665,0,0],[0.665,1,0]]', w * 41.75, h * 46.45, '', 'X11420 Vacuum pump', null, null, this.getTagsForStencil(gn, 'x11420 vacuum pump', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11430;points=[[0,0.375,0],[1,0.375,0],[0.4,0.99,0],[0.6,1,0]]', w * 46.97, h * 37.36, '', 'X11430 Pressure intensifier, continuous, which converts a pneumatic pressure p1 into a higher hydraulic pressure p2', null, null, this.getTagsForStencil(gn, 'x11430 pressure intensifier continuous which converts a pneumatic pressure p1 into a higher hydraulic pressure p2', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11440;points=[[0.04,1,0],[0.707,1,0]]', w * 55.71, h * 28.02, '', 'X11440 Single-acting, single-rod cylinder, return stroke by spring force, spring chamber with connection', null, null, this.getTagsForStencil(gn, 'x11440 single acting single rod cylinder return stroke by spring force spring chamber with connection', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11450;points=[[0.04,1,0],[0.707,1,0]]', w * 55.71, h * 28.02, '', 'X11450 Double-acting, single-rod cylinder', null, null, this.getTagsForStencil(gn, 'x11450 double acting single rod cylinder', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11460;points=[[0.427,1,0],[0.81,1,0]]', w * 97.52, h * 36.78, '', 'X11460 Double-acting, double-rod cylinder, with different piston-rod diameters; cushioning on both sides with adjustment on right side only', null, null, this.getTagsForStencil(gn, 'x11460 double acting double rod cylinder with different piston rod diameters cushioning on both sides with adjustment on right side only', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11470;points=[[0.28,1,0],[0.76,1,0]]', w * 77.69, h * 30.32, '', 'X11470 Double-acting diaphragm cylinder with preset stroke limiter', null, null, this.getTagsForStencil(gn, 'x11470 double acting diaphragm cylinder with preset stroke limiter', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11480;points=[[0.53,1,0]]', w * 74.56, h * 28.02, '', 'X11480 Single-acting diaphragm cylinder with cushioning on rod end, vented cap end without the possibility of a connection', null, null, this.getTagsForStencil(gn, 'x11480 single acting diaphragm cylinder with cushioning on rod end vented cap end without the possibility of a connection', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11490;points=[[0.047,1,0]]', w * 51.07, h * 32.7, '', 'X11490 Single-acting cylinder, plunger cylinder', null, null, this.getTagsForStencil(gn, 'x11490 single acting cylinder plunger cylinder', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11500;points=[[0.025,1,0]]', w * 85.98, h * 32.7, '', 'X11500 Telescopic cylinder, single-acting', null, null, this.getTagsForStencil(gn, 'x11500 telescopic cylinder single a0cting', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11510;points=[[0.03,1,0],[0.53,1,0],[0.78,1,0]]', w * 74.26, h * 32.67, '', 'X11510 Telescopic cylinder, double-acting', null, null, this.getTagsForStencil(gn, 'x11510 telescopic cylinder double acting', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11520;points=[[0.05,1,0],[0.94,1,0]]', w * 41.75, h * 32.72, '', 'X11520 Double-acting band-type rodless cylinder with end-position cushioning on both sides of the piston', null, null, this.getTagsForStencil(gn, 'x11520 double acting band type rodless cylinder with end position cushioning on both sides of the piston', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11530;points=[[0.05,1,0],[0.94,1,0]]', w * 41.75, h * 36.9, '', 'X11530 Double-acting cable-type rodless cylinder with adjustable end-position cushioning on both sides of the piston', null, null, this.getTagsForStencil(gn, 'x11530 double acting cable type rodless cylinder with adjustable end position cushioning on both sides of the piston', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11540;points=[[0.04,1,0],[0.705,1,0]]', w * 55.73, h * 42.07, '', 'X11540 Double-acting magnetic-type rodless cylinder with position switch on right-hand end only', null, null, this.getTagsForStencil(gn, 'x11540 double acting magnetic type rodless cylinder with position switch on right hand end only', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11550;points=[[0.04,1,0],[0.705,1,0]]', w * 55.72, h * 28.06, '', 'X11550 Double-acting cylinder with detents at both ends of the stroke', null, null, this.getTagsForStencil(gn, 'x11550 double acting cylinder with detents at both ends of the stroke', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11560;points=[[0.34,1,0],[0.66,1,0]]', w * 116.04, h * 41.96, '', 'X11560 Double-acting cylinder, double rod, with internal limit switch on the left end, with internal mechanical control, external limit switch on the right end, tripped by the piston rod', null, null, this.getTagsForStencil(gn, 'x11560 double acting cylinder double rod with internal limit switch on the left end with internal mechanical control external limit switch on the right end tripped by the piston rod', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11570;points=[[0.027,1,0],[0.477,1,0]]', w * 82.45, h * 52.12, '', 'X11570 Pressure-medium converter, single-acting, which converts a pneumatic pressure into a hydraulic pressure of the same value', null, null, this.getTagsForStencil(gn, 'x11570 pressure medium converter single acting which converts a pneumatic pressure into a hydraulic pressure of the same value', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11580;points=[[0.053,1,0],[0.94,1,0]]', w * 41.74, h * 27.95, '', 'X11580 Pressure intensifier, single-acting, which converts a pneumatic pressure p1 into a higher hydraulic pressure p2', null, null, this.getTagsForStencil(gn, 'x11580 pressure intensifier single acting which converts a pneumatic pressure p1 into a higher hydraulic pressure p2', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11590;points=[[0.053,1,0],[0.94,1,0]]', w * 41.74, h * 36.03, '', 'X11590 Pressure intensifier, single-acting, which converts a pneumatic pressure p1 into a higher hydraulic pressure p2', null, null, this.getTagsForStencil(gn, 'x11590 pressure intensifier single acting which converts a pneumatic pressure p1 into a higher hydraulic pressure p2', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11600;points=[[0.5,1,0]]', w * 37.52, h * 28, '', 'X11600 Bellows cylinder', null, null, this.getTagsForStencil(gn, 'x11600 bellows cylinder', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11610;points=[[0,0.5,0]]', w * 46.69, h * 19.07, '', 'X11610 Hose cylinder', null, null, this.getTagsForStencil(gn, 'x11610 hose cylinder', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11620;points=[[0,0.25,0],[0,0.55,0],[0.55,1,0],[0.863,1,0]]', w * 118.47, h * 46.64, '', 'X11620 Semi-rotary linear drive, double-acting with permanent magnet on the piston', null, null, this.getTagsForStencil(gn, 'x11620 semi rotary linear drive double acting with permanent magnet on the piston', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11630;points=[[0.05,1,0],[0.65,1,0]]', w * 46.47, h * 27.91, '', 'X11630 Gripper, double-acting with permanent magnet on piston', null, null, this.getTagsForStencil(gn, 'x11630 gripper double acting with permanent magnet on piston', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11640;points=[[0.05,1,0],[0.65,1,0]]', w * 46.47, h * 27.91, '', 'X11640 Gripper, double-acting with permanent magnet on piston', null, null, this.getTagsForStencil(gn, 'x11640 gripper double acting with permanent magnet on piston', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11650;points=[[0.05,1,0]]', w * 46.47, h * 27.91, '', 'X11650 Gripper, single-acting with permanent magnet on piston', null, null, this.getTagsForStencil(gn, 'x11650 gripper single acting with permanent magnet on piston', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11660;points=[[0.65,1,0]]', w * 46.47, h * 27.91, '', 'X11660 Gripper, single-acting with permanent magnet on piston', null, null, this.getTagsForStencil(gn, 'x11660 gripper single acting with permanent magnet on piston', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11670;points=[[0,0.1,0],[1,0.1,0],[0.037,0,0],[0.963,0,0]]', w * 20.03, h * 6.68, '', 'X11670 Hose assembly', null, null, this.getTagsForStencil(gn, 'x11670 Hose assembly', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11680;points=[[0,0.27,0],[0,0.64,0],[0,1,0],[1,0.27,0],[1,0.64,0],[1,1,0]]', w * 46.83, h * 25.43, '', 'X11680 Three-way rotary connection', null, null, this.getTagsForStencil(gn, 'x11680 three way rotary connection', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11690;points=[[0.5,0,0],[0.5,1,0]]', w * 9.49, h * 51.39, '', 'X11690 Quick-action coupling without non-return valve, uncoupled', null, null, this.getTagsForStencil(gn, 'x11690 quick action coupling without non return valve uncoupled', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11700;points=[[0.5,0,0],[0.5,1,0]]', w * 9.49, h * 51.39, '', 'X11700 Quick-action coupling with non-return valve, uncoupled', null, null, this.getTagsForStencil(gn, 'x11700 quick action coupling with non return valve uncoupled', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11710;points=[[0.5,0,0],[0.5,1,0]]', w * 9.49, h * 51.43, '', 'X11710 Quick-action coupling with two non-return valves, uncoupled', null, null, this.getTagsForStencil(gn, 'x11710 quick action coupling with two non return valves uncoupled', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11720;points=[[0.5,0,0],[0.5,1,0]]', w * 9.49, h * 46.89, '', 'X11720 Quick-action coupling without non-return valve, coupled', null, null, this.getTagsForStencil(gn, 'x11720 quick action coupling without non return valve coupled', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11730;points=[[0.5,0,0],[0.5,1,0]]', w * 9.49, h * 46.89, '', 'X11730 Quick-action coupling with one non-return valve, coupled', null, null, this.getTagsForStencil(gn, 'x11730 quick action coupling with one non return valve coupled', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11740;points=[[0.5,0,0],[0.5,1,0]]', w * 9.49, h * 46.89, '', 'X11740 Quick-action coupling with two non-return valves, coupled', null, null, this.getTagsForStencil(gn, 'x11740 quick action coupling with two non return valves coupled', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11750;points=[[0,0.58,0]]', w * 35.2, h * 21.37, '', 'X11750 Pressure switch, electro-mechanical, adjustable', null, null, this.getTagsForStencil(gn, 'x11750 pressure switch electro mechanical adjustable', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11760;points=[[0.4,0,0],[0,0.7,0]]', w * 23.41, h * 23.56, '', 'X11760 Pressure converter electronically adjustable switching signal output', null, null, this.getTagsForStencil(gn, 'x11760 pressure converter electronically adjustable switching signal output', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11770;points=[[0,0.5,0]]', w * 23.41, h * 13.98, '', 'X11770 Pressure sensor, analogue output signal', null, null, this.getTagsForStencil(gn, 'x11770 pressure sensor analogue output signal', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11780;points=[[0,0,0],[0.5,0,0],[1,0,0],[1,0.5,0],[1,1,0],[0.5,1,0],[0,1,0],[0,0.5,0]]', w * 13.88, h * 9.28, '', 'X11780 Piezo-electric control mechanism', null, null, this.getTagsForStencil(gn, 'x11780 piezo electric control mechanism', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11790;points=[[0,0,0],[0.5,0,0],[1,0,0],[1,0.5,0],[1,1,0],[0.5,1,0],[0,1,0],[0,0.5,0]]', w * 23.06, h * 13.87, '', 'X11790 Optical indicator', null, null, this.getTagsForStencil(gn, 'x11790 optical indicator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11800;points=[[0,0,0],[0.5,0,0],[1,0,0],[1,0.5,0],[1,1,0],[0.5,1,0],[0,1,0],[0,0.5,0]]', w * 23.06, h * 13.87, '', 'X11800 Indicator with digital display', null, null, this.getTagsForStencil(gn, 'x11800 indicator with digital display', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11810;points=[[0,0,0],[0.5,0,0],[1,0,0],[1,0.5,0],[1,1,0],[0.5,1,0],[0,1,0],[0,0.5,0]]', w * 23.06, h * 13.87, '', 'X11810 Acoustic indicator', null, null, this.getTagsForStencil(gn, 'x11810 acoustic indicator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11820;points=[[0.5,1,0]]', w * 18.67, h * 28.05, '', 'X11820 Pressure-measuring unit (pressure gauge)', null, null, this.getTagsForStencil(gn, 'x11820 pressure measuring unit pressure gauge', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11830;points=[[0.5,0,0],[0.5,1,0]]', w * 18.67, h * 37.38, '', 'X11830 Differential-pressure gauge', null, null, this.getTagsForStencil(gn, 'x11830 differential pressure gauge', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11840;points=[[0.07,0.485,0],[1,0.145,0],[1,0.315,0],[1,0.485,0],[1,0.66,0],[1,0.83,0],[1,1,0]]', w * 50.2, h * 54.27, '', 'X11840 Pressure gauge with select function', null, null, this.getTagsForStencil(gn, 'x11840 pressure gauge with select function', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11850;points=[[0.5,1,0]]', w * 18.67, h * 28.09, '', 'X11850 Thermometer', null, null, this.getTagsForStencil(gn, 'x11850 thermometer', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11860;points=[[0.57,0,0],[0.28,1,0]]', w * 32.48, h * 35.29, '', 'X11860 Thermometer with two adjustable electrical break-contacts (contact thermometer)', null, null, this.getTagsForStencil(gn, 'x11860 thermometer with two adjustable electrical break contacts contact thermometer', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11870;points=[[0.5,1,0]]', w * 18.72, h * 28.09, '', 'X11870 Fluid-level indicator (sight-glass)', null, null, this.getTagsForStencil(gn, 'x11870 fluid level indicator sight glass', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11880;points=[[0.28,1,0]]', w * 32.66, h * 28.09, '', 'X11880 Fluid-level switch with four break-contacts', null, null, this.getTagsForStencil(gn, 'x11880 fluid level switch with four break contacts', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11890;points=[[0.225,1,0]]', w * 41.93, h * 32.62, '', 'X11890 Electrical fluid-level monitor with analogue output signal and digital display', null, null, this.getTagsForStencil(gn, 'x11890 electrical fluid level monitor with analogue output signal and digital display', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11900;points=[[0.5,1,0]]', w * 18.67, h * 28.09, '', 'X11900 Flow indicator', null, null, this.getTagsForStencil(gn, 'x11900 flow indicator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11910;points=[[0.5,0,0],[0.5,1,0]]', w * 18.67, h * 37.52, '', 'X11910 Flow meter', null, null, this.getTagsForStencil(gn, 'x11910 flow meter', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11920;points=[[0.22,0,0],[0.22,1,0]]', w * 41.88, h * 37.52, '', 'X11920 Flow meter with digital display', null, null, this.getTagsForStencil(gn, 'x11920 flow meter with digital display', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11930;points=[[0,0.375,0],[0,0.625,0]]', w * 28.14, h * 18.71, '', 'X11930 Tachometer', null, null, this.getTagsForStencil(gn, 'x11930 tachometer', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11940;points=[[0,0.37,0],[0,0.62,0],[1,0.37,0],[1,0.62,0]]', w * 37.47, h * 18.71, '', 'X11940 Torque meter', null, null, this.getTagsForStencil(gn, 'x11940 torque meter', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11950;points=[[0,0,0],[0.5,0,0],[1,0,0],[1,0.5,0],[1,1,0],[0.5,1,0],[0,1,0],[0,0.5,0]]', w * 23.11, h * 13.91, '', 'X11950 Time controller with switch', null, null, this.getTagsForStencil(gn, 'x11950 time controller with switch', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11960;points=[[0,0.5,0]]', w * 27.91, h * 18.57, '', 'X11960 Counter', null, null, this.getTagsForStencil(gn, 'x11960 counter', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11970;points=[[0,0.29,0],[1,0.145,0],[0.893,1,0]]', w * 88.64, h * 32.33, '', 'X11970 In-line particle counter', null, null, this.getTagsForStencil(gn, 'x11970 in line particle counter', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11980;points=[[0.5,0,0],[0.5,1,0]]', w * 26.22, h * 45.06, '', 'X11980 Filter', null, null, this.getTagsForStencil(gn, 'x11980 filter', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x11990;points=[[0.5,0,0],[0.5,1,0]]', w * 26.22, h * 47.81, '', 'X11990 Reservoir-breather filter', null, null, this.getTagsForStencil(gn, 'x11990 reservoir breather filter', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12000;points=[[0.5,0,0],[0.5,1,0]]', w * 26.22, h * 45.06, '', 'X12000 Filter with additional magnetic element', null, null, this.getTagsForStencil(gn, 'x12000 filter with additional magnetic element', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12010;points=[[0.255,0.045,0],[0.255,1,0]]', w * 51.35, h * 47.26, '', 'X12010 Filter with optical clogging indicator', null, null, this.getTagsForStencil(gn, 'x12010 filter with optical clogging indicator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12020;points=[[0.28,0.09,0],[0.28,1,0]]', w * 46.93, h * 49.61, '', 'X12020 Filter with pressure-measuring instrument', null, null, this.getTagsForStencil(gn, 'x12020 filter with pressure measuring instrument', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12030;points=[[0.62,0,0],[0.62,1,0]]', w * 48.7, h * 63.01, '', 'X12030 Filter with a throttled bypass flow', null, null, this.getTagsForStencil(gn, 'x12030 Filter with a throttled bypass flow', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12040;points=[[0.68,0,0],[0.68,1,0]]', w * 61.46, h * 73.5, '', 'X12040 Filter with bypass valve', null, null, this.getTagsForStencil(gn, 'x12040 filter with bypass valve', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12050;points=[[0.445,0,0],[0.445,1,0]]', w * 93.84, h * 73.5, '', 'X12050 Filter with bypass valve and digital indicator', null, null, this.getTagsForStencil(gn, 'x12050 filter with bypass valve and digital indicator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12060;points=[[0.34,0,0],[0.34,1,0]]', w * 123.13, h * 73.5, '', 'X12060 Filter with bypass valve with optical clogging indicator and electrical contact', null, null, this.getTagsForStencil(gn, 'x12060 filter with bypass valve with optical clogging indicator and electrical contact', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12070;points=[[0.225,0,0],[0.225,1,0]]', w * 58.42, h * 64.27, '', 'X12070 Filter with optical clogging indicator based on differential pressure', null, null, this.getTagsForStencil(gn, 'x12070 filter with optical clogging indicator based on differential pressure', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12080;points=[[0.167,0,0],[0.167,1,0]]', w * 78.16, h * 64.27, '', 'X12080 Filter with pressure-measuring instrument and electrical contact', null, null, this.getTagsForStencil(gn, 'x12080 filter with pressure measuring instrument and electrical contact', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12090;points=[[0,0.5,0],[1,0.5,0]]', w * 45.21, h * 26.2, '', 'X12090 Centrifugal separator', null, null, this.getTagsForStencil(gn, 'x12090 centrifugal separator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12100;points=[[0,0.365,0],[1,0.365,0],[0.5,1,0]]', w * 45.21, h * 35.63, '', 'X12100 Coalescing filter with automatic drain', null, null, this.getTagsForStencil(gn, 'x12100 coalescing filter with automatic drain', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12110;points=[[0,0.543,0],[1,0.543,0],[0.5,1,0]]', w * 45.21, h * 49.55, '', 'X12110 Coalescing filter with manual drain and clogging indicator', null, null, this.getTagsForStencil(gn, 'x12110 coalescing filter with manual drain and clogging indicator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12120;points=[[0,0.5,0],[1,0.5,0]]', w * 45.21, h * 26.2, '', 'X12120 Two-phase separator', null, null, this.getTagsForStencil(gn, 'x12120 two phase separator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12130;points=[[0,0.5,0],[1,0.5,0]]', w * 45.21, h * 26.2, '', 'X12130 vacuum separator', null, null, this.getTagsForStencil(gn, 'x12130 vacuum separator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12140;points=[[0,0.5,0],[1,0.5,0]]', w * 45.21, h * 26.2, '', 'X12140 Electrostatic separator', null, null, this.getTagsForStencil(gn, 'x12140 electrostatic separator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12150;points=[[0,0.43,0],[1,0.43,0],[0.335,1,0]]', w * 97.91, h * 64.35, '', 'X12150 Filter with manual drain, regulator with manual adjustment, nonrelieving, without pressure gauge', null, null, this.getTagsForStencil(gn, 'x12150 filter with manual drain regulator with manual adjustment nonrelieving without pressure gauge', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12160_detailed;points=[[0,0.505,0],[1,0.505,0],[0.236,1,0]]', w * 158.18, h * 73.73, '', 'X12160 Air conditioning unit (FRL unit), consisting of a filter with manual drain, a pressure-relieving pressure regulator with manual adjustment, a pressure gauge and a lubricator (detailed)', null, null, this.getTagsForStencil(gn, 'x12160 air conditioning unit frl unit consisting of filter with manual drain pressure relieving pressure regulator with manual adjustment pressure gauge and lubricator detailed', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12160_simplified;points=[[0,0.5,0],[1,0.5,0]]', w * 65.34, h * 27.89, '', 'X12160 Air conditioning unit (FRL unit), consisting of a filter with manual drain, a pressure-relieving pressure regulator with manual adjustment, a pressure gauge and a lubricator (simplified)', null, null, this.getTagsForStencil(gn, 'x12160 air conditioning unit frl unit consisting of filter with manual drain pressure relieving pressure regulator with manual adjustment pressure gauge and lubricator simplified', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12170;points=[[0.5,0,0],[0.5,1,0]]', w * 81.17, h * 96.39, '', 'X12170 Double filter with manual changeover feature', null, null, this.getTagsForStencil(gn, 'x12170 double filter with manual changeover feature', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12180;points=[[0,0.33,0],[1,0.33,0],[0.5,1,0]]', w * 45.21, h * 39.34, '', 'X12180 Fluid separator with manual drain', null, null, this.getTagsForStencil(gn, 'x12180 fluid separator with manual drain', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12190;points=[[0,0.33,0],[1,0.33,0],[0.5,1,0]]', w * 45.21, h * 39.34, '', 'X12190 Filter with separator with manual drain', null, null, this.getTagsForStencil(gn, 'x12190 filter with separator with manual drain', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12200;points=[[0,0.365,0],[1,0.365,0],[0.5,1,0]]', w * 45.21, h * 35.67, '', 'X12200 Fluid separator with automatic drain', null, null, this.getTagsForStencil(gn, 'x12200 fluid separator with automatic drain', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12210;points=[[0,0.365,0],[1,0.365,0],[0.5,1,0]]', w * 45.21, h * 35.67, '', 'X12210 Adsorber filter', null, null, this.getTagsForStencil(gn, 'x12210 adsorber filter', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12220;points=[[0,0.365,0],[1,0.365,0],[0.5,1,0]]', w * 45.21, h * 35.67, '', 'X12220 Oil mist separator', null, null, this.getTagsForStencil(gn, 'x12220 oil mist separator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12230;points=[[0,0.365,0],[1,0.365,0],[0.5,1,0]]', w * 45.21, h * 35.67, '', 'X12230 Air dryer', null, null, this.getTagsForStencil(gn, 'x12230 air dryer', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12240;points=[[0,0.5,0],[1,0.5,0]]', w * 55.85, h * 26.2, '', 'X12240 Lubricator', null, null, this.getTagsForStencil(gn, 'x12240 lubricator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12250;points=[[0,0.33,0],[1,0.33,0],[0.5,1,0]]', w * 45.21, h * 39.34, '', 'X12250 Lubricator with manual drain', null, null, this.getTagsForStencil(gn, 'x12250 lubricator with manual drain', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12260;points=[[0.5,0,0],[0.5,1,0]]', w * 26.22, h * 49.8, '', 'X12260 cooler without indication of the flow paths of the coolant', null, null, this.getTagsForStencil(gn, 'x12260 cooler without indication of the flow paths of the coolant', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12270;points=[[0.302,0,0],[0.302,1,0],[1,0.41,0],[1,0.595,0]]', w * 43.5, h * 49.8, '', 'X12270 Cooler with liquid coolant', null, null, this.getTagsForStencil(gn, 'x12270 cooler with liquid coolant', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12280;points=[[0.791,0,0],[0.791,1,0]]', w * 105.57, h * 65.2, '', 'X12280 Cooler with electrically powered fan', null, null, this.getTagsForStencil(gn, 'x12280 cooler with electrically powered fan', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12290;points=[[0.5,0,0],[0.5,1,0]]', w * 26.22, h * 49.8, '', 'X12290 Heater', null, null, this.getTagsForStencil(gn, 'x12290 heater', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12300;points=[[0,0.5,0],[1,0.5,0]]', w * 49.8, h * 26.28, '', 'X12300 Temperature regulator', null, null, this.getTagsForStencil(gn, 'x12300 temperature regulator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12310;points=[[0,0.365,0],[1,0.365,0],[0.5,1,0]]', w * 55.85, h * 35.68, '', 'X12310 Reclassifier with manual drain', null, null, this.getTagsForStencil(gn, 'x12310 reclassifier with manual drain', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12320;points=[[0.5,1,0]]', w * 18.53, h * 46.46, '', 'X12320 Gas-loaded accumulator in which the media are separated by a diaphragm (diaphragm-type accumulator)', null, null, this.getTagsForStencil(gn, 'x12320 gas loaded accumulator in which the media are separated by diaphragm type accumulator)', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12330;points=[[0.5,1,0]]', w * 18.53, h * 46.46, '', 'X12330 Gas-loaded accumulator in which the media are separated by a bladder (bladder-type accumulator)', null, null, this.getTagsForStencil(gn, 'x12330 gas loaded accumulator in which the media are separated by a bladder type accumulator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12340;points=[[0.5,1,0]]', w * 18.53, h * 46.46, '', 'X12340 Gas-loaded accumulator in which the media are separated by a piston and piston bladder (piston-type accumulator)', null, null, this.getTagsForStencil(gn, 'x12340 gas loaded accumulator in which the media are separated by a piston and piston bladder piston type accumulator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12350;points=[[0.5,1,0]]', w * 18.53, h * 46.46, '', 'X12350 Gas bottle', null, null, this.getTagsForStencil(gn, 'x12350 gas bottle', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12360;points=[[0.17,1,0]]', w * 54.44, h * 55.92, '', 'X12360 Piston-type accumulator with back-up bottle', null, null, this.getTagsForStencil(gn, 'x12360 piston type accumulator with back up bottle', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12370;points=[[0,0.5,0],[1,0.5,0]]', w * 56.27, h * 18.57, '', 'X12370 Air reservoir', null, null, this.getTagsForStencil(gn, 'x12370 air reservoir', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12380;points=[[0,0.335,0],[1,0.335,0],[0.5,1,0]]', w * 56.13, h * 27.96, '', 'X12380 Vacuum generator', null, null, this.getTagsForStencil(gn, 'x12380 vacuum generator', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12390;points=[[0,0.18,0],[1,0.18,0],[0.5,1,0]]', w * 56.13, h * 51.18, '', 'X12390 Single stage vacuum generator with integrated non-return valve', null, null, this.getTagsForStencil(gn, 'x12390 single stage vacuum generator with integrated non return valve', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12400;points=[[0,0.195,0],[1,0.195,0],[0.25,1,0]]', w * 74.8, h * 46.79, '', 'X12400 Three stage vacuum generator with integrated non-return valves', null, null, this.getTagsForStencil(gn, 'x12400 three stage vacuum generator with integrated non return valves', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12410;points=[[0.59,0,0],[0.725,1,0],[1,0.555,0]]', w * 102.34, h * 84.04, '', 'X12410 Single stage vacuum generator with blow-off valve', null, null, this.getTagsForStencil(gn, 'x12410 single stage vacuum generator with blow off valve', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12420;points=[[0.5,0,0],[0,1,0],[1,1,0]]', w * 18.69, h * 28.39, '', 'X12420 Suction cup', null, null, this.getTagsForStencil(gn, 'x12420 suction cup', dt).join(' ')),
      this.createVertexTemplateEntry(s + 'x12430;points=[[0.5,0,0],[0,1,0],[1,1,0]]', w * 18.69, h * 28.39, '', 'X12430 Suction cup with spring loaded stem and non-return valve', null, null, this.getTagsForStencil(gn, 'x12430 suction cup with spring loaded stem and non return valve', dt).join(' '))
    ]);
  };


})();
