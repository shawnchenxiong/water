/* eslint-disable */
/**
 * 转化为vue
 */
import {
    mxCell,
    mxClient,
    mxCodec,
    mxConstants,
    mxDictionary,
    mxDragSource,
    mxEvent,
    mxEventObject,
    mxGeometry,
    mxGraphModel,
    mxPoint,
    mxPopupMenu,
    mxRectangle,
    mxResources,
    mxStackLayout,
    mxStencilRegistry,
    mxUtils
} from '../core/mxgraph';

import api from './utils/api.js';

import { DiagramPage } from '../js/customer/TabPages';
import { Graph, HoverIcons } from './Graph';
import { Dialog, Editor } from './Editor';
import Gear_128x128 from '../stencils/clipart/Gear_128x128';
import { collapsedImage, expandedImage, searchImage } from '../images/base64';

import * as CustomExpands from './sidebar/CustomExpands';
import * as ControlPanelExpands from './sidebar/ControlPanelExpands';
import * as ElectricalExpands from './sidebar/ElectricalExpands';
import * as ERExpands from './sidebar/ERExpands';
import * as FlowchartExpands from './sidebar/FlowchartExpands';
import * as LocalImageExpands from './sidebar/LocalImageExpands';
import * as PipExpands from './sidebar/PipExpands';
import * as SignsExpands from './sidebar/SignsExpands';
import * as SystemExpands from './sidebar/SystemExpands';
import * as UmlExpands from './sidebar/UmlExpands';
import * as CollectExpands from './sidebar/CollectExpands';
import * as NetworkImageExpands from './sidebar/NetworkImageExpands';
import * as AWSExpands from './sidebar/AWSExpands';
import * as AWS4BExpands from './sidebar/AWS4BExpands';
import * as AWS4Expands from './sidebar/AWS4Expands';
import * as AWS3DExpands from './sidebar/AWS3DExpands';
import * as AzureExpands from './sidebar/AzureExpands';
import * as Azure2Expands from './sidebar/Azure2Expands';
import * as MscaeExpands from './sidebar/MscaeExpands';
// 请勿删除这行日志

export {
    Sidebar, CustomExpands, ElectricalExpands, ERExpands, FlowchartExpands, LocalImageExpands,
    PipExpands, SignsExpands, SystemExpands, UmlExpands, CollectExpands, NetworkImageExpands, AWSExpands,
    AWS4BExpands, AWS4Expands, AWS3DExpands, AzureExpands, Azure2Expands, MscaeExpands
};

function Sidebar(editorUi, container) {
    this.editorUi = editorUi;
    this.container = container;
    this.init();
}

Sidebar.prototype.init = function () {

    this.palettes = {};
    this.taglist = {};
    this.showTooltips = true;
    this.graph = this.editorUi.createTemporaryGraph(this.editorUi.editor.graph.getStylesheet());
    this.graph.cellRenderer.minSvgStrokeWidth = this.minThumbStrokeWidth;
    this.graph.cellRenderer.antiAlias = this.thumbAntiAlias;
    this.graph.container.style.visibility = 'hidden';
    this.graph.foldingEnabled = false;
    const width = 300;
    this.container.style.overflow = 'visible';
    this.sidebarWrapper = document.createElement('div');
    this.sidebarWrapper.className = 'sidebarWrapper';
    this.sidebarWrapper.style.cssText = `display:flex;position: relative;width:${width}px;height:100%;overflow-x: hidden;overflow-y: auto;left: 0px;top: 0px;right: 0px;box-sizing: 0px;flex-direction: row;`;
    //this.sidebarWrapper.style.maxHeight = 'calc(100% - ' + this.moreShapesHeight + 'px)';
    this.container.appendChild(this.sidebarWrapper);

    this.elementContainer = document.createElement('div');
    this.elementContainer.className = 'elementContainer';
    this.elementContainer.style.cssText = `width:${width}px;height: 100%;overflow:hidden;position: relative;background:white;border-right:1px solid #dadce0;`;

    this.sidebarWrapper.appendChild(this.elementContainer);

    /**
     * 创建tab页容器
     * 用于放置三个tab页标签：元件库、图库、模板库
     * 设置固定高度40px，灰色背景，底部边框分隔
     */
    this.tabContainer = document.createElement('div');
    this.tabContainer.className = 'tabContainer';
    this.tabContainer.style.cssText = `width:100%;height:40px;display:flex;border-bottom:1px solid #dadce0;background:#f5f5f5;`;
    this.elementContainer.appendChild(this.tabContainer);

    /**
     * 创建tab页内容容器
     * 用于放置各个tab页对应的内容区域
     * 高度为总高度减去tab标签高度(40px)
     */
    this.tabContentContainer = document.createElement('div');
    this.tabContentContainer.className = 'tabContentContainer';
    this.tabContentContainer.style.cssText = `width:100%;height:calc(100% - 40px);position:relative;`;
    this.elementContainer.appendChild(this.tabContentContainer);

    /**
     * 定义三个tab页的配置信息
     * - components: 元件库tab页，默认激活，包含组件分类菜单和组件面板
     * - gallery: 图库tab页，暂未开发，显示占位内容
     * - templates: 模板库tab页，暂未开发，显示占位内容
     */
    this.tabs = [
        { id: 'components', name: '元件库', active: true },
        { id: 'gallery', name: '图库', active: false },
        { id: 'templates', name: '模板库', active: false }
    ];

    // 初始化tab页UI和事件绑定
    this.initTabs();

    /**
     * 创建元件库tab页的主要内容容器
     * 采用左右分栏布局：左侧为组件分类目录菜单，右侧为具体组件面板
     * 只有在元件库tab页激活时才显示此容器
     */
    this.componentsContent = document.createElement('div');
    this.componentsContent.className = 'componentsContent';
    this.componentsContent.style.cssText = `width:100%;height:100%;display:flex;flex-direction:row;`;
    this.tabContentContainer.appendChild(this.componentsContent);

    /**
     * 创建组件分类目录菜单容器
     * 位于元件库tab页的左侧，宽度固定80px
     * 用于显示各种组件分类的图标和名称（如自定义组件、大屏组件、控制组件等）
     * 用户点击不同分类可切换右侧显示的具体组件
     */
    this.menuContainer = document.createElement('div');
    this.menuContainer.className = 'menuContainer';
    this.menuContainer.style.cssText = `width:80px;display:flex;flex-direction: column;height: 100%;`;
    this.componentsContent.appendChild(this.menuContainer);

    /**
     * 创建组件面板的根容器
     * 位于元件库tab页的右侧，宽度为剩余空间(总宽度-80px)
     * 用于显示当前选中分类下的具体组件列表
     * 支持垂直滚动以容纳大量组件
     */
    this.elementRoot = document.createElement('div');
    this.elementRoot.className = 'elementRoot';
    this.elementRoot.style.cssText = `width:calc(100% - 80px);height:100%;overflow-y: scroll;display:block;margin-top:5px;`;

    this.componentsContent.appendChild(this.elementRoot);

    /**
     * 创建组件面板的内容容器
     * 用于动态加载和显示具体的组件项
     * 采用垂直布局，每个组件分组作为一个独立的面板
     */
    this.elementPanel = document.createElement('div');
    this.elementPanel.className = 'elementPanel';
    this.elementPanel.style.cssText = `display:flex;flex-direction:column;`;
    this.elementRoot.appendChild(this.elementPanel);

    /**
     * 图库tab页的内容容器
     */
    this.galleryRoot = document.createElement('div');
    this.galleryRoot.className = 'galleryRoot';
    this.galleryRoot.style.cssText = `width:100%;height:100%;display:none;flex-direction:row;`;
    this.tabContentContainer.appendChild(this.galleryRoot);

    /**
     * 创建图库分类目录菜单容器
     * 位于图库tab页的左侧，宽度固定80px
     * 用于显示各种图库分类的图标和名称
     */
    this.galleryMenuContainer = document.createElement('div');
    this.galleryMenuContainer.className = 'galleryMenuContainer';
    this.galleryMenuContainer.style.cssText = `width:80px;display:flex;flex-direction: column;height: 100%;`;
    this.galleryRoot.appendChild(this.galleryMenuContainer);

    /**
     * 创建图库面板的根容器
     * 位于图库tab页的右侧，宽度为剩余空间(总宽度-80px)
     * 用于显示当前选中分类下的具体图库内容
     */
    this.galleryElementRoot = document.createElement('div');
    this.galleryElementRoot.className = 'galleryElementRoot';
    this.galleryElementRoot.style.cssText = `width:calc(100% - 80px);height:100%;overflow-y: scroll;display:block;`;
    this.galleryRoot.appendChild(this.galleryElementRoot);

    /**
     * 创建图库面板的内容容器
     * 用于动态加载和显示具体的图库项
     */
    this.galleryElementPanel = document.createElement('div');
    this.galleryElementPanel.className = 'galleryElementPanel';
    this.galleryElementPanel.style.cssText = `display:flex;flex-direction:column;`;
    this.galleryElementRoot.appendChild(this.galleryElementPanel);

    /**
     * 模板库tab页的内容容器
     */
    this.templatesRoot = document.createElement('div');
    this.templatesRoot.className = 'templatesRoot';
    this.templatesRoot.style.cssText = `width:100%;height:100%;overflow-y: scroll;display:none;padding:0px;`;

    // 创建模板库的内容容器
    const templateContent = document.createElement('div');
    templateContent.style.cssText = 'width:100%;height:100%;';

    // 创建模板库列表容器
    const templateLibraryContainer = document.createElement('div');
    templateLibraryContainer.style.cssText = 'width:100%;margin-bottom:30px;';

    // 创建模板库列表容器
    this.templateLibraryList = document.createElement('div');
    this.templateLibraryList.style.cssText = 'width:100%;';
    templateLibraryContainer.appendChild(this.templateLibraryList);

    templateContent.appendChild(templateLibraryContainer);

    // 初始化模板库数据
    this.initTemplateLibrary();





    this.templatesRoot.appendChild(templateContent);
    this.tabContentContainer.appendChild(this.templatesRoot);

    this.pointerUpHandler = mxUtils.bind(this, function () {
        if (this.tooltipCloseImage == null || this.tooltipCloseImage.style.display == 'none') {
            this.showTooltips = true;
            this.hideTooltip();
        }
    });

    mxEvent.addListener(document, (mxClient.IS_POINTER) ? 'pointerup' : 'mouseup', this.pointerUpHandler);

    this.pointerDownHandler = mxUtils.bind(this, function () {
        if (this.tooltipCloseImage == null || this.tooltipCloseImage.style.display == 'none') {
            this.showTooltips = false;
            this.hideTooltip();
        }
    });

    mxEvent.addListener(document, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown', this.pointerDownHandler);

    this.pointerMoveHandler = mxUtils.bind(this, function (evt) {
        if (Date.now() - this.lastCreated > 300 && (this.tooltipCloseImage == null ||
            this.tooltipCloseImage.style.display == 'none')) {
            var src = mxEvent.getSource(evt);
            while (src != null) {
                if (src == this.currentElt) {
                    return;
                }
                src = src.parentNode;
            }
            this.hideTooltip();
        }
    });

    mxEvent.addListener(document, (mxClient.IS_POINTER) ? 'pointermove' : 'mousemove', this.pointerMoveHandler);
    this.pointerOutHandler = mxUtils.bind(this, function (evt) {
        if (evt.toElement == null && evt.relatedTarget == null) {
            this.hideTooltip();
        }
    });

    mxEvent.addListener(document, (mxClient.IS_POINTER) ? 'pointerout' : 'mouseout', this.pointerOutHandler);

    mxEvent.addListener(this.container, 'scroll', mxUtils.bind(this, function () {
        this.showTooltips = true;
        this.hideTooltip();
    }));

    this.initCategoryMenus();

};

/**
 * 初始化tab页标签和交互功能
 * 为每个tab页创建对应的标签元素，并绑定点击和悬停事件
 * 根据tab页的激活状态设置不同的样式效果
 */
Sidebar.prototype.initTabs = function () {
    // 遍历所有tab页配置，为每个tab创建对应的标签元素
    this.tabs.forEach((tab, index) => {
        // 创建单个tab标签元素
        let tabItem = document.createElement('div');
        tabItem.className = 'tabItem';
        // 设置data属性用于后续查找和操作
        tabItem.setAttribute('data-tab-id', tab.id);

        // 设置tab标签的样式
        // flex: 1 使三个tab平均分配宽度
        // 根据激活状态设置不同的颜色和边框
        tabItem.style.cssText = `
            flex: 1;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
            color: ${tab.active ? '#00aaff' : '#666'};
            background: ${tab.active ? '#fff' : 'transparent'};
            border-bottom: ${tab.active ? '2px solid #00aaff' : '2px solid transparent'};
            transition: all 0.3s ease;
        `;
        // 设置tab标签显示的文本
        tabItem.innerText = tab.name;

        /**
         * 绑定tab标签点击事件
         * 点击时调用switchTab方法切换到对应的tab页
         */
        mxEvent.addListener(tabItem, 'click', mxUtils.bind(this, function (evt) {
            this.switchTab(tab.id);
        }));

        /**
         * 绑定鼠标悬停进入事件
         * 非激活状态的tab在鼠标悬停时显示浅灰色背景
         */
        mxEvent.addListener(tabItem, 'mouseenter', function (evt) {
            if (!tab.active) {
                tabItem.style.background = '#f0f0f0';
            }
        });

        /**
         * 绑定鼠标悬停离开事件
         * 非激活状态的tab在鼠标离开时恢复透明背景
         */
        mxEvent.addListener(tabItem, 'mouseleave', function (evt) {
            if (!tab.active) {
                tabItem.style.background = 'transparent';
            }
        });

        // 将创建的tab标签添加到tab容器中
        this.tabContainer.appendChild(tabItem);
    });
};

/**
 * 切换tab页功能
 * 根据传入的tabId切换到对应的tab页，同时更新标签样式和内容显示
 * @param {string} tabId - 要切换到的tab页ID（'components'、'gallery'、'templates'）
 */
Sidebar.prototype.switchTab = function (tabId) {
    /**
     * 更新所有tab标签的激活状态和样式
     * 遍历所有tab配置，将目标tab设为激活状态，其他tab设为非激活状态
     */
    this.tabs.forEach(tab => {
        // 更新tab配置中的激活状态
        tab.active = (tab.id === tabId);

        // 根据tab ID查找对应的DOM元素
        let tabItem = this.tabContainer.querySelector(`[data-tab-id="${tab.id}"]`);
        if (tabItem) {
            // 根据激活状态更新tab标签的视觉样式
            // 激活状态：蓝色文字、白色背景、蓝色底边框
            // 非激活状态：灰色文字、透明背景、透明底边框
            tabItem.style.color = tab.active ? '#00aaff' : '#666';
            tabItem.style.background = tab.active ? '#fff' : 'transparent';
            tabItem.style.borderBottom = tab.active ? '2px solid #00aaff' : '2px solid transparent';
        }
    });

    /**
     * 切换tab页内容的显示状态
     * 根据当前激活的tab ID显示对应的内容容器，隐藏其他内容容器
     */
    // 元件库tab页：显示组件分类菜单和组件面板（flex布局）
    this.componentsContent.style.display = (tabId === 'components') ? 'flex' : 'none';
    // 图库tab页：显示图库分类菜单和图库面板（flex布局）
    this.galleryRoot.style.display = (tabId === 'gallery') ? 'flex' : 'none';

    // 如果切换到图库tab页且还未初始化，则初始化图库菜单
    if (tabId === 'gallery' && !this.galleryInitialized) {
        this.initGalleryMenus();
        this.galleryInitialized = true;
    }
    // 模板库tab页：显示模板库占位内容（block布局）
    this.templatesRoot.style.display = (tabId === 'templates') ? 'block' : 'none';
};

Sidebar.prototype.usrDialogImages = ['usrSwitch:addUsrSwitchPalette', 'usrLight:addUsrLightPalette', 'usrFengji:addUsrFengjiPalette', 'usrGuandao:addUsrGuandaoPalette', 'usrGuantijiaoban:addUsrGuantijiaobanPalette', 'usrLengreyuan:addUsrLengreyuanPalette', 'usrJipaishui:addUsrJipaishuiPalette', 'usrSongpaifeng:addUsrSongpaifengPalette', 'usrGelan:addUsrGelanPalette', 'usrGuolu:addUsrGuoluPalette', 'usrJiareyuan:addUsrJiareyuanPalette', 'usrLiuliangji:addUsrLiuliangjiPalette', 'usrYibiao:addUsrYibiaoPalette', 'usrZhichengjiare:addUsrZhichengjiarePalette', 'usrZhichenglengque:addUsrZhichenglengquePalette', 'usrJiexiantu:addUsrJiexiantuPalette', 'usrDianLi:addUsrDianLiPalette', 'usrErchenchi:addUsrErchenchiPalette'];
Sidebar.prototype.enableTooltips = true;
Sidebar.prototype.tooltipBorder = 16;
Sidebar.prototype.tooltipDelay = 300;
Sidebar.prototype.dropTargetDelay = 200;
Sidebar.prototype.thumbWidth = 42;
Sidebar.prototype.thumbHeight = 42;
Sidebar.prototype.minThumbStrokeWidth = 1;
Sidebar.prototype.thumbAntiAlias = false;
Sidebar.prototype.thumbBorder = 2;
Sidebar.prototype.moreShapesHeight = 52;
Sidebar.prototype.livePreview = true;
Sidebar.prototype.sidebarTitleSize = 8;
Sidebar.prototype.sidebarTitles = false;
Sidebar.prototype.tooltipTitles = true;
Sidebar.prototype.maxTooltipWidth = 400;
Sidebar.prototype.maxTooltipHeight = 400;
Sidebar.prototype.addStencilsToIndex = true;
Sidebar.prototype.defaultImageWidth = 80;
Sidebar.prototype.defaultImageHeight = 80;
Sidebar.prototype.tooltipMouseDown = null;
Sidebar.prototype.collapsedImage = collapsedImage;
Sidebar.prototype.expandedImage = expandedImage;
Sidebar.prototype.searchImage = searchImage;
Sidebar.prototype.dragPreviewBorder = '1px dashed black';

Sidebar.prototype.gearImage = Gear_128x128;
Sidebar.prototype.thumbPadding = 1;

Sidebar.prototype.cisco = ['Buildings', 'Computers and Peripherals', 'Controllers and Modules', 'Directors', 'Hubs and Gateways', 'Misc',
    'Modems and Phones', 'People', 'Routers', 'Security', 'Servers', 'Storage', 'Switches', 'Wireless'];

Sidebar.prototype.cisco19 = ['LAN Switching', 'Routing WAN', 'Network Management', 'Data Center', 'Wireless LAN', 'Collaboration', 'Security Clouds Connectors', 'Endpoint Client Device Icons', 'DNA SD Access', 'SD WAN Viptela', 'ETA Stealthwatch', 'SAFE'];

Sidebar.prototype.cisco_safe = ['Architecture', 'Business Icons', 'Capability', 'Design', 'IoT Things Icons', 'People Places Things Icons', 'Security Icons', 'Technology Icons', 'Threat'];


Sidebar.prototype.addUsrErchenchiPaletteWithConfig = function () {
    this.addUsrErchenchiPalette(true, false, true);
};

Sidebar.prototype.addUsrTextMonitorPalette = function (expand) {
    var sb = this;
    var s = 'shape=label;rounded=1;fillColor=rgba(0,0,255,0.3);strokeColor=none;fontColor=#FFFFFF;align=left;verticalAlign=top;spacing=10;html=1;whiteSpace=wrap;overflow=hidden;rcDprop=textMonitorValues;';
    var w = 240;
    var h = 150;
    var content = '回流污泥流量: 0.00 m³/h\n剩余污泥流量: 0.00 m³/h\n剩余污泥流量累计: 0.00 m³/h\n污泥泵池液位: 0.00 m';
    var title = '多变量文本';

    var fns = [
        sb.addEntry(title, function () {
            var cell = new mxCell(content, new mxGeometry(0, 0, w, h), s);
            cell.vertex = true;
            return sb.createVertexTemplateFromCells([cell], w, h, title);
        }, sb.createVertexTemplateFromCells([
            new mxCell(content, new mxGeometry(0, 0, w, h), s)
        ], w, h, title))
    ];

    this.addPaletteFunctions('usrTextMonitor', '文本组件', expand, fns);
};

Sidebar.prototype.categoryMenus = [
    // {
    //     id: 6,
    //     name: '网络图标',
    //     defaultSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_network_default.svg'),
    //     checkedSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_network_check.svg'),
    //     checked: false,
    //     //'addSalesforceProductPalette', 'addAWS3Palette', 'addAWS4bPalette', 'addAWS4Palette',
    //     funcNames: [
    //         'addClipartComputerPalette', 'addClipartFinancePalette', 'addClipartVariousPalette', 'addClipartPeoplePalette',
    //         'addClipartTelecommunicationPalette', 'addActiveDirectoryPalette', 'addKubernetesPalette',
    //         'addSalesforcePlatformPalette', 'addSalesforceIndustryPalette',
    //         'addAlliedTelesisPalette', 'addAWS3DPalette',
    //         'addAzurePalette', 'addAzure2Palette', 'addMSCAEPalette',
    //     ],
    // },

    // {
    //     id: 5,
    //     name: '我的收藏',
    //     defaultSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_collection_default.svg'),
    //     checkedSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_collection_check.svg'),
    //     checked: false,
    //     funcNames: ['addCollectPalette'],
    // },
    {
        id: 4,
        name: '控制组件',
        defaultSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_control_default.svg'),
        checkedSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_control_check.svg'),
        checked: false,
        funcNames: ['addCustomStateImagePalette', 'addCustomSpecialEffectsPalette'],
    },
    {
        id: 10,
        name: '控制面板',
        defaultSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_control_default.svg'),
        checkedSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_control_check.svg'),
        checked: false,
        funcNames: ['addControlPanelPalette'],
    },
    {
        id: 8,
        name: '自定义组件',
        defaultSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_custom_default.svg'),
        checkedSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_custom_check.svg'),
        checked: false,
        funcNames: ['addCustomStatisticPaletteByron', 'addUsrErchenchiPaletteWithConfig', 'addUsrTextMonitorPalette'],
    },
    {
        id: 3,
        name: '大屏组件',
        defaultSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_datas_default.svg'),
        checkedSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_datas_check.svg'),
        checked: false,
        funcNames: ['addDatavBorderboxPalette', 'addDatavDecorationPalette',
            'addCustomStatistic1Palette', 'addCustomStatistic2Palette',
            'addCustomStatistic3Palette',
            'addCustomStatisticRadarPalette',
            'addCustomStatisticBoxplotPalette',
            'addCustomStatisticFunnelPalette',
            'addCustomStatisticGaugePalette',
            'addCustomStatistic4PaletteOther',
            'addCustomStatisticPaletteOther',
            'addAlarmTablePalette'],
    },
    {
        id: 2,
        name: '系统内置',
        defaultSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_extend_default.svg'),
        checkedSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_extend_check.svg'),
        checked: false,
        funcNames: [
            'addBasicPalette', 'addGeneralPalette',
            'addUsrJiexiantuPalette', 'addUsrDianLiPalette', 'addElectricalPalette',
            'addMiscPalette', 'addAdvancedPalette', 'addArrows2Palette', 'addFlowchartPalette', 'addErPalette',
            'addUml25Palette', 'addUmlPalette', 'addInfographicPalette', 'addCabinetsPalette', 'addFloorplanPalette',
            'addFluidPowerPalette', 'addPidPalette', 'addSignsPalette', 'addClipartComputerPalette', 'addClipartFinancePalette',
            'addClipartVariousPalette', 'addClipartPeoplePalette', 'addClipartTelecommunicationPalette', 'addActiveDirectoryPalette',
            'addKubernetesPalette', 'addSalesforcePlatformPalette', 'addSalesforceIndustryPalette', 'addAlliedTelesisPalette',
            'addAWS3DPalette', 'addAzurePalette', 'addAzure2Palette', 'addMSCAEPalette',
        ],
    },
    {
        id: 9,
        name: '3D组件',
        defaultSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_control_default.svg'),
        checkedSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_control_check.svg'),
        checked: false,
        funcNames: ['add3D'],
    },
    {
        id: 11,
        name: '图表组件',
        defaultSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_datas_default.svg'),
        checkedSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_datas_check.svg'),
        checked: false,
        funcNames: ['addChartComponentsPalette'],
    },
];

Sidebar.prototype.initCategoryMenus = function () {
    this.categoryMenus.map((item, index) => {
        let menuItemDiv = document.createElement('div');
        menuItemDiv.setAttribute('id', `category_menu_item_${item.id}`);
        menuItemDiv.style.cssText = `display:flex;flex-direction: column;width:100%;height:70px;align-items: center;justify-content: center;background:${item.checked ? '#FFFFFF' : 'none'};border-left: ${item.checked ? '2px solid #00aaff' : '2px solid transparent'};`;
        let menuItemIcon = document.createElement('img');
        menuItemIcon.setAttribute('id', `category_menu_item_icon_${item.id}`);
        menuItemIcon.src = item.checked ? item.checkedSrc : item.defaultSrc;
        menuItemIcon.style.cssText = `width: 24px;height: 24px;`;
        let menuItemLabel = document.createElement('div');
        menuItemLabel.innerText = item.name;
        menuItemLabel.setAttribute('id', `category_menu_item_label_${item.id}`);
        menuItemLabel.style.cssText = `margin-top: 6px;font-size: 12px;color: ${item.checked ? '#00aaff' : '#333333'};`;
        menuItemDiv.appendChild(menuItemIcon);
        menuItemDiv.appendChild(menuItemLabel);
        this.menuContainer.appendChild(menuItemDiv);
        mxEvent.addListener(menuItemDiv, 'click', mxUtils.bind(this, function (evt) {
            this.onCategoryMenuItemClick(item);
        }))
    });
    setTimeout(() => {
        this.onCategoryMenuItemClick(this.categoryMenus[0]);
    }, 300);
};

/**
 * 初始化图库菜单
 * 包含系统图元和从API获取的其他图库分类
 */
Sidebar.prototype.initGalleryMenus = function () {

    // 初始化空的图库菜单数组
    this.galleryMenus = [];

    // 首先添加系统图元
    this.galleryMenus.push({
        id: 1,
        name: '系统图元',
        defaultSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_basic_default.svg'),
        checkedSrc: mxUtils.staticImg('/rcscada/menu/ic_menu_basic_check.svg'),
        checked: false,
        funcNames: [
            'addSwitchImagesPalette', 'addUsrLightPalette', 'addUsrFengjiPalette', 'addUsrGuandaoPalette',
            'addUsrGuantijiaobanPalette', 'addUsrLengreyuanPalette', 'addUsrJipaishuiPalette', 'addUsrSongpaifengPalette',
            'addUsrGelanPalette', 'addUsrGuoluPalette', 'addUsrJiareyuanPalette', 'addUsrLiuliangjiPalette',
            'addUsrYibiaoPalette', 'addUsrZhichengjiarePalette', 'addUsrZhichenglengquePalette',
            'addUsrZhinengyibiaoPalette',
        ],
    });

    api.getFolderList().then(res => {
        // 添加从API获取的其他图库分类
        res.result.forEach((item) => {
            this.galleryMenus.push(item)
        })
        this.galleryMenus.map((item, index) => {

            let menuItemDiv = document.createElement('div');
            menuItemDiv.setAttribute('id', `gallery_menu_item_${item.id}`);
            menuItemDiv.style.cssText = `display:flex;flex-direction: column;width:100%;height:70px;align-items: center;justify-content: center;background:${item.checked ? '#FFFFFF' : 'none'};border-left: ${item.checked ? '2px solid #00aaff' : '2px solid transparent'};`;
            let menuItemIcon = document.createElement('img');
            menuItemIcon.setAttribute('id', `gallery_menu_item_icon_${item.id}`);
            menuItemIcon.src = item.checked ? item.checkedSrc : item.defaultSrc;
            menuItemIcon.style.cssText = `width: 24px;height: 24px;`;
            let menuItemLabel = document.createElement('div');
            menuItemLabel.innerText = item.name;
            menuItemLabel.setAttribute('id', `gallery_menu_item_label_${item.id}`);
            menuItemLabel.style.cssText = `margin-top: 6px;font-size: 12px;color: ${item.checked ? '#00aaff' : '#333333'};`;
            menuItemDiv.appendChild(menuItemIcon);
            menuItemDiv.appendChild(menuItemLabel);
            this.galleryMenuContainer.appendChild(menuItemDiv);
            mxEvent.addListener(menuItemDiv, 'click', mxUtils.bind(this, function (evt) {
                console.log('点击了图库菜单', item, index);
                this.onGalleryMenuItemClick(item);
            }))
            if (index === 0) {
                setTimeout(() => {
                    this.onGalleryMenuItemClick(item);
                }, 300);
            }
        });
    })

};

Sidebar.prototype.onCategoryMenuItemClick = function (item) {
    if (item.checked) return;
    this.categoryMenus = this.categoryMenus.map((obj, index) => {
        if (obj.checked && obj.id !== item.id) {
            obj.checked = false;
            let menuItemDiv = document.getElementById(`category_menu_item_${obj.id}`);
            menuItemDiv.style.borderLeft = '2px solid transparent';
            let menuItemIcon = document.getElementById(`category_menu_item_icon_${obj.id}`);
            menuItemIcon.src = obj.defaultSrc;
            let menuItemLabel = document.getElementById(`category_menu_item_label_${obj.id}`);
            menuItemLabel.style.color = '#333333';
        }
        if (obj.id === item.id) obj.checked = true;
        return obj;
    });
    try {
        let menuItemIcon = document.getElementById(`category_menu_item_icon_${item.id}`);
        menuItemIcon.src = item.checkedSrc;
        let menuItemLabel = document.getElementById(`category_menu_item_label_${item.id}`);
        menuItemLabel.style.color = '#00aaff';
        let menuItemDiv = document.getElementById(`category_menu_item_${item.id}`);
        menuItemDiv.style.borderLeft = '2px solid #00aaff';
        this.handleCheckCategoryMenu(item);
    } catch (e) {
        console.log(e);
    }
};

Sidebar.prototype.handleCheckCategoryMenu = function (item) {
    while (this.elementPanel.firstChild) {
        this.elementPanel.removeChild(this.elementPanel.firstChild);
    }
    if (item.hasOwnProperty('children')) {
        if (item.children.length > 0) {

            item.children.forEach((x, index) => {
                const fns = [];
                let defaultImg;
                let s;
                x.photo.forEach(y => {
                    defaultImg = y.path
                    s = `shape=mxgraph.rc.singleImage;igDprop=commonStrokeColor;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;title=${y.title};imgUrl=${defaultImg};opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
                    fns.push(this.createVertexTemplateEntry(s, 160, 160, '', y.title, true, '', '', mxUtils.fixImg(defaultImg), ''));
                })
                if (index === 0) {
                    this.addPaletteFunctions(x.id, x.name, true, fns);

                } else {
                    this.addPaletteFunctions(x.id, x.name, false, fns);
                }
            })
        }
        // const fns = [];
        // let defaultImg = `/rcscada/menu/ic_menu_blaze.png`;
        // let s = `shape=mxgraph.rc.mxRc_blazeSpecialEffects;readonly=1;rcSprop=blazeColor,blazeSize,blazeLevel;blazeColor=#d7cece;blazeSize=20;blazeLevel=1;igBackground=1;igStroke=1;igRound=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;title=沸腾特效;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        // fns.push(this.createVertexTemplateEntry(s, 150, 150, '', '沸腾特效', true, '', '', mxUtils.staticImg(defaultImg), ''));
        // this.addPaletteFunctions('mxRc_SpecialEffects', '特效图元', false, fns);
    } else if (item.funcNames && item.funcNames.length > 0) {
        item.funcNames.map((item, i) => {
            setTimeout(() => {
                if (i === 0) {
                    this[item](true);
                } else {
                    this[item](false);
                }
            }, i);
        });
    }
};

/**
 * 图库菜单项点击事件处理
 * 与元件库菜单点击逻辑相同，但操作图库相关的DOM元素
 */
Sidebar.prototype.onGalleryMenuItemClick = function (item) {
    console.log('itemitemitemitemitemitemitemitemitemitemitemitemitemitem', item);

    if (item.checked) return;
    this.galleryMenus = this.galleryMenus.map((obj, index) => {
        if (obj.checked && obj.id !== item.id) {
            obj.checked = false;
            let menuItemDiv = document.getElementById(`gallery_menu_item_${obj.id}`);
            menuItemDiv.style.borderLeft = '2px solid transparent';
            let menuItemIcon = document.getElementById(`gallery_menu_item_icon_${obj.id}`);
            menuItemIcon.src = obj.defaultSrc;
            let menuItemLabel = document.getElementById(`gallery_menu_item_label_${obj.id}`);
            menuItemLabel.style.color = '#333333';
        }
        if (obj.id === item.id) obj.checked = true;
        return obj;
    });
    try {
        let menuItemIcon = document.getElementById(`gallery_menu_item_icon_${item.id}`);
        menuItemIcon.src = item.checkedSrc;
        let menuItemLabel = document.getElementById(`gallery_menu_item_label_${item.id}`);
        menuItemLabel.style.color = '#00aaff';
        let menuItemDiv = document.getElementById(`gallery_menu_item_${item.id}`);
        menuItemDiv.style.borderLeft = '2px solid #00aaff';
        this.handleCheckGalleryMenu(item);
    } catch (e) {
        console.log(e);
    }
};

/**
 * 处理图库菜单选中事件
 * 与元件库的处理逻辑相同，但渲染到图库面板中
 */
Sidebar.prototype.handleCheckGalleryMenu = function (item) {

    while (this.galleryElementPanel.firstChild) {
        this.galleryElementPanel.removeChild(this.galleryElementPanel.firstChild);
    }
    if (item.hasOwnProperty('children')) {
        if (item.children.length > 0) {
            item.children.forEach((x, index) => {
                const fns = [];
                let defaultImg;
                let s;
                x.photo.forEach((y, photoIndex) => {
                    defaultImg = y.path
                    s = `shape=mxgraph.rc.singleImage;igDprop=commonStrokeColor;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;title=${y.title};imgUrl=${defaultImg};opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
                    fns.push(this.createVertexTemplateEntry(s, 160, 160, '', y.title, true, '', '', mxUtils.fixImg(defaultImg), ''));
                })
                if (index === 0) {
                    this.addGalleryPaletteFunctions(x.id, x.name, true, fns);
                } else {
                    this.addGalleryPaletteFunctions(x.id, x.name, false, fns);
                }
            })
        }
    } else if (item.funcNames && item.funcNames.length > 0) {

        item.funcNames.map((funcName, i) => {
            setTimeout(() => {
                if (i === 0) {
                    this[funcName](true, true);
                } else {
                    this[funcName](false, true);
                }
            }, i);
        });
    }
};

Sidebar.createCustomerNode = function (elementName, attributes) {
    const node = mxUtils.createXmlDocument().createElement(elementName);
    if (attributes) {
        Object.entries(attributes).map((item) => {
            node.setAttribute(item[0], item[1]);
        });
    }
    return node;
};

Sidebar.prototype.createCustomerNode = function (elementName, attributes) {
    return Sidebar.createCustomerNode(elementName, attributes);
};


/*Sidebar.prototype.getTooltipOffset = function () {
    return new mxPoint(0, 0);
};*/

Sidebar.prototype.createTooltip = function (elt, cells, w, h, title, showLabel, off, maxSize, mouseDown, closable, applyAllStyles, thumbImg) {
    applyAllStyles = (applyAllStyles != null) ? applyAllStyles : true;
    this.tooltipMouseDown = mouseDown;
    if (this.tooltip != null) {
        document.body.removeChild(this.tooltip);
        this.tooltip = null;
    }
    if (this.tooltip == null) {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'geSidebarTooltip';
        this.tooltip.style.userSelect = 'none';
        this.tooltip.style.zIndex = mxPopupMenu.prototype.zIndex - 1;
        document.body.appendChild(this.tooltip);
        mxEvent.addMouseWheelListener(mxUtils.bind(this, function (evt) {
            this.hideTooltip();
        }), this.tooltip);
        if (mxUtils.isNullOrUndefined(thumbImg)) {
            this.graph2 = new Graph(this.tooltip, null, null, this.editorUi.editor.graph.getStylesheet());
            this.graph2.isTooltip = true
            this.graph2.shapeBackgroundColor = 'transparent';
            this.graph2.resetViewOnRootChange = false;
            this.graph2.foldingEnabled = false;
            this.graph2.gridEnabled = false;
            this.graph2.autoScroll = false;
            this.graph2.setTooltips(false);
            this.graph2.setConnectable(false);
            this.graph2.setPanning(false);
            this.graph2.setEnabled(false);
            this.graph2.openLink = mxUtils.bind(this, function () {
                this.hideTooltip();
            });
            mxEvent.addGestureListeners(this.tooltip, mxUtils.bind(this, function (evt) {
                if (this.tooltipMouseDown != null) {
                    this.tooltipMouseDown(evt);
                }

                window.setTimeout(mxUtils.bind(this, function () {
                    if (this.tooltipCloseImage == null || this.tooltipCloseImage.style.display == 'none') {
                        this.hideTooltip();
                    }
                }), 0);
            }), null, mxUtils.bind(this, function (evt) {
                this.hideTooltip();
            }));

            if (!mxClient.IS_SVG) {
                this.graph2.view.canvas.style.position = 'relative';
            }
        } else {
            let thumb = document.createElement('img');
            thumb.src = thumbImg;
            thumb.style.cssText = `width: ${Math.min(w, this.maxTooltipWidth)}px;height:${Math.min(h, this.maxTooltipHeight)}px;`;
            this.tooltip.appendChild(thumb);
        }
        var close = document.createElement('img');
        close.setAttribute('src', Dialog.prototype.closeImage);
        close.setAttribute('title', mxResources.get('close'));
        close.style.position = 'absolute';
        close.style.cursor = 'default';
        close.style.padding = '8px';
        close.style.right = '2px';
        close.style.top = '2px';
        this.tooltip.appendChild(close);
        this.tooltipCloseImage = close;

        mxEvent.addListener(close, 'click', mxUtils.bind(this, function (evt) {
            this.hideTooltip();
            mxEvent.consume(evt);
        }));
    }
    this.tooltipCloseImage.style.display = (closable) ? '' : 'none';
    if (mxUtils.isNullOrUndefined(thumbImg)) {
        this.graph2.model.clear();
        this.graph2.view.setTranslate(this.tooltipBorder, this.tooltipBorder);
        if (!maxSize && (w > this.maxTooltipWidth || h > this.maxTooltipHeight)) {
            this.graph2.view.scale = Math.round(Math.min(this.maxTooltipWidth / w, this.maxTooltipHeight / h) * 100) / 100;
        } else {
            this.graph2.view.scale = 1;
        }
        this.tooltip.style.display = 'block';
        this.graph2.labelsVisible = (showLabel == null || showLabel);
        var fo = mxClient.NO_FO;
        mxClient.NO_FO = Editor.prototype.originalNoForeignObject;
        var style = mxUtils.getCurrentStyle(this.tooltip);
        this.graph2.shapeBackgroundColor = style.backgroundColor;
        if (cells != null) {
            var temp = this.graph2.cloneCells(cells);
            this.editorUi.insertHandler(temp, null, this.graph2.model,
                (!applyAllStyles) ? this.editorUi.editor.graph.defaultVertexStyle : null,
                (!applyAllStyles) ? this.editorUi.editor.graph.defaultEdgeStyle : null,
                applyAllStyles, true);
            this.graph2.addCells(temp);
        }
        mxClient.NO_FO = fo;
        var bounds = this.graph2.getGraphBounds();
        if (maxSize && w > 0 && h > 0 && (bounds.width > w || bounds.height > h)) {
            var s = Math.round(Math.min(w / bounds.width, h / bounds.height) * 100) / 100;
            if (!mxClient.NO_FO) {
                this.graph2.view.getDrawPane().ownerSVGElement.style.transform = 'scale(' + s + ')';
                this.graph2.view.getDrawPane().ownerSVGElement.style.transformOrigin = '0 0';
                bounds.width *= s;
                bounds.height *= s;
            } else {
                this.graph2.view.setScale(Math.round(Math.min(
                    this.maxTooltipWidth / bounds.width,
                    this.maxTooltipHeight / bounds.height) * 100) / 100);
                bounds = this.graph2.getGraphBounds();
            }
        } else if (!mxClient.NO_FO) {
            this.graph2.view.getDrawPane().ownerSVGElement.style.transform = '';
        }

        var width = bounds.width + 2 * this.tooltipBorder + 4;
        var height = bounds.height + 2 * this.tooltipBorder;
        this.tooltip.style.overflow = 'visible';
        this.tooltip.style.width = width + 'px';
        var w2 = width;
        if (this.tooltipTitles && title != null && title.length > 0) {
            this.tooltipTitle = document.createElement('div');
            this.tooltipTitle.style.borderTop = '1px solid gray';
            this.tooltipTitle.style.textAlign = 'center';
            this.tooltipTitle.style.width = '100%';
            this.tooltipTitle.style.overflow = 'hidden';
            this.tooltipTitle.style.position = 'absolute';
            this.tooltipTitle.style.paddingTop = '6px';
            this.tooltipTitle.style.bottom = '6px';

            this.tooltip.appendChild(this.tooltipTitle);
            this.tooltipTitle.style.display = '';
            mxUtils.write(this.tooltipTitle, title);
            w2 = Math.min(this.maxTooltipWidth, Math.max(width, this.tooltipTitle.scrollWidth + 4));
            var ddy = this.tooltipTitle.offsetHeight + 10;
            height += ddy;
            if (mxClient.IS_SVG) {
                this.tooltipTitle.style.marginTop = (2 - ddy) + 'px';
            } else {
                height -= 6;
                this.tooltipTitle.style.top = (height - ddy) + 'px';
            }
        } else if (this.tooltipTitle != null && this.tooltipTitle.parentNode != null) {
            this.tooltipTitle.style.display = 'none';
        }
        if (w2 > width) {
            this.tooltip.style.width = w2 + 'px';
        }
        this.tooltip.style.height = height + 'px';
        var x0 = -Math.round(bounds.x - this.tooltipBorder) +
            ((w2 > width) ? (w2 - width) / 2 : 0);
        var y0 = -Math.round(bounds.y - this.tooltipBorder);
        off = (off != null) ? off : this.getTooltipOffset(elt, bounds);
        var left = off.x;
        // var top = off.y;
        var rect = elt.getBoundingClientRect();
        var top = rect.y;
        if (mxClient.IS_SVG) {
            if (x0 != 0 || y0 != 0) {
                this.graph2.view.canvas.setAttribute('transform', 'translate(' + x0 + ',' + y0 + ')');
            } else {
                this.graph2.view.canvas.removeAttribute('transform');
            }
        } else {
            this.graph2.view.drawPane.style.left = x0 + 'px';
            this.graph2.view.drawPane.style.top = y0 + 'px';
        }
    } else {
        off = new mxPoint(0, 0);
        var rect = elt.getBoundingClientRect();
        var left = 310;
        var top = rect.y;
        let w1 = Math.min(w, this.maxTooltipWidth);
        let h1 = w1 * h / w;
        if (this.tooltipTitles && title != null && title.length > 0) {
            this.tooltipTitle = document.createElement('div');
            this.tooltipTitle.style.borderTop = '1px solid gray';
            this.tooltipTitle.style.textAlign = 'center';
            this.tooltipTitle.style.width = '100%';
            this.tooltipTitle.style.height = '20px';
            this.tooltipTitle.style.lineHeight = '20px';
            this.tooltipTitle.style.overflow = 'hidden';
            this.tooltipTitle.style.position = 'absolute';
            this.tooltipTitle.style.paddingTop = '6px';
            this.tooltipTitle.style.bottom = '6px';

            this.tooltip.appendChild(this.tooltipTitle);
            this.tooltipTitle.style.display = '';
            mxUtils.write(this.tooltipTitle, title);
            h1 += 40;
        }
        this.tooltip.style.display = 'block';
        this.tooltip.style.width = w1 + 'px';
        this.tooltip.style.height = h1 + 'px';
    }


    this.tooltip.style.position = 'absolute';
    this.tooltip.style.left = left + 'px';
    this.tooltip.style.top = top + 'px';
    mxUtils.fit(this.tooltip);
    this.lastCreated = Date.now();
};

Sidebar.prototype.showTooltip = function (elt, cells, w, h, title, showLabel, thumbImg) {
    if (this.enableTooltips && this.showTooltips) {
        if (this.currentElt != elt) {
            if (this.thread != null) {
                window.clearTimeout(this.thread);
                this.thread = null;
            }
            var show = mxUtils.bind(this, function () {
                this.createTooltip(elt, cells, w, h, title, showLabel, null, null, null, null, null, thumbImg);
            });

            if (this.tooltip != null && this.tooltip.style.display != 'none') {
                show();
            } else {
                this.thread = window.setTimeout(show, this.tooltipDelay);
            }

            this.currentElt = elt;
        }
    }
};

Sidebar.prototype.hideTooltip = function () {
    if (this.thread != null) {
        window.clearTimeout(this.thread);
        this.thread = null;
    }

    if (this.tooltip != null) {
        this.tooltip.style.display = 'none';
        this.currentElt = null;
    }

    this.tooltipMouseDown = null;
};

Sidebar.prototype.addDataEntry = function (tags, width, height, title, data) {
    return this.addEntry(
        tags,
        mxUtils.bind(this, function () {
            return this.createVertexTemplateFromData(data, width, height, title);
        })
    );
};

Sidebar.prototype.addEntries = function (images) {
    for (let i = 0; i < images.length; i++) {
        mxUtils.bind(this, function (img) {
            let data = img.data;
            let tags = img.title != null ? img.title : '';

            if (img.tags != null) {
                tags += ' ' + img.tags;
            }

            if (data != null && tags.length > 0) {
                this.addEntry(
                    tags,
                    mxUtils.bind(this, function () {
                        data = this.editorUi.convertDataUri(data);
                        let s = 'shape=image;verticalLabelPosition=bottom;verticalAlign=top;imageAspect=0;';

                        if (img.aspect == 'fixed') {
                            s += 'aspect=fixed;';
                        }

                        return this.createVertexTemplate(s + 'image=' + data, img.w, img.h, '', img.title || '', false, false, true);
                    })
                );
            } else if (img.xml != null && tags.length > 0) {
                this.addEntry(
                    tags,
                    mxUtils.bind(this, function () {
                        const cells = this.editorUi.stringToCells(Graph.decompress(img.xml));

                        return this.createVertexTemplateFromCells(cells, img.w, img.h, img.title || '', true, false, true);
                    })
                );
            }
        })(images[i]);
    }
};

Sidebar.prototype.addEntry = function (tags, fn) {
    if (this.taglist != null && tags != null && tags.length > 0) {
        // Replaces special characters
        const tmp = tags
            .toLowerCase()
            .replace(/[\/\,\(\)]/g, ' ')
            .split(' ');

        const doAddEntry = mxUtils.bind(this, function (tag) {
            if (tag != null && tag.length > 1) {
                let entry = this.taglist[tag];

                if (typeof entry !== 'object') {
                    entry = { entries: [], dict: new mxDictionary() };
                    this.taglist[tag] = entry;
                }

                // Ignores duplicates
                if (entry.dict.get(fn) == null) {
                    entry.dict.put(fn, fn);
                    entry.entries.push(fn);
                }
            }
        });

        for (let i = 0; i < tmp.length; i++) {
            doAddEntry(tmp[i]);

            // Adds additional entry with removed trailing numbers
            const normalized = tmp[i].replace(/\.*\d*$/, '');

            if (normalized != tmp[i]) {
                doAddEntry(normalized);
            }
        }
    }

    return fn;
};

Sidebar.prototype.filterTags = function (tags) {
    if (tags != null) {
        const arr = tags.split(' ');
        const result = [];
        const hash = {};

        // Ignores tags with leading numbers, strips trailing numbers
        for (let i = 0; i < arr.length; i++) {
            // Removes duplicates
            if (hash[arr[i]] == null) {
                hash[arr[i]] = '1';
                result.push(arr[i]);
            }
        }

        return result.join(' ');
    }

    return null;
};

Sidebar.prototype.cloneCell = function (cell, value) {
    const clone = cell.clone();

    if (value != null) {
        clone.value = value;
    }

    return clone;
};

Sidebar.prototype.createTitle = function (label) {
    var elt = document.createElement('div');
    elt.setAttribute('title', mxResources.get('sidebarTooltip'));
    elt.className = 'geTitle';
    mxUtils.write(elt, label);
    return elt;
};

Sidebar.prototype.disablePointerEvents = function (node) {
    mxUtils.visitNodes(node, mxUtils.bind(this, function (node) {
        if (node.nodeType == mxConstants.NODETYPE_ELEMENT) {
            node.style.pointerEvents = 'none';
            node.removeAttribute('pointer-events');
        }
    }));
};

Sidebar.prototype.createThumb = function (cells, width, height, parent, title, showLabel, showTitle, w, h, bg, border, scale, thumbImg, className) {
    this.graph.labelsVisible = (showLabel == null || showLabel);
    const fo = mxClient.NO_FO;
    mxClient.NO_FO = Editor.prototype.originalNoForeignObject;
    this.graph.shapeBackgroundColor = (bg != null) ? bg :
        (Editor.isDarkMode() ? '#2a252f' : '#f1f3f4');
    this.graph.view.scaleAndTranslate((scale != null) ? scale : 1, 0, 0);
    this.graph.addCells(cells);
    const bounds = this.graph.getGraphBounds();

    if (scale == null) {
        var s = Math.floor(Math.min((width - 2 * this.thumbBorder) / bounds.width,
            (height - 2 * this.thumbBorder) / bounds.height) * 100) / 100;
        this.graph.view.scaleAndTranslate(s,
            (width - bounds.width * s) / 2 / s - bounds.x,
            (height - bounds.height * s) / 2 / s - bounds.y);
    }
    let node = null;
    if (this.graph.dialect != mxConstants.DIALECT_SVG || mxClient.NO_FO) {
        node = this.graph.container.cloneNode(false);
        node.innerHTML = this.graph.container.innerHTML;
        // if (this.graph.dialect == mxConstants.DIALECT_SVG && !mxClient.NO_FO && this.graph.view.getCanvas().ownerSVGElement != null) {
    } else if (thumbImg) {
        node = document.createElement('div');
        node.className = 'single-img';
        const img = document.createElement('img');
        img.style.width = '90%';
        img.style.margin = '10% 0 0 10%';
        img.style.aspectRatio = '1';
        img.setAttribute('src', thumbImg);
        node.appendChild(img);
    } else {
        node = this.graph.view.getCanvas().ownerSVGElement.cloneNode(true);
        node.style.cssText = `left: 0px; top: 0px; width: 100%; height: 100%; display: block;`;
    }

    this.graph.getModel().clear();
    this.graph.view.scaleAndTranslate(1, 0, 0);
    this.graph.shapeBackgroundColor = (Editor.isDarkMode() ? '#2a252f' : '#f1f3f4');
    mxClient.NO_FO = fo;

    node.style.position = 'relative';
    node.style.overflow = (scale != null) ? 'visible' : 'hidden';
    node.style.left = ((border != null) ? border : this.thumbBorder) + 'px';
    node.style.top = node.style.left;
    node.style.width = width + 'px';
    node.style.height = height + 'px';
    node.style.visibility = '';
    node.style.minWidth = '';
    node.style.minHeight = '';
    this.disablePointerEvents(node);
    parent.appendChild(node);
    if (this.sidebarTitles && title != null && showTitle != false) {
        var border = 0;
        parent.style.height = (this.thumbHeight + border + this.sidebarTitleSize + 8) + 'px';
        var div = document.createElement('div');
        div.style.color = Editor.isDarkMode() ? '#A0A0A0' : '#303030';
        div.style.fontSize = this.sidebarTitleSize + 'px';
        div.style.textAlign = 'center';
        div.style.whiteSpace = 'nowrap';
        div.style.overflow = 'hidden';
        div.style.textOverflow = 'ellipsis';
        if (mxClient.IS_IE) {
            div.style.height = (this.sidebarTitleSize + 12) + 'px';
        }
        div.style.paddingTop = '4px';
        mxUtils.write(div, title);
        parent.appendChild(div);
    }

    return bounds;
};

Sidebar.prototype.createSection = function (title) {
    return mxUtils.bind(this, function () {
        var elt = document.createElement('div');
        elt.setAttribute('title', title);
        elt.style.textOverflow = 'ellipsis';
        elt.style.whiteSpace = 'nowrap';
        elt.style.textAlign = 'center';
        elt.style.overflow = 'hidden';
        elt.style.width = '100%';
        elt.style.padding = '14px 0';

        mxUtils.write(elt, title);

        return elt;
    });
};

Sidebar.prototype.createItem = function (cells, title, showLabel, showTitle, width, height, allowCellsInserted, showTooltip, clickFn, thumbWidth, thumbHeight, icon, startEditing, sourceCell, thumbImg, className) {
    showTooltip = (showTooltip != null) ? showTooltip : true;
    thumbWidth = (thumbWidth != null) ? thumbWidth : this.thumbWidth;
    thumbHeight = (thumbHeight != null) ? thumbHeight : this.thumbHeight;

    const elt = document.createElement('div');
    elt.style.cssText = `cursor: pointer;display: inline-block;background: #FFF;width: calc(calc(100% - 10px) / 4);aspect-ratio:1;overflow:hidden;margin: 0px 0px 2px 2px;vertical-align: top;`;
    mxEvent.addListener(elt, 'click', function (evt) {
        mxEvent.consume(evt);
    });
    const bounds = new mxRectangle(0, 0, width, height);
    if (cells != null && cells.length > 0) {
        var originalCells = cells;
        cells = this.graph.cloneCells(cells);
        this.editorUi.insertHandler(originalCells, null, this.graph.model,
            this.editorUi.editor.graph.defaultVertexStyle,
            this.editorUi.editor.graph.defaultEdgeStyle,
            true, true);
        if (icon != null) {
            elt.style.backgroundImage = 'url(' + icon + ')';
            elt.style.backgroundRepeat = 'no-repeat';
            elt.style.backgroundPosition = 'center';
            elt.style.backgroundSize = '24px 24px';
        } else {
            this.createThumb(originalCells, thumbWidth, thumbHeight,
                elt, title, showLabel, showTitle, width, height, null, null, null, thumbImg, className);
        }
        if (cells.length > 1 || cells[0].vertex) {
            var ds = this.createDragSource(elt, this.createDropHandler(cells, true, allowCellsInserted,
                bounds, startEditing, sourceCell), this.createDragPreview(width, height),
                cells, bounds, startEditing);
            this.addClickHandler(elt, ds, cells, clickFn, startEditing);
            ds.isGuidesEnabled = mxUtils.bind(this, function () {
                return this.editorUi.editor.graph.graphHandler.guidesEnabled;
            });
        } else if (cells[0] != null && cells[0].edge) {
            var ds = this.createDragSource(elt, this.createDropHandler(cells, false, allowCellsInserted,
                bounds, startEditing, sourceCell), this.createDragPreview(width, height),
                cells, bounds, startEditing);
            this.addClickHandler(elt, ds, cells, clickFn);
        }
    }
    if (!mxClient.IS_IOS && showTooltip) {
        mxEvent.addGestureListeners(elt, null, mxUtils.bind(this, function (evt) {
            if (mxEvent.isMouseEvent(evt)) {
                this.showTooltip(elt, cells, bounds.width, bounds.height, title, showLabel, thumbImg);
            }
        }));
    }
    return elt;
};

Sidebar.prototype.updateShapes = function (source, targets) {
    const graph = this.editorUi.editor.graph;
    const sourceCellStyle = graph.getCellStyle(source);
    const result = [];

    graph.model.beginUpdate();
    try {
        const cellStyle = graph.getModel().getStyle(source);

        // Lists the styles to carry over from the existing shape
        const styles = ['shadow', 'dashed', 'dashPattern', 'fontFamily', 'fontSize', 'fontColor', 'align', 'startFill', 'startSize', 'endFill', 'endSize', 'strokeColor', 'strokeWidth', 'fillColor', 'gradientColor', 'html', 'part', 'noEdgeStyle', 'edgeStyle', 'elbow', 'childLayout', 'recursiveResize', 'container', 'collapsible', 'connectable'];

        for (let i = 0; i < targets.length; i++) {
            const targetCell = targets[i];

            if (graph.getModel().isVertex(targetCell) == graph.getModel().isVertex(source) || graph.getModel().isEdge(targetCell) == graph.getModel().isEdge(source)) {
                const style = graph.getCurrentCellStyle(targets[i]);
                graph.getModel().setStyle(targetCell, cellStyle);

                // Removes all children of composite cells
                if (mxUtils.getValue(style, 'composite', '0') == '1') {
                    const childCount = graph.model.getChildCount(targetCell);

                    for (var j = childCount; j >= 0; j--) {
                        graph.model.remove(graph.model.getChildAt(targetCell, j));
                    }
                }

                // Replaces the participant style in the lifeline shape with the target shape
                if (style[mxConstants.STYLE_SHAPE] == 'umlLifeline' && sourceCellStyle[mxConstants.STYLE_SHAPE] != 'umlLifeline') {
                    graph.setCellStyles(mxConstants.STYLE_SHAPE, 'umlLifeline', [targetCell]);
                    graph.setCellStyles('participant', sourceCellStyle[mxConstants.STYLE_SHAPE], [targetCell]);
                }

                for (var j = 0; j < styles.length; j++) {
                    const value = style[styles[j]];

                    if (value != null) {
                        graph.setCellStyles(styles[j], value, [targetCell]);
                    }
                }

                result.push(targetCell);
            }
        }
    } finally {
        graph.model.endUpdate();
    }

    return result;
};

Sidebar.prototype.createDropHandler = function (cells, allowSplit, allowCellsInserted, bounds) {
    allowCellsInserted = allowCellsInserted != null ? allowCellsInserted : true;
    return mxUtils.bind(this, function (graph, evt, target, x, y, force) {
        let elt = force ? null : mxEvent.isTouchEvent(evt) || mxEvent.isPenEvent(evt) ? document.elementFromPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt)) : mxEvent.getSource(evt);

        while (elt != null && elt != this.container) {
            elt = elt.parentNode;
        }

        if (elt == null && graph.isEnabled()) {
            cells = graph.getImportableCells(cells);

            if (cells.length > 0) {
                graph.stopEditing();

                // Holding alt while mouse is released ignores drop target
                const validDropTarget = target != null && !mxEvent.isAltDown(evt) ? graph.isValidDropTarget(target, cells, evt) : false;
                let select = null;

                if (target != null && !validDropTarget) {
                    target = null;
                }

                if (!graph.isCellLocked(target || graph.getDefaultParent())) {
                    graph.model.beginUpdate();
                    try {
                        x = Math.round(x);
                        y = Math.round(y);

                        // Splits the target edge or inserts into target group
                        if (allowSplit && graph.isSplitTarget(target, cells, evt)) {
                            var s = graph.view.scale;
                            var tr = graph.view.translate;
                            var tx = (x + tr.x) * s;
                            var ty = (y + tr.y) * s;

                            const clones = graph.cloneCells(cells);
                            graph.splitEdge(target, clones, null, x - bounds.width / 2, y - bounds.height / 2, tx, ty);
                            select = clones;
                        } else if (cells.length > 0) {
                            select = graph.importCells(cells, x, y, target);
                        }

                        // Executes parent layout hooks for position/order
                        if (graph.layoutManager != null) {
                            const layout = graph.layoutManager.getLayout(target);

                            if (layout != null) {
                                var s = graph.view.scale;
                                var tr = graph.view.translate;
                                var tx = (x + tr.x) * s;
                                var ty = (y + tr.y) * s;

                                for (let i = 0; i < select.length; i++) {
                                    layout.moveCell(select[i], tx, ty);
                                }
                            }
                        }

                        if (allowCellsInserted && (evt == null || !mxEvent.isShiftDown(evt))) {
                            graph.fireEvent(new mxEventObject('cellsInserted', 'cells', select));
                        }
                    } catch (e) {
                        this.editorUi.handleError(e);
                    } finally {
                        graph.model.endUpdate();
                    }

                    if (select != null && select.length > 0) {
                        graph.scrollCellToVisible(select[0]);
                        graph.setSelectionCells(select);
                    }

                    if (graph.editAfterInsert && evt != null && mxEvent.isMouseEvent(evt) && select != null && select.length == 1) {
                        window.setTimeout(function () {
                            graph.startEditing(select[0]);
                        }, 0);
                    }
                }
            }

            mxEvent.consume(evt);
        }
    });
};

Sidebar.prototype.createDragPreview = function (width, height) {
    const elt = document.createElement('div');
    elt.style.border = this.dragPreviewBorder;
    elt.style.width = width + 'px';
    elt.style.height = height + 'px';
    return elt;
};

Sidebar.prototype.dropAndConnect = function (source, targets, direction, dropCellIndex, evt) {
    const geo = this.getDropAndConnectGeometry(source, targets[dropCellIndex], direction, targets);

    // Targets without the new edge for selection
    var tmp = [];

    if (geo != null) {
        const graph = this.editorUi.editor.graph;
        let editingCell = null;

        graph.model.beginUpdate();
        try {
            const sourceGeo = graph.getCellGeometry(source);
            let geo2 = graph.getCellGeometry(targets[dropCellIndex]);

            // Handles special case where target should be ignored for stack layouts
            const targetParent = graph.model.getParent(source);
            let validLayout = true;

            // Ignores parent if it has a stack layout
            if (graph.layoutManager != null) {
                const layout = graph.layoutManager.getLayout(targetParent);

                // LATER: Use parent of parent if valid layout
                if (layout != null && layout.constructor == mxStackLayout) {
                    validLayout = false;

                    var tmp = graph.view.getState(targetParent);

                    // Offsets by parent position
                    if (tmp != null) {
                        var offset = new mxPoint(tmp.x / graph.view.scale - graph.view.translate.x, tmp.y / graph.view.scale - graph.view.translate.y);
                        geo.x += offset.x;
                        geo.y += offset.y;
                        const pt = geo.getTerminalPoint(false);

                        if (pt != null) {
                            pt.x += offset.x;
                            pt.y += offset.y;
                        }
                    }
                }
            }

            let dx = geo2.x;
            let dy = geo2.y;

            // Ignores geometry of edges
            if (graph.model.isEdge(targets[dropCellIndex])) {
                dx = 0;
                dy = 0;
            }

            const useParent = graph.model.isEdge(source) || (sourceGeo != null && !sourceGeo.relative && validLayout);
            targets = graph.importCells(targets, geo.x - (useParent ? dx : 0), geo.y - (useParent ? dy : 0), useParent ? targetParent : null);
            tmp = targets;

            if (graph.model.isEdge(source)) {
                // Adds new terminal to edge
                // LATER: Push new terminal out radially from edge start point
                graph.model.setTerminal(source, targets[dropCellIndex], direction == mxConstants.DIRECTION_NORTH);
            } else if (graph.model.isEdge(targets[dropCellIndex])) {
                // Adds new outgoing connection to vertex and clears points
                graph.model.setTerminal(targets[dropCellIndex], source, true);
                const geo3 = graph.getCellGeometry(targets[dropCellIndex]);
                geo3.points = null;

                if (geo3.getTerminalPoint(false) != null) {
                    geo3.setTerminalPoint(geo.getTerminalPoint(false), false);
                } else if (useParent && graph.model.isVertex(targetParent)) {
                    // Adds parent offset to other nodes
                    const tmpState = graph.view.getState(targetParent);
                    var offset = tmpState.cell != graph.view.currentRoot ? new mxPoint(tmpState.x / graph.view.scale - graph.view.translate.x, tmpState.y / graph.view.scale - graph.view.translate.y) : new mxPoint(0, 0);

                    graph.cellsMoved(targets, offset.x, offset.y, null, null, true);
                }
            } else {
                geo2 = graph.getCellGeometry(targets[dropCellIndex]);
                dx = geo.x - Math.round(geo2.x);
                dy = geo.y - Math.round(geo2.y);
                geo.x = Math.round(geo2.x);
                geo.y = Math.round(geo2.y);
                graph.model.setGeometry(targets[dropCellIndex], geo);
                graph.cellsMoved(targets, dx, dy, null, null, true);
                tmp = targets.slice();
                editingCell = tmp.length == 1 ? tmp[0] : null;
                targets.push(graph.insertEdge(null, null, '', source, targets[dropCellIndex], graph.createCurrentEdgeStyle()));
            }

            if (evt == null || !mxEvent.isShiftDown(evt)) {
                graph.fireEvent(new mxEventObject('cellsInserted', 'cells', targets));
            }
        } catch (e) {
            this.editorUi.handleError(e);
        } finally {
            graph.model.endUpdate();
        }

        if (graph.editAfterInsert && evt != null && mxEvent.isMouseEvent(evt) && editingCell != null) {
            window.setTimeout(function () {
                graph.startEditing(editingCell);
            }, 0);
        }
    }

    return tmp;
};

Sidebar.prototype.getDropAndConnectGeometry = function (source, target, direction, targets) {
    const graph = this.editorUi.editor.graph;
    const view = graph.view;
    const keepSize = targets.length > 1;
    let geo = graph.getCellGeometry(source);
    let geo2 = graph.getCellGeometry(target);

    if (geo != null && geo2 != null) {
        geo2 = geo2.clone();

        if (graph.model.isEdge(source)) {
            var state = graph.view.getState(source);
            const pts = state.absolutePoints;
            var p0 = pts[0];
            var pe = pts[pts.length - 1];

            if (direction == mxConstants.DIRECTION_NORTH) {
                geo2.x = p0.x / view.scale - view.translate.x - geo2.width / 2;
                geo2.y = p0.y / view.scale - view.translate.y - geo2.height / 2;
            } else {
                geo2.x = pe.x / view.scale - view.translate.x - geo2.width / 2;
                geo2.y = pe.y / view.scale - view.translate.y - geo2.height / 2;
            }
        } else {
            if (geo.relative) {
                var state = graph.view.getState(source);
                geo = geo.clone();
                geo.x = (state.x - view.translate.x) / view.scale;
                geo.y = (state.y - view.translate.y) / view.scale;
            }

            let length = graph.defaultEdgeLength;

            // Maintains edge length
            if (graph.model.isEdge(target) && geo2.getTerminalPoint(true) != null && geo2.getTerminalPoint(false) != null) {
                var p0 = geo2.getTerminalPoint(true);
                var pe = geo2.getTerminalPoint(false);
                const dx = pe.x - p0.x;
                const dy = pe.y - p0.y;

                length = Math.sqrt(dx * dx + dy * dy);

                geo2.x = geo.getCenterX();
                geo2.y = geo.getCenterY();
                geo2.width = 1;
                geo2.height = 1;

                if (direction == mxConstants.DIRECTION_NORTH) {
                    geo2.height = length;
                    geo2.y = geo.y - length;
                    geo2.setTerminalPoint(new mxPoint(geo2.x, geo2.y), false);
                } else if (direction == mxConstants.DIRECTION_EAST) {
                    geo2.width = length;
                    geo2.x = geo.x + geo.width;
                    geo2.setTerminalPoint(new mxPoint(geo2.x + geo2.width, geo2.y), false);
                } else if (direction == mxConstants.DIRECTION_SOUTH) {
                    geo2.height = length;
                    geo2.y = geo.y + geo.height;
                    geo2.setTerminalPoint(new mxPoint(geo2.x, geo2.y + geo2.height), false);
                } else if (direction == mxConstants.DIRECTION_WEST) {
                    geo2.width = length;
                    geo2.x = geo.x - length;
                    geo2.setTerminalPoint(new mxPoint(geo2.x, geo2.y), false);
                }
            } else {
                // Try match size or ignore if width or height < 45 which
                // is considered special enough to be ignored here
                if (!keepSize && geo2.width > 45 && geo2.height > 45 && geo.width > 45 && geo.height > 45) {
                    geo2.width = geo2.width * (geo.height / geo2.height);
                    geo2.height = geo.height;
                }

                geo2.x = geo.x + geo.width / 2 - geo2.width / 2;
                geo2.y = geo.y + geo.height / 2 - geo2.height / 2;

                if (direction == mxConstants.DIRECTION_NORTH) {
                    geo2.y = geo2.y - geo.height / 2 - geo2.height / 2 - length;
                } else if (direction == mxConstants.DIRECTION_EAST) {
                    geo2.x = geo2.x + geo.width / 2 + geo2.width / 2 + length;
                } else if (direction == mxConstants.DIRECTION_SOUTH) {
                    geo2.y = geo2.y + geo.height / 2 + geo2.height / 2 + length;
                } else if (direction == mxConstants.DIRECTION_WEST) {
                    geo2.x = geo2.x - geo.width / 2 - geo2.width / 2 - length;
                }

                // Adds offset to match cells without connecting edge
                if (graph.model.isEdge(target) && geo2.getTerminalPoint(true) != null && target.getTerminal(false) != null) {
                    const targetGeo = graph.getCellGeometry(target.getTerminal(false));

                    if (targetGeo != null) {
                        if (direction == mxConstants.DIRECTION_NORTH) {
                            geo2.x -= targetGeo.getCenterX();
                            geo2.y -= targetGeo.getCenterY() + targetGeo.height / 2;
                        } else if (direction == mxConstants.DIRECTION_EAST) {
                            geo2.x -= targetGeo.getCenterX() - targetGeo.width / 2;
                            geo2.y -= targetGeo.getCenterY();
                        } else if (direction == mxConstants.DIRECTION_SOUTH) {
                            geo2.x -= targetGeo.getCenterX();
                            geo2.y -= targetGeo.getCenterY() - targetGeo.height / 2;
                        } else if (direction == mxConstants.DIRECTION_WEST) {
                            geo2.x -= targetGeo.getCenterX() + targetGeo.width / 2;
                            geo2.y -= targetGeo.getCenterY();
                        }
                    }
                }
            }
        }
    }

    return geo2;
};

Sidebar.prototype.isDropStyleEnabled = function (cells, firstVertex) {
    let result = true;

    if (firstVertex != null && cells.length == 1) {
        const vstyle = this.graph.getCellStyle(cells[firstVertex]);

        if (vstyle != null) {
            result = mxUtils.getValue(vstyle, mxConstants.STYLE_STROKECOLOR, mxConstants.NONE) != mxConstants.NONE || mxUtils.getValue(vstyle, mxConstants.STYLE_FILLCOLOR, mxConstants.NONE) != mxConstants.NONE;
        }
    }

    return result;
};

Sidebar.prototype.isDropStyleTargetIgnored = function (state) {
    return this.graph.isSwimlane(state.cell);
};

Sidebar.prototype.createDragSource = function (elt, dropHandler, preview, cells, bounds) {
    // Checks if the cells contain any vertices
    const ui = this.editorUi;
    const graph = ui.editor.graph;
    let freeSourceEdge = null;
    let firstVertex = null;
    const sidebar = this;

    for (let i = 0; i < cells.length; i++) {
        if (firstVertex == null && this.editorUi.editor.graph.model.isVertex(cells[i])) {
            firstVertex = i;
        } else if (freeSourceEdge == null && this.editorUi.editor.graph.model.isEdge(cells[i]) && this.editorUi.editor.graph.model.getTerminal(cells[i], true) == null) {
            freeSourceEdge = i;
        }

        if (firstVertex != null && freeSourceEdge != null) {
            break;
        }
    }

    const dropStyleEnabled = this.isDropStyleEnabled(cells, firstVertex);

    const dragSource = mxUtils.makeDraggable(
        elt,
        this.editorUi.editor.graph,
        mxUtils.bind(this, function (graph, evt) {
            if (this.updateThread != null) {
                window.clearTimeout(this.updateThread);
            }

            if (cells != null && currentStyleTarget != null && activeArrow == styleTarget) {
                const tmp = graph.isCellSelected(currentStyleTarget.cell) ? graph.getSelectionCells() : [currentStyleTarget.cell];
                const updatedCells = this.updateShapes(graph.model.isEdge(currentStyleTarget.cell) ? cells[0] : cells[firstVertex], tmp);
                graph.setSelectionCells(updatedCells);
            } else if (cells != null && activeArrow != null && currentTargetState != null && activeArrow != styleTarget) {
                const index = graph.model.isEdge(currentTargetState.cell) || freeSourceEdge == null ? firstVertex : freeSourceEdge;
                graph.setSelectionCells(this.dropAndConnect(currentTargetState.cell, cells, direction, index, evt));
            } else {
                dropHandler.apply(this, arguments);
            }

            if (this.editorUi.hoverIcons != null) {
                this.editorUi.hoverIcons.update(graph.view.getState(graph.getSelectionCell()));
            }
        }),
        preview,
        0,
        0,
        graph.autoscroll,
        true,
        true
    );

    // Stops dragging if cancel is pressed
    graph.addListener(mxEvent.ESCAPE, function () {
        if (dragSource.isActive()) {
            dragSource.reset();
        }
    });

    // Overrides mouseDown to ignore popup triggers
    const mouseDown = dragSource.mouseDown;

    dragSource.mouseDown = function (evt) {
        if (!mxEvent.isPopupTrigger(evt) && !mxEvent.isMultiTouchEvent(evt)) {
            graph.stopEditing();
            mouseDown.apply(this, arguments);
        }
    };

    // Workaround for event redirection via image tag in quirks and IE8
    function createArrow(img, tooltip) {
        let arrow = null;

        arrow = mxUtils.createImage(img.src);
        arrow.style.width = img.width + 'px';
        arrow.style.height = img.height + 'px';

        if (tooltip != null) {
            arrow.setAttribute('title', tooltip);
        }

        mxUtils.setOpacity(arrow, img == HoverIcons.prototype.refreshTarget ? 30 : 20);
        arrow.style.position = 'absolute';
        arrow.style.cursor = 'crosshair';

        return arrow;
    }

    var currentTargetState = null;
    let currentStateHandle = null;
    var currentStyleTarget = null;
    let activeTarget = false;

    const arrowUp = createArrow(this.triangleUp, mxResources.get('connect'));
    const arrowRight = createArrow(this.triangleRight, mxResources.get('connect'));
    const arrowDown = createArrow(this.triangleDown, mxResources.get('connect'));
    const arrowLeft = createArrow(this.triangleLeft, mxResources.get('connect'));
    var styleTarget = createArrow(this.refreshTarget, mxResources.get('replace'));
    // Workaround for actual parentNode not being updated in old IE
    let styleTargetParent = null;
    const roundSource = createArrow(this.roundDrop);
    const roundTarget = createArrow(this.roundDrop);
    var direction = mxConstants.DIRECTION_NORTH;
    var activeArrow = null;

    function checkArrow(x, y, bounds, arrow) {
        if (arrow.parentNode != null) {
            if (mxUtils.contains(bounds, x, y)) {
                mxUtils.setOpacity(arrow, 100);
                activeArrow = arrow;
            } else {
                mxUtils.setOpacity(arrow, arrow == styleTarget ? 30 : 20);
            }
        }

        return bounds;
    }

    // Hides guides and preview if target is active
    const dsCreatePreviewElement = dragSource.createPreviewElement;

    // Stores initial size of preview element
    dragSource.createPreviewElement = function () {
        const elt = dsCreatePreviewElement.apply(this, arguments);

        // Pass-through events required to tooltip on replace shape
        elt.style.pointerEvents = 'none';

        this.previewElementWidth = elt.style.width;
        this.previewElementHeight = elt.style.height;

        return elt;
    };

    // Shows/hides hover icons
    const dragEnter = dragSource.dragEnter;
    dragSource.dragEnter = function () {
        if (ui.hoverIcons != null) {
            ui.hoverIcons.setDisplay('none');
        }

        dragEnter.apply(this, arguments);
    };

    const dragExit = dragSource.dragExit;
    dragSource.dragExit = function () {
        if (ui.hoverIcons != null) {
            ui.hoverIcons.setDisplay('');
        }

        dragExit.apply(this, arguments);
    };

    dragSource.dragOver = function (graph) {
        mxDragSource.prototype.dragOver.apply(this, arguments);

        if (this.currentGuide != null && activeArrow != null) {
            this.currentGuide.hide();
        }

        if (this.previewElement != null) {
            const view = graph.view;

            if (currentStyleTarget != null && activeArrow == styleTarget) {
                this.previewElement.style.display = graph.model.isEdge(currentStyleTarget.cell) ? 'none' : '';

                this.previewElement.style.left = currentStyleTarget.x + 'px';
                this.previewElement.style.top = currentStyleTarget.y + 'px';
                this.previewElement.style.width = currentStyleTarget.width + 'px';
                this.previewElement.style.height = currentStyleTarget.height + 'px';
            } else if (currentTargetState != null && activeArrow != null) {
                const index = graph.model.isEdge(currentTargetState.cell) || freeSourceEdge == null ? firstVertex : freeSourceEdge;
                const geo = sidebar.getDropAndConnectGeometry(currentTargetState.cell, cells[index], direction, cells);
                const geo2 = !graph.model.isEdge(currentTargetState.cell) ? graph.getCellGeometry(currentTargetState.cell) : null;
                const geo3 = graph.getCellGeometry(cells[index]);
                const parent = graph.model.getParent(currentTargetState.cell);
                let dx = view.translate.x * view.scale;
                let dy = view.translate.y * view.scale;

                if (geo2 != null && !geo2.relative && graph.model.isVertex(parent) && parent != view.currentRoot) {
                    const pState = view.getState(parent);

                    dx = pState.x;
                    dy = pState.y;
                }

                let dx2 = geo3.x;
                let dy2 = geo3.y;

                // Ignores geometry of edges
                if (graph.model.isEdge(cells[index])) {
                    dx2 = 0;
                    dy2 = 0;
                }

                // Shows preview at drop location
                this.previewElement.style.left = (geo.x - dx2) * view.scale + dx + 'px';
                this.previewElement.style.top = (geo.y - dy2) * view.scale + dy + 'px';

                if (cells.length == 1) {
                    this.previewElement.style.width = geo.width * view.scale + 'px';
                    this.previewElement.style.height = geo.height * view.scale + 'px';
                }

                this.previewElement.style.display = '';
            } else if (dragSource.currentHighlight.state != null && graph.model.isEdge(dragSource.currentHighlight.state.cell)) {
                // Centers drop cells when splitting edges
                this.previewElement.style.left = Math.round(parseInt(this.previewElement.style.left) - (bounds.width * view.scale) / 2) + 'px';
                this.previewElement.style.top = Math.round(parseInt(this.previewElement.style.top) - (bounds.height * view.scale) / 2) + 'px';
            } else {
                this.previewElement.style.width = this.previewElementWidth;
                this.previewElement.style.height = this.previewElementHeight;
                this.previewElement.style.display = '';
            }
        }
    };

    let startTime = new Date().getTime();
    let timeOnTarget = 0;
    let prev = null;

    // Gets source cell style to compare shape below
    const sourceCellStyle = this.editorUi.editor.graph.getCellStyle(cells[0]);

    // Allows drop into cell only if target is a valid root
    dragSource.getDropTarget = mxUtils.bind(this, function (graph, x, y, evt) {
        // Alt means no targets at all
        // LATER: Show preview where result will go
        let cell = !mxEvent.isAltDown(evt) && cells != null ? graph.getCellAt(x, y) : null;

        // Uses connectable parent vertex if one exists
        if (cell != null && !this.graph.isCellConnectable(cell)) {
            const parent = this.graph.getModel().getParent(cell);

            if (this.graph.getModel().isVertex(parent) && this.graph.isCellConnectable(parent)) {
                cell = parent;
            }
        }

        // Ignores locked cells
        if (graph.isCellLocked(cell)) {
            cell = null;
        }

        let state = graph.view.getState(cell);
        activeArrow = null;
        let bbox = null;

        // Time on target
        if (prev != state) {
            prev = state;
            startTime = new Date().getTime();
            timeOnTarget = 0;

            if (this.updateThread != null) {
                window.clearTimeout(this.updateThread);
            }

            if (state != null) {
                this.updateThread = window.setTimeout(function () {
                    if (activeArrow == null) {
                        prev = state;
                        dragSource.getDropTarget(graph, x, y, evt);
                    }
                }, this.dropTargetDelay + 10);
            }
        } else {
            timeOnTarget = new Date().getTime() - startTime;
        }

        // Shift means disabled, delayed on cells with children, shows after this.dropTargetDelay, hides after 2500ms
        if (
            dropStyleEnabled &&
            timeOnTarget < 2500 &&
            state != null &&
            !mxEvent.isShiftDown(evt) &&
            // If shape is equal or target has no stroke, fill and gradient then use longer delay except for images
            ((mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE) != mxUtils.getValue(sourceCellStyle, mxConstants.STYLE_SHAPE) && (mxUtils.getValue(state.style, mxConstants.STYLE_STROKECOLOR, mxConstants.NONE) != mxConstants.NONE || mxUtils.getValue(state.style, mxConstants.STYLE_FILLCOLOR, mxConstants.NONE) != mxConstants.NONE || mxUtils.getValue(state.style, mxConstants.STYLE_GRADIENTCOLOR, mxConstants.NONE) != mxConstants.NONE)) || mxUtils.getValue(sourceCellStyle, mxConstants.STYLE_SHAPE) == 'image' || timeOnTarget > 1500 || graph.model.isEdge(state.cell)) &&
            timeOnTarget > this.dropTargetDelay &&
            !this.isDropStyleTargetIgnored(state) &&
            ((graph.model.isVertex(state.cell) && firstVertex != null) || (graph.model.isEdge(state.cell) && graph.model.isEdge(cells[0])))
        ) {
            currentStyleTarget = state;
            var tmp = graph.model.isEdge(state.cell) ? graph.view.getPoint(state) : new mxPoint(state.getCenterX(), state.getCenterY());
            tmp = new mxRectangle(tmp.x - this.refreshTarget.width / 2, tmp.y - this.refreshTarget.height / 2, this.refreshTarget.width, this.refreshTarget.height);

            styleTarget.style.left = Math.floor(tmp.x) + 'px';
            styleTarget.style.top = Math.floor(tmp.y) + 'px';

            if (styleTargetParent == null) {
                graph.container.appendChild(styleTarget);
                styleTargetParent = styleTarget.parentNode;
            }

            checkArrow(x, y, tmp, styleTarget);
        }
        // Does not reset on ignored edges
        else if (currentStyleTarget == null || !mxUtils.contains(currentStyleTarget, x, y) || (timeOnTarget > 1500 && !mxEvent.isShiftDown(evt))) {
            currentStyleTarget = null;

            if (styleTargetParent != null) {
                styleTarget.parentNode.removeChild(styleTarget);
                styleTargetParent = null;
            }
        } else if (currentStyleTarget != null && styleTargetParent != null) {
            // Sets active Arrow as side effect
            var tmp = graph.model.isEdge(currentStyleTarget.cell) ? graph.view.getPoint(currentStyleTarget) : new mxPoint(currentStyleTarget.getCenterX(), currentStyleTarget.getCenterY());
            tmp = new mxRectangle(tmp.x - this.refreshTarget.width / 2, tmp.y - this.refreshTarget.height / 2, this.refreshTarget.width, this.refreshTarget.height);
            checkArrow(x, y, tmp, styleTarget);
        }

        // Checks if inside bounds
        if (activeTarget && currentTargetState != null && !mxEvent.isAltDown(evt) && activeArrow == null) {
            // LATER: Use hit-detection for edges
            bbox = mxRectangle.fromRectangle(currentTargetState);

            if (graph.model.isEdge(currentTargetState.cell)) {
                var pts = currentTargetState.absolutePoints;

                if (roundSource.parentNode != null) {
                    var p0 = pts[0];
                    bbox.add(checkArrow(x, y, new mxRectangle(p0.x - this.roundDrop.width / 2, p0.y - this.roundDrop.height / 2, this.roundDrop.width, this.roundDrop.height), roundSource));
                }

                if (roundTarget.parentNode != null) {
                    var pe = pts[pts.length - 1];
                    bbox.add(checkArrow(x, y, new mxRectangle(pe.x - this.roundDrop.width / 2, pe.y - this.roundDrop.height / 2, this.roundDrop.width, this.roundDrop.height), roundTarget));
                }
            } else {
                var bds = mxRectangle.fromRectangle(currentTargetState);

                // Uses outer bounding box to take rotation into account
                if (currentTargetState.shape != null && currentTargetState.shape.boundingBox != null) {
                    bds = mxRectangle.fromRectangle(currentTargetState.shape.boundingBox);
                }

                bds.grow(this.graph.tolerance);
                bds.grow(HoverIcons.prototype.arrowSpacing);

                var handler = this.graph.selectionCellsHandler.getHandler(currentTargetState.cell);

                if (handler != null) {
                    bds.x -= handler.horizontalOffset / 2;
                    bds.y -= handler.verticalOffset / 2;
                    bds.width += handler.horizontalOffset;
                    bds.height += handler.verticalOffset;

                    // Adds bounding box of rotation handle to avoid overlap
                    if (handler.rotationShape != null && handler.rotationShape.node != null && handler.rotationShape.node.style.visibility != 'hidden' && handler.rotationShape.node.style.display != 'none' && handler.rotationShape.boundingBox != null) {
                        bds.add(handler.rotationShape.boundingBox);
                    }
                }

                bbox.add(checkArrow(x, y, new mxRectangle(currentTargetState.getCenterX() - this.triangleUp.width / 2, bds.y - this.triangleUp.height, this.triangleUp.width, this.triangleUp.height), arrowUp));
                bbox.add(checkArrow(x, y, new mxRectangle(bds.x + bds.width, currentTargetState.getCenterY() - this.triangleRight.height / 2, this.triangleRight.width, this.triangleRight.height), arrowRight));
                bbox.add(checkArrow(x, y, new mxRectangle(currentTargetState.getCenterX() - this.triangleDown.width / 2, bds.y + bds.height, this.triangleDown.width, this.triangleDown.height), arrowDown));
                bbox.add(checkArrow(x, y, new mxRectangle(bds.x - this.triangleLeft.width, currentTargetState.getCenterY() - this.triangleLeft.height / 2, this.triangleLeft.width, this.triangleLeft.height), arrowLeft));
            }

            // Adds tolerance
            if (bbox != null) {
                bbox.grow(10);
            }
        }

        direction = mxConstants.DIRECTION_NORTH;

        if (activeArrow == arrowRight) {
            direction = mxConstants.DIRECTION_EAST;
        } else if (activeArrow == arrowDown || activeArrow == roundTarget) {
            direction = mxConstants.DIRECTION_SOUTH;
        } else if (activeArrow == arrowLeft) {
            direction = mxConstants.DIRECTION_WEST;
        }

        if (currentStyleTarget != null && activeArrow == styleTarget) {
            state = currentStyleTarget;
        }

        const validTarget = (firstVertex == null || graph.isCellConnectable(cells[firstVertex])) && ((graph.model.isEdge(cell) && firstVertex != null) || (graph.model.isVertex(cell) && graph.isCellConnectable(cell)));

        // Drop arrows shown after this.dropTargetDelay, hidden after 5 secs, switches arrows after 500ms
        if ((currentTargetState != null && timeOnTarget >= 5000) || (currentTargetState != state && (bbox == null || !mxUtils.contains(bbox, x, y) || (timeOnTarget > 500 && activeArrow == null && validTarget)))) {
            activeTarget = false;
            currentTargetState = (timeOnTarget < 5000 && timeOnTarget > this.dropTargetDelay) || graph.model.isEdge(cell) ? state : null;

            if (currentTargetState != null && validTarget) {
                var elts = [roundSource, roundTarget, arrowUp, arrowRight, arrowDown, arrowLeft];

                for (var i = 0; i < elts.length; i++) {
                    if (elts[i].parentNode != null) {
                        elts[i].parentNode.removeChild(elts[i]);
                    }
                }

                if (graph.model.isEdge(cell)) {
                    var pts = state.absolutePoints;

                    if (pts != null) {
                        var p0 = pts[0];
                        var pe = pts[pts.length - 1];

                        roundSource.style.left = Math.floor(p0.x - this.roundDrop.width / 2) + 'px';
                        roundSource.style.top = Math.floor(p0.y - this.roundDrop.height / 2) + 'px';

                        roundTarget.style.left = Math.floor(pe.x - this.roundDrop.width / 2) + 'px';
                        roundTarget.style.top = Math.floor(pe.y - this.roundDrop.height / 2) + 'px';

                        if (graph.model.getTerminal(cell, true) == null) {
                            graph.container.appendChild(roundSource);
                        }

                        if (graph.model.getTerminal(cell, false) == null) {
                            graph.container.appendChild(roundTarget);
                        }
                    }
                } else {
                    var bds = mxRectangle.fromRectangle(state);

                    // Uses outer bounding box to take rotation into account
                    if (state.shape != null && state.shape.boundingBox != null) {
                        bds = mxRectangle.fromRectangle(state.shape.boundingBox);
                    }

                    bds.grow(this.graph.tolerance);
                    bds.grow(HoverIcons.prototype.arrowSpacing);

                    var handler = this.graph.selectionCellsHandler.getHandler(state.cell);

                    if (handler != null) {
                        bds.x -= handler.horizontalOffset / 2;
                        bds.y -= handler.verticalOffset / 2;
                        bds.width += handler.horizontalOffset;
                        bds.height += handler.verticalOffset;

                        // Adds bounding box of rotation handle to avoid overlap
                        if (handler.rotationShape != null && handler.rotationShape.node != null && handler.rotationShape.node.style.visibility != 'hidden' && handler.rotationShape.node.style.display != 'none' && handler.rotationShape.boundingBox != null) {
                            bds.add(handler.rotationShape.boundingBox);
                        }
                    }

                    arrowUp.style.left = Math.floor(state.getCenterX() - this.triangleUp.width / 2) + 'px';
                    arrowUp.style.top = Math.floor(bds.y - this.triangleUp.height) + 'px';

                    arrowRight.style.left = Math.floor(bds.x + bds.width) + 'px';
                    arrowRight.style.top = Math.floor(state.getCenterY() - this.triangleRight.height / 2) + 'px';

                    arrowDown.style.left = arrowUp.style.left;
                    arrowDown.style.top = Math.floor(bds.y + bds.height) + 'px';

                    arrowLeft.style.left = Math.floor(bds.x - this.triangleLeft.width) + 'px';
                    arrowLeft.style.top = arrowRight.style.top;

                    if (state.style['portConstraint'] != 'eastwest') {
                        graph.container.appendChild(arrowUp);
                        graph.container.appendChild(arrowDown);
                    }

                    graph.container.appendChild(arrowRight);
                    graph.container.appendChild(arrowLeft);
                }

                // Hides handle for cell under mouse
                if (state != null) {
                    currentStateHandle = graph.selectionCellsHandler.getHandler(state.cell);

                    if (currentStateHandle != null && currentStateHandle.setHandlesVisible != null) {
                        currentStateHandle.setHandlesVisible(false);
                    }
                }

                activeTarget = true;
            } else {
                var elts = [roundSource, roundTarget, arrowUp, arrowRight, arrowDown, arrowLeft];

                for (var i = 0; i < elts.length; i++) {
                    if (elts[i].parentNode != null) {
                        elts[i].parentNode.removeChild(elts[i]);
                    }
                }
            }
        }

        if (!activeTarget && currentStateHandle != null) {
            currentStateHandle.setHandlesVisible(true);
        }

        // Handles drop target
        let target = (!mxEvent.isAltDown(evt) || mxEvent.isShiftDown(evt)) && !(currentStyleTarget != null && activeArrow == styleTarget) ? mxDragSource.prototype.getDropTarget.apply(this, arguments) : null;
        const model = graph.getModel();

        if (target != null) {
            if (activeArrow != null || !graph.isSplitTarget(target, cells, evt)) {
                // Selects parent group as drop target
                while (target != null && !graph.isValidDropTarget(target, cells, evt) && model.isVertex(model.getParent(target))) {
                    target = model.getParent(target);
                }

                if (target != null && (graph.view.currentRoot == target || (!graph.isValidRoot(target) && graph.getModel().getChildCount(target) == 0) || graph.isCellLocked(target) || model.isEdge(target) || !graph.isValidDropTarget(target, cells, evt))) {
                    target = null;
                }
            }
        }

        return target;
    });

    dragSource.stopDrag = function () {
        mxDragSource.prototype.stopDrag.apply(this, arguments);

        const elts = [roundSource, roundTarget, styleTarget, arrowUp, arrowRight, arrowDown, arrowLeft];

        for (let i = 0; i < elts.length; i++) {
            if (elts[i].parentNode != null) {
                elts[i].parentNode.removeChild(elts[i]);
            }
        }

        if (currentTargetState != null && currentStateHandle != null) {
            currentStateHandle.reset();
        }

        currentStateHandle = null;
        currentTargetState = null;
        currentStyleTarget = null;
        styleTargetParent = null;
        activeArrow = null;
    };

    return dragSource;
};

Sidebar.prototype.itemClicked = function (cells, ds, evt) {
    const graph = this.editorUi.editor.graph;
    graph.container.focus();

    // Alt+Click inserts and connects
    if (mxEvent.isAltDown(evt) && graph.getSelectionCount() == 1 && graph.model.isVertex(graph.getSelectionCell())) {
        let firstVertex = null;

        for (let i = 0; i < cells.length && firstVertex == null; i++) {
            if (graph.model.isVertex(cells[i])) {
                firstVertex = i;
            }
        }

        if (firstVertex != null) {
            graph.setSelectionCells(this.dropAndConnect(graph.getSelectionCell(), cells, mxEvent.isMetaDown(evt) || mxEvent.isControlDown(evt) ? (mxEvent.isShiftDown(evt) ? mxConstants.DIRECTION_WEST : mxConstants.DIRECTION_NORTH) : mxEvent.isShiftDown(evt) ? mxConstants.DIRECTION_EAST : mxConstants.DIRECTION_SOUTH, firstVertex, evt));
            graph.scrollCellToVisible(graph.getSelectionCell());
        }
    }
    // Shift+Click updates shape
    else if (mxEvent.isShiftDown(evt) && !graph.isSelectionEmpty()) {
        this.updateShapes(cells[0], graph.getSelectionCells());
        graph.scrollCellToVisible(graph.getSelectionCell());
    } else {
        const pt = mxEvent.isAltDown(evt) ? graph.getFreeInsertPoint() : graph.getCenterInsertPoint(graph.getBoundingBoxFromGeometry(cells, true));
        ds.drop(graph, evt, null, pt.x, pt.y, true);
    }
};

Sidebar.prototype.addClickHandler = function (elt, ds, cells) {
    const graph = this.editorUi.editor.graph;
    const oldMouseDown = ds.mouseDown;
    const oldMouseMove = ds.mouseMove;
    const oldMouseUp = ds.mouseUp;
    const tol = graph.tolerance;
    let first = null;
    const sb = this;

    ds.mouseDown = function (evt) {
        oldMouseDown.apply(this, arguments);
        first = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));

        if (this.dragElement != null) {
            this.dragElement.style.display = 'none';
            mxUtils.setOpacity(elt, 50);
        }
    };

    ds.mouseMove = function (evt) {
        if (this.dragElement != null && this.dragElement.style.display == 'none' && first != null && (Math.abs(first.x - mxEvent.getClientX(evt)) > tol || Math.abs(first.y - mxEvent.getClientY(evt)) > tol)) {
            this.dragElement.style.display = '';
            mxUtils.setOpacity(elt, 100);
        }

        oldMouseMove.apply(this, arguments);
    };

    ds.mouseUp = function (evt) {
        try {
            if (!mxEvent.isPopupTrigger(evt) && this.currentGraph == null && this.dragElement != null && this.dragElement.style.display == 'none') {
                sb.itemClicked(cells, ds, evt, elt);
            }

            oldMouseUp.apply(ds, arguments);
            mxUtils.setOpacity(elt, 100);
            first = null;

            // Blocks tooltips on this element after single click
            sb.currentElt = elt;
        } catch (e) {
            ds.reset();
            sb.editorUi.handleError(e);
        }
    };
};

Sidebar.prototype.createVertexTemplateEntry = function (style, width, height, value, title, showLabel, showTitle, tags, thumbImg, className) {
    if (tags != null && title != null) {
        tags += ' ' + title;
    }
    tags = (tags != null && tags.length > 0) ? tags : ((title != null) ? title.toLowerCase() : '');
    return this.addEntry(tags, mxUtils.bind(this, function () {
        return this.createVertexTemplate(style, width, height, value, title, showLabel, showTitle, null, null, null, null, null, null, null, thumbImg, className);
    }));
}
Sidebar.prototype.createVertexTemplate = function (style, width, height, value, title, showLabel, showTitle, allowCellsInserted, showTooltip, clickFn, thumbWidth, thumbHeight, icon, startEditing, thumbImg, className) {
    const cells = [new mxCell((value != null) ? value : '', new mxGeometry(0, 0, width, height), style)];
    cells[0].vertex = true;
    return this.createVertexTemplateFromCells(cells, width, height, title, showLabel, showTitle, allowCellsInserted, showTooltip, clickFn, thumbWidth, thumbHeight, icon, startEditing, null, thumbImg, className);
};
Sidebar.prototype.createVertexTemplateFromData = function (data, width, height, title, showLabel, showTitle, allowCellsInserted, showTooltip, thumbImg, className) {
    const doc = mxUtils.parseXml(Graph.decompress(data));
    const codec = new mxCodec(doc);
    const model = new mxGraphModel();
    codec.decode(doc.documentElement, model);
    const cells = this.graph.cloneCells(model.root.getChildAt(0).children);
    return this.createVertexTemplateFromCells(cells, width, height, title, showLabel, showTitle, allowCellsInserted, showTooltip, null, null, null, null, null, null, null, thumbImg, className);
};
Sidebar.prototype.createVertexTemplateFromCells = function (cells, width, height, title, showLabel, showTitle, allowCellsInserted, showTooltip, clickFn, thumbWidth, thumbHeight, icon, startEditing, sourceCell, thumbImg, className) {
    return this.createItem(cells, title, showLabel, showTitle, width, height, allowCellsInserted, showTooltip, clickFn, thumbWidth, thumbHeight, icon, startEditing, sourceCell, thumbImg, className);
};

Sidebar.prototype.createEdgeTemplateEntry = function (style, width, height, value, title, showLabel, tags, allowCellsInserted, showTooltip, thumbImg, className) {
    tags = (tags != null && tags.length > 0) ? tags : title.toLowerCase();
    return this.addEntry(tags, mxUtils.bind(this, function () {
        return this.createEdgeTemplate(style, width, height, value, title, showLabel, allowCellsInserted, showTooltip, thumbImg, className);
    }));
};
Sidebar.prototype.createEdgeTemplate = function (style, width, height, value, title, showLabel, allowCellsInserted, showTooltip, thumbImg, className) {
    const cell = new mxCell((value != null) ? value : '', new mxGeometry(0, 0, width, height), style);
    cell.geometry.setTerminalPoint(new mxPoint(0, height), true);
    cell.geometry.setTerminalPoint(new mxPoint(width, 0), false);
    cell.geometry.relative = true;
    cell.edge = true;
    return this.createEdgeTemplateFromCells([cell], width, height, title, showLabel, allowCellsInserted, showTooltip, null, null, null, null, null, thumbImg, className);
};

Sidebar.prototype.createEdgeTemplateFromCells = function (cells, width, height, title, showLabel, allowCellsInserted, showTooltip, showTitle, clickFn, thumbWidth, thumbHeight, icon, thumbImg, className) {
    return this.createItem(cells, title, showLabel, (showTitle != null) ? showTitle : true, width, height, allowCellsInserted, showTooltip, clickFn, thumbWidth, thumbHeight, icon, null, null, thumbImg, className);
};

Sidebar.prototype.addPaletteFunctions = function (id, title, expanded, fns) {
    this.addPalette(id, title, expanded, mxUtils.bind(this, function (content) {
        for (var i = 0; i < fns.length; i++) {
            content.appendChild(fns[i](content));
        }
    }));
};

/**
 * 添加图库面板函数
 * 与addPaletteFunctions方法相同，但渲染到图库面板中
 */
Sidebar.prototype.addGalleryPaletteFunctions = function (id, title, expanded, fns) {
    this.addGalleryPalette(id, title, expanded, mxUtils.bind(this, function (content) {
        for (var i = 0; i < fns.length; i++) {
            content.appendChild(fns[i](content));
        }
    }));
};

Sidebar.prototype.addPalette = function (id, title, expanded, onInit) {
    const elt = document.createElement('div');
    mxUtils.write(elt, title);
    elt.style.cssText = `width: 100%;height: 45px;line-height: 45px;border-bottom: 1px solid #EEE;cursor:pointer;padding-left: 10px;z-index: 1;
    background: white;
    position: sticky;
    top: 0px;`;
    this.appendChild(elt);
    const div = document.createElement('div');
    // div.className = 'geSidebar';
    if (mxClient.IS_POINTER) {
        div.style.touchAction = 'none';
    }
    div.style.cssText = `
    border-bottom:1px solid #EEE;box-sizing: border-box;background:#EFEFEF;`;

    if (expanded) {
        onInit(div);
        onInit = null;
    } else {
        div.style.display = 'none';
    }

    this.addFoldingHandler(elt, div, onInit, expanded);
    const outer = document.createElement('div');
    outer.appendChild(div);
    this.appendChild(outer);
    if (id != null) {
        this.palettes[id] = [elt, outer];
    }
    return div;
};

/**
 * 添加子元素到图库面板
 * 将元素添加到图库面板容器中
 */
Sidebar.prototype.appendGalleryChild = function (child) {
    this.galleryElementPanel.appendChild(child);
};

/**
 * 添加图库面板
 * 与addPalette方法相同，但将内容添加到图库面板中
 */
Sidebar.prototype.addGalleryPalette = function (id, title, expanded, onInit) {
    const elt = document.createElement('div');
    mxUtils.write(elt, title);
    elt.style.cssText = `width: 100%;height: 45px;line-height: 45px;border-bottom: 1px solid #EEE;cursor:pointer;padding-left: 10px;z-index: 1;
    background: white;
    position: sticky;
    top: 0px;`;
    this.appendGalleryChild(elt);
    const div = document.createElement('div');
    // div.className = 'geSidebar';
    if (mxClient.IS_POINTER) {
        div.style.touchAction = 'none';
    }
    div.style.cssText = `
    border-bottom:1px solid #EEE;box-sizing: border-box;background:#EFEFEF;`;

    if (expanded) {
        onInit(div);
        onInit = null;
    } else {
        div.style.display = 'none';
    }

    this.addFoldingHandler(elt, div, onInit, expanded);
    const outer = document.createElement('div');
    outer.appendChild(div);
    this.appendGalleryChild(outer);
    if (id != null) {
        this.galleryPalettes = this.galleryPalettes || {};
        this.galleryPalettes[id] = [elt, outer];
    }
    return div;
};

Sidebar.prototype.addFoldingHandler = function (title, content, funct, expanded) {
    var initialized = false;
    title.style.backgroundRepeat = 'no-repeat';
    title.style.backgroundPosition = '92% 50%';
    title.style.backgroundImage = expanded ? 'url(\'' + this.expandedImage + '\')' : 'url(\'' + this.collapsedImage + '\')';
    mxEvent.addListener(title, 'click', mxUtils.bind(this, function (evt) {
        if (mxEvent.getSource(evt) == title) {
            if (content.style.display == 'none') {
                if (!initialized) {
                    initialized = true;
                    if (funct != null) {
                        title.style.cursor = 'wait';
                        const children = [];
                        for (let i = 0; i < title.children.length; i++) {
                            children.push(title.children[i]);
                            title.removeChild(title.children[i]);
                        }
                        const prev = title.innerHTML;
                        title.innerHTML = mxResources.get('loading') + '...';
                        window.setTimeout(mxUtils.bind(this, function () {
                            this.setContentVisible(content, true);
                            title.style.cursor = '';
                            title.innerHTML = prev;
                            for (var i = 0; i < children.length; i++) {
                                title.appendChild(children[i]);
                            }
                            var fo = mxClient.NO_FO;
                            mxClient.NO_FO = Editor.prototype.originalNoForeignObject;
                            funct(content, title);
                            mxClient.NO_FO = fo;
                        }), (mxClient.IS_FF) ? 20 : 0);
                    } else {
                        this.setContentVisible(content, true);
                    }
                } else {
                    this.setContentVisible(content, true);
                }
                title.style.backgroundImage = 'url(\'' + this.expandedImage + '\')';
            } else {
                title.style.backgroundImage = 'url(\'' + this.collapsedImage + '\')';
                this.setContentVisible(content, false);
            }
            mxEvent.consume(evt);
        }
    }));
    mxEvent.addListener(title, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown',
        mxUtils.bind(this, function (evt) {
            evt.preventDefault();
        }));
};


Sidebar.prototype.removePalette = function (id) {
    var elts = this.palettes[id];

    if (elts != null) {
        this.palettes[id] = null;

        for (var i = 0; i < elts.length; i++) {
            this.container.removeChild(elts[i]);
        }

        return true;
    }

    return false;
};

Sidebar.prototype.addImagePalette = function (id, title, prefix, postfix, items, titles, tags) {
    var showTitles = titles != null;
    var fns = [];

    for (var i = 0; i < items.length; i++) {
        (mxUtils.bind(this, function (item, title, tmpTags) {
            if (tmpTags == null) {
                var slash = item.lastIndexOf('/');
                var dot = item.lastIndexOf('.');
                tmpTags = item.substring((slash >= 0) ? slash + 1 : 0, (dot >= 0) ? dot : item.length).replace(/[-_]/g, ' ');
            }

            fns.push(this.createVertexTemplateEntry('image;html=1;image=' + prefix + item + postfix,
                this.defaultImageWidth, this.defaultImageHeight, '', title, title != null, null, this.filterTags(tmpTags)));
        }))(items[i], (titles != null) ? titles[i] : null, (tags != null) ? tags[items[i]] : null);
    }

    this.addPaletteFunctions(id, title, false, fns);
};
Sidebar.prototype.getTagsForStencil = function (packageName, stencilName, moreTags) {
    var tags = packageName.split('.');
    for (var i = 1; i < tags.length; i++) {
        tags[i] = tags[i].replace(/_/g, ' ')
    }
    tags.push(stencilName.replace(/_/g, ' '));
    if (moreTags != null) {
        tags.push(moreTags);
    }
    return tags.slice(1, tags.length);
};

Sidebar.prototype.addStencilPalette = function (id, title, stencilFile, style, ignore, onInit, scale, tags, customFns, groupId) {
    scale = (scale != null) ? scale : 1;
    if (this.addStencilsToIndex) {
        const fns = [];
        if (customFns != null) {
            for (var i = 0; i < customFns.length; i++) {
                fns.push(customFns[i]);
            }
        }
        mxStencilRegistry.loadStencilSet(stencilFile, mxUtils.bind(this, function (packageName, stencilName, displayName, w, h) {
            if (ignore == null || mxUtils.indexOf(ignore, stencilName) < 0) {
                const tmp = this.getTagsForStencil(packageName, stencilName);
                const tmpTags = (tags != null) ? tags[stencilName] : null;
                if (tmpTags != null) {
                    tmp.push(tmpTags);
                }
                fns.push(this.createVertexTemplateEntry('shape=' + packageName + stencilName.toLowerCase() + style,
                    Math.round(w * scale), Math.round(h * scale), '', stencilName.replace(/_/g, ' '), null, null,
                    this.filterTags(tmp.join(' '))));
            }
        }), true, true);
        this.addPaletteFunctions(id, title, false, fns);
    } else {
        this.addPalette(id, title, false, mxUtils.bind(this, function (content) {
            if (style == null) {
                style = '';
            }
            if (onInit != null) {
                onInit.call(this, content);
            }
            if (customFns != null) {
                for (var i = 0; i < customFns.length; i++) {
                    customFns[i](content);
                }
            }
            mxStencilRegistry.loadStencilSet(stencilFile, mxUtils.bind(this, function (packageName, stencilName, displayName, w, h) {
                if (ignore == null || mxUtils.indexOf(ignore, stencilName) < 0) {
                    content.appendChild(this.createVertexTemplate('shape=' + packageName + stencilName.toLowerCase() + style,
                        Math.round(w * scale), Math.round(h * scale), '', stencilName.replace(/_/g, ' '), true));
                }
            }), true);
        }));
    }
};

Sidebar.prototype.destroy = function () {
    if (this.graph != null) {
        if (this.graph.container != null && this.graph.container.parentNode != null) {
            this.graph.container.parentNode.removeChild(this.graph.container);
        }

        this.graph.destroy();
        this.graph = null;
    }

    if (this.pointerUpHandler != null) {
        mxEvent.removeListener(document, mxClient.IS_POINTER ? 'pointerup' : 'mouseup', this.pointerUpHandler);
        this.pointerUpHandler = null;
    }

    if (this.pointerDownHandler != null) {
        mxEvent.removeListener(document, mxClient.IS_POINTER ? 'pointerdown' : 'mousedown', this.pointerDownHandler);
        this.pointerDownHandler = null;
    }

    if (this.pointerMoveHandler != null) {
        mxEvent.removeListener(document, mxClient.IS_POINTER ? 'pointermove' : 'mousemove', this.pointerMoveHandler);
        this.pointerMoveHandler = null;
    }

    if (this.pointerOutHandler != null) {
        mxEvent.removeListener(document, mxClient.IS_POINTER ? 'pointerout' : 'mouseout', this.pointerOutHandler);
        this.pointerOutHandler = null;
    }
};

Sidebar.prototype.refresh = function () {
    var graph = this.editorUi.editor.graph;
    this.graph.stylesheet.styles = mxUtils.clone(
        graph.getDefaultStylesheet().styles);
    var scrollTop = this.elementPanel.scrollTop;
    this.elementPanel.innerText = '';
    var temp = this.palettes;
    this.palettes = new Object();

    // Overrides addPalette to restore expanded state
    var addPalette = this.addPalette;

    this.addPalette = function (id, title, expanded, onInit) {
        expanded = this.wasPaletteExpanded(temp, id, expanded);

        return addPalette.apply(this, arguments);
    };

    this.init(temp);

    // Restores previous implementation
    this.addPalette = addPalette;

    // Restores scrollbar position
    window.setTimeout(mxUtils.bind(this, function () {
        this.elementPanel.scrollTop = scrollTop;
    }), 0);
};

Sidebar.prototype.wasPaletteExpanded = function (paletteStates, id, defaultExpanded) {
    var elts = (paletteStates != null && id != null) ? paletteStates[id] : null;
    var result = defaultExpanded

    if (elts != null && elts.length == 2 &&
        elts[1].firstChild != null) {
        result = elts[1].firstChild.style.display != 'none';
    }

    return result;
};

Sidebar.prototype.getEntryContainer = function () {
    return this.elementPanel;
};

Sidebar.prototype.appendChild = function (child) {
    this.elementPanel.appendChild(child);
};

/**
 * 添加子元素到图库面板
 * 与appendChild方法相同，但将子元素添加到图库面板中
 */
Sidebar.prototype.appendGalleryChild = function (child) {
    this.galleryElementPanel.appendChild(child);
};

Sidebar.prototype.getTooltipOffset = function (elt, bounds) {
    const b = document.body;
    const d = document.documentElement;
    const bottom = Math.max(b.clientHeight || 0, d.clientHeight);
    const height = bounds.height + 2 * this.tooltipBorder;
    return new mxPoint(this.container.offsetWidth + 2 + this.editorUi.container.offsetLeft,
        Math.min(bottom - height - 20 /*status bar*/, Math.max(0, (this.editorUi.container.offsetTop +
            this.container.offsetTop + elt.offsetTop - this.elementPanel.scrollTop - height / 2 + 16))));
};

/**
 * 初始化模板库数据
 * 请求接口获取模板库分组和模板数据，并渲染到界面上
 */
Sidebar.prototype.initTemplateLibrary = function () {
    // 显示加载状态
    this.showTemplateLibraryLoading();

    // 请求模板库数据
    this.loadTemplateLibraryData();
};

/**
 * 显示模板库加载状态
 */
Sidebar.prototype.showTemplateLibraryLoading = function () {
    if (this.templateLibraryList) {
        this.templateLibraryList.innerHTML = '<div style="text-align:center;padding:20px;color:#999;">加载中...</div>';
    }
};

/**
 * 请求模板库数据
 */
Sidebar.prototype.loadTemplateLibraryData = function () {
    const self = this;

    // 动态导入api模块
    import('./utils/api.js').then(module => {
        const api = module.default;

        // 使用api规范方法请求模板库数据
        api.getGroupsWithTemplates()
            .then(response => {

                const data = response;
                if (data.code === 200 && data.data) {
                    self.renderTemplateLibrary(data.data);
                } else {
                    self.showTemplateLibraryError('数据格式错误: ' + (data.message || '未知错误'));
                }
            })
            .catch(error => {
                self.showTemplateLibraryError('加载失败: ' + (error.message || '网络请求失败'));
            });
    }).catch(error => {
        self.showTemplateLibraryError('系统错误: API模块加载失败');
    });
};

/**
 * 渲染模板库数据
 * @param {Array} groups - 模板分组数据
 */
Sidebar.prototype.renderTemplateLibrary = function (groups) {
    if (!this.templateLibraryList) {
        return;
    }

    // 清空容器
    this.templateLibraryList.innerHTML = '';

    // 遍历分组数据
    groups.forEach(group => {
        this.createTemplateGroup(group);
    });
};

/**
 * 创建模板分组
 * @param {Object} group - 分组数据
 */
Sidebar.prototype.createTemplateGroup = function (group) {
    const self = this;

    // 创建分组容器
    const groupContainer = document.createElement('div');
    groupContainer.style.cssText = 'margin-bottom:15px;border:1px solid #e4e7ed;border-radius:4px;overflow:hidden;';

    // 创建分组标题
    const groupHeader = document.createElement('div');
    groupHeader.style.cssText = `
        padding:12px 15px;
        background:#f5f7fa;
        border-bottom:1px solid #e4e7ed;
        cursor:pointer;
        font-weight:bold;
        color:#333;
        display:flex;
        justify-content:space-between;
        align-items:center;
        transition:background 0.3s;
    `;

    // 分组名称
    const groupTitle = document.createElement('span');
    groupTitle.textContent = group.name;
    groupHeader.appendChild(groupTitle);

    // 展开/收起图标
    const expandIcon = document.createElement('span');
    expandIcon.style.cssText = 'font-size:12px;color:#666;transition:transform 0.3s;';
    expandIcon.textContent = '▼';
    groupHeader.appendChild(expandIcon);

    // 创建模板列表容器
    const templatesContainer = document.createElement('div');
    templatesContainer.style.cssText = 'background:#fff;display:grid;grid-template-columns:1fr 1fr;gap:10px;';

    // 渲染模板列表
    if (group.templates && group.templates.length > 0) {
        group.templates.forEach(template => {
            this.createTemplateItem(template, templatesContainer);
        });
    } else {
        const emptyTip = document.createElement('div');
        emptyTip.style.cssText = 'text-align:center;color:#999;padding:20px;';
        emptyTip.textContent = '暂无模板';
        templatesContainer.appendChild(emptyTip);
    }

    // 添加点击事件 - 展开/收起
    let isExpanded = true; // 默认展开
    groupHeader.addEventListener('click', function () {
        isExpanded = !isExpanded;
        if (isExpanded) {
            templatesContainer.style.display = 'grid';
            expandIcon.style.transform = 'rotate(0deg)';
            groupHeader.style.background = '#f5f7fa';
        } else {
            templatesContainer.style.display = 'none';
            expandIcon.style.transform = 'rotate(-90deg)';
            groupHeader.style.background = '#ebeef5';
        }
    });

    // 鼠标悬停效果
    groupHeader.addEventListener('mouseenter', function () {
        if (isExpanded) {
            this.style.background = '#ebeef5';
        }
    });

    groupHeader.addEventListener('mouseleave', function () {
        if (isExpanded) {
            this.style.background = '#f5f7fa';
        }
    });

    // 组装分组
    groupContainer.appendChild(groupHeader);
    groupContainer.appendChild(templatesContainer);

    // 添加到模板库列表
    this.templateLibraryList.appendChild(groupContainer);
};

/**
 * 创建模板项
 * @param {Object} template - 模板数据
 * @param {HTMLElement} container - 容器元素
 */
Sidebar.prototype.createTemplateItem = function (template, container) {
    const self = this;

    // 创建模板项容器
    const templateItem = document.createElement('div');
    templateItem.style.cssText = `
        display:flex;
        flex-direction:column;
        align-items:center;
        border-radius:6px;
        cursor:pointer;
        transition:all 0.3s;
        background:#fff;
        text-align:center;
    `;

    // 创建缩略图
    const thumbnail = document.createElement('img');
    thumbnail.style.cssText = `
        height:75px;
        object-fit:cover;
        border-radius:4px;
        margin-bottom:8px;
        border:1px solid #e4e7ed;
        width: 95%;
    `;
    thumbnail.src = template.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA2MCA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQ1IiBmaWxsPSIjRjVGN0ZBIi8+CjxwYXRoIGQ9Ik0yMCAyMEgzMFYzMEgyMFYyMFoiIGZpbGw9IiNEREREREQiLz4KPC9zdmc+';
    thumbnail.alt = template.name;

    // 图片加载失败时显示默认图标
    thumbnail.onerror = function () {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA2MCA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQ1IiBmaWxsPSIjRjVGN0ZBIi8+CjxwYXRoIGQ9Ik0yMCAyMEgzMFYzMEgyMFYyMFoiIGZpbGw9IiNEREREREQiLz4KPC9zdmc+';
    };

    // 创建模板信息容器
    const templateInfo = document.createElement('div');
    templateInfo.style.cssText = 'width:100%;';

    // 模板名称
    const templateName = document.createElement('div');
    templateName.style.cssText = 'font-size:12px;color:#333;font-weight:500;margin-bottom:2px;line-height:1.4;';
    templateName.textContent = template.name;



    templateInfo.appendChild(templateName);

    // 组装模板项
    templateItem.appendChild(thumbnail);
    templateItem.appendChild(templateInfo);

    // 添加点击事件
    templateItem.addEventListener('click', function () {
        self.onTemplateItemClick(template);
    });

    // 鼠标悬停效果
    templateItem.addEventListener('mouseenter', function () {
        this.style.background = '#f0f9ff';
        this.style.borderColor = '#409eff';
        this.style.transform = 'translateY(-1px)';
        this.style.boxShadow = '0 2px 8px rgba(64,158,255,0.2)';
    });

    templateItem.addEventListener('mouseleave', function () {
        this.style.background = '#fff';
        this.style.borderColor = '#e4e7ed';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    });

    // 添加到容器
    container.appendChild(templateItem);
};

/**
 * 新的onTemplateItemClick方法 - 直接替换画布数据
 * @param {Object} template - 模板对象
 */
Sidebar.prototype.onTemplateItemClick = function (template) {

    try {
        // 检查模板数据
        if (!template.cellData) {
            alert('模板数据为空');
            return;
        }
        const content = template.cellData;

        // 获取当前编辑器的graph对象
        const graph = this.editorUi.editor.graph;

        if (!graph) {
            alert('无法获取画布对象');
            return;
        }

        // 处理XML内容 - 直接替换模式
        if (content) {
            // 解析XML数据
            let doc = mxUtils.parseXml(content);

            let node = this.editorUi.editor.extractGraphModel(doc.documentElement, true);

            let templateDiagrams = node.getElementsByTagName('diagram')[0];

            if (templateDiagrams && this.editorUi.currentPage && this.editorUi.currentPage.node) {
                // 保留原有diagram标签的属性，只替换内容
                const currentDiagram = this.editorUi.currentPage.node;

                // 清空当前diagram的内容
                while (currentDiagram.firstChild) {
                    currentDiagram.removeChild(currentDiagram.firstChild);
                }

                // 复制模板diagram的内容到当前diagram
                const templateContent = templateDiagrams.textContent || templateDiagrams.innerText;
                if (templateContent) {
                    currentDiagram.textContent = templateContent;
                }

                // 使用更新后的diagram重新初始化页面
                this.editorUi.currentPage = this.editorUi.updatePageRoot(new DiagramPage(currentDiagram), true);
                if (!this.editorUi.currentPage.viewState) {
                    alert('请先保存，模板会覆盖当前页面~');
                    return;
                }

                // 更新pages数组中对应的页面引用
                if (this.editorUi.pages && this.editorUi.pages.length > 0) {
                    const currentPageId = this.editorUi.currentPage.getId();
                    const pageIndex = this.editorUi.pages.findIndex(page => page.getId() === currentPageId);
                    if (pageIndex >= 0) {
                        this.editorUi.pages[pageIndex] = this.editorUi.currentPage;
                    } else {
                        this.editorUi.pages[0] = this.editorUi.currentPage;
                    }
                }

                // 开始批量更新
                graph.getModel().beginUpdate();

                try {

                    // 完全清除当前画布内容
                    graph.selectAll();
                    graph.removeCells(graph.getSelectionCells());
                    graph.clearSelection();

                    // 清除视图缓存
                    graph.view.clear(graph.model.root, true);

                    // 直接替换根节点数据
                    graph.model.rootChanged(this.editorUi.currentPage.root);


                    // 打印替换后的元素信息
                    for (let i = 0; i < graph.model.root.getChildCount(); i++) {
                        const child = graph.model.root.getChildAt(i);
                    }

                    // 应用视图状态
                    if (this.editorUi.currentPage.viewState) {
                        graph.setViewState(this.editorUi.currentPage.viewState);
                    }

                } finally {
                    // 结束批量更新
                    graph.getModel().endUpdate();
                }

                // 滚动到页面
                this.editorUi.scrollToPage();

                // 触发相关事件
                this.editorUi.editor.fireEvent(new mxEventObject('setViewState', 'change', this.editorUi));
                graph.gridEnabled = graph.gridEnabled && !this.editorUi.editor.isChromelessView();
                this.editorUi.editor.fireEvent(new mxEventObject('pageSelected', 'change', this.editorUi));

                // 强制刷新视图
                graph.refresh();

                // 适应视图大小
                setTimeout(() => {
                    if (graph.model.root.getChildCount() > 2) { // 有实际内容时才适应
                        graph.fit();
                        graph.center();
                    }
                }, 100);

            } else {
                alert('模板数据格式错误，无法找到有效的图形数据');
            }
        } else {
            // 如果模板内容为空，则清空画布
            graph.getModel().beginUpdate();
            try {
                graph.selectAll();
                graph.removeCells(graph.getSelectionCells());
                graph.clearSelection();
            } finally {
                graph.getModel().endUpdate();
            }
        }

    } catch (e) {
        alert('模板数据替换失败: ' + e.message);
    }
};

/**
 * 将XML数据渲染到画布上
 * @param {string} xmlData - XML格式的图形数据
 * @param {mxGraph} graph - mxGraph实例
 */
Sidebar.prototype.renderXmlToCanvas = function (xmlData, graph) {

    try {

        // 创建XML解析器
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, 'text/xml');

        // 检查XML解析是否成功
        if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
            throw new Error('XML数据格式错误');
        }

        // 使用mxCodec解码XML
        const codec = new mxCodec(xmlDoc);
        const model = codec.decode(xmlDoc.documentElement);

        if (!model || !model.root) {
            throw new Error('无法解析XML模型数据');
        }

        // 开始批量操作
        graph.getModel().beginUpdate();

        try {
            // 获取所有要添加的单元格（排除根节点）
            const cellsToAdd = [];
            const rootCell = model.root;

            // 遍历根节点的子节点
            for (let i = 0; i < rootCell.getChildCount(); i++) {
                const child = rootCell.getChildAt(i);
                if (child.id !== '0' && child.id !== '1') { // 排除默认的根节点
                    cellsToAdd.push(child);
                }
            }

            // 添加偏移量避免重叠
            const offsetX = 50;
            const offsetY = 50;

            // 调整位置并添加到画布
            cellsToAdd.forEach(cell => {
                if (cell.geometry) {
                    cell.geometry.x += offsetX;
                    cell.geometry.y += offsetY;
                }
            });

            // 批量添加单元格到画布
            const addedCells = graph.addCells(cellsToAdd);

            // 选中新添加的单元格
            if (addedCells && addedCells.length > 0) {
                graph.setSelectionCells(addedCells);
            }

            // 自动调整视图以适应新内容
            graph.fit();

        } finally {
            // 结束批量操作
            graph.getModel().endUpdate();
        }


    } catch (error) {
        alert('XML渲染失败: ' + error.message);
    }
};

/**
 * 显示模板库错误信息
 * @param {string} message - 错误信息
 */
Sidebar.prototype.showTemplateLibraryError = function (message) {
    if (this.templateLibraryList) {
        this.templateLibraryList.innerHTML = `
            <div style="text-align:center;padding:20px;color:#f56c6c;">
                <div style="margin-bottom:10px;">⚠️</div>
                <div>${message}</div>
                <button onclick="this.parentNode.parentNode.parentNode.parentNode.initTemplateLibrary()" 
                        style="margin-top:10px;padding:5px 15px;background:#409eff;color:white;border:none;border-radius:4px;cursor:pointer;">
                    重新加载
                </button>
            </div>
        `;
    }
};

Sidebar.prototype.setContentVisible = function (content, visible) {
    mxUtils.setPrefixedStyle(content.style, 'transition', 'all 0.2s linear');
    mxUtils.setPrefixedStyle(content.style, 'transform-origin', 'top left');
    if (visible) {
        mxUtils.setPrefixedStyle(content.style, 'transform', 'scaleY(0)');
        content.style.display = 'block';
        window.setTimeout(mxUtils.bind(this, function () {
            mxUtils.setPrefixedStyle(content.style, 'transform', 'scaleY(1)');
            window.setTimeout(mxUtils.bind(this, function () {
                mxUtils.setPrefixedStyle(content.style, 'transform', null);
                mxUtils.setPrefixedStyle(content.style, 'transition', null);
            }), 200);
        }), 0);
    } else {
        mxUtils.setPrefixedStyle(content.style, 'transform', 'scaleY(0)');
        window.setTimeout(mxUtils.bind(this, function () {
            mxUtils.setPrefixedStyle(content.style, 'transform', null);
            mxUtils.setPrefixedStyle(content.style, 'transition', null);
            content.style.display = 'none';
        }), 200);
    }
};
