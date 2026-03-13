/* eslint-disable */

import {mxConstants, mxResources, mxEventObject, mxEvent, mxUtils, mxClient, mxCellRenderer} from '../../core/mxgraph';
import BaseFormatPanel from "./BaseFormatPanel";

export default DiagramStructurePanel;

function DiagramStructurePanel(format, editorUi, container) {
    BaseFormatPanel.call(this, format, editorUi, container);
    this.init();

    setTimeout(()=>{
        this.container.scrollTop = DiagramStructurePanel.lastScrollTop;
    }, this.setScrollTopLazyTime);
    this.listenTop();
}
DiagramStructurePanel.lastScrollTop = 0;
mxUtils.extend(DiagramStructurePanel, BaseFormatPanel);

DiagramStructurePanel.prototype.listenTop = function () {
    this.container.addEventListener("scroll", mxUtils.bind(this, function (e) {
        DiagramStructurePanel.lastScrollTop = this.container.scrollTop;
    }));
}


DiagramStructurePanel.prototype.createTreeNode = function (graph, oneCell, root, index) {
    const cellStyle = mxUtils.getCellStyleWithStr(oneCell.style);
    let title;
    if (cellStyle) {
        title = cellStyle.title;
        if (!title) {
            title = cellStyle.defaultTitle;
        }
    }
    title = title ? title : '节点' + index;
    const hasChild = oneCell.children && oneCell.children.length > 0;
    const treeSetDiv = this.createTag('div', 'rcui-tree-set');
    const treeEntryDiv = this.createTag('div', 'rcui-tree-entry');
    const treeMainDiv = this.createTag('div', 'rcui-tree-main');
    const treeIconClickSpan = this.createTag('span', 'rcui-tree-iconClick');
    const treeIconI = this.createTag('i', 'rcui-icon');
    const treeIconTxt = this.createTag('span', 'rcui-tree-txt');

    const treeBtnGroupDiv = this.createTag('div', 'rcui-btn-group rcui-tree-btnGroup');
    const treeBtn1 = this.createTag('i', 'rcui-icon');
    const treeBtn2 = this.createTag('i', 'rcui-icon');
    const treeBtn3 = this.createTag('i', 'rcui-icon rcui-icon-edit');
    let s = `display: inline-block;
    width: 32px;
    height: 30px;
    text-align: center;
    line-height: 30px;
    border-radius: 8px;
    margin-left: 2px;
    border: 0.5px solid #CCCCCC;`;
    treeBtn1.style.cssText = s;
    treeBtn2.style.cssText = s;
    treeBtn3.style.cssText = s;

    treeBtn1.style.fontSize = '24px';
    treeBtn3.style.fontSize = '22px';

    const unlocked = graph.isCellMovable(oneCell);
    mxUtils.addStyleClass(treeBtn2, unlocked ? 'rcui-icon-password' : 'rcui-icon-lock');

    treeBtnGroupDiv.appendChild(treeBtn1);
    treeBtnGroupDiv.appendChild(treeBtn2);
    treeBtnGroupDiv.appendChild(treeBtn3);

    if(!graph.isCellVisible(oneCell)){
        mxUtils.addStyleClass(treeBtn1, 'rcui-icon-eye-invisible');
        mxUtils.removeStyleClass(treeBtn1, 'rcui-icon-eye');
        mxUtils.addStyleClass(treeBtn2, 'rcui-hide');
        mxUtils.addStyleClass(treeBtn3, 'rcui-hide');
    }else{
        mxUtils.addStyleClass(treeBtn1, 'rcui-icon-eye');
        mxUtils.removeStyleClass(treeBtn1, 'rcui-icon-eye-invisible');
        mxUtils.removeStyleClass(treeBtn2, 'rcui-hide');
        mxUtils.removeStyleClass(treeBtn3, 'rcui-hide');
    }

    treeBtnGroupDiv.style.position = 'absolute';
    treeBtnGroupDiv.style.right = '10px';

    treeIconTxt.innerText = title;
    treeIconTxt.setAttribute('title', title);
    treeIconClickSpan.appendChild(treeIconI);
    treeMainDiv.appendChild(treeIconClickSpan);
    treeMainDiv.appendChild(treeIconTxt);
    treeMainDiv.appendChild(treeBtnGroupDiv);
    treeEntryDiv.appendChild(treeMainDiv);
    treeSetDiv.appendChild(treeEntryDiv);
    let treePack = null;
    if (hasChild) {
        treePack = this.createTag('span', 'rcui-tree-pack rcui-tree-lineExtend rcui-tree-showLine');
        treePack.style.display = 'none';
        for (let i = 0; i < oneCell.children.length; i++) {
            const childCell = oneCell.children[i];
            this.createTreeNode(graph, childCell, treePack, i);
        }
        treeSetDiv.appendChild(treePack);
        mxUtils.addStyleClass(treeIconClickSpan, 'rcui-tree-icon');
        mxUtils.addStyleClass(treeIconI, 'rcui-icon-triangle-r');
    } else {
        mxUtils.addStyleClass(treeIconI, 'rcui-icon-component');
    }
    const titleIconClickListener = mxUtils.bind(this, function (evt) {
        if (hasChild) {
            if (treePack.style.display === 'none') {
                treePack.style.display = 'block';
                mxUtils.removeStyleClass(treeIconI, 'rcui-icon-triangle-r');
                mxUtils.addStyleClass(treeIconI, 'rcui-icon-triangle-d');
            } else {
                treePack.style.display = 'none';
                mxUtils.removeStyleClass(treeIconI, 'rcui-icon-triangle-d');
                mxUtils.addStyleClass(treeIconI, 'rcui-icon-triangle-r');
            }
        } else {
            graph.selectCellForEvent(oneCell, evt);
        }
    });
    mxEvent.addListener(treeIconClickSpan, 'click', titleIconClickListener);
    mxEvent.addListener(treeIconTxt, 'click', titleIconClickListener);
    mxEvent.addListener(treeBtn3, 'click', mxUtils.bind(this, function (evt) {
        graph.selectCellForEvent(oneCell, evt);
    }));
    mxEvent.addListener(treeBtn2, 'click', mxUtils.bind(this, function (evt) {
        this.toggleLock(oneCell);
    }));
    mxEvent.addListener(treeBtn1, 'click', mxUtils.bind(this, function (evt) {
        const cells = [oneCell];
        let key = 'visible';
        let nowVisible = graph.isCellVisible(oneCell);
        let value = nowVisible ? '0' : '1';
        graph.setCellStyles(key, value, cells);
        graph.setCellsVisible(cells, !nowVisible);
        this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [key], 'values', [value], 'cells', cells));
    }));

    root.appendChild(treeSetDiv);
}

DiagramStructurePanel.prototype.init = function () {
    const graph = this.editorUi.editor.graph;
    const rootCell = graph.getModel().getRoot();
    console.log('rootCell', rootCell);
    if (rootCell.children && rootCell.children.length > 0 && rootCell.children[0].children && rootCell.children[0].children.length > 0) {
        let treeRoot = this.createTag('div', 'rcui-tree rcui-border-box rcui-tree-line');
        for (let i = 0; i < rootCell.children[0].children.length; i++) {
            const oneCell = rootCell.children[0].children[i];
            this.createTreeNode(graph, oneCell, treeRoot, i);
        }
        this.container.appendChild(treeRoot);
    }else{
        let emptyDiv = this.createTag('div', 'rcui-empty-node');
        let emptyImg = this.createTag('img', 'rcui-empty-node-img');
        let emptyText = this.createTag('div', 'rcui-empty-node-text');
        emptyImg.src = mxUtils.staticImg('/rcscada/icon_empty.svg');
        emptyDiv.appendChild(emptyImg);
        emptyDiv.appendChild(emptyText);
        emptyText.innerText = '未插入图元';
        this.container.appendChild(emptyDiv);
    }
}

DiagramStructurePanel.prototype.toggleLock = function (oneCell) {
    const graph = this.editorUi.editor.graph;
    console.log('toggleLock', oneCell.id);
    if (!oneCell) return;
    graph.stopEditing(false);
    graph.getModel().beginUpdate();
    try {
        let value = graph.isCellMovable(oneCell) ? 0 : 1;
        let cells = [oneCell];
        if (oneCell.children && oneCell.children.length > 0) {
            cells.push(...oneCell.children);
        }
        graph.setCellStyles(mxConstants.STYLE_MOVABLE, value, cells);
        graph.setCellStyles(mxConstants.STYLE_RESIZABLE, value, cells);
        graph.setCellStyles(mxConstants.STYLE_ROTATABLE, value, cells);
        graph.setCellStyles(mxConstants.STYLE_DELETABLE, value, cells);
        graph.setCellStyles(mxConstants.STYLE_EDITABLE, value, cells);
        graph.setCellStyles('connectable', value, cells);
        ui.fireEvent(new mxEventObject('styleChanged', 'keys', [
            mxConstants.STYLE_MOVABLE,
            mxConstants.STYLE_RESIZABLE,
            mxConstants.STYLE_ROTATABLE,
            mxConstants.STYLE_DELETABLE,
            mxConstants.STYLE_EDITABLE, 'connectable'], 'values', [value, value, value, value, value], 'cells', cells));
    } finally {
        graph.getModel().endUpdate();
    }
}
