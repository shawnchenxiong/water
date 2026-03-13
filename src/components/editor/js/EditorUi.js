/* eslint-disable */
/**
 * 转化为vue
 */
import {
    mxClient,
    mxClipboard,
    mxCodecRegistry,
    mxConstants,
    mxDictionary,
    mxEvent,
    mxEventObject,
    mxEventSource,
    mxGraphModel,
    mxImage,
    mxKeyHandler,
    mxMorphing,
    mxObjectCodec,
    mxObjectIdentity,
    mxOutline,
    mxPoint,
    mxPopupMenu,
    mxRectangle,
    mxResources,
    mxStackLayout,
    mxUtils
} from '../core/mxgraph';
import { mxDualRuler } from './mxRuler';
import { Actions } from './Actions';
import { TableShape } from './Shapes';
import { ShapesExpands } from './ShapesExpands';
import { Dialog, Editor, ErrorDialog, FilenameDialog } from './Editor';
import { Sidebar } from './Sidebar';
import { Menus } from './Menus';
import { Graph, HoverIcons } from './Graph';
import { Toolbar } from './Toolbar';
import { Format } from './Format';
import { BackgroundImageDialog, ColorDialog, ConfirmDialog } from './Dialogs';
import CollectionAddDialog from "./dialogs/CollectionAddDialog";
import ChooseImageDialog from './dialogs/ChooseImageDialog';
import PointSetDialog from './dialogs/PointSetDialog';
import ConfirmTipDialog from './dialogs/ConfirmTipDialog';
import ChooseVirvarDialog from './dialogs/ChooseVirvarDialog';
import SetTablePropertiesDialog from './dialogs/SetTablePropertiesDialog';
import ObjectFormDialog from './dialogs/ObjectFormDialog';
import { submenuImage } from '../images/base64';
import { Spinner } from './utils/spin';

import { ChangePage, DiagramPage, MovePage, RenamePage, SelectPage } from './customer/TabPages';

import html2Canvas from './utils/html2canvas.esm';

import pageZoomOut from '../images/pageZoomOut.png';
import pageZoomIn from '../images/pageZoomIn.png';
import pageZoomAuto from '../images/pageZoomAuto.png';
import icon_full_screen from '../images/icon_full_screen.svg';

export { ChangePageSetup, EditorUi, TableShape, ShapesExpands };

const mxSettings = {
    currentVersion: 18,
    defaultFormatWidth: 600 > screen.width ? '0' : '240',
    key: Editor.settingsKey,
    getLanguage: function () {
        return mxSettings.settings.language;
    },
    setLanguage: function (b) {
        mxSettings.settings.language = b;
    },
    isMainSettings: function () {
        return '.drawio-config' == mxSettings.key;
    },
    getMainSettings: function () {
        var b = localStorage.getItem('.drawio-config');
        null == b ? ((b = mxSettings.getDefaults()), delete b.isNew) : ((b = JSON.parse(b)), (b.version = mxSettings.currentVersion));
        return b;
    },
    getUi: function () {
        return mxSettings.isMainSettings() ? mxSettings.settings.ui : mxSettings.getMainSettings().ui;
    },
    setUi: function (b) {
        if (mxSettings.isMainSettings()) {
            mxSettings.settings.ui = b;
            if ('kennedy' == b || '' == b) mxSettings.settings.darkMode = !1;
            mxSettings.save();
        } else {
            var e = mxSettings.getMainSettings();
            e.ui = b;
            'kennedy' == b && (e.darkMode = !1);
            localStorage.setItem('.drawio-config', JSON.stringify(e));
        }
    },
    getShowStartScreen: function () {
        return mxSettings.settings.showStartScreen;
    },
    setShowStartScreen: function (b) {
        mxSettings.settings.showStartScreen = b;
    },
    getGridColor: function (b) {
        return b ? mxSettings.settings.darkGridColor : mxSettings.settings.gridColor;
    },
    setGridColor: function (b, e) {
        e ? (mxSettings.settings.darkGridColor = b) : (mxSettings.settings.gridColor = b);
    },
    getAutosave: function () {
        return mxSettings.settings.autosave;
    },
    setAutosave: function (b) {
        mxSettings.settings.autosave = b;
    },
    getResizeImages: function () {
        return mxSettings.settings.resizeImages;
    },
    setResizeImages: function (b) {
        mxSettings.settings.resizeImages = b;
    },
    getOpenCounter: function () {
        return mxSettings.settings.openCounter;
    },
    setOpenCounter: function (b) {
        mxSettings.settings.openCounter = b;
    },
    setCustomFonts: function (b) {
        mxSettings.settings.customFonts = b;
    },
    getCustomFonts: function () {
        for (var b = mxSettings.settings.customFonts || [], e = 0; e < b.length; e++) 'string' === typeof b[e] && (b[e] = {
            name: b[e],
            url: null
        });
        return b;
    },
    getLibraries: function () {
        return mxSettings.settings.libraries;
    },
    setLibraries: function (b) {
        mxSettings.settings.libraries = b;
    },
    addCustomLibrary: function (b) {
        mxSettings.load();
        Array.isArray(mxSettings.settings.customLibraries) || (mxSettings.settings.customLibraries = []);
        0 > mxUtils.indexOf(mxSettings.settings.customLibraries, b) && ('L.scratchpad' === b ? mxSettings.settings.customLibraries.splice(0, 0, b) : mxSettings.settings.customLibraries.push(b));
        mxSettings.save();
    },
    removeCustomLibrary: function (b) {
        mxSettings.load();
        mxUtils.remove(b, mxSettings.settings.customLibraries);
        mxSettings.save();
    },
    getCustomLibraries: function () {
        return mxSettings.settings.customLibraries;
    },
    getPlugins: function () {
        return mxSettings.settings.plugins;
    },
    setPlugins: function (b) {
        mxSettings.settings.plugins = b;
    },
    getRecentColors: function () {
        return mxSettings.settings.recentColors;
    },
    setRecentColors: function (b) {
        mxSettings.settings.recentColors = b;
    },
    getFormatWidth: function () {
        return parseInt(mxSettings.settings.formatWidth);
    },
    setFormatWidth: function (b) {
        mxSettings.settings.formatWidth = b;
    },
    isCreateTarget: function () {
        return mxSettings.settings.createTarget;
    },
    setCreateTarget: function (b) {
        mxSettings.settings.createTarget = b;
    },
    getPageFormat: function () {
        return mxSettings.settings.pageFormat;
    },
    setPageFormat: function (b) {
        mxSettings.settings.pageFormat = b;
    },
    getUnit: function () {
        return mxSettings.settings.unit || mxConstants.POINTS;
    },
    setUnit: function (b) {
        mxSettings.settings.unit = b;
    },
    isRulerOn: function () {
        return mxSettings.settings.isRulerOn;
    },
    setRulerOn: function (b) {
        mxSettings.settings.isRulerOn = b;
    },
    getDraftSaveDelay: function () {
        return mxSettings.settings.draftSaveDelay;
    },
    setDraftSaveDelay: function (b) {
        mxSettings.settings.draftSaveDelay = b;
    },
    getDefaults: function () {
        return {
            language: '',
            configVersion: Editor.configVersion,
            customFonts: [],
            libraries: Sidebar.prototype.defaultEntries,
            customLibraries: Editor.defaultCustomLibraries,
            plugins: [],
            recentColors: [],
            formatWidth: mxSettings.defaultFormatWidth,
            createTarget: false,
            pageFormat: mxGraph.prototype.pageFormat,
            search: !0,
            showStartScreen: !0,
            gridColor: mxGraphView.prototype.defaultGridColor,
            darkGridColor: mxGraphView.prototype.defaultDarkGridColor,
            autosave: !EditorUi.isElectronApp,
            resizeImages: null,
            openCounter: 0,
            version: mxSettings.currentVersion,
            isNew: !0,
            unit: mxConstants.POINTS,
            isRulerOn: true,
        };
    },
    init: function () {
        mxSettings.settings = mxSettings.getDefaults();
    },
    save: function () {
        if (isLocalStorage && 'undefined' !== typeof JSON)
            try {
                delete mxSettings.settings.isNew, (mxSettings.settings.version = mxSettings.currentVersion), localStorage.setItem(mxSettings.key, JSON.stringify(mxSettings.settings));
            } catch (b) {
            }
    },
    load: function () {
        isLocalStorage && 'undefined' !== typeof JSON && mxSettings.parse(localStorage.getItem(mxSettings.key));
        null == mxSettings.settings && mxSettings.init();
    },
    parse: function (b) {
        b = null != b ? JSON.parse(b) : null;
        null == b || b.configVersion != Editor.configVersion || (null != Editor.config && Editor.config.override) ? ((mxSettings.settings = null), mxSettings.init()) : ((mxSettings.settings = b), null == mxSettings.settings.plugins && (mxSettings.settings.plugins = []), null == mxSettings.settings.recentColors && (mxSettings.settings.recentColors = []), null == mxSettings.settings.customFonts && (mxSettings.settings.customFonts = []), null == mxSettings.settings.libraries && (mxSettings.settings.libraries = Sidebar.prototype.defaultEntries), null == mxSettings.settings.customLibraries && (mxSettings.settings.customLibraries = Editor.defaultCustomLibraries), null == mxSettings.settings.ui && (mxSettings.settings.ui = ''), null == mxSettings.settings.formatWidth && (mxSettings.settings.formatWidth = mxSettings.defaultFormatWidth), null != mxSettings.settings.lastAlert && delete mxSettings.settings.lastAlert, null == mxSettings.settings.createTarget && (mxSettings.settings.createTarget = !1), null == mxSettings.settings.pageFormat && (mxSettings.settings.pageFormat = mxGraph.prototype.pageFormat), null == mxSettings.settings.search && (mxSettings.settings.search = !0), null == mxSettings.settings.showStartScreen && (mxSettings.settings.showStartScreen = !0), null == mxSettings.settings.gridColor && (mxSettings.settings.gridColor = mxGraphView.prototype.defaultGridColor), null == mxSettings.settings.darkGridColor && (mxSettings.settings.darkGridColor = mxGraphView.prototype.defaultDarkGridColor), null == mxSettings.settings.autosave ? (mxSettings.settings.autosave = !EditorUi.isElectronApp) : EditorUi.isElectronApp && null == localStorage.getItem('._autoSaveTrans_') && (localStorage.setItem('._autoSaveTrans_', '1'), (mxSettings.settings.autosave = !1), mxSettings.save()), null != mxSettings.settings.scratchpadSeen && delete mxSettings.settings.scratchpadSeen);
    },
    clear: function () {
        isLocalStorage && localStorage.removeItem(mxSettings.key);
    },
};
('undefined' == typeof mxLoadSettings || mxLoadSettings) && mxSettings.load();
window.mxSettings = mxSettings;

function EditorUi(editor, container, config, lightbox) {
    // 在 EditorUi 构造函数中添加
    window.addEventListener('storage', this.handleStorageEvent.bind(this));
    this.pasteOffset = 10;
    mxEventSource.call(this);
    this.GLOBAL_CONFIG = config;
    this.PUBLIC_CONFIG = {};
    this.pages = [];
    this.destroyFunctions = [];
    this.editor = editor || new Editor();
    this.container = container || document.body;
    // window.ui = this;
    // window.editor = this.editor;
    // window.graph = this.editor.graph;
    const graph = this.editor.graph;
    graph.lightbox = lightbox;

    this.init();

    if (!graph.standalone) {
        setTimeout(() => {
            this.refresh();
            this.ruochenResetPipStyle();
        }, 1000);
    }
}

mxUtils.extend(EditorUi, mxEventSource);
EditorUi.compactUi = true;
// EditorUi.prototype.splitSize = mxClient.IS_TOUCH || mxClient.IS_POINTER ? 12 : 8;
EditorUi.prototype.splitSize = 0;
EditorUi.prototype.menubarHeight = 0;
EditorUi.prototype.formatEnabled = true;
EditorUi.prototype.formatWidth = 280;
EditorUi.prototype.toolbarHeight = 60;
EditorUi.prototype.footerHeight = 0;
EditorUi.prototype.sidebarFooterHeight = 34;
// EditorUi.prototype.hsplitPosition = screen.width <= 640 ? 118 : 300;
EditorUi.prototype.hsplitPosition = 300;
EditorUi.prototype.allowAnimation = true;
EditorUi.prototype.lightboxMaxFitScale = 2;
EditorUi.prototype.lightboxVerticalDivider = 4;
EditorUi.prototype.hsplitClickEnabled = false;
EditorUi.prototype.copiedStyle = null;
EditorUi.prototype.emptyDiagramXml = '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel>';
EditorUi.prototype.emptyLibraryXml = '<mxlibrary>[]</mxlibrary>';
EditorUi.prototype.mode = null;
EditorUi.prototype.timeout = Editor.prototype.timeout;
EditorUi.prototype.defaultCustomShapeStyle = 'shape=stencil(tZRtTsQgEEBPw1+DJR7AoN6DbWftpAgE0Ortd/jYRGq72R+YNE2YgTePloEJGWblgA18ZuKFDcMj5/Sm8boZq+BgjCX4pTyqk6ZlKROitwusOMXKQDODx5iy4pXxZ5qTHiFHawxB0JrQZH7lCabQ0Fr+XWC1/E8zcsT/gAi+Subo2/3Mh6d/oJb5nU1b5tW7r2knautaa3T+U32o7f7vZwpJkaNDLORJjcu7t59m2jXxqX9un+tt022acsfmoKaQZ+vhhswZtS6Ne/ThQGt0IV0N3Yyv6P3CeT9/tHO0XFI5cAE=);whiteSpace=wrap;html=1;';
EditorUi.prototype.maxBackgroundSize = 1600;
EditorUi.prototype.maxImageSize = 1920;
EditorUi.prototype.maxTextWidth = 520;
EditorUi.prototype.resampleThreshold = 100000;
EditorUi.prototype.maxImageBytes = 1024 * 1024;
EditorUi.prototype.maxBackgroundBytes = 2500000;
EditorUi.prototype.maxTextBytes = 500000;
EditorUi.prototype.currentFile = null;
EditorUi.prototype.printPdfExport = false;
EditorUi.prototype.pdfPageExport = true;
EditorUi.prototype.formatEnabled = true;
EditorUi.prototype.insertTemplateEnabled = true;
EditorUi.prototype.closableScratchpad = true;
EditorUi.prototype.embedExportBorder = 8;
EditorUi.prototype.embedExportBackground = null;
EditorUi.prototype.shareCursorPosition = true;
EditorUi.prototype.showRemoteCursors = true;
EditorUi.prototype.tabContainerHeight = 36;
EditorUi.prototype.lazyZoomDelay = 20;
EditorUi.prototype.wheelZoomDelay = 400;
EditorUi.prototype.buttonZoomDelay = 600;
EditorUi.prototype.flowSpeedArr = ['0.0', '2.0', '0.8', '0.25'];

EditorUi.prototype.refreshCellTwinkleAnim = function (cell) {
    const graph = this.editor.graph;
    const state = graph.getView().getState(cell);
    if (!state || !state.shape || !state.shape.node) return;
    const style = graph.getCellStyle(cell);
    const twinkleAnimState = mxUtils.getValue(style, 'twinkleAnimState', !this.editor.chromeless ? '1' : null);
    let styleId = null;
    if (mxUtils.isNotNullOrUndefined(twinkleAnimState) && twinkleAnimState == '1') {
        const twinkleSpeed = mxUtils.getValue(style, 'twinkleSpeed', null);
        if (mxUtils.isNotNullOrUndefined(twinkleSpeed)) {
            let zp = twinkleSpeed == '1' ? '5' : twinkleSpeed == '2' ? '2.5' : '1';
            styleId = `win_animation_twinkle_style_${twinkleSpeed}_infinite`;
            const el = document.getElementsByName(styleId);
            if (!el || el.length <= 0) {
                const keyframes = `${styleId}_keyframes`;
                const styleBody = `
                        .${styleId} {
                            animation: ${keyframes} ${zp}s linear infinite;
                        }
                        @keyframes ${keyframes}{
                            0% { opacity: 0; }
                            5% { opacity: 0.1; }
                            10% { opacity: 0.2; }
                            15% { opacity: 0.3; }
                            20% { opacity: 0.5; }
                            25% { opacity: 0.5; }
                            30% { opacity: 0.6; }
                            35% { opacity: 0.7; }
                            40% { opacity: 0.8; }
                            45% { opacity: 0.9; }
                            50% { opacity: 1; }
                            55% { opacity: 0.9; }
                            60% { opacity: 0.8; }
                            65% { opacity: 0.7; }
                            70% { opacity: 0.6; }
                            75% { opacity: 0.5; }
                            80% { opacity: 0.4; }
                            85% { opacity: 0.3; }
                            90% { opacity: 0.2; }
                            95% { opacity: 0.1; }
                            100% { opacity: 0; }
                        }`;
                const cssStyle = document.createElement('style');
                cssStyle.setAttribute('type', 'text/css');
                cssStyle.setAttribute('name', styleId);
                cssStyle.innerHTML = styleBody;
                document.head.appendChild(cssStyle);
            }
        }
    }
    const targetDiv = state.shape.node;

    /*let classNames = targetDiv.style.className;
    classNames = classNames ? classNames.split(' ') : [];
    const normarClass = classNames.filter(item => item.indexOf('win_animation_twinkle_style') !== 0);
    if(styleId != null){
        normarClass.push(styleId);
    }
    targetDiv.setAttribute('class', normarClass.join(' '));*/
    const rc_custom_view_outer_div = targetDiv.querySelector('div.rc_custom_view_outer_div');
    if (rc_custom_view_outer_div) {
        let classNames2 = rc_custom_view_outer_div.className;
        classNames2 = classNames2 ? classNames2.split(' ') : [];
        const normarClass2 = classNames2.filter(item => item.indexOf('win_animation_twinkle_style') !== 0);
        if (styleId != null) {
            normarClass2.push(styleId);
        }
        rc_custom_view_outer_div.className = normarClass2.join(' ');
    } else {
        let classNames = targetDiv.getAttribute('class');
        classNames = classNames ? classNames.split(' ') : [];
        const normarClass = classNames.filter(item => item.indexOf('win_animation_twinkle_style') !== 0);
        if (styleId != null) {
            normarClass.push(styleId);
        }
        targetDiv.setAttribute('class', normarClass.join(' '));
    }
};

EditorUi.prototype.refreshCellRotateAnim = function (cell) {
    const graph = this.editor.graph;
    const state = graph.getView().getState(cell);
    if (!state || !state.shape || !state.shape.node) return;
    const style = graph.getCellStyle(cell);
    const rotateAnimState = mxUtils.getValue(style, 'rotateAnimState', !this.editor.chromeless ? '1' : null);
    let styleId = null;
    if (mxUtils.isNotNullOrUndefined(rotateAnimState) && rotateAnimState == '1') {
        const rotateDirection = mxUtils.getValue(style, 'rotateDirection', null);
        const rotateSpeed = mxUtils.getValue(style, 'rotateSpeed', null);
        if (mxUtils.isNotNullOrUndefined(rotateDirection) && mxUtils.isNotNullOrUndefined(rotateSpeed)) {
            styleId = `win_animation_rotate_style_direction${rotateDirection}_speed${rotateSpeed}`;
            const el = document.getElementsByName(styleId);
            if (!el || el.length <= 0) {
                const keyframes = `${styleId}_keyframes`;
                const styleBody = `.${styleId} {
                            transform-box: fill-box;
                            animation: ${keyframes} ${rotateSpeed}s linear infinite;
                            transform-origin: center;
                        }
                        @keyframes ${keyframes}{
                            0% {
                                transform: rotate(${rotateDirection == '0' ? '0' : '360'}deg);
                            }
                            100% {
                                transform: rotate(${rotateDirection == '0' ? '360' : '0'}deg);
                            }
                        }`;
                const cssStyle = document.createElement('style');
                cssStyle.setAttribute('type', 'text/css');
                cssStyle.setAttribute('name', styleId);
                cssStyle.innerHTML = styleBody;
                document.head.appendChild(cssStyle);
            }
        }
    }
    const targetDiv = state.shape.node;
    const rc_custom_view_outer_div = targetDiv.querySelector('div.rc_custom_view_outer_div');
    if (rc_custom_view_outer_div) {
        let classNames2 = rc_custom_view_outer_div.className;
        classNames2 = classNames2 ? classNames2.split(' ') : [];
        const normarClass2 = classNames2.filter(item => item.indexOf('win_animation_rotate_style') !== 0);
        if (styleId != null) {
            normarClass2.push(styleId);
        }
        rc_custom_view_outer_div.className = normarClass2.join(' ');
    } else {
        let classNames = targetDiv.getAttribute('class');
        classNames = classNames ? classNames.split(' ') : [];
        const normarClass = classNames.filter(item => item.indexOf('win_animation_rotate_style') !== 0);
        if (styleId != null) {
            normarClass.push(styleId);
        }
        targetDiv.setAttribute('class', normarClass.join(' '));
    }
};

EditorUi.prototype.refreshCellPip = function (cell) {
    const graph = this.editor.graph;
    const state = graph.getView().getState(cell);
    const enableFlow = mxUtils.getValue(state.style, 'enableFlow', null);
    if (mxUtils.isNotNullOrUndefined(enableFlow) && enableFlow == '1') {
        //let pipFlow = mxUtils.getValue(state.style, 'pipFlow', '0');// 是否流动
        //pipFlow = !this.editor.chromeless ? '1' :  pipFlow; // 是否流动
        let pipWidth = mxUtils.getValue(state.style, 'pipWidth', 10);
        const pipColor = mxUtils.getValue(state.style, 'strokeBgColor', '#FFFFFF');
        let pipSpeed = mxUtils.getValue(state.style, 'pipSpeed', '');
        // 如果未设置流速，默认为'1'（慢速）
        if (pipSpeed === null || pipSpeed === undefined || pipSpeed === '') {
            pipSpeed = '1';
        }
        const pipDash = mxUtils.getValue(state.style, 'pipDash', '10');
        const flowDirection = mxUtils.getValue(state.style, 'flowDirection', '0');
        const pipRound = mxUtils.getValue(state.style, 'pipRound', '0');
        const flowRound = mxUtils.getValue(state.style, 'flowRound', '0');

        pipWidth = Math.floor(graph.getView().scale * pipWidth);
        //向边缘形状添加动画并使“管道”可见
        state.shape.node.getElementsByTagName('path')[0].removeAttribute('visibility');
        state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke-width', pipWidth);
        if (pipRound == '1') {
            state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke-linecap', 'round');
        }
        if (flowRound == '1') {
            state.shape.node.getElementsByTagName('path')[1].setAttribute('stroke-linecap', 'round');
        }
        // state.shape.node.getElementsByTagName('path')[0].setAttribute('class', 'testRadius');
        state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke', pipColor);
        let dash = pipDash ? parseInt(pipDash) : 0;
        dash = Math.floor(graph.getView().scale * dash);
        let time = parseInt(pipSpeed);
        if (isNaN(time) || time < 0 || time >= this.flowSpeedArr.length) {
            time = 1;
        }
        // time = pipFlow == '1' ? this.flowSpeedArr[time] : '0.0';
        let timeName = this.flowSpeedArr[time];
        timeName = timeName.replaceAll('.', '');
        const styleId = `pipAnimation_${flowDirection}_${2 * dash}_t${timeName}`;
        const el = document.getElementsByName(styleId);
        if (!el || el.length <= 0) {
            const keyframes = `${styleId}_keyframes`;
            const duration = this.flowSpeedArr[time];
            const animProp = (duration === '0.0' || duration === 0 || time === 0) ? 'none' : `${keyframes} ${duration}s linear infinite`;
            const styleBody = `.${styleId} {
		stroke-dasharray: ${dash};
		stroke-linecap:round;
		animation: ${animProp};
		}
		@keyframes ${keyframes}{
			to {
				stroke-dashoffset: ${(flowDirection == '0' ? -1 : 1) * 2 * dash};
			}
		}`;
            const style = document.createElement('style');
            style.setAttribute('type', 'text/css');
            style.setAttribute('name', styleId);
            style.innerHTML = styleBody;
            document.head.appendChild(style);
        }
        state.shape.node.getElementsByTagName('path')[1].setAttribute('class', styleId);
    }
};

EditorUi.parsePng = function (f, fn, error) {
    var pos = 0;

    function fread(d, count) {
        var start = pos;
        pos += count;

        return d.substring(start, pos);
    }

    function _freadint(d) {
        var bytes = fread(d, 4);

        return bytes.charCodeAt(3) + (bytes.charCodeAt(2) << 8) + (bytes.charCodeAt(1) << 16) + (bytes.charCodeAt(0) << 24);
    }

    // Checks signature
    if (fread(f, 8) != String.fromCharCode(137) + 'PNG' + String.fromCharCode(13, 10, 26, 10)) {
        if (error != null) {
            error();
        }
        return;
    }
    fread(f, 4);
    if (fread(f, 4) != 'IHDR') {
        if (error != null) {
            error();
        }

        return;
    }
    fread(f, 17);
    do {
        var n = _freadint(f);
        var type = fread(f, 4);
        if (fn != null) {
            if (fn(pos - 8, type, n)) {
                break;
            }
        }
        let value = fread(f, n);
        fread(f, 4);
        if (type == 'IEND') {
            break;
        }
    } while (n);
};


EditorUi.prototype.isOfflineApp = function () {
    return false;
};
EditorUi.prototype.isOffline = function (ignoreStealth) {
    return (this.isOfflineApp() || !navigator.onLine);
};

EditorUi.prototype.propertiesCollapsed = true;

EditorUi.prototype.init = function () {
    const graph = this.editor.graph;
    if (graph.useCssTransforms) {
        this.lazyZoomDelay = 0;
    }
    mxPopupMenu.prototype.submenuImage = submenuImage;
    // 处理菜单的挂载容器
    var _this = this;
    mxPopupMenu.prototype.showMenu = function () {
        _this.container.appendChild(this.div);
        mxUtils.fit(this.div);
    };
    // 处理菜单的挂载子容器
    mxPopupMenu.prototype.showSubmenu = function (parent, row) {
        if (row.div != null) {
            row.div.style.left = parent.div.offsetLeft + row.offsetLeft + row.offsetWidth - 1 + 'px';
            row.div.style.top = parent.div.offsetTop + row.offsetTop + 'px';
            _this.container.appendChild(row.div);
            const left = parseInt(row.div.offsetLeft);
            const width = parseInt(row.div.offsetWidth);
            const offset = mxUtils.getDocumentScrollOrigin(document);
            const b = document.body;
            const d = document.documentElement;
            const right = offset.x + (b.clientWidth || d.clientWidth);
            if (left + width > right) {
                row.div.style.left = Math.max(0, parent.div.offsetLeft - width + (mxClient.IS_IE ? 6 : -6)) + 'px';
            }
            mxUtils.fit(row.div);
        }
    };
    this.selectionStateListener = mxUtils.bind(this, function (sender, evt) {
        this.clearSelectionState();
    });
    graph.getSelectionModel().addListener(mxEvent.CHANGE, this.selectionStateListener);
    graph.getModel().addListener(mxEvent.CHANGE, this.selectionStateListener);
    graph.addListener(mxEvent.EDITING_STARTED, this.selectionStateListener);
    graph.addListener(mxEvent.EDITING_STOPPED, this.selectionStateListener);
    graph.getView().addListener('unitChanged', this.selectionStateListener);
    if (this.editor.chromeless && !this.editor.editable) {
        this.footerHeight = 0;
        graph.isEnabled = function () {
            return false;
        };
        graph.panningHandler.isForcePanningEvent = function (me) {
            return !mxEvent.isPopupTrigger(me.getEvent());
        };
    }
    this.actions = new Actions(this);
    this.menus = this.createMenus();
    if (!graph.standalone) {
        var styless = ['rounded', 'shadow', 'glass', 'dashed', 'dashPattern', 'labelBackgroundColor',
            'labelBorderColor', 'comic', 'sketch', 'fillWeight', 'hachureGap', 'hachureAngle', 'jiggle',
            'disableMultiStroke', 'disableMultiStrokeFill', 'fillStyle', 'curveFitting',
            'simplification', 'sketchStyle', 'pointerEvents', 'strokeColor', 'strokeWidth',
            'align', 'verticalAlign', 'spacingLeft', 'spacingRight', 'spacingTop',
            'spacingBottom', 'spacing'
        ];
        var connectStyless = ['shape', 'edgeStyle', 'curved', 'rounded', 'elbow', 'jumpStyle', 'jumpSize',
            'comic', 'sketch', 'fillWeight', 'hachureGap', 'hachureAngle', 'jiggle',
            'disableMultiStroke', 'disableMultiStrokeFill', 'fillStyle', 'curveFitting',
            'simplification', 'sketchStyle'];
        var ignoredEdgeStyles = ['curved', 'sourcePerimeterSpacing', 'targetPerimeterSpacing',
            'startArrow', 'startFill', 'startSize', 'endArrow', 'endFill', 'endSize'];
        var vertexStyleIgnored = false;
        var edgeStyleIgnored = false;
        this.setDefaultStyle = function (cell) {
            try {
                if (graph.getModel().isEdge(cell)) {
                    edgeStyleIgnored = false;
                } else {
                    vertexStyleIgnored = false;
                }

                var style = graph.getCellStyle(cell, false);
                var values = [];
                var keys = [];

                for (var key in style) {
                    values.push(style[key]);
                    keys.push(key);
                }

                // Resets current style
                if (graph.getModel().isEdge(cell)) {
                    graph.currentEdgeStyle = {};
                } else {
                    graph.currentVertexStyle = {}
                }

                this.fireEvent(new mxEventObject('styleChanged',
                    'keys', keys, 'values', values,
                    'cells', [cell], 'force', true));

                // Blocks update of default style with style changes
                // once the it was set using this function
                if (graph.getModel().isEdge(cell)) {
                    edgeStyleIgnored = true;
                } else {
                    vertexStyleIgnored = true;
                }
            } catch (e) {
                this.handleError(e);
            }
        };

        this.clearDefaultStyle = function () {
            graph.currentEdgeStyle = mxUtils.clone(graph.defaultEdgeStyle);
            graph.currentVertexStyle = mxUtils.clone(graph.defaultVertexStyle);
            edgeStyleIgnored = false;
            vertexStyleIgnored = false;

            // Updates UI
            this.fireEvent(new mxEventObject('styleChanged', 'keys', [], 'values', [], 'cells', []));
        };

        // Keys that should be ignored if the cell has a value (known: new default for all cells is html=1 so
        // for the html key this effecticely only works for edges inserted via the connection handler)
        var valueStyless = ['fontFamily', 'fontSource', 'fontSize', 'fontColor'];

        for (var i = 0; i < valueStyless.length; i++) {
            if (mxUtils.indexOf(styless, valueStyless[i]) < 0) {
                styless.push(valueStyless[i]);
            }
        }

        // Keys that always update the current edge style regardless of selection
        var alwaysEdgeStyless = ['edgeStyle', 'startArrow', 'startFill', 'startSize', 'endArrow',
            'endFill', 'endSize'];

        // Keys that are ignored together (if one appears all are ignored)
        var keyGroupss = [['startArrow', 'startFill', 'endArrow', 'endFill'],
        ['startSize', 'endSize'],
        ['sourcePerimeterSpacing', 'targetPerimeterSpacing'],
        ['fillColor', 'gradientColor', 'gradientDirection'],
        ['opacity'],
        ['html']];

        // Adds all keys used above to the styles array
        for (var i = 0; i < keyGroupss.length; i++) {
            for (var j = 0; j < keyGroupss[i].length; j++) {
                styless.push(keyGroupss[i][j]);
            }
        }

        for (var i = 0; i < connectStyless.length; i++) {
            if (mxUtils.indexOf(styless, connectStyless[i]) < 0) {
                styless.push(connectStyless[i]);
            }
        }
        var insertHandlers = function (cells, asText, model, vertexStyle, edgeStyle, applyAll, recurse) {
            vertexStyle = (vertexStyle != null) ? vertexStyle : graph.currentVertexStyle;
            edgeStyle = (edgeStyle != null) ? edgeStyle : graph.currentEdgeStyle;
            applyAll = (applyAll != null) ? applyAll : true;

            model = (model != null) ? model : graph.getModel();

            if (recurse) {
                var temp = [];

                for (var i = 0; i < cells.length; i++) {
                    temp = temp.concat(model.getDescendants(cells[i]));
                }

                cells = temp;
            }

            model.beginUpdate();
            try {
                for (var i = 0; i < cells.length; i++) {
                    var cell = cells[i];
                    var isText = asText;
                    var appliedStyles;
                    if (cell.style != null && !isText) {
                        let pairs = cell.style.split(';');
                        isText = isText || mxUtils.indexOf(pairs, 'text') >= 0;
                    }
                    if (isText) {
                        appliedStyles = ['fontSize', 'fontFamily', 'fontColor'];
                    } else {
                        var cellStyle = model.getStyle(cell);
                        var tokens = (cellStyle != null) ? cellStyle.split(';') : [];
                        appliedStyles = styless.slice();
                        for (var j = 0; j < tokens.length; j++) {
                            var tmp = tokens[j];
                            var pos = tmp.indexOf('=');

                            if (pos >= 0) {
                                var key = tmp.substring(0, pos);
                                var index = mxUtils.indexOf(appliedStyles, key);
                                if (index >= 0) {
                                    appliedStyles.splice(index, 1);
                                }
                                for (var k = 0; k < keyGroupss.length; k++) {
                                    var group = keyGroupss[k];
                                    if (mxUtils.indexOf(group, key) >= 0) {
                                        for (var l = 0; l < group.length; l++) {
                                            var index2 = mxUtils.indexOf(appliedStyles, group[l]);
                                            if (index2 >= 0) {
                                                appliedStyles.splice(index2, 1);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    var edge = model.isEdge(cell);
                    var current = (edge) ? edgeStyle : vertexStyle;
                    var newStyle = model.getStyle(cell);
                    for (var j = 0; j < appliedStyles.length; j++) {
                        var key = appliedStyles[j];
                        var styleValue = current[key];
                        if (styleValue != null && key != 'edgeStyle' && (key != 'shape' || edge)) {
                            if (!edge || applyAll || mxUtils.indexOf(ignoredEdgeStyles, key) < 0) {
                                newStyle = mxUtils.setStyle(newStyle, key, styleValue);
                            }
                        }
                    }

                    if (Editor.simpleLabels) {
                        newStyle = mxUtils.setStyle(mxUtils.setStyle(
                            newStyle, 'html', null), 'whiteSpace', null);
                    }

                    model.setStyle(cell, newStyle);
                }
            } finally {
                model.endUpdate();
            }
            return cells;
        };
        graph.addListener('cellsInserted', function (sender, evt) {
            insertHandlers(evt.getProperty('cells'), null, null, null, null, true, true);
        });
        graph.addListener('textInserted', function (sender, evt) {
            insertHandlers(evt.getProperty('cells'), true);
        });
        this.insertHandler = insertHandlers;

        this.createDivs();
        this.createUi();
        this.refresh();
        const textEditing = mxUtils.bind(this, function (evt) {
            if (evt == null) {
                evt = window.event;
            }
            return graph.isEditing() || (evt != null && this.isSelectionAllowed(evt));
        });

        if (!this.editor.chromeless || this.editor.editable) {
            // Allows context menu for links in hints
            const linkHandler = function (evt) {
                if (evt != null) {
                    let source = mxEvent.getSource(evt);

                    if (source.nodeName == 'A') {
                        while (source != null) {
                            if (source.className == 'geHint') {
                                return true;
                            }

                            source = source.parentNode;
                        }
                    }
                }

                return textEditing(evt);
            };

            if (mxClient.IS_IE && (typeof document.documentMode === 'undefined' || document.documentMode < 9)) {
                mxEvent.addListener(this.diagramContainer, 'contextmenu', linkHandler);
            } else {
                // Allows browser context menu outside of diagram and sidebar
                this.diagramContainer.oncontextmenu = linkHandler;
            }
        } else {
            graph.panningHandler.usePopupTrigger = false;
        }
        graph.init(this.diagramContainer);
        if (mxClient.IS_SVG && graph.view.getDrawPane() != null) {
            var root = graph.view.getDrawPane().ownerSVGElement;

            if (root != null) {
                root.style.position = 'absolute';
            }
        }
        this.hoverIcons = this.createHoverIcons();
        if (graph.graphHandler != null) {
            const graphHandlerStart = graph.graphHandler.start;
            graph.graphHandler.start = function () {
                if (ui.hoverIcons != null) {
                    ui.hoverIcons.reset();
                }
                graphHandlerStart.apply(this, arguments);
            };
        }
        mxEvent.addListener(
            this.diagramContainer,
            'mousemove',
            mxUtils.bind(this, function (evt) {
                const off = mxUtils.getOffset(this.diagramContainer);

                if (mxEvent.getClientX(evt) - off.x - this.diagramContainer.clientWidth > 0 || mxEvent.getClientY(evt) - off.y - this.diagramContainer.clientHeight > 0) {
                    this.diagramContainer.setAttribute('title', mxResources.get('panTooltip'));
                } else {
                    this.diagramContainer.removeAttribute('title');
                }
            })
        );
        let spaceKeyPressed = false;
        const hoverIconsIsResetEvent = this.hoverIcons.isResetEvent;
        this.hoverIcons.isResetEvent = function () {
            return spaceKeyPressed || hoverIconsIsResetEvent.apply(this, arguments);
        };
        this.keydownHandler = mxUtils.bind(this, function (evt) {
            if (evt.which == 32 /* Space */ && !graph.isEditing()) {
                spaceKeyPressed = true;
                this.hoverIcons.reset();
                graph.container.style.cursor = 'move';

                // Disables scroll after space keystroke with scrollbars
                if (!graph.isEditing() && mxEvent.getSource(evt) == graph.container) {
                    mxEvent.consume(evt);
                }
            } else if (!mxEvent.isConsumed(evt) && evt.keyCode == 27 /* Escape */) {
                this.hideDialog(null, true);
            }
        });
        mxEvent.addListener(document, 'keydown', this.keydownHandler);
        this.keyupHandler = mxUtils.bind(this, function () {
            graph.container.style.cursor = '';
            spaceKeyPressed = false;
        });
        mxEvent.addListener(document, 'keyup', this.keyupHandler);
        const panningHandlerIsForcePanningEvent = graph.panningHandler.isForcePanningEvent;
        graph.panningHandler.isForcePanningEvent = function (me) {
            return panningHandlerIsForcePanningEvent.apply(this, arguments) || spaceKeyPressed || (mxEvent.isMouseEvent(me.getEvent()) && (this.usePopupTrigger || !mxEvent.isPopupTrigger(me.getEvent())) && ((!mxEvent.isControlDown(me.getEvent()) && mxEvent.isRightMouseButton(me.getEvent())) || mxEvent.isMiddleMouseButton(me.getEvent())));
        };
        const cellEditorIsStopEditingEvent = graph.cellEditor.isStopEditingEvent;
        graph.cellEditor.isStopEditingEvent = function (evt) {
            return cellEditorIsStopEditingEvent.apply(this, arguments) || (evt.keyCode == 13 && ((!mxClient.IS_SF && mxEvent.isControlDown(evt)) || (mxClient.IS_MAC && mxEvent.isMetaDown(evt)) || (mxClient.IS_SF && mxEvent.isShiftDown(evt))));
        };
        const graphIsZoomWheelEvent = graph.isZoomWheelEvent;
        graph.isZoomWheelEvent = function () {
            return spaceKeyPressed || graphIsZoomWheelEvent.apply(this, arguments);
        };
        let textMode = false;
        let fontMenu = null;
        let sizeMenu = null;
        let nodes = null;
        const updateToolbar = mxUtils.bind(this, function () {
            if (this.toolbar != null && textMode != graph.cellEditor.isContentEditing()) {
                let node = this.toolbar.container.firstChild;
                const newNodes = [];

                while (node != null) {
                    const tmp = node.nextSibling;

                    if (mxUtils.indexOf(this.toolbar.staticElements, node) < 0) {
                        node.parentNode.removeChild(node);
                        newNodes.push(node);
                    }

                    node = tmp;
                }

                // Saves references to special items
                const tmp1 = this.toolbar.fontMenu;
                const tmp2 = this.toolbar.sizeMenu;

                if (nodes == null) {
                    this.toolbar.createTextToolbar();
                } else {
                    for (let i = 0; i < nodes.length; i++) {
                        this.toolbar.container.appendChild(nodes[i]);
                    }

                    // Restores references to special items
                    this.toolbar.fontMenu = fontMenu;
                    this.toolbar.sizeMenu = sizeMenu;
                }

                textMode = graph.cellEditor.isContentEditing();
                fontMenu = tmp1;
                sizeMenu = tmp2;
                nodes = newNodes;
            }
        });
        var ui = this;

        // Overrides cell editor to update toolbar
        const cellEditorStartEditing = graph.cellEditor.startEditing;
        graph.cellEditor.startEditing = function () {
            cellEditorStartEditing.apply(this, arguments);
            //updateToolbar();

            if (graph.cellEditor.isContentEditing()) {
                let updating = false;

                const updateCssHandler = function () {
                    if (!updating) {
                        updating = true;

                        window.setTimeout(function () {
                            const selectedElement = graph.getSelectedElement();
                            let node = selectedElement;

                            while (node != null && node.nodeType != mxConstants.NODETYPE_ELEMENT) {
                                node = node.parentNode;
                            }

                            if (node != null) {
                                const css = mxUtils.getCurrentStyle(node);

                                if (css != null && ui.toolbar != null) {
                                    // Strips leading and trailing quotes
                                    let ff = css.fontFamily;

                                    if (ff.charAt(0) == "'") {
                                        ff = ff.substring(1);
                                    }

                                    if (ff.charAt(ff.length - 1) == "'") {
                                        ff = ff.substring(0, ff.length - 1);
                                    }

                                    ui.toolbar.setFontName(ff);
                                    ui.toolbar.setFontSize(parseInt(css.fontSize));
                                }
                            }

                            updating = false;
                        }, 0);
                    }
                };

                mxEvent.addListener(graph.cellEditor.textarea, 'input', updateCssHandler);
                mxEvent.addListener(graph.cellEditor.textarea, 'touchend', updateCssHandler);
                mxEvent.addListener(graph.cellEditor.textarea, 'mouseup', updateCssHandler);
                mxEvent.addListener(graph.cellEditor.textarea, 'keyup', updateCssHandler);
                updateCssHandler();
            }
        };

        // Updates toolbar and handles possible errors
        const cellEditorStopEditing = graph.cellEditor.stopEditing;
        graph.cellEditor.stopEditing = function () {
            try {
                cellEditorStopEditing.apply(this, arguments);
                //updateToolbar();
            } catch (e) {
                ui.handleError(e);
            }
        };

        // Enables scrollbars and sets cursor style for the container
        graph.container.setAttribute('tabindex', '0');
        graph.container.style.cursor = 'default';

        // Workaround for page scroll if embedded via iframe
        if (window.self === window.top && graph.container.parentNode != null) {
            try {
                graph.container.focus();
            } catch (e) {
                // ignores error in old versions of IE
            }
        }

        // Keeps graph container focused on mouse down
        const graphFireMouseEvent = graph.fireMouseEvent;
        graph.fireMouseEvent = function (evtName) {
            if (evtName == mxEvent.MOUSE_DOWN) {
                this.container.focus();
            }

            graphFireMouseEvent.apply(this, arguments);
        };

        // Configures automatic expand on mouseover
        graph.popupMenuHandler.autoExpand = true;

        // Installs context menu
        if (this.menus != null) {
            graph.popupMenuHandler.factoryMethod = mxUtils.bind(this, function (menu, cell, evt) {
                this.menus.createPopupMenu(menu, cell, evt);
            });
        }

        // Hides context menu
        mxEvent.addGestureListeners(
            document,
            mxUtils.bind(this, function () {
                graph.popupMenuHandler.hideMenu();
            })
        );

        // Create handler for key events
        this.keyHandler = this.createKeyHandler(this.editor);

        // Getter for key handler
        this.getKeyHandler = function () {
            return this.keyHandler;
        };

        // Stores the current style and assigns it to new cells
        const styles = ['rounded', 'shadow', 'glass', 'dashed', 'dashPattern', 'comic', 'labelBackgroundColor'];
        const connectStyles = ['shape', 'edgeStyle', 'curved', 'rounded', 'elbow', 'comic', 'jumpStyle', 'jumpSize'];


        // Keys that should be ignored if the cell has a value (known: new default for all cells is html=1 so
        // for the html key this effecticely only works for edges inserted via the connection handler)
        const valueStyles = ['fontFamily', 'fontSize', 'fontColor'];

        // Keys that always update the current edge style regardless of selection
        const alwaysEdgeStyles = ['edgeStyle', 'startArrow', 'startFill', 'startSize', 'endArrow', 'endFill', 'endSize'];

        // Keys that are ignored together (if one appears all are ignored)
        const keyGroups = [['startArrow', 'startFill', 'startSize', 'sourcePerimeterSpacing', 'endArrow', 'endFill', 'endSize', 'targetPerimeterSpacing'], ['strokeColor', 'strokeWidth'], ['fillColor', 'gradientColor'], valueStyles, ['opacity'], ['align'], ['html']];

        // Adds all keys used above to the styles array
        for (var i = 0; i < keyGroups.length; i++) {
            for (let j = 0; j < keyGroups[i].length; j++) {
                styles.push(keyGroups[i][j]);
            }
        }

        for (var i = 0; i < connectStyles.length; i++) {
            if (mxUtils.indexOf(styles, connectStyles[i]) < 0) {
                styles.push(connectStyles[i]);
            }
        }

        graph.connectionHandler.addListener(mxEvent.CONNECT, function (sender, evt) {
            const cells = [evt.getProperty('cell')];

            if (evt.getProperty('terminalInserted')) {
                cells.push(evt.getProperty('terminal'));
            }

            insertHandlers(cells);
        });

        this.addListener(
            'styleChanged',
            mxUtils.bind(this, function (sender, evt) {
                // Checks if edges and/or vertices were modified
                const cells = evt.getProperty('cells');
                let vertex = false;
                let edge = false;

                if (cells.length > 0) {
                    for (var i = 0; i < cells.length; i++) {
                        vertex = graph.getModel().isVertex(cells[i]) || vertex;
                        edge = graph.getModel().isEdge(cells[i]) || edge;

                        if (edge && vertex) {
                            break;
                        }
                    }
                } else {
                    vertex = true;
                    edge = true;
                }

                const keys = evt.getProperty('keys');
                const values = evt.getProperty('values');

                for (var i = 0; i < keys.length; i++) {
                    const common = mxUtils.indexOf(valueStyles, keys[i]) >= 0;

                    // Ignores transparent stroke colors
                    if (keys[i] != 'strokeColor' || (values[i] != null && values[i] != 'none')) {
                        // Special case: Edge style and shape
                        if (mxUtils.indexOf(connectStyles, keys[i]) >= 0) {
                            if (edge || mxUtils.indexOf(alwaysEdgeStyles, keys[i]) >= 0) {
                                if (values[i] == null) {
                                    delete graph.currentEdgeStyle[keys[i]];
                                } else {
                                    graph.currentEdgeStyle[keys[i]] = values[i];
                                }
                            }
                            // Uses style for vertex if defined in styles
                            else if (vertex && mxUtils.indexOf(styles, keys[i]) >= 0) {
                                if (values[i] == null) {
                                    delete graph.currentVertexStyle[keys[i]];
                                } else {
                                    graph.currentVertexStyle[keys[i]] = values[i];
                                }
                            }
                        } else if (mxUtils.indexOf(styles, keys[i]) >= 0) {
                            if (vertex || common) {
                                if (values[i] == null) {
                                    delete graph.currentVertexStyle[keys[i]];
                                } else {
                                    graph.currentVertexStyle[keys[i]] = values[i];
                                }
                            }

                            if (edge || common || mxUtils.indexOf(alwaysEdgeStyles, keys[i]) >= 0) {
                                if (values[i] == null) {
                                    delete graph.currentEdgeStyle[keys[i]];
                                } else {
                                    graph.currentEdgeStyle[keys[i]] = values[i];
                                }
                            }
                        }
                    }
                }

                if (this.toolbar != null) {
                    this.toolbar.setFontName(graph.currentVertexStyle['fontFamily'] || Menus.prototype.defaultFont);
                    this.toolbar.setFontSize(graph.currentVertexStyle['fontSize'] || Menus.prototype.defaultFontSize);

                    if (this.toolbar.edgeStyleMenu != null) {
                        // Updates toolbar icon for edge style
                        const edgeStyleDiv = this.toolbar.edgeStyleMenu.getElementsByTagName('div')[0];

                        if (graph.currentEdgeStyle['edgeStyle'] == 'orthogonalEdgeStyle' && graph.currentEdgeStyle['curved'] == '1') {
                            edgeStyleDiv.className = 'geSprite geSprite-curved';
                        } else if (graph.currentEdgeStyle['edgeStyle'] == 'straight' || graph.currentEdgeStyle['edgeStyle'] == 'none' || graph.currentEdgeStyle['edgeStyle'] == null) {
                            edgeStyleDiv.className = 'geSprite geSprite-straight';
                        } else if (graph.currentEdgeStyle['edgeStyle'] == 'entityRelationEdgeStyle') {
                            edgeStyleDiv.className = 'geSprite geSprite-entity';
                        } else if (graph.currentEdgeStyle['edgeStyle'] == 'elbowEdgeStyle') {
                            edgeStyleDiv.className = 'geSprite geSprite-' + (graph.currentEdgeStyle['elbow'] == 'vertical' ? 'verticalelbow' : 'horizontalelbow');
                        } else if (graph.currentEdgeStyle['edgeStyle'] == 'isometricEdgeStyle') {
                            edgeStyleDiv.className = 'geSprite geSprite-' + (graph.currentEdgeStyle['elbow'] == 'vertical' ? 'verticalisometric' : 'horizontalisometric');
                        } else {
                            edgeStyleDiv.className = 'geSprite geSprite-orthogonal';
                        }
                    }

                    if (this.toolbar.edgeShapeMenu != null) {
                        // Updates icon for edge shape
                        const edgeShapeDiv = this.toolbar.edgeShapeMenu.getElementsByTagName('div')[0];
                        if (graph.currentEdgeStyle['shape'] == 'link') {
                            edgeShapeDiv.className = 'geSprite geSprite-linkedge';
                        } else if (graph.currentEdgeStyle['shape'] == 'flexArrow') {
                            edgeShapeDiv.className = 'geSprite geSprite-arrow';
                        } else if (graph.currentEdgeStyle['shape'] == 'arrow') {
                            edgeShapeDiv.className = 'geSprite geSprite-simplearrow';
                        } else {
                            edgeShapeDiv.className = 'geSprite geSprite-connection';
                        }
                    }
                    // Updates icon for optinal line start shape
                    if (this.toolbar.lineStartMenu != null) {
                        const lineStartDiv = this.toolbar.lineStartMenu.getElementsByTagName('div')[0];

                        lineStartDiv.className = this.getCssClassForMarker('start', graph.currentEdgeStyle['shape'], graph.currentEdgeStyle[mxConstants.STYLE_STARTARROW], mxUtils.getValue(graph.currentEdgeStyle, 'startFill', '1'));
                    }
                    // Updates icon for optinal line end shape
                    if (this.toolbar.lineEndMenu != null) {
                        const lineEndDiv = this.toolbar.lineEndMenu.getElementsByTagName('div')[0];
                        lineEndDiv.className = this.getCssClassForMarker('end', graph.currentEdgeStyle['shape'], graph.currentEdgeStyle[mxConstants.STYLE_ENDARROW], mxUtils.getValue(graph.currentEdgeStyle, 'endFill', '1'));
                    }
                }
            })
        );

        // 更新字体大小和字体系列标签
        if (this.toolbar != null) {
            const update = mxUtils.bind(this, function (graphModel, evt) {
                let ff = graph.currentVertexStyle['fontFamily'] || 'Helvetica';
                let fs = String(graph.currentVertexStyle['fontSize'] || '12');
                const state = graph.getView().getState(graph.getSelectionCell());

                if (state != null) {
                    ff = state.style[mxConstants.STYLE_FONTFAMILY] || ff;
                    fs = state.style[mxConstants.STYLE_FONTSIZE] || fs;

                    if (ff.length > 10) {
                        ff = ff.substring(0, 8) + '...';
                    }
                }

                this.toolbar.setFontName(ff);
                this.toolbar.setFontSize(fs);

                this.ruochenResetPipStyle();
            });

            graph.getSelectionModel().addListener(mxEvent.CHANGE, update);
            graph.getModel().addListener(mxEvent.CHANGE, update);
        }
        // 设置管道样式

        this.ruochenResetPipStyle = function () {
            const allCells = this.editor.graph.model.cells;
            for (let i in allCells) {
                let cell = allCells[i];
                const state = graph.getView().getState(cell);
                if (!cell || !cell.visible || !state) continue;
                this.refreshCellPip(cell);
                this.refreshCellRotateAnim(cell);
                this.refreshCellTwinkleAnim(cell);
            }
        };
        graph.view.addListener(
            mxEvent.SCALE,
            mxUtils.bind(this, function () {
                setTimeout(() => {
                    this.ruochenResetPipStyle();
                }, 1);
            })
        );
        graph.addListener(
            mxEvent.CELLS_ADDED,
            mxUtils.bind(this, function (sender, evt) {
                const cells = evt.getProperty('cells');
                const parent = evt.getProperty('parent');
                if (graph.getModel().isLayer(parent) && !graph.isCellVisible(parent) && cells != null && cells.length > 0) {
                    graph.getModel().setVisible(parent, true);
                }
                if (evt && evt.name == 'cellsAdded' && cells && cells.length > 0) {
                    for (let index = 0; index < cells.length; index++) {
                        const cell = cells[index];
                        if (!cell.getId() || mxUtils.isInteger(cell.getId())) {
                            cell.setId(mxUtils.uuid() + (cell.getId() != null ? '_' + cell.getId() : ''));
                        }
                    }
                }
            })
        );

        // Global handler to hide the current menu
        this.gestureHandler = mxUtils.bind(this, function (evt) {
            if (this.currentMenu != null && mxEvent.getSource(evt) != this.currentMenu.div) {
                this.hideCurrentMenu();
            }
        });

        mxEvent.addGestureListeners(document, this.gestureHandler);

        // Updates the editor UI after the window has been resized or the orientation changes
        // Timeout is workaround for old IE versions which have a delay for DOM client sizes.
        // Should not use delay > 0 to avoid handle multiple repaints during window resize
        this.resizeHandler = mxUtils.bind(this, function () {
            window.setTimeout(
                mxUtils.bind(this, function () {
                    if (this.editor.graph != null) {
                        this.refresh();
                        this.ruochenResetPipStyle();
                    }
                }),
                0
            );
        });

        mxEvent.addListener(window, 'resize', this.resizeHandler);

        this.orientationChangeHandler = mxUtils.bind(this, function () {
            this.refresh();
        });

        mxEvent.addListener(window, 'orientationchange', this.orientationChangeHandler);
        if (mxClient.IS_IOS && !window.navigator.standalone) {
            this.scrollHandler = mxUtils.bind(this, function () {
                window.scrollTo(0, 0);
            });

            mxEvent.addListener(window, 'scroll', this.scrollHandler);
        }
        this.editor.addListener(
            'resetGraphView',
            mxUtils.bind(this, function () {
                this.resetScrollbars();
            })
        );
        this.addListener(
            'gridEnabledChanged',
            mxUtils.bind(this, function () {
                graph.view.validateBackground();
            })
        );
        this.addListener(
            'backgroundColorChanged',
            mxUtils.bind(this, function () {
                graph.view.validateBackground();
            })
        );
        this.addListener(
            'viewBackgroundColorChanged',
            mxUtils.bind(this, function () {
                graph.view.validateBackground();
            })
        );
        graph.addListener(
            'gridSizeChanged',
            mxUtils.bind(this, function () {
                if (graph.isGridEnabled()) {
                    graph.view.validateBackground();
                }
            })
        );
        this.editor.resetGraph();
    }


    let id = graph.getModel().getRoot().getId();
    if (!id || mxUtils.isInteger(id)) {
        graph.getModel()
            .getRoot()
            .setId(mxUtils.uuid() + (id != null ? '_' + id : ''));
    }
    if (!graph.standalone) {
        mxEvent.addListener(
            graph.container,
            'scroll',
            mxUtils.bind(this, function () {
                graph.tooltipHandler.hide();
                if (graph.connectionHandler != null && graph.connectionHandler.constraintHandler != null) {
                    graph.connectionHandler.constraintHandler.reset();
                }
            })
        );
        var graphFireMouseEvent = graph.fireMouseEvent;
        graph.fireMouseEvent = function (evtName, me, sender) {
            graphFireMouseEvent.apply(this, arguments);
        };

        // Hides tooltip on escape
        graph.addListener(
            mxEvent.ESCAPE,
            mxUtils.bind(this, function () {
                graph.tooltipHandler.hide();
                const rb = graph.getRubberband();

                if (rb != null) {
                    rb.cancel();
                }
            })
        );

        mxEvent.addListener(
            graph.container,
            'keydown',
            mxUtils.bind(this, function (evt) {
                this.onKeyDown(evt);
            })
        );

        mxEvent.addListener(
            graph.container,
            'keypress',
            mxUtils.bind(this, function (evt) {
                this.onKeyPress(evt);
            })
        );

        // Updates action states
        this.addUndoListener();
        this.addBeforeUnloadListener();

        graph.getSelectionModel().addListener(
            mxEvent.CHANGE,
            mxUtils.bind(this, function () {
                this.updateActionStates();
            })
        );

        graph.getModel().addListener(
            mxEvent.CHANGE,
            mxUtils.bind(this, function () {
                this.updateActionStates();
            })
        );

        // Changes action states after change of default parent
        const graphSetDefaultParent = graph.setDefaultParent;
        const ui = this;

        this.editor.graph.setDefaultParent = function () {
            graphSetDefaultParent.apply(this, arguments);
            ui.updateActionStates();
        };

        this.updateActionStates();
        this.initClipboard();
        this.initCanvas();

        if (this.format != null) {
            this.format.init();
        }

        window.addEventListener("keydown", mxUtils.bind(this, function (e) {
            //可以判断是不是mac，如果是mac,ctrl变为花键 禁止ctrl+s 的弹出系统框
            //event.preventDefault() 方法阻止元素发生默认的行为。
            if (e.keyCode === 83 && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
            }
        }), false);

    }
    this.spinner = this.createSpinner(null, null, 24);

    if (Editor.isSettingsEnabled()) {
        const view = this.editor.graph.view;
        view.setUnit(mxSettings.getUnit());
        view.addListener('unitChanged', function (sender, evt) {
            mxSettings.setUnit(evt.getProperty('unit'));
            mxSettings.save();
        });
        const showRuler = mxSettings.isRulerOn() && (!this.editor.isChromelessView() || this.editor.editable);
        this.ruler = showRuler ? new mxDualRuler(this, view.unit) : null;
        this.refresh();
    }

    mxClient.IS_SVG && this.editor.graph.addSvgShadow(graph.view.canvas.ownerSVGElement, null, !0);

    this.initPages();

    // this.createFirstPage();

};

EditorUi.prototype.createFirstPage = function () {
    // const name = this.createPageName(1);
    // const pageId = mxUtils.uuid();
    // var page = this.updatePageRoot(new DiagramPage(document.createElement('diagram'), pageId));
    //const page = this.updatePageRoot(this.createPage(name, pageId, 1));

    // this.fileNode = node.ownerDocument.createElement('mxfile');
    this.currentPage = new DiagramPage(document.createElement('diagram'), mxUtils.uuid());
    this.currentPage.setName(mxResources.get('pageWithNumber', [1]));
    this.pages = [this.currentPage];

    if (this.currentPage != null) {
        this.currentPage.root = this.editor.graph.model.root;
        // Scrolls to current page
        this.scrollToPage();
    }
}


EditorUi.prototype.isPagesEnabled = function () {
    return this.editor.editable;
};

EditorUi.prototype.initPages = function () {
    if (!this.editor.graph.standalone) {
        this.actions.addAction(
            'previousPage',
            mxUtils.bind(this, function () {
                this.selectNextPage(false);
            })
        );

        this.actions.addAction(
            'nextPage',
            mxUtils.bind(this, function () {
                this.selectNextPage(true);
            })
        );

        if (this.isPagesEnabled()) {
            this.keyHandler.bindAction(33, true, 'previousPage', true); // Ctrl+Shift+PageUp
            this.keyHandler.bindAction(34, true, 'nextPage', true); // Ctrl+Shift+PageDown
        }

        // Updates the tabs after loading the diagram
        var graph = this.editor.graph;
        var graphViewValidateBackground = graph.view.validateBackground;

        graph.view.validateBackground = mxUtils.bind(this, function () {
            if (this.tabContainer != null) {
                var prevHeight = this.tabContainer.style.height;
                if (this.fileNode == null || this.pages == null) {
                    // this.tabContainer.style.height = '0px';
                    this.tabContainer.style.height = this.tabContainerHeight + 'px';
                } else {
                    this.tabContainer.style.height = this.tabContainerHeight + 'px';
                }

                if (prevHeight != this.tabContainer.style.height) {
                    this.refresh(false);
                }
            }

            graphViewValidateBackground.apply(graph.view, arguments);
        });

        // Adds a graph model listener to update the view
        this.editor.graph.model.addListener(
            mxEvent.CHANGE,
            mxUtils.bind(this, function (sender, evt) {
                var edit = evt.getProperty('edit');
                var changes = edit.changes;
                for (var i = 0; i < changes.length; i++) {
                    if (changes[i] instanceof RenamePage || changes[i] instanceof ChangePage) {//|| changes[i] instanceof mxRootChange
                        this.updateTabContainer();
                        break;
                    }
                }
            })
        );

        // Invokes pageSelected to reset/restore view state
        var graphSizeDidChange = graph.sizeDidChange;
        var lastPage = null;
        var ui = this;

        graph.sizeDidChange = function () {
            var result = graphSizeDidChange.apply(this, arguments);

            if (ui.currentPage != null && lastPage != ui.currentPage) {
                lastPage = ui.currentPage;
                ui.pageSelected();
            }

            return result;
        };

        // Selects new default parent if root changes
        graph.addListener(
            mxEvent.ROOT,
            mxUtils.bind(this, function () {
                if (graph.defaultParent != null && !graph.model.contains(graph.defaultParent)) {
                    graph.setDefaultParent(null);
                    graph.selectUnlockedLayer();
                }
            })
        );

        var pagesChanged = mxUtils.bind(this, function () {
            this.updateDocumentTitle();
            this.updateTabContainer();
        });

        this.addListener('currentThemeChanged', pagesChanged);
        this.editor.addListener('pagesPatched', pagesChanged);
        this.editor.addListener('pageRenamed', pagesChanged);
        this.editor.addListener('pageMoved', pagesChanged);
        this.editor.addListener('fileLoaded', pagesChanged);

        this.editor.addListener(
            'pageSelected',
            mxUtils.bind(this, function (sender, evt) {
                this.scrollToPage();
                this.updateHashObject();
                this.updateTabContainer();
                this.updateDocumentTitle();

                if (this.toolbar != null) {
                    this.toolbar.updateZoom();
                }
                const backgroundImg = this.currentPage.getBackgroundImage();
                const backgroundColor = this.currentPage.getBackgroundColor();
                if (backgroundImg) {
                    let image = new Image();
                    image.src = mxUtils.fixImg(backgroundImg);
                    image.crossOrigin = '*';
                    image.onload = mxUtils.bind(this, function () {
                        let canvas = document.createElement('canvas');
                        canvas.width = image.width;
                        canvas.height = image.height;
                        let ctx = canvas.getContext('2d');
                        ctx.drawImage(image, 0, 0, image.width, image.height);
                        let dataURL = canvas.toDataURL('image/png');
                        let bgImg = new Image();
                        bgImg.src = dataURL;
                        setTimeout(() => {
                            this.setBackgroundImage(bgImg);
                        }, 100);
                    });
                } else if (backgroundColor) {
                    this.setBackgroundColor(backgroundColor);
                }
            })
        );

        this.editor.addListener(
            'pageMoved',
            mxUtils.bind(this, function (sender, evt) {
                this.scrollToPage();
                this.updateHashObject();
            })
        );
        mxEvent.addListener(
            window,
            'resize',
            mxUtils.bind(this, function () {
                this.checkTabScrollerOverflow();
            })
        );

        setTimeout(() => {
            this.updateTabContainer();
            this.refresh();
        }, 1000);
    }


};

EditorUi.prototype.clearSelectionState = function () {
    this.selectionState = null;
};

EditorUi.prototype.getSelectionState = function () {
    if (this.selectionState == null) {
        this.selectionState = this.createSelectionState();
    }
    return this.selectionState;
};

EditorUi.prototype.createSelectionState = function () {
    var graph = this.editor.graph;
    var cells = graph.getSelectionCells();
    var result = this.initSelectionState();
    var initial = true;
    for (var i = 0; i < cells.length; i++) {
        var style = graph.getCurrentCellStyle(cells[i]);
        if (mxUtils.getValue(style, mxConstants.STYLE_EDITABLE, '1') != '0' ||
            style['erchenchiType'] === 'statusIndicator' ||
            style['erchenchiType'] === 'dataDisplay') {
            this.updateSelectionStateForCell(result, cells[i], cells, initial);
            initial = false;
        }
    }
    this.updateSelectionStateForTableCells(result);
    return result;
};

EditorUi.prototype.initSelectionState = function () {
    return {
        vertices: [],
        edges: [],
        cells: [],
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
        autoSize: false,
        image: false,
        shadow: true,
        lineJumps: true,
        resizable: true,
        table: false,
        cell: false,
        row: false,
        movable: true,
        rotatable: true,
        stroke: true,
        swimlane: false,
        unlocked: this.editor.graph.isEnabled(),
        connections: false,
    };
};

EditorUi.prototype.updateSelectionStateForCell = function (result, cell, cells, initial) {
    var graph = this.editor.graph;
    result.cells.push(cell);
    if (graph.getModel().isVertex(cell)) {
        result.connections = graph.model.getEdgeCount(cell) > 0;
        result.unlocked = result.unlocked && !graph.isCellLocked(cell);
        result.resizable = result.resizable && graph.isCellResizable(cell);
        result.rotatable = result.rotatable && graph.isCellRotatable(cell);
        result.movable = result.movable && graph.isCellMovable(cell) && !graph.isTableRow(cell) && !graph.isTableCell(cell);
        result.swimlane = result.swimlane || graph.isSwimlane(cell);
        result.table = result.table || graph.isTable(cell);
        result.cell = result.cell || graph.isTableCell(cell);
        result.row = result.row || graph.isTableRow(cell);
        result.vertices.push(cell);
        var geo = graph.getCellGeometry(cell);
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
                var x = geo.relative ? geo.offset.x : geo.x;
                var y = geo.relative ? geo.offset.y : geo.y;

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
        result.connections = true;
        result.resizable = false;
        result.rotatable = false;
        result.movable = false;
    }
    var state = graph.view.getState(cell);
    if (state != null) {
        result.autoSize = result.autoSize || graph.isAutoSizeState(state);
        result.glass = result.glass && graph.isGlassState(state);
        result.rounded = result.rounded && graph.isRoundedState(state);
        result.lineJumps = result.lineJumps && graph.isLineJumpState(state);
        result.image = result.image || graph.isImageState(state);
        result.shadow = result.shadow && graph.isShadowState(state);
        result.fill = result.fill && graph.isFillState(state);
        result.gradient = result.fill && graph.isGradientState(state);
        result.stroke = result.stroke && graph.isStrokeState(state);
        var shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
        result.containsImage = result.containsImage || shape == 'image';
        graph.mergeStyle(state.style, result.style, initial);
    }
};

EditorUi.prototype.updateSelectionStateForTableCells = function (result) {
    if (result.cells.length > 1 && result.cell) {
        var cells = mxUtils.sortCells(result.cells);
        var model = this.editor.graph.model;
        var parent = model.getParent(cells[0]);
        var table = model.getParent(parent);

        if (parent != null && table != null) {
            var col = parent.getIndex(cells[0]);
            var row = table.getIndex(parent);
            var lastspan = null;
            var colspan = 1;
            var rowspan = 1;
            var index = 0;

            var nextRowCell = row < table.getChildCount() - 1 ? model.getChildAt(model.getChildAt(table, row + 1), col) : null;

            while (index < cells.length - 1) {
                var next = cells[++index];

                if (nextRowCell != null && nextRowCell == next && (lastspan == null || colspan == lastspan)) {
                    lastspan = colspan;
                    colspan = 0;
                    rowspan++;
                    parent = model.getParent(nextRowCell);
                    nextRowCell = row + rowspan < table.getChildCount() ? model.getChildAt(model.getChildAt(table, row + rowspan), col) : null;
                }

                var state = this.editor.graph.view.getState(next);

                if (next == model.getChildAt(parent, col + colspan) && state != null && mxUtils.getValue(state.style, 'colspan', 1) == 1 && mxUtils.getValue(state.style, 'rowspan', 1) == 1) {
                    colspan++;
                } else {
                    break;
                }
            }

            if (index == rowspan * colspan - 1) {
                result.mergeCell = cells[0];
                result.colspan = colspan;
                result.rowspan = rowspan;
            }
        }
    }
};

EditorUi.prototype.onKeyDown = function (evt) {
    const graph = this.editor.graph;
    if (evt.which == 9 && graph.isEnabled() && !mxEvent.isAltDown(evt) && (!graph.isEditing() || !mxEvent.isShiftDown(evt))) {
        if (graph.isEditing()) {
            graph.stopEditing(false);
        } else {
            graph.selectCell(!mxEvent.isShiftDown(evt));
        }

        mxEvent.consume(evt);
    }
};

EditorUi.prototype.onKeyPress = function (evt) {
    const graph = this.editor.graph;

    // KNOWN: Focus does not work if label is empty in quirks mode
    if (this.isImmediateEditingEvent(evt) && !graph.isEditing() && !graph.isSelectionEmpty() && evt.which !== 0 && evt.which !== 27 && !mxEvent.isAltDown(evt) && !mxEvent.isControlDown(evt) && !mxEvent.isMetaDown(evt)) {
        graph.escape();
        graph.startEditing();

        // Workaround for FF where char is lost if cursor is placed before char
        if (mxClient.IS_FF) {
            const ce = graph.cellEditor;

            if (ce.textarea != null) {
                ce.textarea.innerHTML = String.fromCharCode(evt.which);

                // Moves cursor to end of textarea
                const range = document.createRange();
                range.selectNodeContents(ce.textarea);
                range.collapse(false);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }
};

EditorUi.prototype.isImmediateEditingEvent = function () {
    return true;
};

EditorUi.prototype.getCssClassForMarker = function (prefix, shape, marker, fill) {
    let result = '';
    if (shape == 'flexArrow') {
        result = marker != null && marker != mxConstants.NONE ? 'geSprite geSprite-' + prefix + 'blocktrans' : 'geSprite geSprite-noarrow';
    } else {
        // SVG marker sprites
        if (marker == 'box' || marker == 'halfCircle') {
            result = 'geSprite geSvgSprite geSprite-' + marker + (prefix == 'end' ? ' geFlipSprite' : '');
        } else if (marker == mxConstants.ARROW_CLASSIC) {
            result = fill == '1' ? 'geSprite geSprite-' + prefix + 'classic' : 'geSprite geSprite-' + prefix + 'classictrans';
        } else if (marker == mxConstants.ARROW_CLASSIC_THIN) {
            result = fill == '1' ? 'geSprite geSprite-' + prefix + 'classicthin' : 'geSprite geSprite-' + prefix + 'classicthintrans';
        } else if (marker == mxConstants.ARROW_OPEN) {
            result = 'geSprite geSprite-' + prefix + 'open';
        } else if (marker == mxConstants.ARROW_OPEN_THIN) {
            result = 'geSprite geSprite-' + prefix + 'openthin';
        } else if (marker == mxConstants.ARROW_BLOCK) {
            result = fill == '1' ? 'geSprite geSprite-' + prefix + 'block' : 'geSprite geSprite-' + prefix + 'blocktrans';
        } else if (marker == mxConstants.ARROW_BLOCK_THIN) {
            result = fill == '1' ? 'geSprite geSprite-' + prefix + 'blockthin' : 'geSprite geSprite-' + prefix + 'blockthintrans';
        } else if (marker == mxConstants.ARROW_OVAL) {
            result = fill == '1' ? 'geSprite geSprite-' + prefix + 'oval' : 'geSprite geSprite-' + prefix + 'ovaltrans';
        } else if (marker == mxConstants.ARROW_DIAMOND) {
            result = fill == '1' ? 'geSprite geSprite-' + prefix + 'diamond' : 'geSprite geSprite-' + prefix + 'diamondtrans';
        } else if (marker == mxConstants.ARROW_DIAMOND_THIN) {
            result = fill == '1' ? 'geSprite geSprite-' + prefix + 'thindiamond' : 'geSprite geSprite-' + prefix + 'thindiamondtrans';
        } else if (marker == 'openAsync') {
            result = 'geSprite geSprite-' + prefix + 'openasync';
        } else if (marker == 'dash') {
            result = 'geSprite geSprite-' + prefix + 'dash';
        } else if (marker == 'cross') {
            result = 'geSprite geSprite-' + prefix + 'cross';
        } else if (marker == 'async') {
            result = fill == '1' ? 'geSprite geSprite-' + prefix + 'async' : 'geSprite geSprite-' + prefix + 'asynctrans';
        } else if (marker == 'circle' || marker == 'circlePlus') {
            result = fill == '1' || marker == 'circle' ? 'geSprite geSprite-' + prefix + 'circle' : 'geSprite geSprite-' + prefix + 'circleplus';
        } else if (marker == 'ERone') {
            result = 'geSprite geSprite-' + prefix + 'erone';
        } else if (marker == 'ERmandOne') {
            result = 'geSprite geSprite-' + prefix + 'eronetoone';
        } else if (marker == 'ERmany') {
            result = 'geSprite geSprite-' + prefix + 'ermany';
        } else if (marker == 'ERoneToMany') {
            result = 'geSprite geSprite-' + prefix + 'eronetomany';
        } else if (marker == 'ERzeroToOne') {
            result = 'geSprite geSprite-' + prefix + 'eroneopt';
        } else if (marker == 'ERzeroToMany') {
            result = 'geSprite geSprite-' + prefix + 'ermanyopt';
        } else {
            result = 'geSprite geSprite-noarrow';
        }
    }
    return result;
};

EditorUi.prototype.createMenus = function () {
    return new Menus(this);
};

EditorUi.prototype.updatePasteActionStates = function () {
    const graph = this.editor.graph;
    const paste = this.actions.get('paste');
    const pasteHere = this.actions.get('pasteHere');
    paste.setEnabled(this.editor.graph.cellEditor.isContentEditing() || (!mxClipboard.isEmpty() && graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())));
    pasteHere.setEnabled(paste.isEnabled());
};
EditorUi.prototype.convertDataUri = function (uri) {
    if (uri.substring(0, 5) == 'data:') {
        var semi = uri.indexOf(';');
        if (semi > 0) {
            uri = uri.substring(0, semi) + uri.substring(uri.indexOf(',', semi + 1));
        }
    }
    return uri;
};

EditorUi.prototype.handleStorageEvent = function (event) {
    if (event.key === 'mxGraph-cross-tab-copy' && event.newValue) {
        console.log('收到跨标签数据：', event.newValue)
        try {
            const xmlString = event.newValue;
            const cellsToPaste = this.deserializeCells(xmlString);
            if (cellsToPaste) {
                mxClipboard.setCells(cellsToPaste); // 存储到剪贴板
                this.updatePasteActionStates();     // 更新粘贴按钮状态
            }
        } catch (e) {
            console.error("解析跨标签数据失败", e);
        }
    }
};

// 自定义序列化函数（处理 mxGraph 单元格对象）
EditorUi.prototype.serializeCells = function (cells) {
    const doc = mxUtils.createXmlDocument();
    const root = this.editor.graph.getModel().root; // 保留根节点
    const node = this.editor.graph.encodeCells(cells, doc, root);
    return mxUtils.getXml(node);
};

// 自定义反序列化函数
EditorUi.prototype.deserializeCells = function (xmlString) {
    const xmlDoc = mxUtils.parseXml(xmlString);
    const codec = new mxCodec(xmlDoc);
    const model = new mxGraphModel();
    console.log("deserializeCells")

    try {
        codec.decode(xmlDoc.documentElement, model);
    } catch (e) {
        console.error("反序列化失败", e);
        return null; // 反序列化失败时返回 null
    }

    const currentModel = this.editor.graph.getModel();

    currentModel.beginUpdate();
    try {
        const cells = Object.values(model.cells || {}); // 确保是数组
        console.log("deserializeCells Ing", cells)
        return cells;
    } finally {
        currentModel.endUpdate();
    }
};

EditorUi.prototype.initClipboard = function () {
    const ui = this;
    const mxClipboardCut = mxClipboard.cut;
    mxClipboard.cut = function (graph) {
        if (graph.cellEditor.isContentEditing()) {
            document.execCommand('cut', false, null);
        } else {
            mxClipboardCut.apply(this, arguments);
        }
        ui.updatePasteActionStates();
    };
    mxClipboard.copy = function (graph) {
        let result = null;

        // 保留原有内容编辑处理逻辑
        if (graph.cellEditor.isContentEditing()) {
            document.execCommand('copy', false, null);
        } else {
            // 1. 克隆选中的单元格
            const selectedCells = graph.getSelectionCells();
            const clonedCells = graph.cloneCells(selectedCells); // 使用mxGraph的克隆方法

            // 2. 递归重写所有克隆单元格的ID（格式：UUID_原始ID）
            const rewriteIds = (cell) => {
                const originalId = cell['id'];
                let baseId = originalId; // 默认基础ID为原ID

                // 处理原始ID为空或无效的情况
                if (!originalId) {
                    baseId = '';
                } else {
                    // 匹配开头的UUID前缀（格式：UUID_）
                    const uuidPattern = /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}_/;
                    const match = originalId.match(uuidPattern);

                    if (match) {
                        // 提取基础ID（去掉UUID前缀）
                        baseId = originalId.slice(match[0].length);
                    }
                }

                // 生成新UUID并拼接基础ID
                let newId;
                if (baseId === '') {
                    // 原始ID无效，直接使用新UUID
                    newId = mxUtils.uuid();
                } else {
                    newId = `${mxUtils.uuid()}_${baseId}`;
                }

                cell.setId(newId); // 设置新ID

                // 递归处理子单元格
                const childCount = graph.model.getChildCount(cell);
                for (let i = 0; i < childCount; i++) {
                    const child = graph.model.getChildAt(cell, i);
                    rewriteIds(child); // 递归处理子单元格
                }
            };

            clonedCells.forEach(cell => rewriteIds(cell)); // 遍历顶层克隆单元格

            // 3. 处理跨标签页数据序列化（保留原有逻辑）
            const xmlString = ui.serializeCells(clonedCells); // 使用原有序列化方法
            localStorage.setItem('mxGraph-cross-tab-copy', xmlString);
            localStorage.setItem('drawio-cross-tab-timestamp', Date.now() + '');


            ui.pasteOffset = 10; // 重置偏移量为初始值
            // 4. 保留原有剪切板设置逻辑
            mxClipboard.setCells(clonedCells);
            result = clonedCells;
        }

        // 保留原有状态更新逻辑
        ui.updatePasteActionStates();
        return result;
    };
    const mxClipboardPaste = mxClipboard.paste;
    mxClipboard.paste = function (graph) {
        let result = null;
        const offset = ui.pasteOffset; // 使用当前偏移量
        const cells = mxClipboard.getCells(); // 获取剪贴板中的单元格

        if (Array.isArray(cells) && cells.length > 0) {
            // 1. 克隆剪贴板中的单元格（确保独立性）
            const clonedCells = graph.cloneCells(cells);

            // 2. 递归重写克隆单元格的ID（格式：UUID_原始ID）
            const rewriteIds = (cell) => {
                const originalId = cell.getId();
                const newId = `${mxUtils.uuid()}${originalId ? '_' + originalId : ''}`;
                cell.setId(newId); // 设置新ID

                // 处理子单元格（如表格/嵌套形状）
                const childCount = graph.model.getChildCount(cell);
                for (let i = 0; i < childCount; i++) {
                    rewriteIds(graph.model.getChildAt(cell, i));
                }
            };

            clonedCells.forEach(cell => rewriteIds(cell)); // 遍历顶层克隆单元格

            // 3. 应用几何偏移并添加到模型
            const currentModel = graph.getModel();
            const targetParent = graph.getDefaultParent();
            currentModel.beginUpdate();
            try {
                clonedCells.forEach(cell => {
                    const geo = graph.getModel().getGeometry(cell);
                    if (geo) {
                        const newGeo = geo.clone();
                        newGeo.x += offset;
                        newGeo.y += offset;
                        graph.getModel().setGeometry(cell, newGeo);
                    }
                    currentModel.add(targetParent, cell);
                });
                result = clonedCells;
            } finally {
                currentModel.endUpdate();
            }
            ui.pasteOffset += 10;
        } else {
            // 回退到默认逻辑
            if (graph.cellEditor.isContentEditing()) {
                document.execCommand('paste', false, null);
            } else {
                result = mxClipboardPaste.apply(this, arguments);
            }
        }
        ui.updatePasteActionStates();
        return result;
    };
    const cellEditorStartEditing = this.editor.graph.cellEditor.startEditing;
    this.editor.graph.cellEditor.startEditing = function () {
        cellEditorStartEditing.apply(this, arguments);
        ui.updatePasteActionStates();
    };
    const cellEditorStopEditing = this.editor.graph.cellEditor.stopEditing;
    this.editor.graph.cellEditor.stopEditing = function () {
        cellEditorStopEditing.apply(this, arguments);
        ui.updatePasteActionStates();
    };
    this.updatePasteActionStates();
};

EditorUi.prototype.initCanvas = function () {
    const graph = this.editor.graph;
    graph.timerAutoScroll = true;
    graph.getPagePadding = function () {
        return new mxPoint(Math.max(0, Math.round((graph.container.offsetWidth - 34) / graph.view.scale)), Math.max(0, Math.round((graph.container.offsetHeight - 34) / graph.view.scale)));
    };
    graph.view.getBackgroundPageBounds = function () {
        const layout = this.graph.getPageLayout();
        const page = this.graph.getPageSize();
        return new mxRectangle(this.scale * (this.translate.x + layout.x * page.width), this.scale * (this.translate.y + layout.y * page.height), this.scale * layout.width * page.width, this.scale * layout.height * page.height);
    };
    graph.getPreferredPageSize = function () {
        const pages = this.getPageLayout();
        const size = this.getPageSize();
        return new mxRectangle(0, 0, pages.width * size.width, pages.height * size.height);
    };
    let resize = null;
    const ui = this;
    this.fitView = function () {
        if (graph.isLightboxView()) {
            if (graph.view.scale == 1) {
                this.lightboxFit();
            } else {
                graph.zoomTo(1);
            }
            this.chromelessResize(false);
        } else {
            this.chromelessResize(true);
        }
    };
    if (this.editor.isChromelessView()) {
        resize = mxUtils.bind(this, function (autoscale, maxScale, cx, cy) {
            if (graph.container != null && !graph.isViewer()) {
                cx = cx != null ? cx : 0;
                cy = cy != null ? cy : 0;

                const bds = graph.pageVisible ? graph.view.getBackgroundPageBounds() : graph.getGraphBounds();
                const scroll = mxUtils.hasScrollbars(graph.container);
                const tr = graph.view.translate;
                const s = graph.view.scale;

                // Normalizes the bounds
                const b = mxRectangle.fromRectangle(bds);
                b.x = b.x / s - tr.x;
                b.y = b.y / s - tr.y;
                b.width /= s;
                b.height /= s;

                const st = graph.container.scrollTop;
                const sl = graph.container.scrollLeft;
                let sb = mxClient.IS_QUIRKS || document.documentMode >= 8 ? 20 : 14;

                if (document.documentMode == 8 || document.documentMode == 9) {
                    sb += 3;
                }

                const cw = graph.container.offsetWidth - sb;
                const ch = graph.container.offsetHeight - sb;

                const ns = autoscale ? Math.max(0.3, Math.min(maxScale || 1, cw / b.width)) : s;
                let dx = (cw - ns * b.width) / 2 / ns;
                let dy = this.lightboxVerticalDivider == 0 ? 0 : (ch - ns * b.height) / this.lightboxVerticalDivider / ns;

                if (scroll) {
                    dx = Math.max(dx, 0);
                    dy = Math.max(dy, 0);
                }

                if (scroll || bds.width < cw || bds.height < ch) {
                    graph.view.scaleAndTranslate(ns, Math.floor(dx - b.x), Math.floor(dy - b.y));
                    graph.container.scrollTop = (st * ns) / s;
                    graph.container.scrollLeft = (sl * ns) / s;
                } else if (cx != 0 || cy != 0) {
                    const t = graph.view.translate;
                    graph.view.setTranslate(Math.floor(t.x + cx / s), Math.floor(t.y + cy / s));
                }
            }
        });
        this.chromelessResize = resize;
        this.chromelessWindowResize = mxUtils.bind(this, function () {
            this.chromelessResize(false);
        });
        const autoscaleResize = mxUtils.bind(this, function () {
            this.chromelessWindowResize(false);
        });
        mxEvent.addListener(window, 'resize', autoscaleResize);
        this.destroyFunctions.push(function () {
            mxEvent.removeListener(window, 'resize', autoscaleResize);
        });
        this.editor.addListener(
            'resetGraphView',
            mxUtils.bind(this, function () {
                this.chromelessResize(true);
            })
        );
        this.actions.get('zoomIn').funct = mxUtils.bind(this, function () {
            graph.zoomIn();
            this.chromelessResize(false);
        });
        this.actions.get('zoomOut').funct = mxUtils.bind(this, function () {
            graph.zoomOut();
            this.chromelessResize(false);
        });
        this.chromelessToolbar = document.createElement('div');
        this.chromelessToolbar.style.position = 'fixed';
        this.chromelessToolbar.style.overflow = 'hidden';
        this.chromelessToolbar.style.boxSizing = 'border-box';
        this.chromelessToolbar.style.whiteSpace = 'nowrap';
        this.chromelessToolbar.style.backgroundColor = '#000000';
        this.chromelessToolbar.style.padding = '10px 10px 8px 10px';
        this.chromelessToolbar.style.right = graph.isViewer() ? '0' : '20px';
        if (!mxClient.IS_VML) {
            mxUtils.setPrefixedStyle(this.chromelessToolbar.style, 'borderRadius', '20px');
            mxUtils.setPrefixedStyle(this.chromelessToolbar.style, 'transition', 'opacity 600ms ease-in-out');
        }
        const updateChromelessToolbarPosition = mxUtils.bind(this, function () {
            const css = mxUtils.getCurrentStyle(graph.container);
            if (graph.isViewer()) {
                this.chromelessToolbar.style.top = '0';
            } else {
                this.chromelessToolbar.style.bottom = (css != null ? parseInt(css['margin-bottom'] || 0) : 0) + (this.tabContainer != null ? 20 + parseInt(this.tabContainer.style.height) : 20) + 'px';
            }
        });
        this.editor.addListener('resetGraphView', updateChromelessToolbarPosition);
        updateChromelessToolbarPosition();
        const addButton = mxUtils.bind(this, function (fn, imgSrc, tip) {
            const a = document.createElement('span');
            a.style.paddingLeft = '8px';
            a.style.paddingRight = '8px';
            a.style.cursor = 'pointer';
            mxEvent.addListener(a, 'click', fn);
            if (tip != null) {
                a.setAttribute('title', tip);
            }
            const img = document.createElement('img');
            img.setAttribute('border', '0');
            img.setAttribute('id', tip);
            img.setAttribute('src', imgSrc);
            img.style.cssText = 'width:40px;height:40px';
            a.appendChild(img);
            this.chromelessToolbar.appendChild(a);
            return a;
        });
        const prevButton = addButton(
            mxUtils.bind(this, function (evt) {
                this.actions.get('previousPage').funct();
                mxEvent.consume(evt);
            }),
            Editor.previousImage,
            mxResources.get('previousPage')
        );
        const pageInfo = document.createElement('div');
        pageInfo.style.display = 'inline-block';
        pageInfo.style.verticalAlign = 'top';
        pageInfo.style.fontFamily = 'Helvetica,Arial';
        pageInfo.style.marginTop = '8px';
        pageInfo.style.fontSize = '14px';
        pageInfo.style.color = '#ffffff';
        this.chromelessToolbar.appendChild(pageInfo);
        const nextButton = addButton(
            mxUtils.bind(this, function (evt) {
                this.actions.get('nextPage').funct();
                mxEvent.consume(evt);
            }),
            Editor.nextImage,
            mxResources.get('nextPage')
        );
        const updatePageInfo = mxUtils.bind(this, function () {
            if (this.pages != null && this.pages.length > 1 && this.currentPage != null) {
                pageInfo.innerHTML = '';
                mxUtils.write(pageInfo, mxUtils.indexOf(this.pages, this.currentPage) + 1 + ' / ' + this.pages.length);
            }
        });
        prevButton.style.paddingLeft = '0px';
        prevButton.style.paddingRight = '4px';
        nextButton.style.paddingLeft = '4px';
        nextButton.style.paddingRight = '0px';
        const updatePageButtons = mxUtils.bind(this, function () {
            if (this.pages != null && this.pages.length > 1 && this.currentPage != null) {
                nextButton.style.display = '';
                prevButton.style.display = '';
                pageInfo.style.display = 'inline-block';
            } else {
                nextButton.style.display = 'none';
                prevButton.style.display = 'none';
                pageInfo.style.display = 'none';
            }
            updatePageInfo();
        });
        this.editor.addListener('resetGraphView', updatePageButtons);
        this.editor.addListener('pageSelected', updatePageInfo);
        addButton(
            mxUtils.bind(this, function (evt) {
                this.actions.get('zoomOut').funct();
                mxEvent.consume(evt);
                this.ruochenResetPipStyle();
            }),
            pageZoomOut,
            mxResources.get('zoomOut') + ' (Alt+Mousewheel)'
        );
        addButton(
            mxUtils.bind(this, function (evt) {
                this.actions.get('zoomIn').funct();
                mxEvent.consume(evt);
                this.ruochenResetPipStyle();
            }),
            pageZoomIn,
            mxResources.get('zoomIn') + ' (Alt+Mousewheel)'
        );
        addButton(
            mxUtils.bind(this, function (evt) {
                this.fitView();
                mxEvent.consume(evt);
                this.ruochenResetPipStyle();
            }),
            pageZoomAuto,
            mxResources.get('fit')
        );
        addButton(
            mxUtils.bind(this, function (evt) {
                const elem = this.container;
                if (!document.fullscreenElement &&
                    !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                    if (elem.requestFullscreen) {
                        elem.requestFullscreen();
                    } else if (elem.msRequestFullscreen) {
                        elem.msRequestFullscreen();
                    } else if (elem.mozRequestFullScreen) {
                        elem.mozRequestFullScreen();
                    } else if (elem.webkitRequestFullscreen) {
                        elem.webkitRequestFullscreen();
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                }
                mxEvent.consume(evt);
                this.ruochenResetPipStyle();
            }),
            icon_full_screen,
            '切换全屏'
        );
        /*addButton(
            mxUtils.bind(this, function (evt) {
                this.fitView();
                mxEvent.consume(evt);
                this.ruochenResetPipStyle();
                this.chromelessToolbar.style.display = 'none';
                setTimeout(() => {
                    this.exportPreviewImage();
                });
            }),
            require('../images/pageZoomAuto.png'),
            '导出图片'
        );*/
        let fadeThread = null;
        let fadeThread2 = null;
        const fadeOut = mxUtils.bind(this, function (delay) {
            if (fadeThread != null) {
                window.clearTimeout(fadeThread);
                fadeThread = null;
            }
            if (fadeThread2 != null) {
                window.clearTimeout(fadeThread2);
                fadeThread2 = null;
            }
            fadeThread = window.setTimeout(
                mxUtils.bind(this, function () {
                    mxUtils.setOpacity(this.chromelessToolbar, 0);
                    fadeThread = null;
                    fadeThread2 = window.setTimeout(
                        mxUtils.bind(this, function () {
                            this.chromelessToolbar.style.display = 'none';
                            fadeThread2 = null;
                        }),
                        600
                    );
                }),
                delay || 200
            );
        });
        const fadeIn = mxUtils.bind(this, function (opacity) {
            if (fadeThread != null) {
                window.clearTimeout(fadeThread);
                fadeThread = null;
            }
            if (fadeThread2 != null) {
                window.clearTimeout(fadeThread2);
                fadeThread2 = null;
            }
            this.chromelessToolbar.style.display = '';
            mxUtils.setOpacity(this.chromelessToolbar, opacity || 30);
        });

        // this.addChromelessToolbarItems(addButton);

        /* if (this.editor.editButtonLink != null || this.editor.editButtonFunc != null) {
            addButton(
                mxUtils.bind(this, function (evt) {
                    if (this.editor.editButtonFunc != null) {
                        this.editor.editButtonFunc();
                    } else if (this.editor.editButtonLink == '_blank') {
                        this.editor.editAsNew(this.getEditBlankXml());
                    } else {
                        graph.openLink(this.editor.editButtonLink, 'editWindow');
                    }

                    mxEvent.consume(evt);
                }),
                Editor.editLargeImage,
                mxResources.get('edit')
            );
        } */
        if (this.lightboxToolbarActions != null) {
            for (let i = 0; i < this.lightboxToolbarActions.length; i++) {
                const lbAction = this.lightboxToolbarActions[i];
                addButton(lbAction.fn, lbAction.icon, lbAction.tooltip);
            }
        }
        this.chromelessToolbar.style.display = 'none';
        if (!graph.isViewer()) {
            mxUtils.setPrefixedStyle(this.chromelessToolbar.style, 'transform', 'translate(-50%,0)');
        }
        graph.container.appendChild(this.chromelessToolbar);
        mxEvent.addListener(
            graph.container,
            mxClient.IS_POINTER ? 'pointermove' : 'mousemove',
            mxUtils.bind(this, function (evt) {
                if (!mxEvent.isTouchEvent(evt)) {
                    if (!mxEvent.isShiftDown(evt)) {
                        fadeIn(30);
                    }
                    fadeOut();
                }
            })
        );
        mxEvent.addListener(this.chromelessToolbar, mxClient.IS_POINTER ? 'pointermove' : 'mousemove', function (evt) {
            mxEvent.consume(evt);
        });
        mxEvent.addListener(
            this.chromelessToolbar,
            'mouseenter',
            mxUtils.bind(this, function (evt) {
                if (!mxEvent.isShiftDown(evt)) {
                    fadeIn(100);
                } else {
                    fadeOut();
                }
            })
        );
        mxEvent.addListener(
            this.chromelessToolbar,
            'mousemove',
            mxUtils.bind(this, function (evt) {
                if (!mxEvent.isShiftDown(evt)) {
                    fadeIn(100);
                } else {
                    fadeOut();
                }

                mxEvent.consume(evt);
            })
        );
        mxEvent.addListener(
            this.chromelessToolbar,
            'mouseleave',
            mxUtils.bind(this, function (evt) {
                if (!mxEvent.isTouchEvent(evt)) {
                    fadeIn(30);
                }
            })
        );
        const tol = graph.getTolerance();
        graph.addMouseListener({
            startX: 0,
            startY: 0,
            scrollLeft: 0,
            scrollTop: 0,
            mouseDown: function (sender, me) {
                this.startX = me.getGraphX();
                this.startY = me.getGraphY();
                this.scrollLeft = graph.container.scrollLeft;
                this.scrollTop = graph.container.scrollTop;
            },
            mouseMove: function () {
            },
            mouseUp: function (sender, me) {
                if (mxEvent.isTouchEvent(me.getEvent())) {
                    if (Math.abs(this.scrollLeft - graph.container.scrollLeft) < tol && Math.abs(this.scrollTop - graph.container.scrollTop) < tol && Math.abs(this.startX - me.getGraphX()) < tol && Math.abs(this.startY - me.getGraphY()) < tol) {
                        if (parseFloat(ui.chromelessToolbar.style.opacity || 0) > 0) {
                            fadeOut();
                        } else {
                            fadeIn(30);
                        }
                    }
                }
            },
        });
    } else if (this.editor.extendCanvas) {
        const graphViewValidate = graph.view.validate;
        graph.view.validate = function () {
            if (this.graph.container != null && mxUtils.hasScrollbars(this.graph.container)) {
                const pad = this.graph.getPagePadding();
                const size = this.graph.getPageSize();
                this.translate.x = pad.x - (this.x0 || 0) * size.width;
                this.translate.y = pad.y - (this.y0 || 0) * size.height;
            }
            graphViewValidate.apply(this, arguments);
        };

        if (!graph.isViewer()) {
            const graphSizeDidChange = graph.sizeDidChange;

            graph.sizeDidChange = function () {
                if (this.container != null && mxUtils.hasScrollbars(this.container)) {
                    const pages = this.getPageLayout();
                    const pad = this.getPagePadding();
                    const size = this.getPageSize();

                    // Updates the minimum graph size
                    const minw = Math.ceil(2 * pad.x + pages.width * size.width);
                    const minh = Math.ceil(2 * pad.y + pages.height * size.height);

                    const min = graph.minimumGraphSize;

                    // LATER: Fix flicker of scrollbar size in IE quirks mode
                    // after delayed call in window.resize event handler
                    if (min == null || min.width != minw || min.height != minh) {
                        graph.minimumGraphSize = new mxRectangle(0, 0, minw, minh);
                    }

                    // Updates auto-translate to include padding and graph size
                    const dx = pad.x - pages.x * size.width;
                    const dy = pad.y - pages.y * size.height;

                    if (!this.autoTranslate && (this.view.translate.x != dx || this.view.translate.y != dy)) {
                        this.autoTranslate = true;
                        this.view.x0 = pages.x;
                        this.view.y0 = pages.y;

                        // NOTE: THIS INVOKES THIS METHOD AGAIN. UNFORTUNATELY THERE IS NO WAY AROUND THIS SINCE THE
                        // BOUNDS ARE KNOWN AFTER THE VALIDATION AND SETTING THE TRANSLATE TRIGGERS A REVALIDATION.
                        // SHOULD MOVE TRANSLATE/SCALE TO VIEW.
                        const tx = graph.view.translate.x;
                        const ty = graph.view.translate.y;
                        graph.view.setTranslate(dx, dy);

                        // LATER: Fix rounding errors for small zoom
                        graph.container.scrollLeft += Math.round((dx - tx) * graph.view.scale);
                        graph.container.scrollTop += Math.round((dy - ty) * graph.view.scale);

                        this.autoTranslate = false;

                        return;
                    }

                    graphSizeDidChange.apply(this, arguments);
                } else {
                    // Fires event but does not invoke superclass
                    this.fireEvent(new mxEventObject(mxEvent.SIZE, 'bounds', this.getGraphBounds()));
                }
            };
        }
    }

    // Accumulates the zoom factor while the rendering is taking place
    // so that not the complete sequence of zoom steps must be painted
    const bgGroup = graph.view.getBackgroundPane();
    const mainGroup = graph.view.getDrawPane();
    graph.cumulativeZoomFactor = 1;
    let updateZoomTimeout = null;
    let cursorPosition = null;
    let scrollPosition = null;
    let filter = null;

    const scheduleZoom = function (delay) {
        if (updateZoomTimeout != null) {
            window.clearTimeout(updateZoomTimeout);
        }

        window.setTimeout(function () {
            if (!graph.isMouseDown) {
                updateZoomTimeout = window.setTimeout(
                    mxUtils.bind(this, function () {
                        if (graph.isFastZoomEnabled()) {
                            // Transforms background page
                            if (graph.view.backgroundPageShape != null && graph.view.backgroundPageShape.node != null) {
                                mxUtils.setPrefixedStyle(graph.view.backgroundPageShape.node.style, 'transform-origin', null);
                                mxUtils.setPrefixedStyle(graph.view.backgroundPageShape.node.style, 'transform', null);
                            }

                            // Transforms graph and background image
                            mainGroup.style.transformOrigin = '';
                            bgGroup.style.transformOrigin = '';

                            // Workaround for no reset of transform in Safari
                            if (mxClient.IS_SF) {
                                mainGroup.style.transform = 'scale(1)';
                                bgGroup.style.transform = 'scale(1)';

                                window.setTimeout(function () {
                                    mainGroup.style.transform = '';
                                    bgGroup.style.transform = '';
                                }, 0);
                            } else {
                                mainGroup.style.transform = '';
                                bgGroup.style.transform = '';
                            }

                            // Shows interactive elements
                            graph.view.getDecoratorPane().style.opacity = '';
                            graph.view.getOverlayPane().style.opacity = '';
                        }

                        const sp = new mxPoint(graph.container.scrollLeft, graph.container.scrollTop);
                        const offset = mxUtils.getOffset(graph.container);
                        const prev = graph.view.scale;
                        let dx = 0;
                        let dy = 0;

                        if (cursorPosition != null) {
                            dx = graph.container.offsetWidth / 2 - cursorPosition.x + offset.x;
                            dy = graph.container.offsetHeight / 2 - cursorPosition.y + offset.y;
                        }

                        graph.zoom(graph.cumulativeZoomFactor);
                        const s = graph.view.scale;

                        if (s != prev) {
                            if (scrollPosition != null) {
                                dx += sp.x - scrollPosition.x;
                                dy += sp.y - scrollPosition.y;
                            }

                            if (resize != null) {
                                ui.chromelessResize(false, null, dx * (graph.cumulativeZoomFactor - 1), dy * (graph.cumulativeZoomFactor - 1));
                            }

                            if (mxUtils.hasScrollbars(graph.container) && (dx != 0 || dy != 0)) {
                                graph.container.scrollLeft -= dx * (graph.cumulativeZoomFactor - 1);
                                graph.container.scrollTop -= dy * (graph.cumulativeZoomFactor - 1);
                            }
                        }

                        if (filter != null) {
                            mainGroup.setAttribute('filter', filter);
                        }

                        graph.cumulativeZoomFactor = 1;
                        updateZoomTimeout = null;
                        scrollPosition = null;
                        cursorPosition = null;
                        filter = null;
                    }),
                    delay != null ? delay : graph.isFastZoomEnabled() ? ui.wheelZoomDelay : ui.lazyZoomDelay
                );
            }
        }, 0);
    };

    graph.lazyZoom = function (zoomIn, ignoreCursorPosition, delay) {
        // TODO: Fix ignored cursor position if scrollbars are disabled
        ignoreCursorPosition = ignoreCursorPosition || !graph.scrollbars;

        if (ignoreCursorPosition) {
            cursorPosition = new mxPoint(graph.container.offsetLeft + graph.container.clientWidth / 2, graph.container.offsetTop + graph.container.clientHeight / 2);
        }

        // Switches to 5% zoom steps below 15%
        if (zoomIn) {
            if (this.view.scale * this.cumulativeZoomFactor <= 0.15) {
                this.cumulativeZoomFactor *= (this.view.scale + 0.05) / this.view.scale;
            } else {
                // Uses to 5% zoom steps for better grid rendering in webkit
                // and to avoid rounding errors for zoom steps
                this.cumulativeZoomFactor *= this.zoomFactor;
                this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor * 20) / 20 / this.view.scale;
            }
        } else {
            if (this.view.scale * this.cumulativeZoomFactor <= 0.15) {
                this.cumulativeZoomFactor *= (this.view.scale - 0.05) / this.view.scale;
            } else {
                // Uses to 5% zoom steps for better grid rendering in webkit
                // and to avoid rounding errors for zoom steps
                this.cumulativeZoomFactor /= this.zoomFactor;
                this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor * 20) / 20 / this.view.scale;
            }
        }

        this.cumulativeZoomFactor = Math.max(0.05, Math.min(this.view.scale * this.cumulativeZoomFactor, 160)) / this.view.scale;

        if (graph.isFastZoomEnabled()) {
            if (filter == null && mainGroup.getAttribute('filter') != '') {
                filter = mainGroup.getAttribute('filter');
                mainGroup.removeAttribute('filter');
            }

            scrollPosition = new mxPoint(graph.container.scrollLeft, graph.container.scrollTop);

            const cx = ignoreCursorPosition ? graph.container.scrollLeft + graph.container.clientWidth / 2 : cursorPosition.x + graph.container.scrollLeft - graph.container.offsetLeft;
            const cy = ignoreCursorPosition ? graph.container.scrollTop + graph.container.clientHeight / 2 : cursorPosition.y + graph.container.scrollTop - graph.container.offsetTop;
            mainGroup.style.transformOrigin = cx + 'px ' + cy + 'px';
            mainGroup.style.transform = 'scale(' + this.cumulativeZoomFactor + ')';
            bgGroup.style.transformOrigin = cx + 'px ' + cy + 'px';
            bgGroup.style.transform = 'scale(' + this.cumulativeZoomFactor + ')';

            if (graph.view.backgroundPageShape != null && graph.view.backgroundPageShape.node != null) {
                const page = graph.view.backgroundPageShape.node;

                mxUtils.setPrefixedStyle(page.style, 'transform-origin', (ignoreCursorPosition ? graph.container.clientWidth / 2 + graph.container.scrollLeft - page.offsetLeft + 'px' : cursorPosition.x + graph.container.scrollLeft - page.offsetLeft - graph.container.offsetLeft + 'px') + ' ' + (ignoreCursorPosition ? graph.container.clientHeight / 2 + graph.container.scrollTop - page.offsetTop + 'px' : cursorPosition.y + graph.container.scrollTop - page.offsetTop - graph.container.offsetTop + 'px'));
                mxUtils.setPrefixedStyle(page.style, 'transform', 'scale(' + this.cumulativeZoomFactor + ')');
            }

            graph.view.getDecoratorPane().style.opacity = '0';
            graph.view.getOverlayPane().style.opacity = '0';

            if (ui.hoverIcons != null) {
                ui.hoverIcons.reset();
            }
        }

        scheduleZoom(delay);
    };

    // Holds back repaint until after mouse gestures
    mxEvent.addGestureListeners(
        graph.container,
        function () {
            if (updateZoomTimeout != null) {
                window.clearTimeout(updateZoomTimeout);
            }
        },
        null,
        function () {
            if (graph.cumulativeZoomFactor != 1) {
                scheduleZoom(0);
            }
        }
    );

    // Holds back repaint until scroll ends
    mxEvent.addListener(graph.container, 'scroll', function () {
        if (updateZoomTimeout && !graph.isMouseDown && graph.cumulativeZoomFactor != 1) {
            scheduleZoom(0);
        }
    });

    mxEvent.addMouseWheelListener(
        mxUtils.bind(this, function (evt, up, force) {
            if (this.dialogs == null || this.dialogs.length == 0) {
                // Scrolls with scrollbars turned off
                if (!graph.scrollbars && graph.isScrollWheelEvent(evt)) {
                    const t = graph.view.getTranslate();
                    const step = 40 / graph.view.scale;

                    if (!mxEvent.isShiftDown(evt)) {
                        graph.view.setTranslate(t.x, t.y + (up ? step : -step));
                    } else {
                        graph.view.setTranslate(t.x + (up ? -step : step), t.y);
                    }
                } else if (force || graph.isZoomWheelEvent(evt)) {
                    let source = mxEvent.getSource(evt);

                    while (source != null) {
                        if (source == graph.container) {
                            graph.tooltipHandler.hideTooltip();
                            cursorPosition = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
                            graph.lazyZoom(up);
                            mxEvent.consume(evt);

                            return false;
                        }

                        source = source.parentNode;
                    }
                }
            }
        }),
        graph.container
    );

    // Uses fast zoom for pinch gestures on iOS
    graph.panningHandler.zoomGraph = function (evt) {
        graph.cumulativeZoomFactor = evt.scale;
        graph.lazyZoom(evt.scale > 0, true);
        mxEvent.consume(evt);
    };
};

/**
 * 创建一个临时图形实例以渲染屏幕外内容。
 */
EditorUi.prototype.addChromelessToolbarItems = function (addButton) {
    addButton(
        mxUtils.bind(this, function (evt) {
            this.actions.get('print').funct();
            mxEvent.consume(evt);
        }),
        Editor.printLargeImage,
        mxResources.get('print')
    );
};

/**
 * 创建一个临时图形实例以渲染屏幕外内容。
 */
EditorUi.prototype.createTemporaryGraph = function (stylesheet) {
    const graph = new Graph(document.createElement('div'), null, null, stylesheet);
    graph.resetViewOnRootChange = false;
    graph.setConnectable(false);
    graph.gridEnabled = false;
    graph.autoScroll = false;
    graph.setTooltips(false);
    graph.setEnabled(false);

    // Container must be in the DOM for correct HTML rendering
    graph.container.style.visibility = 'hidden';
    graph.container.style.position = 'absolute';
    graph.container.style.overflow = 'hidden';
    graph.container.style.height = '1px';
    graph.container.style.width = '1px';

    return graph;
};

EditorUi.prototype.toggleFormatPanel = function (visible) {
    visible = visible != null ? visible : this.formatWidth == 0;

    if (this.format != null) {
        this.formatWidth = visible ? 280 : 0;
        this.formatContainer.style.display = visible ? '' : 'none';
        this.refresh();
        this.format.refresh();
        this.fireEvent(new mxEventObject('formatWidthChanged'));
    }
};

/**
 * 添加对标签中占位符的支持。
 */
EditorUi.prototype.lightboxFit = function (maxHeight) {
    if (this.isDiagramEmpty()) {
        this.editor.graph.view.setScale(1);
    } else {
        const border = 60;

        // LATER: Use initial graph bounds to avoid rounding errors
        this.editor.graph.maxFitScale = this.lightboxMaxFitScale;
        this.editor.graph.fit(border, null, null, null, null, null, maxHeight);
        this.editor.graph.maxFitScale = null;
    }
};

/**
 * 通过给定向量平移该点。
 *
 * @param {number} dx 平移的 X 坐标。
 * @param {number} dy 平移的 Y 坐标。
 */
EditorUi.prototype.isDiagramEmpty = function () {
    const model = this.editor.graph.getModel();

    return model.getChildCount(model.root) == 1 && model.getChildCount(model.getChildAt(model.root, 0)) == 0;
};

/**
 * 用于允许对某些事件进行选择和上下文菜单的挂钩。
 */
EditorUi.prototype.isSelectionAllowed = function (evt) {
    return mxEvent.getSource(evt).nodeName == 'SELECT' || (mxEvent.getSource(evt).nodeName == 'INPUT' && mxUtils.isAncestorNode(this.formatContainer, mxEvent.getSource(evt)));
};

/**
 * 如果浏览器窗口关闭且未保存，则安装对话框
 * 在保存和图像导出期间必须禁用此功能。
 */
EditorUi.prototype.addBeforeUnloadListener = function () {
    // Installs dialog if browser window is closed without saving
    // This must be disabled during save and image export
    window.onbeforeunload = mxUtils.bind(this, function () {
        if (!this.editor.isChromelessView()) {
            return this.onBeforeUnload();
        }
    });
};

/**
 * 设置应用程序的 onbeforeunload
 */
EditorUi.prototype.onBeforeUnload = function () {
    if (this.editor.modified) {
        return mxResources.get('allChangesLost');
    }
};

/**
 * 设置当前菜单和元素。
 */
EditorUi.prototype.setCurrentMenu = function (menu, elt) {
    this.currentMenuElt = elt;
    this.currentMenu = menu;
};

/**
 * 重置当前菜单和元素。
 */
EditorUi.prototype.resetCurrentMenu = function () {
    this.currentMenuElt = null;
    this.currentMenu = null;
};

/**
 * 隐藏并销毁当前菜单。
 */
EditorUi.prototype.hideCurrentMenu = function () {
    if (this.currentMenu != null) {
        this.currentMenu.hideMenu();
        this.resetCurrentMenu();
    }
};

/**
 * 更新文档标题。
 */
EditorUi.prototype.updateDocumentTitle = function () {
    let title = this.editor.getOrCreateFilename();

    if (this.editor.appName != null) {
        title += ' - ' + this.editor.appName;
    }

    document.title = title;
};

/**
 * 更新文档标题。
 */
EditorUi.prototype.createHoverIcons = function () {
    return new HoverIcons(this.editor.graph);
};

EditorUi.prototype.redo = function () {
    try {
        const graph = this.editor.graph;

        if (graph.isEditing()) {
            document.execCommand('redo', false, null);
        } else {
            this.editor.undoManager.redo();
        }
    } catch (e) {
        // ignore all errors
    }
};

EditorUi.prototype.undo = function () {
    try {
        const graph = this.editor.graph;

        if (graph.isEditing()) {
            // Stops editing and executes undo on graph if native undo
            // does not affect current editing value
            const value = graph.cellEditor.textarea.innerHTML;
            document.execCommand('undo', false, null);

            if (value == graph.cellEditor.textarea.innerHTML) {
                graph.stopEditing(true);
                this.editor.undoManager.undo();
            }
        } else {
            this.editor.undoManager.undo();
        }
    } catch (e) {
        // ignore all errors
    }
};

EditorUi.prototype.canRedo = function () {
    return this.editor.graph.isEditing() || this.editor.undoManager.canRedo();
};

EditorUi.prototype.canUndo = function () {
    return this.editor.graph.isEditing() || this.editor.undoManager.canUndo();
};

EditorUi.prototype.getEditBlankXml = function () {
    return mxUtils.getXml(this.editor.getGraphXml());
};

EditorUi.prototype.getUrl = function (pathname) {
    const href = pathname != null ? pathname : window.location.pathname;
    return href;
};

/**
 * Specifies if the graph has scrollbars.
 */
EditorUi.prototype.setScrollbars = function (value) {
    const graph = this.editor.graph;
    const prev = graph.container.style.overflow;
    graph.scrollbars = value;
    this.editor.updateGraphComponents();

    if (prev != graph.container.style.overflow) {
        graph.container.scrollTop = 0;
        graph.container.scrollLeft = 0;
        graph.view.scaleAndTranslate(1, 0, 0);
        this.resetScrollbars();
    }

    this.fireEvent(new mxEventObject('scrollbarsChanged'));
};

/**
 * 如果图表有滚动条，则返回 true。
 */
EditorUi.prototype.hasScrollbars = function () {
    return this.editor.graph.scrollbars;
};

/**
 * 重置滚动条的状态。
 */
EditorUi.prototype.resetScrollbars = function () {
    const graph = this.editor.graph;

    if (!this.editor.extendCanvas) {
        graph.container.scrollTop = 0;
        graph.container.scrollLeft = 0;

        if (!mxUtils.hasScrollbars(graph.container)) {
            graph.view.setTranslate(0, 0);
        }
    } else if (!this.editor.isChromelessView()) {
        if (mxUtils.hasScrollbars(graph.container)) {
            if (graph.pageVisible) {
                const pad = graph.getPagePadding();
                graph.container.scrollTop = Math.floor(pad.y - this.editor.initialTopSpacing) - 1;
                graph.container.scrollLeft = Math.floor(Math.min(pad.x, (graph.container.scrollWidth - graph.container.clientWidth) / 2)) - 1;

                // Scrolls graph to visible area
                var bounds = graph.getGraphBounds();

                if (bounds.width > 0 && bounds.height > 0) {
                    if (bounds.x > graph.container.scrollLeft + graph.container.clientWidth * 0.9) {
                        graph.container.scrollLeft = Math.min(bounds.x + bounds.width - graph.container.clientWidth, bounds.x - 10);
                    }

                    if (bounds.y > graph.container.scrollTop + graph.container.clientHeight * 0.9) {
                        graph.container.scrollTop = Math.min(bounds.y + bounds.height - graph.container.clientHeight, bounds.y - 10);
                    }
                }
            } else {
                var bounds = graph.getGraphBounds();
                const width = Math.max(bounds.width, graph.scrollTileSize.width * graph.view.scale);
                const height = Math.max(bounds.height, graph.scrollTileSize.height * graph.view.scale);
                graph.container.scrollTop = Math.floor(Math.max(0, bounds.y - Math.max(20, (graph.container.clientHeight - height) / 4)));
                graph.container.scrollLeft = Math.floor(Math.max(0, bounds.x - Math.max(0, (graph.container.clientWidth - width) / 2)));
            }
        } else {
            const b = mxRectangle.fromRectangle(graph.pageVisible ? graph.view.getBackgroundPageBounds() : graph.getGraphBounds());
            const tr = graph.view.translate;
            const s = graph.view.scale;
            b.x = b.x / s - tr.x;
            b.y = b.y / s - tr.y;
            b.width /= s;
            b.height /= s;

            const dy = graph.pageVisible ? 0 : Math.max(0, (graph.container.clientHeight - b.height) / 4);

            graph.view.setTranslate(Math.floor(Math.max(0, (graph.container.clientWidth - b.width) / 2) - b.x + 2), Math.floor(dy - b.y + 1));
        }
    }
};

EditorUi.prototype.setPageVisible = function (value) {
    const graph = this.editor.graph;
    const hasScrollbars = mxUtils.hasScrollbars(graph.container);
    let tx = 0;
    let ty = 0;

    if (hasScrollbars) {
        tx = graph.view.translate.x * graph.view.scale - graph.container.scrollLeft;
        ty = graph.view.translate.y * graph.view.scale - graph.container.scrollTop;
    }

    graph.pageVisible = value;
    graph.pageBreaksVisible = value;
    graph.preferPageSize = value;
    graph.view.validateBackground();

    // Workaround for possible handle offset
    if (hasScrollbars) {
        const cells = graph.getSelectionCells();
        graph.clearSelection();
        graph.setSelectionCells(cells);
    }

    // Calls updatePageBreaks
    graph.sizeDidChange();

    if (hasScrollbars) {
        graph.container.scrollLeft = graph.view.translate.x * graph.view.scale - tx;
        graph.container.scrollTop = graph.view.translate.y * graph.view.scale - ty;
    }

    this.fireEvent(new mxEventObject('pageViewChanged'));
};

/**
 * 变更类型
 */
function ChangePageSetup(editorUi, color, image, format, pageScale, isView) {
    this.editorUi = editorUi;
    this.color = color;
    this.previousColor = color;
    this.image = image;
    this.previousImage = image;
    this.format = format;
    this.previousFormat = format;
    this.pageScale = pageScale;
    this.previousPageScale = pageScale;
    this.isView = isView || !1;

    // 需要，因为 null 是颜色和图像的有效值
    this.ignoreColor = false;
    this.ignoreImage = false;
}

/**
 * 实现可撤销的页面重命名。
 */
ChangePageSetup.prototype.execute = function () {
    const graph = this.editorUi.editor.graph;
    if (!this.ignoreColor) {
        this.color = this.previousColor;
        let tmp = graph.background;
        console.log('graph.background', graph.background, this.previousColor);
        this.editorUi.setBackgroundColor(this.previousColor);
        this.previousColor = tmp;
    }
    /*if (!this.ignoreColor) {
        this.color = this.previousColor;
        tmp = graph.viewBackground;
        this.editorUi.setViewBackgroundColor(this.previousColor);
        this.previousColor = tmp;
    }*/

    if (!this.ignoreImage) {
        this.image = this.previousImage;
        var tmp = graph.backgroundImage;
        this.editorUi.setBackgroundImage(this.previousImage);
        this.previousImage = tmp;
    }

    if (this.previousFormat != null) {
        this.format = this.previousFormat;
        var tmp = graph.pageFormat;

        if (this.previousFormat.width != tmp.width || this.previousFormat.height != tmp.height) {
            this.editorUi.setPageFormat(this.previousFormat);
            this.previousFormat = tmp;
        }
    }

    if (this.foldingEnabled != null && this.foldingEnabled != this.editorUi.editor.graph.foldingEnabled) {
        this.editorUi.setFoldingEnabled(this.foldingEnabled);
        this.foldingEnabled = !this.foldingEnabled;
    }

    if (this.previousPageScale != null) {
        const currentPageScale = this.editorUi.editor.graph.pageScale;

        if (this.previousPageScale != currentPageScale) {
            this.editorUi.setPageScale(this.previousPageScale);
            this.previousPageScale = currentPageScale;
        }
    }
    if (this.shadowVisible != null && this.shadowVisible != this.editorUi.editor.graph.shadowVisible) {
        this.editorUi.editor.graph.setShadowVisible(this.shadowVisible);
        this.shadowVisible = !this.shadowVisible;
    }
};

// 为 ChangePageSetup 注册编解码器
(function () {
    const codec = new mxObjectCodec(new ChangePageSetup(), ['ui', 'previousColor', 'previousImage', 'previousFormat', 'previousPageScale']);

    codec.afterDecode = function (dec, node, obj) {
        obj.previousColor = obj.color;
        obj.previousImage = obj.image;
        obj.previousFormat = obj.format;
        obj.previousPageScale = obj.pageScale;

        if (obj.foldingEnabled != null) {
            obj.foldingEnabled = !obj.foldingEnabled;
        }

        return obj;
    };

    mxCodecRegistry.register(codec);
})();

EditorUi.prototype.setBackgroundColor = function (value) {
    this.editor.graph.background = value;
    this.editor.graph.view.validateBackground();

    this.fireEvent(new mxEventObject('backgroundColorChanged'));
};
EditorUi.prototype.setViewBackgroundColor = function (value) {
    this.editor.graph.viewBackground = value;
    this.editor.graph.view.validateBackground();
    this.fireEvent(new mxEventObject('viewBackgroundColorChanged'));
};

EditorUi.prototype.setFoldingEnabled = function (value) {
    this.editor.graph.foldingEnabled = value;
    this.editor.graph.view.revalidate();

    this.fireEvent(new mxEventObject('foldingEnabledChanged'));
};

EditorUi.prototype.setPageFormat = function (value) {
    this.editor.graph.pageFormat = value;

    if (!this.editor.graph.pageVisible) {
        this.actions.get('pageView').funct();
    } else {
        this.editor.graph.view.validateBackground();
        this.editor.graph.sizeDidChange();
    }

    this.fireEvent(new mxEventObject('pageFormatChanged'));
};

EditorUi.prototype.setPageScale = function (value) {
    this.editor.graph.pageScale = value;

    if (!this.editor.graph.pageVisible) {
        this.actions.get('pageView').funct();
    } else {
        this.editor.graph.view.validateBackground();
        this.editor.graph.sizeDidChange();
    }

    this.fireEvent(new mxEventObject('pageScaleChanged'));
};

EditorUi.prototype.setGridColor = function (value) {
    this.editor.graph.view.gridColor = value;
    this.editor.graph.view.validateBackground();
    this.fireEvent(new mxEventObject('gridColorChanged'));
};

/**
 * 更新给定撤消/重做项的状态。
 */
EditorUi.prototype.addUndoListener = function () {
    const undo = this.actions.get('undo');
    const redo = this.actions.get('redo');

    const undoMgr = this.editor.undoManager;

    const undoListener = mxUtils.bind(this, function () {
        undo.setEnabled(this.canUndo());
        redo.setEnabled(this.canRedo());
    });

    undoMgr.addListener(mxEvent.ADD, undoListener);
    undoMgr.addListener(mxEvent.UNDO, undoListener);
    undoMgr.addListener(mxEvent.REDO, undoListener);
    undoMgr.addListener(mxEvent.CLEAR, undoListener);

    // Overrides cell editor to update action states
    const cellEditorStartEditing = this.editor.graph.cellEditor.startEditing;

    this.editor.graph.cellEditor.startEditing = function () {
        cellEditorStartEditing.apply(this, arguments);
        undoListener();
    };

    const cellEditorStopEditing = this.editor.graph.cellEditor.stopEditing;

    this.editor.graph.cellEditor.stopEditing = function () {
        cellEditorStopEditing.apply(this, arguments);
        undoListener();
    };

    // Updates the button states once
    undoListener();
};

/**
 * 根据选择更新给定工具栏项目的状态。
 */
EditorUi.prototype.updateActionStates = function () {
    const graph = this.editor.graph;
    const selected = !graph.isSelectionEmpty();
    let vertexSelected = false;
    let edgeSelected = false;

    const cells = graph.getSelectionCells();

    if (cells != null) {
        for (var i = 0; i < cells.length; i++) {
            const cell = cells[i];

            if (graph.getModel().isEdge(cell)) {
                edgeSelected = true;
            }

            if (graph.getModel().isVertex(cell)) {
                vertexSelected = true;
            }

            if (edgeSelected && vertexSelected) {
                break;
            }
        }
    }

    // Updates action states
    const actions = ['cut', 'copy', 'bold', 'italic', 'underline', 'delete', 'duplicate', 'backgroundColor', 'borderColor', 'edit', 'toFront', 'toBack', 'lockUnlock', 'solid', 'dashed', 'pasteSize', 'dotted', 'fillColor', 'gradientColor', 'shadow', 'fontColor', 'formattedText', 'rounded', 'toggleRounded', 'sharp', 'strokeColor'];

    for (var i = 0; i < actions.length; i++) {
        this.actions.get(actions[i]).setEnabled(selected);
    }

    this.actions.get('setAsDefaultStyle').setEnabled(graph.getSelectionCount() == 1);
    this.actions.get('clearWaypoints').setEnabled(!graph.isSelectionEmpty());
    this.actions.get('copySize').setEnabled(graph.getSelectionCount() == 1);
    this.actions.get('turn').setEnabled(!graph.isSelectionEmpty());
    this.actions.get('curved').setEnabled(edgeSelected);
    this.actions.get('rotation').setEnabled(vertexSelected);
    this.actions.get('wordWrap').setEnabled(vertexSelected);
    this.actions.get('autosize').setEnabled(vertexSelected);
    const oneVertexSelected = vertexSelected && graph.getSelectionCount() == 1;
    this.actions.get('leftAlign').setEnabled(graph.getSelectionCount() > 1);
    this.actions.get('rightAlign').setEnabled(graph.getSelectionCount() > 1);
    this.actions.get('hCenterAlign').setEnabled(graph.getSelectionCount() > 1);
    this.actions.get('topAlign').setEnabled(graph.getSelectionCount() > 1);
    this.actions.get('bottomAlign').setEnabled(graph.getSelectionCount() > 1);
    this.actions.get('vCenterAlign').setEnabled(graph.getSelectionCount() > 1);
    this.actions.get('lock').setEnabled(graph.getSelectionCount() > 0 && graph.isCellMovable(graph.getSelectionCell()));
    this.actions.get('unlock').setEnabled(graph.getSelectionCount() > 0 && !graph.isCellMovable(graph.getSelectionCell()));
    this.actions.get('group').setEnabled(graph.getSelectionCount() > 1 && !graph.isContainer(graph.getSelectionCell()));
    this.actions.get('ungroup').setEnabled(graph.getSelectionCount() == 1 && (graph.getModel().getChildCount(graph.getSelectionCell()) > 0 || (oneVertexSelected && graph.isContainer(graph.getSelectionCell()))));
    this.actions.get('removeFromGroup').setEnabled(oneVertexSelected && graph.getModel().isVertex(graph.getModel().getParent(graph.getSelectionCell())));

    // Updates menu states
    this.menus.get('navigation').setEnabled(selected || graph.view.currentRoot != null);
    this.actions.get('collapsible').setEnabled(vertexSelected && (graph.isContainer(graph.getSelectionCell()) || graph.model.getChildCount(graph.getSelectionCell()) > 0));
    this.actions.get('home').setEnabled(graph.view.currentRoot != null);
    this.actions.get('exitGroup').setEnabled(graph.view.currentRoot != null);
    this.actions.get('enterGroup').setEnabled(graph.getSelectionCount() == 1 && graph.isValidRoot(graph.getSelectionCell()));
    const foldable = graph.getSelectionCount() == 1 && graph.isCellFoldable(graph.getSelectionCell());
    this.actions.get('expand').setEnabled(foldable);
    this.actions.get('collapse').setEnabled(foldable);

    this.actions.get('guides').setEnabled(graph.isEnabled());
    this.actions.get('grid').setEnabled(!this.editor.chromeless || this.editor.editable);

    const unlocked = graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent());
    this.menus.get('layout').setEnabled(unlocked);
    this.menus.get('direction').setEnabled(unlocked && vertexSelected);
    this.menus.get('align').setEnabled(unlocked && vertexSelected && graph.getSelectionCount() > 1);
    this.menus.get('distribute').setEnabled(unlocked && vertexSelected && graph.getSelectionCount() > 1);
    this.actions.get('selectVertices').setEnabled(unlocked);
    this.actions.get('selectEdges').setEnabled(unlocked);
    this.actions.get('selectAll').setEnabled(unlocked);
    this.actions.get('selectNone').setEnabled(unlocked);

    this.updatePasteActionStates();
};

EditorUi.prototype.zeroOffset = new mxPoint(0, 0);

EditorUi.prototype.getDiagramContainerOffset = function () {
    return this.zeroOffset;
};

EditorUi.prototype.refresh = function (sizeDidChange) {
    sizeDidChange = (sizeDidChange != null) ? sizeDidChange : true;

    var w = this.container.clientWidth;
    var h = this.container.clientHeight;

    if (this.container == document.body) {
        w = document.body.clientWidth || document.documentElement.clientWidth;
        h = document.documentElement.clientHeight;
    }

    // Workaround for bug on iOS see
    // http://stackoverflow.com/questions/19012135/ios-7-ipad-safari-landscape-innerheight-outerheight-layout-issue
    // FIXME: Fix if footer visible
    var off = 0;

    if (mxClient.IS_IOS && !window.navigator.standalone && typeof Menus !== 'undefined') {
        if (window.innerHeight != document.documentElement.clientHeight) {
            off = document.documentElement.clientHeight - window.innerHeight;
            window.scrollTo(0, 0);
        }
    }

    var effHsplitPosition = Math.max(0, Math.min(
        this.hsplitPosition, w - this.splitSize - 40));
    var tmp = 0;

    if (this.menubar != null) {
        this.menubarContainer.style.height = this.menubarHeight + 'px';
        tmp += this.menubarHeight;
    }

    if (this.toolbar != null) {
        this.toolbarContainer.style.top = this.menubarHeight + 'px';
        this.toolbarContainer.style.height = this.toolbarHeight + 'px';
        tmp += this.toolbarHeight;
    }

    if (tmp > 0) {
        tmp += 1;
    }

    var fw = (this.format != null) ? this.formatWidth : 0;
    this.sidebarContainer.style.top = tmp + 'px';
    this.sidebarContainer.style.width = effHsplitPosition + 'px';
    this.formatContainer.style.top = tmp + 'px';
    this.formatContainer.style.width = 350 + 'px';
    this.formatContainer.style.display = (this.format != null) ? '' : 'none';

    var diagContOffset = this.getDiagramContainerOffset();
    var contLeft = (this.hsplit.parentNode != null) ? (effHsplitPosition) : 0;
    this.footerContainer.style.height = this.footerHeight + 'px';
    this.hsplit.style.top = this.sidebarContainer.style.top;
    this.hsplit.style.left = effHsplitPosition + 'px';
    this.footerContainer.style.display = (this.footerHeight == 0) ? 'none' : '';

    if (this.tabContainer != null) {
        this.tabContainer.style.left = contLeft + 'px';
        this.hsplit.style.bottom = this.tabContainer.offsetHeight + 'px';
    } else {
        this.hsplit.style.bottom = (this.footerHeight + off) + 'px';
    }

    if (this.footerHeight > 0) {
        this.footerContainer.style.bottom = off + 'px';
    }

    var th = 0;

    if (this.tabContainer != null) {
        this.tabContainer.style.bottom = (this.footerHeight + off) + 'px';
        this.tabContainer.style.right = fw + 'px';
        th = this.tabContainer.clientHeight;
        this.checkTabScrollerOverflow();
    }

    this.sidebarContainer.style.bottom = (this.footerHeight + off) + 'px';
    this.formatContainer.style.bottom = (this.footerHeight + off) + 'px';

    this.diagramContainer.style.left = (contLeft + diagContOffset.x) + 'px';
    this.diagramContainer.style.top = (tmp + diagContOffset.y) + 'px';
    this.diagramContainer.style.right = fw + 'px';
    this.diagramContainer.style.bottom = (this.footerHeight + off + th) + 'px';

    if (sizeDidChange) {
        this.editor.graph.sizeDidChange();
    }
};

/**
 * 创建所需的容器。
 */
EditorUi.prototype.createDivs = function () {
    this.menubarContainer = this.createDiv('geMenubarContainer');
    this.toolbarContainer = this.createDiv('geToolbarContainer');
    this.sidebarContainer = this.createDiv('geSidebarContainer');
    this.formatContainer = this.createDiv('geSidebarContainer geFormatContainer');
    this.diagramContainer = this.createDiv('geDiagramContainer');
    this.footerContainer = this.createDiv('geFooterContainer');
    this.hsplit = this.createDiv('geHsplit');
    this.hsplit.setAttribute('title', mxResources.get('collapseExpand'));

    this.menubarContainer.style.top = '0px';
    this.menubarContainer.style.left = '0px';
    this.menubarContainer.style.right = '0px';
    this.toolbarContainer.style.left = '0px';
    this.toolbarContainer.style.right = '0px';
    this.sidebarContainer.style.left = '0px';
    this.formatContainer.style.right = '0px';
    this.formatContainer.style.width = '350px';
    this.formatContainer.style.zIndex = '1';
    this.diagramContainer.style.right = (this.format != null ? this.formatWidth : 0) + 'px';
    this.footerContainer.style.left = '0px';
    this.footerContainer.style.right = '0px';
    this.footerContainer.style.bottom = '0px';
    this.footerContainer.style.zIndex = mxPopupMenu.prototype.zIndex - 2;
    this.hsplit.style.width = this.splitSize + 'px';
    this.hsplit.style.display = 'none';

    /*if (this.sidebarFooterContainer) {
        this.sidebarFooterContainer.style.left = '0px';
    }*/

    if (!this.editor.chromeless) {
        this.tabContainer = this.createTabContainer();
    } else {
        this.diagramContainer.style.border = 'none';
    }
};

/**
 * 侧边栏页脚容器的挂钩。此实现返回 null。
 */
EditorUi.prototype.createSidebarFooterContainer = function () {
    return null;
};

/**
 * 创建所需的容器。
 */
EditorUi.prototype.createUi = function () {
    // this.menubar = this.editor.chromeless ? null : this.menus.createMenubar(this.createDiv('geMenubar'));
    // this.menubar = this.menus.createMenubar(this.createDiv('geMenubar'));

    if (this.menubar != null) {
        this.exitButton = this.createDiv('diagram-exit');
        this.menubarContainer.appendChild(this.menubar.container);
        this.menubarContainer.appendChild(this.exitButton);
    }
    if (this.menubar != null) {
        this.statusContainer = this.createStatusContainer();
        this.editor.addListener(
            'statusChanged',
            mxUtils.bind(this, function () {
                this.setStatusText(this.editor.getStatus());
            })
        );
        this.setStatusText(this.editor.getStatus());
        this.menubar.container.appendChild(this.statusContainer);
        this.container.appendChild(this.menubarContainer);
    }

    this.sidebar = (this.editor.chromeless) ? null : this.createSidebar(this.sidebarContainer);
    if (this.sidebar != null) {
        this.container.appendChild(this.sidebarContainer);
    }
    this.format = this.editor.chromeless || !this.formatEnabled ? null : this.createFormat(this.formatContainer);
    if (this.format != null) {
        this.container.appendChild(this.formatContainer);
    }
    const footer = this.editor.chromeless ? null : this.createFooter();
    if (footer != null) {
        this.footerContainer.appendChild(footer);
        this.container.appendChild(this.footerContainer);
    }
    if (this.sidebar != null && this.sidebarFooterContainer) {
        this.container.appendChild(this.sidebarFooterContainer);
    }
    this.container.appendChild(this.diagramContainer);

    if (this.container != null && this.tabContainer != null) {
        this.container.appendChild(this.tabContainer);
    }
    this.toolbar = this.editor.chromeless ? null : this.createToolbar(this.createDiv('geToolbar'));
    if (this.toolbar != null) {
        this.toolbarContainer.appendChild(this.toolbar.container);
        this.container.appendChild(this.toolbarContainer);
    }
    if (this.sidebar != null) {
        this.container.appendChild(this.hsplit);
        /* this.addSplitHandler(
            this.hsplit,
            true,
            0,
            mxUtils.bind(this, function (value) {
                this.hsplitPosition = value;
                this.refresh();
                this.ruochenResetPipStyle();
            })
        ); */
    }
};

/**
 * 为给定容器创建一个新工具栏。
 */
EditorUi.prototype.createStatusContainer = function () {
    const container = document.createElement('a');
    container.className = 'geItem geStatus';

    if (screen.width < 420) {
        container.style.maxWidth = Math.max(20, screen.width - 320) + 'px';
        container.style.overflow = 'hidden';
    }

    return container;
};

EditorUi.prototype.setStatusText = function (value) {
    this.statusContainer.innerHTML = value;
};

EditorUi.prototype.createToolbar = function (container) {
    return new Toolbar(this, container);
};
EditorUi.prototype.createPageUsr = function (container) {
    return new PageUsr(this, container);
};

EditorUi.prototype.createSidebar = function (container) {
    return new Sidebar(this, container);
};

EditorUi.prototype.createFormat = function (container) {
    return new Format(this, container);
};

EditorUi.prototype.createFooter = function () {
    return this.createDiv('geFooter');
};

/**
 * 为工具栏容器创建实际的工具栏。
 */
EditorUi.prototype.createDiv = function (classname) {
    const elt = document.createElement('div');
    elt.className = classname;

    return elt;
};

/**
 * 更新给定撤消/重做项的状态。
 */
EditorUi.prototype.addSplitHandler = function (elt, horizontal, dx, onChange) {
    var start = null;
    var initial = null;
    var ignoreClick = true;
    var last = null;
    mxClient.IS_POINTER && (elt.style.touchAction = 'none');
    var getValue = mxUtils.bind(this, function () {
        var result = parseInt(horizontal ? elt.style.left : elt.style.top);
        return horizontal || (result = result - dx - this.toolbarHeight), result;
    });

    function moveHandler(evt) {
        if (null != start) {
            var pt = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
            onChange(Math.max(0, initial + (horizontal ? pt.x - start.x : pt.y - start.y) - dx)), mxEvent.consume(evt), initial != getValue() && ((ignoreClick = !0), (last = null));
        }
    }

    function dropHandler(evt) {
        moveHandler(evt), (initial = null), (start = null);
    }

    mxEvent.addGestureListeners(elt, function (evt) {
        (start = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt))), (initial = getValue()), (ignoreClick = !1), mxEvent.consume(evt);
    });
    mxEvent.addListener(
        elt,
        'click',
        mxUtils.bind(this, function (evt) {
            if (!ignoreClick && this.hsplitClickEnabled) {
                var next = null != last ? last - dx : 0;
                (last = getValue()), onChange(next), mxEvent.consume(evt);
            }
        })
    );
    mxEvent.addGestureListeners(document, null, moveHandler, dropHandler),
        this.destroyFunctions.push(function () {
            mxEvent.removeGestureListeners(document, null, moveHandler, dropHandler);
        });
};

EditorUi.prototype.prompt = function (title, defaultValue, fn) {
    var dlg = new FilenameDialog(
        this,
        defaultValue,
        mxResources.get('apply'),
        function (newValue) {
            fn(parseFloat(newValue));
        },
        title
    );

    this.showDialog(dlg.container, 300, 80, true, true);
    dlg.init();
};

EditorUi.prototype.handleError = function (resp, title, fn, invokeFnOnClose) {
    const e = resp != null && resp.error != null ? resp.error : resp;
    console.log('handleError', e);
    if (e != null || title != null) {
        let msg = mxUtils.htmlEntities(mxResources.get('unknownError'));
        const btn = mxResources.get('ok');
        title = title != null ? title : mxResources.get('error');

        if (e != null && e.message != null) {
            msg = mxUtils.htmlEntities(e.message);
        }
        console.log('handleError', title, msg);
        //this.showError(title, msg, btn, fn, null, null, null, null, null, null, null, null, invokeFnOnClose ? fn : null);
    } else if (fn != null) {
        fn();
    }
};

EditorUi.prototype.showError = function (title, msg, btn, fn, retry, btn2, fn2, btn3, fn3, w, h, hide, onClose) {
    const dlg = new ErrorDialog(this, title, msg, btn || mxResources.get('ok'), fn, retry, btn2, fn2, hide, btn3, fn3);
    const lines = Math.ceil(msg != null ? msg.length / 50 : 1);
    this.showDialog(dlg.container, w || 340, h || 100 + lines * 20, true, false, onClose);
    dlg.init();
};

/**
 * 显示打印对话框。
 */
EditorUi.prototype.showDialog = function (elt, w, h, modal, closable, onClose, noScroll, transparent, onResize, ignoreBgClick) {
    this.editor.graph.tooltipHandler.hideTooltip();

    if (this.dialogs == null) {
        this.dialogs = [];
    }

    this.dialog = new Dialog(this, elt, w, h, modal, closable, onClose, noScroll, transparent, onResize, ignoreBgClick);
    this.dialogs.push(this.dialog);
};

EditorUi.prototype.hideDialog = function (cancel, isEsc) {
    if (this.dialogs != null && this.dialogs.length > 0) {
        const dlg = this.dialogs.pop();

        if (dlg.close(cancel, isEsc) == false) {
            //add the dialog back if dialog closing is cancelled
            this.dialogs.push(dlg);
            return;
        }

        this.dialog = this.dialogs.length > 0 ? this.dialogs[this.dialogs.length - 1] : null;
        this.editor.fireEvent(new mxEventObject('hideDialog'));

        if (this.dialog == null && this.editor.graph.container.style.visibility != 'hidden') {
            window.setTimeout(
                mxUtils.bind(this, function () {
                    if (this.editor.graph.isEditing() && this.editor.graph.cellEditor.textarea != null) {
                        this.editor.graph.cellEditor.textarea.focus();
                    } else {
                        mxUtils.clearSelection();
                        this.editor.graph.container.focus();
                    }
                }),
                0
            );
        }
    }
};

/**
 * 处理 ctrl+enter 击键来克隆单元格。
 */
EditorUi.prototype.ctrlEnter = function () {
    const graph = this.editor.graph;

    if (graph.isEnabled()) {
        try {
            const cells = graph.getSelectionCells();
            const lookup = new mxDictionary();
            const newCells = [];

            for (let i = 0; i < cells.length; i++) {
                // Clones table rows instead of cells
                const cell = graph.isTableCell(cells[i]) ? graph.model.getParent(cells[i]) : cells[i];

                if (cell != null && !lookup.get(cell)) {
                    lookup.put(cell, true);
                    newCells.push(cell);
                }
            }

            graph.setSelectionCells(graph.duplicateCells(newCells, false));
        } catch (e) {
            this.handleError(e);
        }
    }
};

/**
 * 显示颜色对话框。
 */
EditorUi.prototype.pickColor = function (color, apply) {
    const graph = this.editor.graph;
    const selState = graph.cellEditor.saveSelection();
    const h = 226 + (Math.ceil(ColorDialog.prototype.presetColors.length / 12) + Math.ceil(ColorDialog.prototype.defaultColors.length / 12)) * 17;

    const dlg = new ColorDialog(
        this,
        color || 'none',
        function (color) {
            graph.cellEditor.restoreSelection(selState);
            apply(color);
        },
        function () {
            graph.cellEditor.restoreSelection(selState);
        }
    );
    this.showDialog(dlg.container, 230, h, true, false);
    dlg.init();
};

/**
 * 从数据传输事件的给定 HTML 数据中提取图形模型。
 */
EditorUi.prototype.extractGraphModelFromHtml = function (data) {
    let result = null;

    try {
        const idx = data.indexOf('&lt;mxGraphModel ');

        if (idx >= 0) {
            const idx2 = data.lastIndexOf('&lt;/mxGraphModel&gt;');

            if (idx2 > idx) {
                result = data
                    .substring(idx, idx2 + 21)
                    .replace(/&gt;/g, '>')
                    .replace(/&lt;/g, '<')
                    .replace(/\\&quot;/g, '"')
                    .replace(/\n/g, '');
            }
        }
    } catch (e) {
        // ignore
    }

    return result;
};

/**
 * 在编辑器中打开给定的文件。
 */
EditorUi.prototype.extractGraphModelFromEvent = function (evt) {
    let result = null;
    let data = null;

    if (evt != null) {
        const provider = evt.dataTransfer != null ? evt.dataTransfer : evt.clipboardData;

        if (provider != null) {
            if (document.documentMode == 10 || document.documentMode == 11) {
                data = provider.getData('Text');
            } else {
                data = mxUtils.indexOf(provider.types, 'text/html') >= 0 ? provider.getData('text/html') : null;

                if (mxUtils.indexOf(provider.types, 'text/plain' && (data == null || data.length == 0))) {
                    data = provider.getData('text/plain');
                }
            }

            if (data != null) {
                data = Graph.zapGremlins(mxUtils.trim(data));

                // Tries parsing as HTML document with embedded XML
                const xml = this.extractGraphModelFromHtml(data);

                if (xml != null) {
                    data = xml;
                }
            }
        }
    }

    if (data != null && this.isCompatibleString(data)) {
        result = data;
    }

    return result;
};

/**
 * 如果事件数据是受支持的格式，则挂钩子类返回 true。
 * 此实现始终返回 false。
 */
EditorUi.prototype.isCompatibleString = function () {
    return false;
};

/**
 * 执行给定的布局。
 */
EditorUi.prototype.executeLayout = function (exec, animate, post) {
    const graph = this.editor.graph;

    if (graph.isEnabled()) {
        graph.getModel().beginUpdate();
        try {
            exec();
        } catch (e) {
            throw e;
        } finally {
            // Animates the changes in the graph model except
            // for Camino, where animation is too slow
            if (this.allowAnimation && animate && (navigator.userAgent == null || navigator.userAgent.indexOf('Camino') < 0)) {
                // New API for animating graph layout results asynchronously
                const morph = new mxMorphing(graph);
                morph.addListener(
                    mxEvent.DONE,
                    mxUtils.bind(this, function () {
                        graph.getModel().endUpdate();

                        if (post != null) {
                            post();
                        }
                    })
                );

                morph.startAnimation();
            } else {
                graph.getModel().endUpdate();

                if (post != null) {
                    post();
                }
            }
        }
    }
};

/* EditorUi.prototype.showImageDialog = function (title, value, fn) {
    const cellEditor = this.editor.graph.cellEditor;
    const selState = cellEditor.saveSelection();
    const newValue = mxUtils.prompt(title, value);
    cellEditor.restoreSelection(selState);

    if (newValue != null && newValue.length > 0) {
        const img = new Image();

        img.onload = function () {
            fn(newValue, img.width, img.height);
        };
        img.onerror = function () {
            fn(null);
            mxUtils.alert(mxResources.get("fileNotFound"));
        };

        img.src = newValue;
    } else {
        fn(null);
    }
}; */
EditorUi.prototype.showImageDialog = function (title, value, fn, ignoreExisting, convertDataUri) {
    var dlg = new ChooseImageDialog(this, function (res, w, h) {
        if (fn) {
            fn(res, w, h);
        }
    }, null);
    this.showDialog(dlg.container, 750, 640, true, false, null, null, null, null, false);
    var root = dlg.container.parentNode;
    root.style.padding = '0px';
};

EditorUi.prototype.showCollectionAddDialog = function (sureFn, cancelFn) {
    let dlg = new CollectionAddDialog(this, null, function (res) {
        if (sureFn) {
            sureFn(res);
        }
    }, function () {
        if (cancelFn) {
            cancelFn();
        }
    });
    this.showDialog(dlg.container, 750, 640, true, false, null, null, null, null, false);
    let root = dlg.container.parentNode;
    root.style.padding = '0px';
};

EditorUi.prototype.showLinkDialog = function () {
    // var dlg = new LinkDialog(this, value, btnLabel, fn);
    // this.showDialog(dlg.container, 420, 90, true, true);
    // dlg.init();
};

EditorUi.prototype.showBackgroundImageDialog = function (apply, img, color, showColor) {
    apply =
        apply != null
            ? apply
            : mxUtils.bind(this, function (image, failed, color, shadowVisible) {
                if (!failed) {
                    var change = new ChangePageSetup(this, showColor ? color : null, image);
                    change.ignoreColor = !showColor;
                    if (shadowVisible != null && showColor) {
                        change.shadowVisible = shadowVisible;
                    }
                    this.editor.graph.model.execute(change);
                }
            });
    var dlg = new BackgroundImageDialog(this, apply, img, color, showColor);
    this.showDialog(dlg.container, 400, showColor ? 240 : 220, true, true);
    dlg.init();
};

EditorUi.prototype.setBackgroundImage = function (image) {
    this.editor.graph.setBackgroundImage(image);
    this.editor.graph.view.validateBackgroundImage();
    this.fireEvent(new mxEventObject('backgroundImageChanged'));
};

EditorUi.prototype.confirm = function (msg, okFn, cancelFn) {
    if (mxUtils.confirm(msg)) {
        if (okFn != null) {
            okFn();
        }
    } else if (cancelFn != null) {
        cancelFn();
    }
};

EditorUi.prototype.createOutline = function () {
    const outline = new mxOutline(this.editor.graph);
    outline.border = 20;

    mxEvent.addListener(window, 'resize', function () {
        outline.update();
    });

    this.addListener('pageFormatChanged', function () {
        outline.update();
    });

    return outline;
};

// Alt+Shift+键码映射到操作
EditorUi.prototype.altShiftActions = {
    67: 'clearWaypoints', // Alt+Shift+C
    65: 'connectionArrows', // Alt+Shift+A
    80: 'connectionPoints', // Alt+Shift+P
    84: 'editTooltip', // Alt+Shift+T
    86: 'pasteSize', // Alt+Shift+V
    88: 'copySize', // Alt+Shift+X
};

EditorUi.prototype.createKeyHandler = function () {
    const editorUi = this;
    const graph = this.editor.graph;
    const keyHandler = new mxKeyHandler(graph);

    const isEventIgnored = keyHandler.isEventIgnored;
    keyHandler.isEventIgnored = function (evt) {
        // Handles undo/redo/ctrl+./,/u via action and allows ctrl+b/i
        // only if editing value is HTML (except for FF and Safari)
        return !(mxEvent.isShiftDown(evt) && evt.keyCode == 9) && (!this.isControlDown(evt) || mxEvent.isShiftDown(evt) || (evt.keyCode != 90 && evt.keyCode != 89 && evt.keyCode != 188 && evt.keyCode != 190 && evt.keyCode != 85)) && ((evt.keyCode != 66 && evt.keyCode != 73) || !this.isControlDown(evt) || (this.graph.cellEditor.isContentEditing() && !mxClient.IS_FF && !mxClient.IS_SF)) && isEventIgnored.apply(this, arguments);
    };

    // Ignores graph enabled state but not chromeless state
    keyHandler.isEnabledForEvent = function (evt) {
        return !mxEvent.isConsumed(evt) && this.isGraphEvent(evt) && this.isEnabled() && (editorUi.dialogs == null || editorUi.dialogs.length == 0);
    };

    // Routes command-key to control-key on Mac
    keyHandler.isControlDown = function (evt) {
        return mxEvent.isControlDown(evt) || (mxClient.IS_MAC && evt.metaKey);
    };

    let queue = [];
    let thread = null;

    // Helper function to move cells with the cursor keys
    function nudge(keyCode, stepSize, resize) {
        queue.push(function () {
            if (!graph.isSelectionEmpty() && graph.isEnabled()) {
                stepSize = stepSize != null ? stepSize : 1;

                if (resize) {
                    // Resizes all selected vertices
                    graph.getModel().beginUpdate();
                    try {
                        var cells = graph.getSelectionCells();

                        for (var i = 0; i < cells.length; i++) {
                            if (graph.getModel().isVertex(cells[i]) && graph.isCellResizable(cells[i])) {
                                let geo = graph.getCellGeometry(cells[i]);

                                if (geo != null) {
                                    geo = geo.clone();

                                    if (keyCode == 37) {
                                        geo.width = Math.max(0, geo.width - stepSize);
                                    } else if (keyCode == 38) {
                                        geo.height = Math.max(0, geo.height - stepSize);
                                    } else if (keyCode == 39) {
                                        geo.width += stepSize;
                                    } else if (keyCode == 40) {
                                        geo.height += stepSize;
                                    }

                                    graph.getModel().setGeometry(cells[i], geo);
                                }
                            }
                        }
                    } finally {
                        graph.getModel().endUpdate();
                    }
                } else {
                    // Moves vertices up/down in a stack layout
                    const cell = graph.getSelectionCell();
                    var parent = graph.model.getParent(cell);
                    let layout = null;

                    if (graph.getSelectionCount() == 1 && graph.model.isVertex(cell) && graph.layoutManager != null && !graph.isCellLocked(cell)) {
                        layout = graph.layoutManager.getLayout(parent);
                    }

                    if (layout != null && layout.constructor == mxStackLayout) {
                        const index = parent.getIndex(cell);

                        if (keyCode == 37 || keyCode == 38) {
                            graph.model.add(parent, cell, Math.max(0, index - 1));
                        } else if (keyCode == 39 || keyCode == 40) {
                            graph.model.add(parent, cell, Math.min(graph.model.getChildCount(parent), index + 1));
                        }
                    } else {
                        var cells = graph.getMovableCells(graph.getSelectionCells());
                        const realCells = [];

                        for (var i = 0; i < cells.length; i++) {
                            // TODO: Use getCompositeParent
                            const style = graph.getCurrentCellStyle(cells[i]);

                            if (mxUtils.getValue(style, 'part', '0') == '1') {
                                var parent = graph.model.getParent(cells[i]);

                                if (graph.model.isVertex(parent) && mxUtils.indexOf(cells, parent) < 0) {
                                    realCells.push(parent);
                                }
                            } else {
                                realCells.push(cells[i]);
                            }
                        }

                        if (realCells.length > 0) {
                            cells = realCells;
                            let dx = 0;
                            let dy = 0;

                            if (keyCode == 37) {
                                dx = -stepSize;
                            } else if (keyCode == 38) {
                                dy = -stepSize;
                            } else if (keyCode == 39) {
                                dx = stepSize;
                            } else if (keyCode == 40) {
                                dy = stepSize;
                            }

                            graph.moveCells(cells, dx, dy);
                        }
                    }
                }
            }
        });

        if (thread != null) {
            window.clearTimeout(thread);
        }

        thread = window.setTimeout(function () {
            if (queue.length > 0) {
                graph.getModel().beginUpdate();

                try {
                    for (let i = 0; i < queue.length; i++) {
                        queue[i]();
                    }

                    queue = [];
                } finally {
                    graph.getModel().endUpdate();
                }
            }
        }, 200);
    }

    // Overridden to handle special alt+shift+cursor keyboard shortcuts
    const directions = {
        37: mxConstants.DIRECTION_WEST,
        38: mxConstants.DIRECTION_NORTH,
        39: mxConstants.DIRECTION_EAST,
        40: mxConstants.DIRECTION_SOUTH,
    };

    const keyHandlerGetFunction = keyHandler.getFunction;

    mxKeyHandler.prototype.getFunction = function (evt) {
        if (graph.isEnabled()) {
            // TODO: Add alt modified state in core API, here are some specific cases
            if (mxEvent.isShiftDown(evt) && mxEvent.isAltDown(evt)) {
                const action = editorUi.actions.get(editorUi.altShiftActions[evt.keyCode]);

                if (action != null) {
                    return action.funct;
                }
            }

            if (evt.keyCode == 9 && mxEvent.isAltDown(evt)) {
                if (graph.cellEditor.isContentEditing()) {
                    // Alt+Shift+Tab while editing
                    return function () {
                        document.execCommand('outdent', false, null);
                    };
                } else if (mxEvent.isShiftDown(evt)) {
                    // Alt+Shift+Tab
                    return function () {
                        graph.selectParentCell();
                    };
                } else {
                    // Alt+Tab
                    return function () {
                        graph.selectChildCell();
                    };
                }
            } else if (directions[evt.keyCode] != null && !graph.isSelectionEmpty()) {
                // On macOS, Control+Cursor is used by Expose so allow for Alt+Control to resize
                if (!this.isControlDown(evt) && mxEvent.isShiftDown(evt) && mxEvent.isAltDown(evt)) {
                    if (graph.model.isVertex(graph.getSelectionCell())) {
                        return function () {
                            const cells = graph.connectVertex(graph.getSelectionCell(), directions[evt.keyCode], graph.defaultEdgeLength, evt, true);

                            if (cells != null && cells.length > 0) {
                                if (cells.length == 1 && graph.model.isEdge(cells[0])) {
                                    graph.setSelectionCell(graph.model.getTerminal(cells[0], false));
                                } else {
                                    graph.setSelectionCell(cells[cells.length - 1]);
                                }

                                graph.scrollCellToVisible(graph.getSelectionCell());

                                if (editorUi.hoverIcons != null) {
                                    editorUi.hoverIcons.update(graph.view.getState(graph.getSelectionCell()));
                                }
                            }
                        };
                    }
                } else {
                    // Avoids consuming event if no vertex is selected by returning null below
                    // Cursor keys move and resize (ctrl) cells
                    if (this.isControlDown(evt)) {
                        return function () {
                            nudge(evt.keyCode, mxEvent.isShiftDown(evt) ? graph.gridSize : null, true);
                        };
                    } else {
                        return function () {
                            nudge(evt.keyCode, mxEvent.isShiftDown(evt) ? graph.gridSize : null);
                        };
                    }
                }
            }
        }

        return keyHandlerGetFunction.apply(this, arguments);
    };

    // Binds keystrokes to actions
    keyHandler.bindAction = mxUtils.bind(this, function (code, control, key, shift) {
        const action = this.actions.get(key);

        if (action != null) {
            const f = function () {
                if (action.isEnabled()) {
                    action.funct();
                }
            };

            if (control) {
                if (shift) {
                    keyHandler.bindControlShiftKey(code, f);
                } else {
                    keyHandler.bindControlKey(code, f);
                }
            } else {
                if (shift) {
                    keyHandler.bindShiftKey(code, f);
                } else {
                    keyHandler.bindKey(code, f);
                }
            }
        }
    });

    const ui = this;
    const keyHandlerEscape = keyHandler.escape;
    keyHandler.escape = function () {
        keyHandlerEscape.apply(this, arguments);
    };

    // Ignores enter keystroke. Remove this line if you want the
    // enter keystroke to stop editing. N, W, T are reserved.
    keyHandler.enter = function () {
    };

    keyHandler.bindControlShiftKey(36, function () {
        graph.exitGroup();
    }); // Ctrl+Shift+Home
    keyHandler.bindControlShiftKey(35, function () {
        graph.enterGroup();
    }); // Ctrl+Shift+End
    keyHandler.bindShiftKey(36, function () {
        graph.home();
    }); // Ctrl+Shift+Home
    keyHandler.bindKey(35, function () {
        graph.refresh();
    }); // End
    keyHandler.bindAction(107, true, 'zoomIn'); // Ctrl+Plus
    keyHandler.bindAction(109, true, 'zoomOut'); // Ctrl+Minus
    keyHandler.bindAction(80, true, 'print'); // Ctrl+P
    keyHandler.bindAction(79, true, 'outline', true); // Ctrl+Shift+O
    keyHandler.bindAction(86, true, 'paste'); // Ctrl+V
    if (!this.editor.chromeless || this.editor.editable) {
        keyHandler.bindControlKey(36, function () {
            if (graph.isEnabled()) {
                graph.foldCells(true);
            }
        }); // Ctrl+Home
        keyHandler.bindControlKey(35, function () {
            if (graph.isEnabled()) {
                graph.foldCells(false);
            }
        }); // Ctrl+End
        keyHandler.bindControlKey(13, function () {
            ui.ctrlEnter();
        }); // Ctrl+Enter
        keyHandler.bindAction(8, false, 'delete'); // Backspace
        keyHandler.bindAction(8, true, 'deleteAll'); // Shift+Backspace
        keyHandler.bindAction(46, false, 'delete'); // Delete
        keyHandler.bindAction(46, true, 'deleteAll'); // Ctrl+Delete
        keyHandler.bindAction(36, false, 'resetView'); // Home
        keyHandler.bindAction(72, true, 'fitWindow', true); // Ctrl+Shift+H
        keyHandler.bindAction(74, true, 'fitPage'); // Ctrl+J
        keyHandler.bindAction(74, true, 'fitTwoPages', true); // Ctrl+Shift+J
        keyHandler.bindAction(48, true, 'customZoom'); // Ctrl+0
        keyHandler.bindAction(82, true, 'turn'); // Ctrl+R
        keyHandler.bindAction(82, true, 'clearDefaultStyle', true); // Ctrl+Shift+R
        keyHandler.bindAction(65, true, 'selectAll'); // Ctrl+A
        keyHandler.bindAction(65, true, 'selectNone', true); // Ctrl+A
        keyHandler.bindAction(73, true, 'selectVertices', true); // Ctrl+Shift+I
        keyHandler.bindAction(69, true, 'selectEdges', true); // Ctrl+Shift+E
        keyHandler.bindAction(69, true, 'editStyle'); // Ctrl+E
        keyHandler.bindAction(66, true, 'bold'); // Ctrl+B
        keyHandler.bindAction(66, true, 'toBack', true); // Ctrl+Shift+B
        keyHandler.bindAction(70, true, 'toFront', true); // Ctrl+Shift+F
        keyHandler.bindAction(68, true, 'duplicate'); // Ctrl+D
        keyHandler.bindAction(68, true, 'setAsDefaultStyle', true); // Ctrl+Shift+D
        keyHandler.bindAction(90, true, 'undo'); // Ctrl+Z
        keyHandler.bindAction(89, true, 'autosize', true); // Ctrl+Shift+Y
        keyHandler.bindAction(88, true, 'cut'); // Ctrl+X
        keyHandler.bindAction(67, true, 'copy'); // Ctrl+C
        keyHandler.bindAction(86, true, 'paste'); // Ctrl+V
        keyHandler.bindAction(71, true, 'group'); // Ctrl+G
        keyHandler.bindAction(77, true, 'editData'); // Ctrl+M
        keyHandler.bindAction(71, true, 'grid', true); // Ctrl+Shift+G
        keyHandler.bindAction(73, true, 'italic'); // Ctrl+I
        keyHandler.bindAction(76, true, 'lockUnlock'); // Ctrl+L
        keyHandler.bindAction(76, true, 'layers', true); // Ctrl+Shift+L
        keyHandler.bindAction(80, true, 'formatPanel', true); // Ctrl+Shift+P
        keyHandler.bindAction(85, true, 'underline'); // Ctrl+U
        keyHandler.bindAction(85, true, 'ungroup', true); // Ctrl+Shift+U
        keyHandler.bindAction(190, true, 'superscript'); // Ctrl+.
        keyHandler.bindAction(188, true, 'subscript'); // Ctrl+,
        keyHandler.bindAction(9, false, 'indent', true); // Shift+Tab,
        keyHandler.bindAction(68, true, 'pointSet', true); //Ctrl + Shift+D,
        keyHandler.bindKey(13, function () {
            if (graph.isEnabled()) {
                graph.startEditingAtCell();
            }
        }); // Enter
        keyHandler.bindKey(113, function () {
            if (graph.isEnabled()) {
                graph.startEditingAtCell();
            }
        }); // F2

        keyHandler.bindAction(83, true, 'save'); // Ctrl+S
        // keyHandler.bindAction(83, true, 'saveAs', true); // Ctrl+Shift+S
    }

    if (!mxClient.IS_WIN) {
        keyHandler.bindAction(90, true, 'redo', true); // Ctrl+Shift+Z
    } else {
        keyHandler.bindAction(89, true, 'redo'); // Ctrl+Y
    }

    return keyHandler;
};

EditorUi.prototype.destroy = function () {
    var graph = this.editor.graph;

    if (graph != null && this.selectionStateListener != null) {
        graph.getSelectionModel().removeListener(mxEvent.CHANGE, this.selectionStateListener);
        graph.getModel().removeListener(mxEvent.CHANGE, this.selectionStateListener);
        graph.removeListener(mxEvent.EDITING_STARTED, this.selectionStateListener);
        graph.removeListener(mxEvent.EDITING_STOPPED, this.selectionStateListener);
        graph.getView().removeListener('unitChanged', this.selectionStateListener);
        this.selectionStateListener = null;
    }
    if (this.editor != null) {
        this.editor.destroy();
        this.editor = null;
    }

    if (this.menubar != null) {
        this.menubar.destroy();
        this.menubar = null;
    }

    if (this.toolbar != null) {
        this.toolbar.destroy();
        this.toolbar = null;
    }

    if (this.sidebar != null) {
        this.sidebar.destroy();
        this.sidebar = null;
    }

    if (this.keyHandler != null) {
        this.keyHandler.destroy();
        this.keyHandler = null;
    }

    if (this.keydownHandler != null) {
        mxEvent.removeListener(document, 'keydown', this.keydownHandler);
        this.keydownHandler = null;
    }

    if (this.keyupHandler != null) {
        mxEvent.removeListener(document, 'keyup', this.keyupHandler);
        this.keyupHandler = null;
    }

    if (this.resizeHandler != null) {
        mxEvent.removeListener(window, 'resize', this.resizeHandler);
        this.resizeHandler = null;
    }

    if (this.gestureHandler != null) {
        mxEvent.removeGestureListeners(document, this.gestureHandler);
        this.gestureHandler = null;
    }

    if (this.orientationChangeHandler != null) {
        mxEvent.removeListener(window, 'orientationchange', this.orientationChangeHandler);
        this.orientationChangeHandler = null;
    }

    if (this.scrollHandler != null) {
        mxEvent.removeListener(window, 'scroll', this.scrollHandler);
        this.scrollHandler = null;
    }

    if (this.destroyFunctions != null) {
        for (var i = 0; i < this.destroyFunctions.length; i++) {
            this.destroyFunctions[i]();
        }

        this.destroyFunctions = null;
    }

    const c = [this.menubarContainer, this.toolbarContainer, this.sidebarContainer, this.formatContainer, this.diagramContainer, this.footerContainer, this.chromelessToolbar, this.hsplit, this.sidebarFooterContainer, this.layersDialog];

    for (var i = 0; i < c.length; i++) {
        if (c[i] != null && c[i].parentNode != null) {
            c[i].parentNode.removeChild(c[i]);
        }
    }
};

EditorUi.prototype.importFiles = function (files, x, y, maxSize, fn, resultFn, filterFn, barrierFn, resizeDialog, maxBytes, resampleThreshold, ignoreEmbeddedXml, evt) {
    maxSize = maxSize != null ? maxSize : this.maxImageSize;
    maxBytes = maxBytes != null ? maxBytes : this.maxImageBytes;

    var crop = x != null && y != null;
    var resizeImages = true;
    x = x != null ? x : 0;
    y = y != null ? y : 0;

    // Checks if large images are imported
    var largeImages = false;

    if (!mxClient.IS_CHROMEAPP && files != null) {
        var thresh = resampleThreshold || this.resampleThreshold;
        for (var i = 0; i < files.length; i++) {
            if (files[i].type.substring(0, 9) !== 'image/svg' && files[i].type.substring(0, 6) === 'image/' && files[i].size > thresh) {
                largeImages = true;
                break;
            }
        }
    }

    var doImportFiles = mxUtils.bind(this, function () {
        var graph = this.editor.graph;
        var gs = graph.gridSize;
        if (fn == null) {
            fn = mxUtils.bind(this, function (data, mimeType, x, y, w, h, filename, done, file) {
                try {
                    if (data != null && data.substring(0, 10) == '<mxlibrary') {
                        this.spinner.stop();
                        this.loadLibrary(new LocalLibrary(this, data, filename));
                        return null;
                    } else if (this.getServiceName() != 'atlassian' && this.isCompatibleString(data) && files.length == 1 && this.isBlankFile() && !this.canUndo()) {
                        // Opens as diagram if current file is blank with no undoable changes
                        this.spinner.stop();
                        this.fileLoaded(new LocalFile(this, data, filename, true));
                        return null;
                    } else {
                        return this.importFile(data, mimeType, x, y, w, h, filename, done, file, crop, ignoreEmbeddedXml, evt);
                    }
                } catch (e) {
                    this.handleError(e);

                    return null;
                }
            });
        }
        if (resultFn == null) {
            resultFn = mxUtils.bind(this, function (cells) {
                graph.setSelectionCells(cells);
            });
        }
        if (this.spinner.spin(document.body, mxResources.get('loading'))) {
            var count = files.length;
            var remain = count;
            var queue = [];
            // Barrier waits for all files to be loaded asynchronously
            var barrier = mxUtils.bind(this, function (index, fnc) {
                queue[index] = fnc;
                if (--remain == 0) {
                    this.spinner.stop();
                    if (barrierFn != null) {
                        barrierFn(queue);
                    } else {
                        var cells = [];

                        graph.getModel().beginUpdate();
                        try {
                            for (var j = 0; j < queue.length; j++) {
                                var tmp = queue[j]();

                                if (tmp != null) {
                                    cells = cells.concat(tmp);
                                }
                            }
                        } finally {
                            graph.getModel().endUpdate();
                        }
                    }

                    resultFn(cells);
                }
            });

            for (var i = 0; i < count; i++) {
                mxUtils.bind(this, function (index) {
                    var file = files[index];

                    if (file != null) {
                        var reader = new FileReader();

                        reader.onload = mxUtils.bind(this, function (e) {
                            if (filterFn == null || filterFn(file)) {
                                try {
                                    if (file.type.startsWith('image/')) {
                                        if (file.type.startsWith('image/svg')) {
                                            var data = Graph.clipSvgDataUri(e.target.result);
                                            var comma = data.indexOf(',');
                                            var svgText = decodeURIComponent(escape(atob(data.substring(comma + 1))));
                                            var root = mxUtils.parseXml(svgText);
                                            var svgs = root.getElementsByTagName('svg');
                                            if (svgs.length > 0) {
                                                var svgRoot = svgs[0];
                                                var cont = ignoreEmbeddedXml ? null : svgRoot.getAttribute('content');
                                                if (cont != null && cont.charAt(0) != '<' && cont.charAt(0) != '%') {
                                                    cont = unescape(window.atob ? atob(cont) : Base64.decode(cont, true));
                                                }
                                                if (cont != null && cont.charAt(0) == '%') {
                                                    cont = decodeURIComponent(cont);
                                                }
                                                if (cont != null && (cont.substring(0, 8) === '<mxfile ' || cont.substring(0, 14) === '<mxGraphModel ')) {
                                                    barrier(index, mxUtils.bind(this, function () {
                                                        return fn(cont, 'text/xml', x + index * gs, y + index * gs, 0, 0, file.name);
                                                    }));
                                                } else {
                                                    barrier(index, mxUtils.bind(this, function () {
                                                        try {
                                                            // Parses SVG and find width and height
                                                            if (root != null) {
                                                                var svgs = root.getElementsByTagName('svg');

                                                                if (svgs.length > 0) {
                                                                    var svgRoot = svgs[0];
                                                                    var w = svgRoot.getAttribute('width');
                                                                    var h = svgRoot.getAttribute('height');

                                                                    if (w != null && w.charAt(w.length - 1) != '%') {
                                                                        w = parseFloat(w);
                                                                    } else {
                                                                        w = NaN;
                                                                    }

                                                                    if (h != null && h.charAt(h.length - 1) != '%') {
                                                                        h = parseFloat(h);
                                                                    } else {
                                                                        h = NaN;
                                                                    }

                                                                    // Check if viewBox attribute already exists
                                                                    var vb = svgRoot.getAttribute('viewBox');

                                                                    if (vb == null || vb.length == 0) {
                                                                        svgRoot.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
                                                                    }
                                                                    // Uses width and height from viewbox for
                                                                    // missing width and height attributes
                                                                    else if (isNaN(w) || isNaN(h)) {
                                                                        var tokens = vb.split(' ');

                                                                        if (tokens.length > 3) {
                                                                            w = parseFloat(tokens[2]);
                                                                            h = parseFloat(tokens[3]);
                                                                        }
                                                                    }

                                                                    data = Editor.createSvgDataUri(mxUtils.getXml(svgRoot));
                                                                    var s = Math.min(1, Math.min(maxSize / Math.max(1, w)), maxSize / Math.max(1, h));
                                                                    var cells = fn(data, file.type, x + index * gs, y + index * gs, Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s)), file.name);

                                                                    // Hack to fix width and height asynchronously
                                                                    if (cells != null && (isNaN(w) || isNaN(h))) {
                                                                        var img = new Image();

                                                                        img.onload = mxUtils.bind(this, function () {
                                                                            w = Math.max(1, img.width);
                                                                            h = Math.max(1, img.height);

                                                                            cells[0].geometry.width = w;
                                                                            cells[0].geometry.height = h;

                                                                            svgRoot.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
                                                                            data = Editor.createSvgDataUri(mxUtils.getXml(svgRoot));

                                                                            var semi = data.indexOf(';');

                                                                            if (semi > 0) {
                                                                                data = data.substring(0, semi) + data.substring(data.indexOf(',', semi + 1));
                                                                            }

                                                                            graph.setCellStyles('image', data, [cells[0]]);
                                                                        });

                                                                        img.src = Editor.createSvgDataUri(mxUtils.getXml(svgRoot));
                                                                    }
                                                                    return cells;
                                                                }
                                                            }
                                                        } catch (e) {
                                                            // ignores any SVG parsing errors
                                                        }
                                                        return null;
                                                    }));
                                                }
                                            } else {
                                                barrier(index, mxUtils.bind(this, function () {
                                                    return null;
                                                }));
                                            }
                                        } else {
                                            var containsModel = false;
                                            if (file.type == 'image/png') {
                                                var xml = ignoreEmbeddedXml ? null : this.extractGraphModelFromPng(e.target.result);
                                                if (xml != null && xml.length > 0) {
                                                    var img = new Image();
                                                    img.src = e.target.result;
                                                    barrier(index, mxUtils.bind(this, function () {
                                                        return fn(xml, 'text/xml', x + index * gs, y + index * gs, img.width, img.height, file.name);
                                                    }));
                                                    containsModel = true;
                                                }
                                            }
                                            if (!containsModel) {
                                                if (mxClient.IS_CHROMEAPP) {
                                                    this.spinner.stop();
                                                    this.showError(
                                                        mxResources.get('error'),
                                                        mxResources.get('dragAndDropNotSupported'),
                                                        mxResources.get('cancel'),
                                                        mxUtils.bind(this, function () {
                                                            // Hides the dialog
                                                        }),
                                                        null,
                                                        mxResources.get('ok'),
                                                        mxUtils.bind(this, function () {
                                                            // Redirects to import function
                                                            this.actions.get('import').funct();
                                                        })
                                                    );
                                                } else {
                                                    this.loadImage(e.target.result, mxUtils.bind(this, function (img) {
                                                        this.resizeImage(img, e.target.result, mxUtils.bind(this, function (data2, w2, h2) {
                                                            barrier(index, mxUtils.bind(this, function () {
                                                                // Refuses to insert images above a certain size as they kill the app
                                                                if (data2 != null && data2.length < maxBytes) {
                                                                    var s = !resizeImages || !this.isResampleImageSize(file.size, resampleThreshold) ? 1 : Math.min(1, Math.min(maxSize / w2, maxSize / h2));
                                                                    return fn(data2, file.type, x + index * gs, y + index * gs, Math.round(w2 * s), Math.round(h2 * s), file.name);
                                                                } else {
                                                                    this.handleError({
                                                                        message: mxResources.get('imageTooBig'),
                                                                    });
                                                                    return null;
                                                                }
                                                            }));
                                                        }), resizeImages, maxSize, resampleThreshold, file.size);
                                                    }),
                                                        mxUtils.bind(this, function () {
                                                            this.handleError({
                                                                message: mxResources.get('invalidOrMissingFile'),
                                                            });
                                                        }));
                                                }
                                            }
                                        }
                                    } else {
                                        var data = e.target.result;
                                        fn(data, file.type, x + index * gs, y + index * gs, 240, 160, file.name, function (cells) {
                                            barrier(index, function () {
                                                return cells;
                                            });
                                        }, file);
                                    }
                                } catch (e) {
                                    barrier(index, mxUtils.bind(this, function () {
                                        return null;
                                    }));
                                    if (window.console != null) {
                                        console.error(e, file);
                                    }
                                }
                            }
                        });
                        if (/(\.v(dx|sdx?))($|\?)/i.test(file.name) || /(\.vs(x|sx?))($|\?)/i.test(file.name)) {
                            fn(null, file.type, x + index * gs, y + index * gs, 240, 160, file.name, function (cells) {
                                barrier(index, function () {
                                    return cells;
                                });
                            }, file);
                        } else if (file.type.startsWith('image') || file.type === 'application/pdf') {
                            reader.readAsDataURL(file);
                        } else {
                            reader.readAsText(file);
                        }
                    }
                })(i);
            }
        }
    });

    if (largeImages) {
        // Workaround for lost files array in async code
        var tmp = [];

        for (var i = 0; i < files.length; i++) {
            tmp.push(files[i]);
        }

        files = tmp;

        this.confirmImageResize(function (doResize) {
            resizeImages = doResize;
            doImportFiles();
        }, resizeDialog);
    } else {
        doImportFiles();
    }
};

EditorUi.prototype.isBlankFile = function () {
    return this.pages != null && this.pages.length == 1 && this.isDiagramEmpty() && this.currentPage.getName() == mxResources.get('pageWithNumber', [1]);
};

EditorUi.prototype.confirmImageResize = function (fn, force) {
    force = force != null ? force : false;
    var resume = this.spinner != null && this.spinner.pause != null ? this.spinner.pause() : function () {
    };
    var resizeImages = isLocalStorage || mxClient.IS_CHROMEAPP ? mxSettings.getResizeImages() : null;

    var wrapper = function (remember, resize) {
        if (remember || force) {
            mxSettings.setResizeImages(remember ? resize : null);
            mxSettings.save();
        }

        resume();
        fn(resize);
    };

    if (resizeImages != null && !force) {
        wrapper(false, resizeImages);
    } else {
        this.showDialog(
            new ConfirmDialog(
                this,
                mxResources.get('resizeLargeImages'),
                function (remember) {
                    wrapper(remember, true);
                },
                function (remember) {
                    wrapper(remember, false);
                },
                mxResources.get('resize'),
                mxResources.get('actualSize'),
                '<img style="margin-top:8px;" src="' + Editor.loResImage + '"/>',
                '<img style="margin-top:8px;" src="' + Editor.hiResImage + '"/>',
                isLocalStorage || mxClient.IS_CHROMEAPP
            ).container,
            340,
            isLocalStorage || mxClient.IS_CHROMEAPP ? 220 : 200,
            true,
            true
        );
    }
};

EditorUi.prototype.isResampleImageSize = function (size, thresh) {
    thresh = thresh != null ? thresh : this.resampleThreshold;

    return size > thresh;
};

EditorUi.prototype.resizeImage = function (img, data, fn, enabled, maxSize, thresh, fileSize) {
    maxSize = maxSize != null ? maxSize : this.maxImageSize;
    var w = Math.max(1, img.width);
    var h = Math.max(1, img.height);
    var originalData = data;

    if (enabled && this.isResampleImageSize(fileSize != null ? fileSize : data.length, thresh)) {
        try {
            var factor = Math.max(w / maxSize, h / maxSize);

            if (factor > 1) {
                var w2 = Math.round(w / factor);
                var h2 = Math.round(h / factor);

                var canvas = document.createElement('canvas');
                canvas.width = w2;
                canvas.height = h2;

                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w2, h2);
                var tmp = canvas.toDataURL();

                // Uses new image if smaller
                if (tmp.length < data.length) {
                    // Checks if the image is empty by comparing
                    // with an empty image of the same size
                    var canvas2 = document.createElement('canvas');
                    canvas2.width = w2;
                    canvas2.height = h2;
                    var tmp2 = canvas2.toDataURL();

                    if (tmp !== tmp2) {
                        data = tmp;
                        w = w2;
                        h = h2;
                    }
                }
            }
        } catch (e) {
            // ignores image scaling errors
        }
    }

    if (enabled && originalData != data && maxSize > this.maxImageSize / 2 && data.length > this.maxImageBytes) {
        this.resizeImage(img, data, fn, enabled, maxSize / 1.5, thresh, fileSize);
    } else {
        fn(data, w, h);
    }
};

EditorUi.prototype.extractGraphModelFromPng = function (data) {
    return Editor.extractGraphModelFromPng(data);
};

EditorUi.prototype.loadImage = function (uri, onload, onerror) {
    try {
        var img = new Image();

        img.onload = function () {
            img.width = img.width > 0 ? img.width : 120;
            img.height = img.height > 0 ? img.height : 120;

            onload(img);
        };

        if (onerror != null) {
            img.onerror = onerror;
        }

        img.src = uri;
    } catch (e) {
        if (onerror != null) {
            onerror(e);
        } else {
            throw e;
        }
    }
};

EditorUi.prototype.createSpinner = function (x, y, size) {
    var autoPosition = x == null || y == null;
    size = size != null ? size : 24;

    var spinner = new Spinner({
        lines: 12, // The number of lines to draw
        length: size, // The length of each line
        width: Math.round(size / 3), // The line thickness
        radius: Math.round(size / 2), // The radius of the inner circle
        rotate: 0, // The rotation offset
        color: Editor.isDarkMode() ? '#c0c0c0' : '#000', // #rgb or #rrggbb
        speed: 1.5, // Rounds per second
        trail: 60, // Afterglow percentage
        hwaccel: false, // Whether to use hardware acceleration
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
        direction: 1, // 1: clockwise, -1: counterclockwise
        fadeColor: 'transparent', // CSS color or array of colors
        shadow: '0 0 1px transparent', // Box-shadow for the lines
        className: 'spinner', // The CSS class to assign to the spinner
        position: 'absolute', // Element positioning
    });

    // Extends spin method to include an optional label
    var oldSpin = spinner.spin;

    spinner.spin = function (container, label) {
        var result = false;

        if (!this.active) {
            oldSpin.call(this, container);
            this.active = true;

            if (label != null) {
                if (autoPosition) {
                    y = Math.max(document.body.clientHeight || 0, document.documentElement.clientHeight || 0) / 2;
                    x = document.body.clientWidth / 2 - 2;
                }

                var status = document.createElement('div');
                status.style.position = 'absolute';
                status.style.whiteSpace = 'nowrap';
                status.style.background = '#4B4243';
                status.style.color = 'white';
                status.style.fontFamily = Editor.defaultHtmlFont;
                status.style.fontSize = '9pt';
                status.style.padding = '6px';
                status.style.paddingLeft = '10px';
                status.style.paddingRight = '10px';
                status.style.zIndex = 2e9;
                status.style.left = Math.max(0, x) + 'px';
                status.style.top = Math.max(0, y + 70) + 'px';

                mxUtils.setPrefixedStyle(status.style, 'borderRadius', '6px');
                mxUtils.setPrefixedStyle(status.style, 'transform', 'translate(-50%,-50%)');

                if (!Editor.isDarkMode()) {
                    mxUtils.setPrefixedStyle(status.style, 'boxShadow', '2px 2px 3px 0px #ddd');
                }

                if (label.substring(label.length - 3, label.length) != '...' && label.charAt(label.length - 1) != '!') {
                    label = label + '...';
                }

                status.innerHTML = label;
                container.appendChild(status);
                spinner.status = status;
            }

            // Pause returns a function to resume the spinner
            this.pause = mxUtils.bind(this, function () {
                var fn = function () {
                };

                if (this.active) {
                    fn = mxUtils.bind(this, function () {
                        this.spin(container, label);
                    });
                }

                this.stop();

                return fn;
            });

            result = true;
        }

        return result;
    };

    // Extends stop method to remove the optional label
    var oldStop = spinner.stop;

    spinner.stop = function () {
        oldStop.call(this);
        this.active = false;

        if (spinner.status != null && spinner.status.parentNode != null) {
            spinner.status.parentNode.removeChild(spinner.status);
        }

        spinner.status = null;
    };

    spinner.pause = function () {
        return function () {
        };
    };

    return spinner;
};

EditorUi.prototype.isCompatibleString = function (data) {
    try {
        var doc = mxUtils.parseXml(data);
        var node = this.editor.extractGraphModel(doc.documentElement, true);

        return node != null && node.getElementsByTagName('parsererror').length == 0;
    } catch (e) {
        // ignore
    }

    return false;
};

EditorUi.prototype.isVisioData = function (data) {
    return data.length > 8 && ((data.charCodeAt(0) == 0xd0 && data.charCodeAt(1) == 0xcf && data.charCodeAt(2) == 0x11 && data.charCodeAt(3) == 0xe0 && data.charCodeAt(4) == 0xa1 && data.charCodeAt(5) == 0xb1 && data.charCodeAt(6) == 0x1a && data.charCodeAt(7) == 0xe1) || (data.charCodeAt(0) == 0x50 && data.charCodeAt(1) == 0x4b && data.charCodeAt(2) == 0x03 && data.charCodeAt(3) == 0x04) || (data.charCodeAt(0) == 0x50 && data.charCodeAt(1) == 0x4b && data.charCodeAt(2) == 0x03 && data.charCodeAt(3) == 0x06));
};

EditorUi.prototype.isRemoteVisioData = function (data) {
    return data.length > 8 && ((data.charCodeAt(0) == 0xd0 && data.charCodeAt(1) == 0xcf && data.charCodeAt(2) == 0x11 && data.charCodeAt(3) == 0xe0 && data.charCodeAt(4) == 0xa1 && data.charCodeAt(5) == 0xb1 && data.charCodeAt(6) == 0x1a && data.charCodeAt(7) == 0xe1) || (data.charCodeAt(0) == 0x3c && data.charCodeAt(1) == 0x3f && data.charCodeAt(2) == 0x78 && data.charCodeAt(3) == 0x6d && data.charCodeAt(3) == 0x6c));
};

EditorUi.prototype.createToolbarButton = function (img, title, fn, size) {
    size = size != null ? size : 24;
    var btn = document.createElement('a');
    btn.className = 'geToolbarButton geAdaptiveAsset';
    btn.setAttribute('title', title);
    btn.style.backgroundImage = 'url(' + img + ')';
    btn.style.backgroundPosition = 'center center';
    btn.style.backgroundRepeat = 'no-repeat';
    btn.style.backgroundSize = '100% 100%';
    btn.style.display = 'inline-block';
    btn.style.cursor = 'pointer';
    btn.style.marginLeft = '6px';
    btn.style.width = size + 'px';
    btn.style.height = size + 'px';

    if (fn != null) {
        // Prevents focus
        mxEvent.addListener(
            btn,
            mxClient.IS_POINTER ? 'pointerdown' : 'mousedown',
            mxUtils.bind(this, function (evt) {
                evt.preventDefault();
            })
        );

        mxEvent.addListener(btn, 'click', function (evt) {
            if (btn.getAttribute('disabled') != 'disabled') {
                fn(evt);
            }

            mxEvent.consume(evt);
        });
    }

    return btn;
};

EditorUi.prototype.highlightElement = function (elt) {
    var x = 0;
    var y = 0;
    var w = 0;
    var h = 0;

    if (elt == null) {
        var b = document.body;
        var d = document.documentElement;

        w = (b.clientWidth || d.clientWidth) - 3;
        h = Math.max(b.clientHeight || 0, d.clientHeight) - 3;
    } else {
        x = elt.offsetTop;
        y = elt.offsetLeft;
        w = elt.clientWidth;
        h = elt.clientHeight;
    }

    var hl = document.createElement('div');
    hl.style.zIndex = mxPopupMenu.prototype.zIndex + 2;
    hl.style.border = '3px dotted rgb(254, 137, 12)';
    hl.style.pointerEvents = 'none';
    hl.style.position = 'absolute';
    hl.style.top = x + 'px';
    hl.style.left = y + 'px';
    hl.style.width = Math.max(0, w - 3) + 'px';
    hl.style.height = Math.max(0, h - 3) + 'px';

    if (elt != null && elt.parentNode == this.editor.graph.container) {
        this.editor.graph.container.appendChild(hl);
    } else {
        document.body.appendChild(hl);
    }

    return hl;
};

EditorUi.prototype.saveFile = function (preview, server) {
    // const graph = this.editor.graph;
    if (this.dialogs != null && this.dialogs.length > 0) return;
    if (this.spinner.spin(document.body)) {
        this.editor.graph.isEditing() && this.editor.graph.stopEditing(false);
        this.editor.graph.isMouseDown = false;
        this.editor.graph.model.beginUpdate();
        // 获取地址栏的deviceId
        // const urlParams = new URLSearchParams(window.location.search);
        // const deviceId = urlParams.get('deviceId');
        // console.log('Device ID from URL:', deviceId);

        // 用于存储解析后的 JSON 数据
        // const cellScripts = [];

        try {
            //     const cells = this.editor.graph.model.cells;
            //     // 使用 Object.values 来获取所有的细胞对象，并遍历它们
            //     Object.values(cells).forEach(cell => {
            //         if (cell && cell.style) { // 检查是否有 style 属性
            //             // 解析 style 属性
            //             const style = graph.getCellStyle(cell);
            //
            //             // 检查是否为 mxgraph.rc.mxDynamicChart
            //             if (style.shape === 'mxgraph.rc.mxDynamicChart') {
            //                 // 获取 commonScript 属性
            //                 const commonScriptEncoded = style.commonScript;
            //                 if (commonScriptEncoded) {
            //                     // 解码 commonScript
            //                     const commonScriptDecoded = decodeURIComponent(commonScriptEncoded);
            //                     const json = JSON.parse(commonScriptDecoded);
            //                     json.id = cell.id;
            //                     json.deviceId = parseInt(deviceId); // 确保 deviceId 是整数类型
            //                     json.commonScript = commonScriptDecoded; // 保存原始的 commonScript 内容
            //                     console.log("Decoded commonScript for cell with id " + cell.id + ": " + JSON.stringify(json));
            //                     // 将解析后的 JSON 数据添加到数组中
            //                     cellScripts.push(json);
            //                 }
            //             }
            //         }
            //     });
            //
            //     // 发送数据到后台
            //     if (cellScripts.length > 0) {
            //         api.saveCellScript(cellScripts)
            //             .then(response => {
            //                 if (response.code === 200) {
            //                     console.log('Data saved successfully:', response);
            //                 } else {
            //                     console.error('Error saving data:', response.message);
            //                 }
            //             })
            //             .catch(error => {
            //                 console.error('Error saving data:', error);
            //             });
            //     }

            if (this.currentPage && this.currentPage.getId()) {
                const data = this.editor.graph.compressNode(this.editor.getGraphXml(true), true);
                mxUtils.setTextContent(this.currentPage.node, data);
            }
            this.save2Server(preview, server);
        } finally {
            // 结束事务
            this.editor.graph.model.endUpdate();
        }
    }
};

EditorUi.prototype.exportPreviewImage = function () {
    if (this.spinner.spin(document.body, mxResources.get('loading'))) {
        new Promise((resolve, reject) => {
            const divPanel = document.getElementById('RCgeBackgroundPage');
            html2Canvas(divPanel, {
                useCORS: true, // 解决资源跨域问题
            }).then((canvas) => {
                const dataURL = canvas.toDataURL('image/jpeg', 1.0);
                const a = document.createElement('a');
                a.href = dataURL;
                a.download = 'div-image.png';
                a.click();
                resolve();
            });
        })
            .then(() => {
                this.spinner.stop();
            })
            .catch((e) => {
                console.log(e);
                this.spinner.stop();
            });
    }
};


// EditorUi.prototype.fileLoaded = function (file) {
// 	var result = !1;
// 	this.hideDialog();
// 	var oldFile = this.getCurrentFile();
// 	this.setCurrentFile(null), null != oldFile && (oldFile.removeListener(this.descriptorChangedListener), oldFile.close()), this.editor.graph.model.clear(), this.editor.undoManager.clear();
// 	var noFile = mxUtils.bind(this, function () {
// 		this.setGraphEnabled(!1), this.setCurrentFile(null), null != oldFile && this.updateDocumentTitle(), this.editor.graph.model.clear(), this.editor.undoManager.clear(), this.setBackgroundImage(null), null != window.location.hash && window.location.hash.length > 0 && (window.location.hash = ''), null != this.fname && ((this.fname.innerHTML = ''), this.fname.setAttribute('title', mxResources.get('rename'))), this.editor.setStatus(''), this.updateUi(), this.showSplash();
// 	});
// 	if (null != file)
// 		try {
// 			if ((this.setCurrentFile(file), file.addListener('descriptorChanged', this.descriptorChangedListener), file.addListener('contentChanged', this.descriptorChangedListener), file.open(0), this.setGraphEnabled(!0), this.setMode(file.getMode()), this.editor.undoManager.clear(), this.descriptorChanged(), this.updateUi(), null == file.realtime && (file.isEditable() ? this.editor.setStatus('') : this.editor.setStatus('<span class="geStatusAlert" style="margin-left:8px;">' + mxUtils.htmlEntities(mxResources.get('readOnly')) + '</span>')), !this.editor.isChromelessView() || this.editor.editable)) this.editor.graph.selectUnlockedLayer(), this.showLayersDialog(), this.restoreLibraries(), window.self !== window.top && window.focus();
// 			else if (this.editor.graph.isLightboxView() && (this.lightboxFit(), IsDrawPagePermission)) {
// 				var pageId = this.currentPage.getId();
// 				null != this.currentPage.getPassword() && '' != this.currentPage.getPassword() && 0 === window['enterPasswordCount_' + pageId] && this.InputPasswordPage(this.currentPage, 'firstLoad');
// 			}
// 			this.chromelessResize && this.chromelessResize(), this.editor.fireEvent(new mxEventObject('fileLoaded')), (result = !0);
// 			try {
// 				mxSettings.setOpenCounter(mxSettings.getOpenCounter() + 1), mxSettings.save();
// 			} catch (e) {}
// 		} catch (e) {
// 			//null != window.console && console.log('error in fileLoaded:', file, e);
// 		}
// 	else noFile();
// 	return result;
// };

EditorUi.prototype.exportImage = function (scale, transparentBackground, ignoreSelection, addShadow, editable, border, noCrop, currentPage, format, grid, dpi, theme, exportType) {
    format = format != null ? format : 'png';

    if (this.spinner.spin(document.body, mxResources.get('exporting'))) {
        var selectionEmpty = this.editor.graph.isSelectionEmpty();
        ignoreSelection = ignoreSelection != null ? ignoreSelection : selectionEmpty;

        // Caches images
        if (this.thumbImageCache == null) {
            this.thumbImageCache = new Object();
        }

        try {
            this.editor.exportToCanvas(
                mxUtils.bind(this, function (canvas) {
                    this.spinner.stop();

                    try {
                        this.saveCanvas(canvas, editable ? this.getFileData(true, null, null, null, ignoreSelection, currentPage) : null, format, this.pages == null || this.pages.length == 0, dpi);
                    } catch (e) {
                        this.handleError(e);
                    }
                }),
                null,
                this.thumbImageCache,
                null,
                mxUtils.bind(this, function (e) {
                    this.spinner.stop();
                    this.handleError(e);
                }),
                null,
                ignoreSelection,
                scale || 1,
                transparentBackground,
                addShadow,
                null,
                null,
                border,
                noCrop,
                grid,
                theme,
                exportType
            );
        } catch (e) {
            this.spinner.stop();
            this.handleError(e);
        }
    }
};


EditorUi.prototype.setTabContainerVisible = function (visible) {
    if (visible) {
        this.tabContainerHeight = EditorUi.prototype.tabContainerHeight;
    } else {
        this.tabContainerHeight = 0;
    }
    if (isLocalStorage) {
        mxSettings.settings.pages = this.tabContainerHeight > 0;
        mxSettings.save();
    }
    this.editor.updateGraphComponents();
    this.refresh();
};

EditorUi.prototype.isTabContainerVisible = function () {
    return this.tabContainerHeight > 0;
};

EditorUi.prototype.getSelectedPageIndex = function () {
    return this.getPageIndex(this.currentPage);
};

EditorUi.prototype.getPageIndex = function (page) {
    var result = null;

    if (this.pages != null && page != null) {
        for (var i = 0; i < this.pages.length; i++) {
            if (this.pages[i] == page) {
                result = i;

                break;
            }
        }
    }
    return result;
};

EditorUi.prototype.getPageById = function (id, pages) {
    pages = pages != null ? pages : this.pages;

    if (pages != null) {
        for (var i = 0; i < pages.length; i++) {
            if (pages[i].getId() == id) {
                return pages[i];
            }
        }
    }

    return null;
};

EditorUi.prototype.createImageForPageLink = function (src, sourcePage, sourceGraph) {
    var comma = src.indexOf(',');
    var result = null;

    if (comma > 0) {
        var page = this.getPageById(src.substring(comma + 1));

        if (page != null && page != sourcePage) {
            result = this.getImageForPage(page, sourcePage, sourceGraph);
            result.originalSrc = src;
        }
    }

    if (result == null) {
        result = { originalSrc: src };
    }

    return result;
};

EditorUi.prototype.pageSelected = function () {
    var graph = this.editor.graph;
    var page = this.currentPage;

    if (page != null) {
        graph.tooltipHandler.hide();

        if (page.viewState == null || page.viewState.scrollTop == null || page.viewState.scrollLeft == null) {
            // Selects unlocked layer if page was never shown
            graph.selectUnlockedLayer();
            this.resetScrollbars();

            if (graph.isLightboxView()) {
                this.lightboxFit();
            }

            if (this.chromelessResize != null) {
                graph.container.scrollleft = 0;
                graph.container.scrollTop = 0;
                this.chromelessResize();
            }
        } else {
            graph.setScrollbarPositions(page.viewState, graph.view.translate.x, graph.view.translate.y);
        }
        this.updateTabContainer();
        this.scrollToPage();
    }
};

EditorUi.prototype.getImageForPage = function (page, sourcePage, sourceGraph) {
    sourceGraph = sourceGraph != null ? sourceGraph : this.editor.graph;
    var graphGetGlobalVariable = sourceGraph.getGlobalVariable;
    var graph = this.createTemporaryGraph(sourceGraph.getStylesheet());
    graph.defaultPageBackgroundColor = sourceGraph.defaultPageBackgroundColor;
    graph.shapeBackgroundColor = sourceGraph.shapeBackgroundColor;
    graph.shapeForegroundColor = sourceGraph.shapeForegroundColor;
    var index = this.getPageIndex(sourcePage != null ? sourcePage : this.currentPage);

    graph.getGlobalVariable = function (name) {
        if (name == 'pagenumber') {
            return index + 1;
        } else if (name == 'page' && sourcePage != null) {
            return sourcePage.getName();
        } else {
            return graphGetGlobalVariable.apply(this, arguments);
        }
    };

    document.body.appendChild(graph.container);

    this.updatePageRoot(page);
    graph.model.setRoot(page.root);

    var temp = Graph.foreignObjectWarningText;
    Graph.foreignObjectWarningText = '';
    var theme = Editor.cssDarkMode || Editor.isDarkMode() ? 'dark' : 'light';
    var svgRoot = graph.getSvg(null, null, null, null, null, null, null, null, null, null, null, theme, null, null, true);

    var bounds = graph.getGraphBounds();
    document.body.removeChild(graph.container);
    Graph.foreignObjectWarningText = temp;

    return new mxImage(Editor.createSvgDataUri(mxUtils.getXml(svgRoot)), bounds.width, bounds.height, bounds.x, bounds.y);
};

EditorUi.prototype.getHashObject = function () {
    return {};
}
EditorUi.prototype.updateDocumentTitle = function () {
}
EditorUi.prototype.updateHashObject = function () {
}
EditorUi.prototype.setHashObject = function (obj) {
}


EditorUi.prototype.scrollToPage = function () {
    var index = this.getSelectedPageIndex();

    if (this.tabScroller != null && this.tabScroller.children.length > index && this.tabScroller.children[index] != null) {
        this.tabScroller.children[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
        this.tabScroller.children[index].className = 'geTab gePageTab geActivePage';
        // lastSelectedElt = this.tabScroller.children[index];
    }
};

EditorUi.prototype.restoreViewState = function (page, viewState, selection) {
    var newPage = page != null ? this.getPageById(page.getId()) : null;
    var graph = this.editor.graph;

    if (newPage != null && this.currentPage != null && this.pages != null) {
        if (newPage != this.currentPage) {
            this.selectPage(newPage, true, viewState);
        } else {
            // TODO: Pass viewState to setGraphXml
            graph.setViewState(viewState);
            this.editor.updateGraphComponents();
            graph.view.revalidate();
            graph.sizeDidChange();
        }

        graph.container.scrollLeft = graph.view.translate.x * graph.view.scale + viewState.scrollLeft;
        graph.container.scrollTop = graph.view.translate.y * graph.view.scale + viewState.scrollTop;
        graph.restoreSelection(selection);
    }
};
EditorUi.prototype.updatePageRoot = function (page, checked) {
    if (page.root == null) {
        var node = this.editor.extractGraphModel(page.node, false, checked);
        var cause = Editor.extractParserError(node);
        if (cause) {
            throw new Error(cause);
        } else if (node != null) {
            page.graphModelNode = node;

            // Converts model XML into page object with root cell
            page.viewState = this.editor.graph.createViewState(node);
            var codec = new mxCodec(node.ownerDocument);
            page.root = codec.decode(node).root;
        } else {
            // Initializes page object with new empty root
            page.root = this.editor.graph.model.createRoot();
        }
    } else if (page.viewState == null) {
        if (page.graphModelNode == null) {
            var node = this.editor.extractGraphModel(page.node);

            var cause = Editor.extractParserError(node);

            if (cause) {
                throw new Error(cause);
            } else if (node != null) {
                page.graphModelNode = node;
            }
        }

        if (page.graphModelNode != null) {
            page.viewState = this.editor.graph.createViewState(page.graphModelNode);
        }
    }

    return page;
};

EditorUi.prototype.replaceDiagramData = function (data) {
    this.editor.graph.model.execute(new ReplaceDiagram(this, mxUtils.parseXml(data).documentElement));
};

EditorUi.prototype.selectPage = function (page, quiet, viewState) {
    try {
        if (page != this.currentPage) {
            var graph = this.editor.graph;

            if (graph.isEditing()) {
                graph.stopEditing(false);
            }

            quiet = quiet != null ? quiet : false;
            graph.isMouseDown = false;
            graph.reset();

            var edit = graph.model.createUndoableEdit();

            // Special flag to bypass autosave for this edit
            edit.ignoreEdit = true;

            var change = new SelectPage(this, page, viewState);
            change.execute();
            edit.add(change);
            edit.notify();

            if (!quiet) {
                graph.model.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', edit));
            }
        }
    } catch (e) {
        this.handleError(e);
    }
};

EditorUi.prototype.selectNextPage = function (forward) {
    var next = this.currentPage;

    if (next != null && this.pages != null) {
        var tmp = mxUtils.indexOf(this.pages, next);

        if (forward) {
            this.selectPage(this.pages[mxUtils.mod(tmp + 1, this.pages.length)]);
        } else if (!forward) {
            this.selectPage(this.pages[mxUtils.mod(tmp - 1, this.pages.length)]);
        }
    }
};

EditorUi.prototype.insertPage = function (page, index) {
    if (this.editor.graph.isEnabled()) {
        if (this.editor.graph.isEditing()) {
            this.editor.graph.stopEditing(false);
        }

        page = page != null ? page : this.createPage(null, this.createPageId());
        index = index != null ? index : this.pages.length;

        // Uses model to fire event and trigger autosave
        var change = new ChangePage(this, page, page, index);
        this.editor.graph.model.execute(change);
    }

    return page;
};

EditorUi.prototype.createPageId = function () {
    var id = null;
    do {
        id = Editor.guid();
    } while (this.getPageById(id) != null);
    return id;
};

EditorUi.prototype.createPage = function (name, id) {
    var page = new DiagramPage(document.createElement('diagram'), id);
    page.setName(name != null ? name : this.createPageName());
    this.initDiagramNode(page);
    return page;
};

EditorUi.prototype.createPageName = function () {
    var existing = {};
    for (var i = 0; i < this.pages.length; i++) {
        var tmp = this.pages[i].getName();

        if (tmp != null && tmp.length > 0) {
            existing[tmp] = tmp;
        }
    }
    var nr = this.pages.length;
    var name = null;

    do {
        name = mxResources.get('pageWithNumber', [++nr]);
    } while (existing[name] != null);

    return name;
};

EditorUi.prototype.removePage = function (page) {
    try {
        var graph = this.editor.graph;
        var tmp = mxUtils.indexOf(this.pages, page);

        if (graph.isEnabled() && tmp >= 0) {
            if (this.editor.graph.isEditing()) {
                this.editor.graph.stopEditing(false);
            }

            graph.model.beginUpdate();
            try {
                var next = this.currentPage;

                if (next == page && this.pages.length > 1) {
                    if (tmp == this.pages.length - 1) {
                        tmp--;
                    } else {
                        tmp++;
                    }

                    next = this.pages[tmp];
                } else if (this.pages.length <= 1) {
                    // Removes label with incorrect page number to force
                    // default page name which is OK for a single page
                    next = this.insertPage();
                    graph.model.execute(new RenamePage(this, next, mxResources.get('pageWithNumber', [1])));
                }

                // Uses model to fire event to trigger autosave
                graph.model.execute(new ChangePage(this, page, next));
            } finally {
                graph.model.endUpdate();
            }
        }
    } catch (e) {
        this.handleError(e);
    }

    return page;
};

/**
 * Duplicates the given page.
 */
EditorUi.prototype.duplicatePage = function (page, name) {
    var newPage = null;

    try {
        var graph = this.editor.graph;

        if (graph.isEnabled()) {
            if (graph.isEditing()) {
                graph.stopEditing();
            }

            // Clones the current page and takes a snapshot of the graph model and view state
            var node = page.node.cloneNode(false);
            node.removeAttribute('id');

            var cloneMap = new Object();
            var lookup = graph.createCellLookup([graph.model.root]);

            var newPage = new DiagramPage(node);
            newPage.root = graph.cloneCell(graph.model.root, null, cloneMap);
            // Updates cell IDs
            var model = new mxGraphModel();
            model.prefix = Editor.guid() + '-';
            model.setRoot(newPage.root);

            // Updates custom links
            graph.updateCustomLinks(graph.createCellMapping(cloneMap, lookup), [newPage.root]);

            // Initializes diagram node
            newPage.viewState = page == this.currentPage ? graph.getViewState() : page.viewState;
            this.initDiagramNode(newPage);

            // Resets zoom and scrollbar positions
            newPage.viewState.scale = 1;
            delete newPage.viewState.scrollLeft;
            delete newPage.viewState.scrollTop;
            delete newPage.viewState.currentRoot;
            delete newPage.viewState.defaultParent;
            newPage.setName(name);

            // Inserts new page after duplicated page
            newPage = this.insertPage(newPage, mxUtils.indexOf(this.pages, page) + 1);
        }
    } catch (e) {
        this.handleError(e);
    }

    return newPage;
};

EditorUi.prototype.initDiagramNode = function (page) {
    var enc = new mxCodec(mxUtils.createXmlDocument());
    var temp = enc.encode(new mxGraphModel(page.root));
    this.editor.graph.saveViewState(page.viewState, temp);
    mxUtils.setTextContent(page.node, Graph.compressNode(temp, true));
};

EditorUi.prototype.clonePages = function (pages) {
    var errors = [];
    var result = [];

    for (var i = 0; i < pages.length; i++) {
        try {
            result.push(this.clonePage(pages[i]));
        } catch (e) {
            errors.push(mxResources.get('pageWithNumber', [i + 1]) + ': ' + e.message);
        }
    }

    if (errors.length > 0) {
        throw new Error(errors.join('\n'));
    }

    return result;
};

/**
 * Duplicates the given page.
 */
EditorUi.prototype.clonePage = function (page) {
    this.updatePageRoot(page);

    var result = new DiagramPage(page.node.cloneNode(true));
    var viewState = page == this.currentPage ? this.editor.graph.getViewState() : page.viewState;
    result.viewState = mxUtils.clone(viewState, EditorUi.transientViewStateProperties);
    result.root = this.editor.graph.model.cloneCell(page.root, null, true);

    return result;
};

/**
 * Renames the given page using a dialog.
 */
EditorUi.prototype.renamePage = function (page) {
    var graph = this.editor.graph;

    if (graph.isEnabled()) {
        var dlg = new FilenameDialog(
            this,
            page.getName(),
            mxResources.get('rename'),
            mxUtils.bind(this, function (name) {
                if (name != null && name.length > 0) {
                    this.editor.graph.model.execute(new RenamePage(this, page, name));
                }
            }),
            mxResources.get('rename')
        );
        this.showDialog(dlg.container, 300, 80, true, true);
        dlg.init();
    }

    return page;
};

/**
 * Returns true if the given string contains an mxfile.
 */
EditorUi.prototype.movePage = function (oldIndex, newIndex) {
    this.editor.graph.model.execute(new MovePage(this, oldIndex, newIndex));
};

/**
 * Returns true if the given string contains an mxfile.
 */
EditorUi.prototype.createTabContainer = function () {
    var div = document.createElement('div');
    div.className = 'geTabContainer geTabItem';

    return div;
};

/**
 * Returns true if the given string contains an mxfile.
 */
EditorUi.prototype.updateTabContainer = function () {
    if (this.tabContainer != null && this.pages != null) {
        var graph = this.editor.graph;
        var wrapper = document.createElement('div');
        wrapper.className = 'geTabScroller';
        var startIndex = null;

        for (var i = 0; i < this.pages.length; i++) {
            // Install drag and drop for page reorder
            mxUtils.bind(this, function (index, tab) {
                if (this.pages[index] == this.currentPage) {
                    tab.className = 'geTab gePageTab geActivePage';
                } else {
                    tab.className = 'geTab gePageTab geInactivePage';
                }

                tab.setAttribute('draggable', 'true');

                mxEvent.addListener(
                    tab,
                    'dragstart',
                    mxUtils.bind(this, function (evt) {
                        if (graph.isEnabled()) {
                            // Workaround for no DnD on DIV in FF
                            if (mxClient.IS_FF) {
                                // LATER: Check what triggers a parse as XML on this in FF after drop
                                evt.dataTransfer.setData('Text', '<diagram/>');
                            }

                            startIndex = index;
                        } else {
                            // Blocks event
                            mxEvent.consume(evt);
                        }
                    })
                );

                mxEvent.addListener(
                    tab,
                    'dragend',
                    mxUtils.bind(this, function (evt) {
                        startIndex = null;
                        evt.stopPropagation();
                        evt.preventDefault();
                    })
                );

                mxEvent.addListener(
                    tab,
                    'dragover',
                    mxUtils.bind(this, function (evt) {
                        if (startIndex != null) {
                            evt.dataTransfer.dropEffect = 'move';
                        }

                        evt.stopPropagation();
                        evt.preventDefault();
                    })
                );

                mxEvent.addListener(
                    tab,
                    'drop',
                    mxUtils.bind(this, function (evt) {
                        if (startIndex != null && index != startIndex) {
                            // LATER: Shift+drag for merge, ctrl+drag for clone
                            this.movePage(startIndex, index);
                        }

                        evt.stopPropagation();
                        evt.preventDefault();
                    })
                );

                wrapper.appendChild(tab);
            })(i, this.createTabForPage(this.pages[i], i + 1));
        }

        var sl = this.tabScroller != null ? this.tabScroller.scrollLeft : 0;
        this.tabContainer.innerText = '';

        if (Editor.currentTheme != 'simple') {
            this.pageMenuTab = this.createPageMenuTab();
            this.tabContainer.appendChild(this.pageMenuTab);
        }

        this.tabContainer.appendChild(wrapper);

        // Not chromeless and not read-only file
        if (this.isPageInsertTabVisible()) {
            this.tabContainer.appendChild(this.createPageInsertTab());
        }

        this.leftScrollTab = this.createLeftScrollTab();
        this.tabContainer.appendChild(this.leftScrollTab);

        this.rightScrollTab = this.createRightScrollTab();
        this.tabContainer.appendChild(this.rightScrollTab);

        this.tabScroller = wrapper;
        this.tabScroller.scrollLeft = sl;
        this.checkTabScrollerOverflow();

        mxEvent.addListener(
            this.tabScroller,
            'scroll',
            mxUtils.bind(this, function (evt) {
                this.checkTabScrollerOverflow();
            })
        );

        window.setTimeout(
            mxUtils.bind(this, function () {
                mxUtils.setPrefixedStyle(this.leftScrollTab.style, 'transition', 'all 0.2s linear');
                mxUtils.setPrefixedStyle(this.rightScrollTab.style, 'transition', 'all 0.2s linear');
            }),
            0
        );
    }
};

/**
 * Returns true if the given string contains an mxfile.
 */
EditorUi.prototype.checkTabScrollerOverflow = function () {
    if (this.tabScroller != null && this.tabContainer != null && this.tabContainer.children.length > 2) {
        var overflow = this.tabScroller.scrollWidth > this.tabScroller.offsetWidth;
        this.leftScrollTab.style.opacity = !overflow ? 0 : this.tabScroller.scrollLeft == 0 ? 0.2 : 1;
        this.rightScrollTab.style.opacity = !overflow ? 0 : Math.ceil(this.tabScroller.scrollLeft) + this.tabScroller.offsetWidth >= this.tabScroller.scrollWidth ? 0.2 : 1;
    }
};

EditorUi.prototype.isPageInsertTabVisible = function () {
    return true;
};

EditorUi.prototype.createTab = function () {
    var tab = document.createElement('div');
    tab.className = 'geTab';

    return tab;
};

EditorUi.prototype.getShortPageName = function (page) {
    var short = null;

    if (page != null) {
        short = page.getName();

        if (short != null && short.length > 36) {
            short = short.substring(0, 34) + '...';
        }
    }

    return short;
};

EditorUi.prototype.createControlTab = function (title, image, fn) {
    var tab = this.createTab();
    tab.className = 'geTab geControlTab';
    tab.style.width = '30px';

    if (title != null) {
        tab.setAttribute('title', title);
    }

    var inner = document.createElement('div');
    inner.className = 'geAdaptiveAsset';
    inner.style.backgroundImage = 'url(' + image + ')';
    inner.style.backgroundRepeat = 'no-repeat';
    inner.style.backgroundPosition = 'center';
    inner.style.backgroundSize = '24px';
    inner.style.position = 'relative';
    inner.style.opacity = '0.5';
    inner.style.width = '100%';
    inner.style.height = '100%';

    tab.appendChild(inner);

    mxEvent.addListener(tab, 'click', fn);

    return tab;
};

EditorUi.prototype.createPageInsertTab = function () {
    return this.createControlTab(
        mxResources.get('insertPage'),
        Editor.plusImage,
        mxUtils.bind(this, function (evt) {
            this.insertPage();
            mxEvent.consume(evt);
        })
    );
};

EditorUi.prototype.createLeftScrollTab = function () {
    return this.createControlTab(
        null,
        Editor.thinArrowLeftImage,
        mxUtils.bind(this, function (evt) {
            var dx = Math.max(60, this.tabScroller.clientWidth / 2);

            if (this.tabScroller.scrollBy != null) {
                this.tabScroller.scrollBy({ left: -dx, top: 0, behavior: 'smooth' });
            } else {
                this.tabScroller.scrollLeft -= dx;
            }

            mxEvent.consume(evt);
        })
    );
};

EditorUi.prototype.createRightScrollTab = function () {
    return this.createControlTab(
        null,
        Editor.thinArrowRightImage,
        mxUtils.bind(this, function (evt) {
            var dx = Math.max(60, this.tabScroller.clientWidth / 2);

            if (this.tabScroller.scrollBy != null) {
                this.tabScroller.scrollBy({ left: dx, top: 0, behavior: 'smooth' });
            } else {
                this.tabScroller.scrollLeft += dx;
            }

            mxEvent.consume(evt);
        })
    );
};

EditorUi.prototype.createPageMenuTab = function () {
    return this.createControlTab(
        mxResources.get('pages'),
        Editor.verticalDotsImage,
        mxUtils.bind(this, function (evt) {
            this.editor.graph.popupMenuHandler.hideMenu();

            var menu = new mxPopupMenu(
                mxUtils.bind(this, function (menu, parent) {
                    this.menus.get('pages').funct(menu, parent);
                })
            );

            menu.div.className += ' geMenubarMenu';
            menu.smartSeparators = true;
            menu.showDisabled = true;
            menu.autoExpand = true;

            // Disables autoexpand and destroys menu when hidden
            menu.hideMenu = mxUtils.bind(this, function () {
                mxPopupMenu.prototype.hideMenu.apply(menu, arguments);
                menu.destroy();
            });

            var x = mxEvent.getClientX(evt);
            var y = mxEvent.getClientY(evt);
            menu.popup(x, y, null, evt);

            // Allows hiding by clicking on document
            this.setCurrentMenu(menu);

            mxEvent.consume(evt);
        })
    );
};

EditorUi.prototype.createTabForPage = function (page, pageNumber) {
    var tab = this.createTab();
    var name = page.getName() || mxResources.get('untitled');
    var id = page.getId();
    tab.setAttribute('title', name + (id != null ? ' (' + id + ')' : '') + ' [' + pageNumber + ']');

    var label = document.createElement('span');
    label.style.maxWidth = '160px';
    label.style.textOverflow = 'ellipsis';
    label.style.overflow = 'hidden';
    mxUtils.write(label, name);
    tab.appendChild(label);

    this.addTabListeners(page, tab);

    return tab;
};

EditorUi.prototype.addTabListeners = function (page, tab) {
    mxEvent.disableContextMenu(tab);
    var graph = this.editor.graph;

    mxEvent.addListener(
        tab,
        'dblclick',
        mxUtils.bind(this, function (evt) {
            this.renamePage(page);
            mxEvent.consume(evt);
        })
    );

    var elt = document.createElement('div');
    elt.className = 'geTabMenuButton';
    elt.style.backgroundImage = 'url(' + mxWindow.prototype.minimizeImage + ')';
    elt.style.backgroundPosition = 'center center';
    elt.style.backgroundRepeat = 'no-repeat';
    elt.style.backgroundSize = '10px';
    tab.appendChild(elt);

    var menuWasVisible = false;
    var pageWasActive = false;

    var onMouseDown = mxUtils.bind(this, function (evt) {
        // Do not consume event here to allow for drag and drop of tabs
        menuWasVisible = this.currentMenu != null;
        pageWasActive = page == this.currentPage;

        if (!graph.isMouseDown && !pageWasActive) {
            this.selectPage(page);
        }

        this.scrollToPage();
    });

    var onMouseUp = mxUtils.bind(this, function (evt) {
        if (graph.isEnabled() && !graph.isMouseDown && ((pageWasActive && (mxEvent.isTouchEvent(evt) || mxEvent.getSource(evt) == elt)) || mxEvent.isPopupTrigger(evt))) {
            graph.popupMenuHandler.hideMenu();
            this.hideCurrentMenu();

            if (!mxEvent.isTouchEvent(evt) || !menuWasVisible) {
                var menu = new mxPopupMenu(this.createPageMenu(page));

                menu.div.className += ' geMenubarMenu';
                menu.smartSeparators = true;
                menu.showDisabled = true;
                menu.autoExpand = true;

                // Disables autoexpand and destroys menu when hidden
                menu.hideMenu = mxUtils.bind(this, function () {
                    mxPopupMenu.prototype.hideMenu.apply(menu, arguments);
                    this.resetCurrentMenu();
                    menu.destroy();
                });

                var x = mxEvent.getClientX(evt);
                var y = mxEvent.getClientY(evt);
                menu.popup(x, y, null, evt);
                this.setCurrentMenu(menu, tab);
            }
        }

        mxEvent.consume(evt);
    });

    mxEvent.addGestureListeners(elt, onMouseDown, null, onMouseUp);
    mxEvent.addGestureListeners(tab, onMouseDown, null, onMouseUp);
};

EditorUi.prototype.getLinkForPage = function (page, params, lightbox) {
    if (page != null && !mxClient.IS_CHROMEAPP && !EditorUi.isElectronApp) {
        var file = this.getCurrentFile();

        if (file != null && file.constructor != LocalFile && this.getServiceName() == 'draw.io') {
            var search = this.getSearch(['create', 'title', 'mode', 'url', 'drive', 'splash', 'state', 'clibs', 'ui', 'viewbox', 'hide-pages', 'sketch']);
            search += (search.length == 0 ? '?' : '&') + 'page-id=' + page.getId();

            if (params != null) {
                search += '&' + params.join('&');
            }

            return (lightbox ? EditorUi.lightboxHost : mxClient.IS_CHROMEAPP || EditorUi.isElectronApp || !/.*\.draw\.io$/.test(window.location.hostname) ? EditorUi.drawHost : 'https://' + window.location.host) + '/' + search + '#' + file.getHash();
        }
    }

    return null;
};

EditorUi.prototype.createPageMenu = function (page, label) {
    return mxUtils.bind(this, function (menu, parent) {
        menu.addItem(
            mxResources.get('duplicate'),
            null,
            mxUtils.bind(this, function () {
                this.duplicatePage(page, mxResources.get('copyOf', [page.getName()]));
            }),
            parent
        );

        menu.addSeparator(parent);

        if (this.currentPage == page && this.pages.length > 1) {
            this.menus.addSubmenu('movePage', menu, parent, mxResources.get('move'));
        }

        menu.addItem(
            mxResources.get('delete'),
            null,
            mxUtils.bind(this, function () {
                this.removePage(page);
            }),
            parent
        );

        menu.addItem(
            mxResources.get('rename') + '...',
            null,
            mxUtils.bind(this, function () {
                this.renamePage(page, label);
            }),
            parent
        );
    });
};

EditorUi.prototype.showPageLinkDialog = function (page) {
    var graph = this.editor.graph;

    this.showPublishLinkDialog(
        mxResources.get('url'),
        true,
        null,
        null,
        mxUtils.bind(this, function (linkTarget, linkColor, allPages, lightbox, editLink, layers) {
            var params = this.createUrlParameters(linkTarget, linkColor, allPages, lightbox, editLink, layers);

            if (!allPages) {
                params.push('hide-pages=1');
            }

            if (!graph.isSelectionEmpty()) {
                var bounds = graph.getBoundingBox(graph.getSelectionCells());

                var t = graph.view.translate;
                var s = graph.view.scale;
                bounds.width /= s;
                bounds.height /= s;
                bounds.x = bounds.x / s - t.x;
                bounds.y = bounds.y / s - t.y;

                params.push(
                    'viewbox=' +
                    encodeURIComponent(
                        JSON.stringify({
                            x: Math.round(bounds.x),
                            y: Math.round(bounds.y),
                            width: Math.round(bounds.width),
                            height: Math.round(bounds.height),
                            border: 100,
                        })
                    )
                );
            }

            var dlg = new EmbedDialog(this, this.getLinkForPage(page, params, lightbox));
            this.showDialog(dlg.container, 450, 240, true, true);
            dlg.init();
        })
    );
};

EditorUi.prototype.isRulerVisible = function () {
    return this.ruler != null;
};

EditorUi.prototype.setRulerVisible = function (visible) {
    var before = this.getDiagramContainerOffset();
    mxSettings.setRulerOn(visible);
    mxSettings.save();
    if (!visible && this.ruler != null) {
        this.ruler.destroy();
        this.ruler = null;
    } else if (visible && this.ruler == null) {
        this.ruler = new mxDualRuler(this, this.editor.graph.view.unit);
    }
    this.refresh();
    this.fireEvent(new mxEventObject('rulerVisibleChanged'));

    var after = this.getDiagramContainerOffset();
    this.diagramContainer.scrollLeft += after.x - before.x;
    this.diagramContainer.scrollTop += after.x - before.x;
};

EditorUi.prototype.showPointSetDialog = function () {
    console.log('this.dialogs', this.dialogs);
    if (this.dialogs != null && this.dialogs.length > 0) return;
    let w = 1400;
    let h = 900;
    let dlg = new PointSetDialog(this, { width: w, height: h });
    this.showDialog(dlg.container, w, h, true, false, null, null, null, null, false);
    let root = dlg.container.parentNode;
    root.style.padding = '0px';
}
EditorUi.prototype.layerConfirm = function (config) {
    let w = config.width ? config.width : 240;
    let h = config.height ? config.height : 180;
    config.width = w;
    config.height = h;
    let dlg = new ConfirmTipDialog(this, config);
    this.showDialog(dlg.container, w, h, true, false, (cancel, isEsc) => isEsc ? false : true, null, null, null, false);
    let root = dlg.container.parentNode;
    root.style.padding = '0px';
}

EditorUi.prototype.showChooseVirvarDialog = function (config) {
    let w = config.width ? config.width : 640;
    let h = config.height ? config.height : 680;
    config.width = w;
    config.height = h;
    let dlg = new ChooseVirvarDialog(this, config);
    this.showDialog(dlg.container, w, h, true, false, (cancel, isEsc) => isEsc ? false : true, null, null, null, false);
    let root = dlg.container.parentNode;
    root.style.padding = '0px';
}
EditorUi.prototype.showSetTablePropertiesDialog = function (config) {
    let w = config.width ? config.width : 960;
    let h = config.height ? config.height : 720;
    config.width = w;
    config.height = h;
    let dlg = new SetTablePropertiesDialog(this, config);
    this.showDialog(dlg.container, w, h, true, false, (cancel, isEsc) => isEsc ? false : true, null, null, null, false);
    let root = dlg.container.parentNode;
    root.style.padding = '0px';
}
EditorUi.prototype.showObjectFormDialog = function (config) {
    let w = config.width ? config.width : 480;
    let h = config.height ? config.height : 360;
    config.width = w;
    config.height = h;
    let dlg = new ObjectFormDialog(this, config);
    this.showDialog(dlg.container, w, h, true, false, (cancel, isEsc) => isEsc ? false : true, null, null, null, false);
    let root = dlg.container.parentNode;
    root.style.padding = '0px';
}


