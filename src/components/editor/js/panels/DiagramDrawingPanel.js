/* eslint-disable */

import {
    mxConstants,
    mxResources,
    mxEventObject,
    mxEvent,
    mxUtils,
    mxClient,
    mxCellRenderer,
    mxRectangle
} from '../../core/mxgraph';
import BaseFormatPanel from "./BaseFormatPanel";

import {ChangePageSetup} from '../EditorUi';

export default DiagramDrawingPanel;

const pageFormatOptions = [
    {
        key: '1600-900',
        title: '1600 x 900',
        format: new mxRectangle(0, 0, 900, 1600),
    },
    {
        key: '1920-1200',
        title: '1920 x 1200',
        format: new mxRectangle(0, 0, 1200, 1920),
    },
    {
        key: '1920-1080',
        title: '1920 x 1080',
        format: new mxRectangle(0, 0, 1080, 1920),
    },
    {
        key: '1600-1200',
        title: '1600 x 1200',
        format: new mxRectangle(0, 0, 1200, 1600),
    },
    {key: 'custom', title: '自定义', format: null},
];

function DiagramDrawingPanel(format, editorUi, container) {
    BaseFormatPanel.call(this, format, editorUi, container);
    this.container.style.cssText = `padding: 10px;box-sizing: border-box;`;
    this.init();

    setTimeout(()=>{
        this.container.scrollTop = DiagramDrawingPanel.lastScrollTop;
    }, this.setScrollTopLazyTime);
    this.listenTop();
}

DiagramDrawingPanel.lastScrollTop = 0;

mxUtils.extend(DiagramDrawingPanel, BaseFormatPanel);

DiagramDrawingPanel.prototype.listenTop = function () {
    this.container.addEventListener("scroll", mxUtils.bind(this, function (e) {
        DiagramDrawingPanel.lastScrollTop = this.container.scrollTop;
    }));
}

DiagramDrawingPanel.prototype.init = function () {
    setTimeout(() => {
        this.addSetGraphSizeView();
        this.addSetBackgroundView();
        this.addSetGraphLineView();
    }, 1);
}

DiagramDrawingPanel.prototype.addSetBackgroundView = function () {
    const ui = this.editorUi;
    const graph = this.editorUi.editor.graph;
    const setBackgroundColorRow = this.createLabelCellRowGradientColor('背景颜色', {}, mxUtils.bind(this, function () {
        return this.editorUi.currentPage ? this.editorUi.currentPage.getBackgroundColor() : '#FFFFFF';
    }), mxUtils.bind(this, function (color) {
        const change = new ChangePageSetup(this.editorUi, color);
        change.ignoreImage = true;
        graph.model.execute(change);
        this.editorUi.currentPage.setBackgroundColor(color);
    }));
    this.container.appendChild(setBackgroundColorRow.root);

    const setBackgroundImgRow = this.createLabelCellRowPicture('背景图片', {}, mxUtils.bind(this, function () {
        return this.editorUi.currentPage ? this.editorUi.currentPage.getBackgroundImage() : '#FFFFFF';
    }), mxUtils.bind(this, function (newValue) {
        this.editorUi.currentPage.setBackgroundImage(newValue);
        if(newValue){
            var img = new Image();
            img.src = mxUtils.fixImg(newValue);
            var change = new ChangePageSetup(this.editorUi, null, img);
            change.ignoreColor = true;
            graph.model.execute(change);
        }else{
            var change = new ChangePageSetup(this.editorUi, null, null);
            change.ignoreColor = true;
            graph.model.execute(change);
        }
        this.editorUi.editor.updateGraphComponents();
        graph.view.validate();
        graph.sizeDidChange();
    }));
    this.container.appendChild(setBackgroundImgRow.root);
    const w = graph.pageFormat.width * 1.0;
    const h = graph.pageFormat.height * 1.0;
    setBackgroundImgRow.cell.outerChangeSize(w, h);
}

DiagramDrawingPanel.prototype.addSetGraphSizeView = function () {
    const ui = this.editorUi;
    const graph = this.editorUi.editor.graph;
    const setCustomWidthRow = this.createLabelCellRowInput('自定义宽度', {
        type: 'number',
        min: 1,
        max: 99999,
        step: 1,
        hideStep: false,
        decimal: false,
        unit: 'px',
    }, mxUtils.bind(this, function () {
        return graph.pageFormat.width;
    }), mxUtils.bind(this, function (val) {
        const oldH = graph.pageFormat.height;
        let newPageFormat = new mxRectangle(0, 0, parseInt(val), oldH);
        let change = new ChangePageSetup(ui, null, null, newPageFormat);
        change.ignoreColor = true;
        change.ignoreImage = true;
        graph.model.execute(change);
    }));
    const setCustomHeightRow = this.createLabelCellRowInput('自定义高度', {
        type: 'number',
        min: 1,
        max: 99999,
        step: 1,
        hideStep: false,
        decimal: false,
        unit: 'px',
    }, mxUtils.bind(this, function () {
        return graph.pageFormat.height;
    }), mxUtils.bind(this, function (val) {
        const oldW = graph.pageFormat.width;
        let newPageFormat = new mxRectangle(0, 0, oldW, parseInt(val));
        let change = new ChangePageSetup(ui, null, null, newPageFormat);
        change.ignoreColor = true;
        change.ignoreImage = true;
        graph.model.execute(change);
    }));
    const setGrapthOrientationRow = this.createLabelCellRowSelect('显示方向', {
        options: [{key: 'landscape', title: '横向'}, {
            key: 'portrait',
            title: '纵向'
        }]
    }, function () {
        const w = graph.pageFormat.width;
        const h = graph.pageFormat.height;
        return w >= h ? 'landscape' : 'portrait';
    }, function (option) {
        let newPageFormat = new mxRectangle(0, 0, 0, 0);
        const w = graph.pageFormat.width;
        const h = graph.pageFormat.height;
        if (option.key === 'landscape') {
            newPageFormat.width = Math.max(w, h);
            newPageFormat.height = Math.min(w, h);
        } else {
            newPageFormat.width = Math.min(w, h);
            newPageFormat.height = Math.max(w, h);
        }
        const change = new ChangePageSetup(ui, null, null, newPageFormat);
        change.ignoreColor = true;
        change.ignoreImage = true;
        graph.model.execute(change);
    });
    const setGrapthSizeRow = this.createLabelCellRowSelect('显示分辨率', {options: pageFormatOptions}, function () {
        const w = graph.pageFormat.width;
        const h = graph.pageFormat.height;
        let key = w >= h ? `${w}-${h}` : `${h}-${w}`;
        for (let i = 0; i < pageFormatOptions.length; i++) {
            let item = pageFormatOptions[i];
            if (key === item.key) {
                return key;
            }
        }
        return 'custom';
    }, function (option) {
        if (option.format != null) {
            const w1 = graph.pageFormat.width;
            const h1 = graph.pageFormat.height;
            const landscape = w1 >= h1;
            let newPageFormat = new mxRectangle(0, 0, 0, 0);
            const w = option.format.width;
            const h = option.format.height;
            if (landscape) {
                newPageFormat.width = Math.max(w, h);
                newPageFormat.height = Math.min(w, h);
            } else {
                newPageFormat.width = Math.min(w, h);
                newPageFormat.height = Math.max(w, h);
            }
            var change = new ChangePageSetup(ui, null, null, newPageFormat);
            change.ignoreColor = true;
            change.ignoreImage = true;
            graph.model.execute(change);
            if(setGrapthOrientationRow.root.display !== 'flex'){
                setGrapthOrientationRow.root.style.display = 'flex';
                setCustomWidthRow.root.style.display = 'none';
                setCustomHeightRow.root.style.display = 'none';
            }
        }else{
            if(setGrapthOrientationRow.root.display !== 'none'){
                setGrapthOrientationRow.root.style.display = 'none';
                setCustomWidthRow.root.style.display = 'flex';
                setCustomHeightRow.root.style.display = 'flex';
                setCustomWidthRow.cell.outerChangeValue(graph.pageFormat.width);
                setCustomHeightRow.cell.outerChangeValue(graph.pageFormat.height);
            }
        }
    });
    this.container.appendChild(setGrapthSizeRow.root);
    const ow = graph.pageFormat.width;
    const oh = graph.pageFormat.height;
    let find = pageFormatOptions.find(item => {
        if(item.format != null){
            let w = item.format.width;
            let h = item.format.height;
            return (ow === w && oh === h) || (ow === h && oh === w);
        }
        return false;
    })
    this.container.appendChild(setGrapthOrientationRow.root);
    this.container.appendChild(setCustomWidthRow.root);
    this.container.appendChild(setCustomHeightRow.root);
    if(find){
        setGrapthOrientationRow.root.style.display = 'flex';
        setCustomWidthRow.root.style.display = 'none';
        setCustomHeightRow.root.style.display = 'none';
    }else{
        setGrapthOrientationRow.root.style.display = 'none';
        setCustomWidthRow.root.style.display = 'flex';
        setCustomHeightRow.root.style.display = 'flex';
    }
};

DiagramDrawingPanel.prototype.addSetGraphLineView = function () {
    const ui = this.editorUi;
    const graph = this.editorUi.editor.graph;

    const setLineColorRow = this.createLabelCellRowColor('辅助线颜色', {},
        mxUtils.bind(this, function () {
            return graph.view.gridColor;
        }), mxUtils.bind(this, function (color) {
            if (color) {
                this.editorUi.setGridColor(color);
            } else {
                graph.setGridEnabled(false);
                this.editorUi.fireEvent(new mxEventObject('gridEnabledChanged'));
            }
        }));

    const setLineSpaceRow = this.createLabelCellRowInput('辅助线间隔', {
        type: 'number',
        min: 0,
        max: 100,
        step: 1,
        hideStep: false,
        decimal: false,
        unit: 'px',
    }, mxUtils.bind(this, function () {
        return graph.getGridSize();
    }), mxUtils.bind(this, function (val) {
        if (val && val.length > 0) {
            val = parseInt(val);
            if (val !== graph.getGridSize()) {
                if(val > 0){
                    graph.setGridSize(val);
                }else{
                    graph.setGridSize(1);
                    setLineSpaceRow.cell.outerChangeValue(1);
                }
            }
        } else {
            graph.setGridEnabled(false);
            setLineColorRow.root.style.display = val ? 'flex' : 'none';
            setLineSpaceRow.root.style.display = val ? 'flex' : 'none';
            this.editorUi.fireEvent(new mxEventObject('gridEnabledChanged'));
        }
    }));

    const setGrapthLineRow = this.createLabelCellRowSwitch('辅助线', {trueLabel: '开启', falseLabel: '关闭'},
        mxUtils.bind(this, function (val) {
            return graph.isGridEnabled();
        }), mxUtils.bind(this, function (val) {
            graph.setGridEnabled(val);
            setLineColorRow.root.style.display = val ? 'flex' : 'none';
            setLineSpaceRow.root.style.display = val ? 'flex' : 'none';
            this.editorUi.fireEvent(new mxEventObject('gridEnabledChanged'));
        }));

    this.container.appendChild(setGrapthLineRow.root);
    this.container.appendChild(setLineColorRow.root);
    this.container.appendChild(setLineSpaceRow.root);
    setLineColorRow.root.style.display = graph.isGridEnabled() ? 'flex' : 'none';
    setLineSpaceRow.root.style.display = graph.isGridEnabled() ? 'flex' : 'none';

    const setShadowVisibleRow = this.createLabelCellRowSwitch('节点阴影', {trueLabel: '开启', falseLabel: '关闭'},
        mxUtils.bind(this, function (val) {
            return graph.shadowVisible;
        }), mxUtils.bind(this, function (val) {
            const change = new ChangePageSetup(this.editorUi);
            change.ignoreColor = true;
            change.ignoreImage = true;
            change.shadowVisible = val;
            graph.model.execute(change);
        }));

    this.container.appendChild(setShadowVisibleRow.root);

    const setConnectionArrowsRow = this.createLabelCellRowSwitch('节点' + mxResources.get('connectionArrows'), {trueLabel: '开启', falseLabel: '关闭'},
        mxUtils.bind(this, function () {
            return graph.connectionArrowsEnabled;
        }), mxUtils.bind(this, function (val) {
            this.editorUi.actions.get('connectionArrows').funct();
        }));
    this.container.appendChild(setConnectionArrowsRow.root);
    const setConnectionPointRow = this.createLabelCellRowSwitch('节点' + mxResources.get('connectionPoints'), {trueLabel: '开启', falseLabel: '关闭'},
        mxUtils.bind(this, function () {
            return graph.connectionHandler.isEnabled();
        }), mxUtils.bind(this, function (val) {
            this.editorUi.actions.get('connectionPoints').funct();
        }));
    this.container.appendChild(setConnectionPointRow.root);
    const setConnectionGuidesRow = this.createLabelCellRowSwitch('连接' + mxResources.get('guides'), {trueLabel: '开启', falseLabel: '关闭'},
        mxUtils.bind(this, function () {
            return graph.graphHandler.guidesEnabled;
        }), mxUtils.bind(this, function (val) {
            this.editorUi.actions.get('guides').funct();
        }));
    this.container.appendChild(setConnectionGuidesRow.root);
    const setRulerVisibleRow = this.createLabelCellRowSwitch('画布标尺', {trueLabel: '显示', falseLabel: '隐藏'},
        mxUtils.bind(this, function () {
            return this.editorUi.isRulerVisible();
        }), mxUtils.bind(this, function (val) {
            this.editorUi.actions.get('ruler').funct();
        }));
    this.container.appendChild(setRulerVisibleRow.root);

    const setRoundedRow = this.createLabelCellRowSwitch('全部圆角', {trueLabel: '开启', falseLabel: '关闭'},
        mxUtils.bind(this, function () {
            let cells = graph.getVerticesAndEdges();
            let rounded = true;
            if (cells.length > 0) {
                for (let i = 0; i < cells.length; i++) {
                    let style = graph.getCellStyle(cells[i]);
                    if (mxUtils.getValue(style, mxConstants.STYLE_ROUNDED, 0) == 0) {
                        rounded = false;
                        break;
                    }
                }
            }
            return rounded;
        }), mxUtils.bind(this, function (val) {
            graph.getModel().beginUpdate();
            try {
                let cells = graph.getVerticesAndEdges();
                graph.updateCellStyles({ rounded: val ? '1' : '0' }, cells);
            } finally {
                graph.getModel().endUpdate();
            }
        }));
    this.container.appendChild(setRoundedRow.root);

}
