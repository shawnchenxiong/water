/* eslint-disable */
import {mxConstants, mxEvent, mxUtils} from '../core/mxgraph';
import DiagramFormatPanel from "./panels/DiagramFormatPanel";
import ElementFormatPanel from "./panels/ElementFormatPanel";

export {Format};

function Format(editorUi, container) {
  this.editorUi = editorUi;
  this.container = container;
  this.container.style.backgroundColor = '#fbfbfb';
  this.container.style.background = '#fbfbfb';
}

Format.prototype.labelIndex = 0;

Format.prototype.currentIndex = 0;

Format.prototype.showCloseButton = true;

/**
 * 非活动选项卡的背景颜色。
 */
Format.prototype.inactiveTabBackgroundColor = '#f1f3f4';

Format.prototype.roundableShapes = ['label', 'rectangle', 'internalStorage', 'corner', 'parallelogram', 'swimlane', 'triangle', 'trapezoid', 'ext', 'step', 'tee', 'process', 'link', 'rhombus', 'offPageConnector', 'loopLimit', 'hexagon', 'manualInput', 'curlyBracket', 'singleArrow', 'callout', 'doubleArrow', 'flexArrow', 'card', 'umlLifeline'];

/**
 * 将标签菜单项添加到给定菜单和父菜单。
 */
Format.prototype.init = function () {
  const ui = this.editorUi;
  const editor = ui.editor;
  const graph = editor.graph;
  this.lastDiagramKey = null;
  this.lastElementKey = null;
  // 保存上一次的选择状态，用于检测选择是否真的发生了变化
  this.lastSelectionCells = null;
  this.update = mxUtils.bind(this, function (sender, evt) {
    // 检查是否是自动保存触发的样式变化，如果是则跳过刷新以避免输入框闪烁
    if (evt && evt.getProperty) {
      const edit = evt.getProperty('edit');
      if (edit && edit.changes) {
        // 检查是否只有样式变化
        let onlyStyleChanges = true;
        let isDynamicDataProp = false;
        for (let i = 0; i < edit.changes.length; i++) {
          const change = edit.changes[i];
          // 检查是否是样式变化（mxStyleChange 有 style 和 cell 属性）
          if (change && change.style !== undefined && change.cell !== undefined) {
            // 检查是否是动态数据属性（dpropKey）
            // 动态数据属性的键通常以 common 开头、以 Values 结尾、或者是 Event 结尾
            if (change.style && typeof change.style === 'string') {
              // 使用正则表达式检查是否是动态数据属性
              // 匹配模式：common开头、Values结尾、Event结尾等
              const dynamicPropPattern = /(common\w+=|.*Values=|.*Event=)/;
              if (dynamicPropPattern.test(change.style)) {
                isDynamicDataProp = true;
              }
            }
          } else {
            onlyStyleChanges = false;
            break;
          }
        }
        // 如果只有样式变化且是动态数据属性，跳过刷新
        if (onlyStyleChanges && isDynamicDataProp) {
          return;
        }
      }
    }
    
    // 检查是否是选择变化事件，如果是且选择没有真正改变，跳过刷新
    const senderName = sender ? (sender.constructor ? sender.constructor.name : 'unknown') : 'no-sender';
    if (senderName === 'mxGraphSelectionModel') {
      const graph = this.editorUi.editor.graph;
      const currentSelection = graph.getSelectionCells();
      
      // 检查是否正在编辑输入框，如果是则跳过刷新以避免输入框闪烁
      const activeElement = document.activeElement;
      // 检查 activeElement 本身是否是输入框
      const isDirectInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
      // 检查 activeElement 是否在 Format 面板容器内，以及容器内是否有输入框包含焦点
      let isEditingInput = isDirectInput;
      if (!isEditingInput && activeElement && this.container) {
        // 检查 activeElement 是否在容器内
        const isInContainer = this.container.contains(activeElement);
        if (isInContainer) {
          // 检查容器内是否有输入框包含焦点
          const inputsInContainer = this.container.querySelectorAll('input, textarea');
          for (let i = 0; i < inputsInContainer.length; i++) {
            if (inputsInContainer[i] === document.activeElement || inputsInContainer[i].contains(document.activeElement)) {
              isEditingInput = true;
              break;
            }
          }
        }
      }
      
      // 如果正在编辑输入框，跳过刷新
      if (isEditingInput) {
        // 仍然更新保存的选择状态，但不刷新
        this.lastSelectionCells = currentSelection.length > 0 ? currentSelection.slice() : null;
        return;
      }
      
      // 比较当前选择和上一次选择是否相同
      if (this.lastSelectionCells && currentSelection.length === this.lastSelectionCells.length) {
        let selectionChanged = false;
        for (let i = 0; i < currentSelection.length; i++) {
          if (currentSelection[i] !== this.lastSelectionCells[i]) {
            selectionChanged = true;
            break;
          }
        }
        // 如果选择没有真正改变，跳过刷新
        if (!selectionChanged) {
          return;
        }
      }
      // 更新保存的选择状态
      this.lastSelectionCells = currentSelection.length > 0 ? currentSelection.slice() : null;
    } else {
      // 非选择变化事件，清除保存的选择状态
      this.lastSelectionCells = null;
    }
    
    this.refresh();
  });

  graph.getSelectionModel().addListener(mxEvent.CHANGE, this.update);
  graph.getModel().addListener(mxEvent.CHANGE, this.update);
  graph.addListener(mxEvent.EDITING_STARTED, this.update);
  graph.addListener(mxEvent.EDITING_STOPPED, this.update);
  graph.getView().addListener('unitChanged', this.update);
  editor.addListener('autosaveChanged', this.update);
  graph.addListener(mxEvent.ROOT, this.update);
  ui.addListener('styleChanged', this.update);
  ui.addListener('darkModeChanged', this.update);

  this.refresh();
};

Format.prototype.clearSelectionState = function () {
  this.selectionState = null;
};

Format.prototype.getSelectionState = function () {
  if (this.selectionState == null) {
    this.selectionState = this.createSelectionState();
  }
  return this.selectionState;
};

Format.prototype.createSelectionState = function () {
  const cells = this.editorUi.editor.graph.getSelectionCells();
  const result = this.initSelectionState();

  for (let i = 0; i < cells.length; i++) {
    this.updateSelectionStateForCell(result, cells[i], cells);
  }

  return result;
};

Format.prototype.initSelectionState = function () {
  return {
    vertices: [],
    edges: [],
    x: null,
    y: null,
    width: null,
    height: null,
    style: {},
    containsImage: false,
    containsLabel: false,
    fill: true,
    glass: true,
    rounded: true,
    comic: true,
    autoSize: false,
    image: true,
    shadow: true,
    lineJumps: true,
    resizable: true,
    table: false,
    cell: false,
    row: false,
    movable: true,
    rotatable: true,
  };
};

Format.prototype.updateSelectionStateForCell = function (result, cell) {
  const graph = this.editorUi.editor.graph;
  if (graph.getModel().isVertex(cell)) {
    result.resizable = result.resizable && graph.isCellResizable(cell);
    result.rotatable = result.rotatable && graph.isCellRotatable(cell);
    result.movable = result.movable && graph.isCellMovable(cell) && !graph.isTableRow(cell) && !graph.isTableCell(cell);
    result.table = result.table || graph.isTable(cell);
    result.cell = result.cell || graph.isTableCell(cell);
    result.row = result.row || graph.isTableRow(cell);
    result.vertices.push(cell);
    const geo = graph.getCellGeometry(cell);

    if (geo != null) {
      if (geo.width > 0) {
        if (result.width == null) {
          result.width = geo.width;
        } else if (result.width != geo.width) {
          result.width = '';
        }
      } else {
        result.containsLabel = true;
      }

      if (geo.height > 0) {
        if (result.height == null) {
          result.height = geo.height;
        } else if (result.height != geo.height) {
          result.height = '';
        }
      } else {
        result.containsLabel = true;
      }

      if (!geo.relative || geo.offset != null) {
        const x = geo.relative ? geo.offset.x : geo.x;
        const y = geo.relative ? geo.offset.y : geo.y;

        if (result.x == null) {
          result.x = x;
        } else if (result.x != x) {
          result.x = '';
        }

        if (result.y == null) {
          result.y = y;
        } else if (result.y != y) {
          result.y = '';
        }
      }
    }
  } else if (graph.getModel().isEdge(cell)) {
    result.edges.push(cell);
    result.resizable = false;
    result.rotatable = false;
    result.movable = false;
  }

  const state = graph.view.getState(cell);

  if (state != null) {
    result.autoSize = result.autoSize || this.isAutoSizeState(state);
    result.glass = result.glass && this.isGlassState(state);
    result.rounded = result.rounded && this.isRoundedState(state);
    result.lineJumps = result.lineJumps && this.isLineJumpState(state);
    result.comic = result.comic && this.isComicState(state);
    result.image = result.image && this.isImageState(state);
    result.shadow = result.shadow && this.isShadowState(state);
    result.fill = result.fill && this.isFillState(state);

    const shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
    result.containsImage = result.containsImage || shape == 'image';

    for (const key in state.style) {
      const value = state.style[key];

      if (value != null) {
        if (result.style[key] == null) {
          result.style[key] = value;
        } else if (result.style[key] != value) {
          result.style[key] = '';
        }
      }
    }
  }
};

Format.prototype.isFillState = function (state) {
  return state.view.graph.model.isVertex(state.cell) || mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null) == 'arrow' || mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null) == 'filledEdge' || mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null) == 'flexArrow';
};

Format.prototype.isGlassState = function (state) {
  const shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
  return shape == 'label' || shape == 'rectangle' || shape == 'internalStorage' || shape == 'ext' || shape == 'umlLifeline' || shape == 'swimlane' || shape == 'process';
};

Format.prototype.isRoundedState = function (state) {
  return state.shape != null ? state.shape.isRoundable() : mxUtils.indexOf(this.roundableShapes, mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null)) >= 0;
};

Format.prototype.isLineJumpState = function (state) {
  const shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
  const curved = mxUtils.getValue(state.style, mxConstants.STYLE_CURVED, false);

  return !curved && (shape == 'connector' || shape == 'filledEdge');
};

Format.prototype.isComicState = function (state) {
  const shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);

  return mxUtils.indexOf(['label', 'rectangle', 'internalStorage', 'corner', 'parallelogram', 'note', 'collate', 'swimlane', 'triangle', 'trapezoid', 'ext', 'step', 'tee', 'process', 'link', 'rhombus', 'offPageConnector', 'loopLimit', 'hexagon', 'manualInput', 'singleArrow', 'doubleArrow', 'flexArrow', 'filledEdge', 'card', 'umlLifeline', 'connector', 'folder', 'component', 'sortShape', 'cross', 'umlFrame', 'cube', 'isoCube', 'isoRectangle', 'partialRectangle'], shape) >= 0;
};

Format.prototype.isAutoSizeState = function (state) {
  return mxUtils.getValue(state.style, mxConstants.STYLE_AUTOSIZE, null) == '1';
};

Format.prototype.isImageState = function (state) {
  const shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);

  return shape == 'label' || shape == 'image';
};

Format.prototype.isShadowState = function (state) {
  const shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);

  return shape != 'image';
};

Format.prototype.clear = function () {
  this.container.innerHTML = '';
  if (this.panels != null) {
    for (let i = 0; i < this.panels.length; i++) {
      this.panels[i].destroy();
    }
  }
  this.panels = [];
};

Format.prototype.refresh = function () {
  if (this.pendingRefresh != null) {
    window.clearTimeout(this.pendingRefresh);
    this.pendingRefresh = null;
  }
  this.pendingRefresh = window.setTimeout(
    mxUtils.bind(this, function () {
      this.immediateRefresh();
    },1)
  );
};

Format.prototype.immediateRefresh = function () {
  if (this.container.style.width === '0px') {
    return;
  }
  this.clear();
  const ui = this.editorUi;
  const graph = ui.editor.graph;
  const div = Format.createDiv('rcui-panel');
  let panel = null;
  if (graph.isSelectionEmpty()) {
    // this.panels.push(panel = new OldDiagramFormatPanel(this, ui, div));
    this.panels.push(panel = new DiagramFormatPanel(this, ui, div));
  } else {
    // this.panels.push(panel = new OldElementFormatPanel(this, ui, div));
    this.panels.push(panel = new ElementFormatPanel(this, ui, div));
  }
  this.container.appendChild(panel.container);
};

Format.createDiv = function (className) {
  const div = document.createElement('div');
  div.className = className;
  return div;
};
