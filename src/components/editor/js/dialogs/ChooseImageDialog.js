import {mxClient, mxEvent, mxResources, mxUtils} from "../../core/mxgraph";
import api from '../utils/api';
import BaseDialog from "./BaseDialog";
import {Sidebar} from "../Sidebar";

export default ChooseImageDialog;


function ChooseImageDialog(editorUi, sureCallBack, cancelCallBack) {
    BaseDialog.call(this, editorUi);
    this.sureCallBack = sureCallBack;
    this.cancelCallBack = cancelCallBack;
    this.init();
};

mxUtils.extend(ChooseImageDialog, BaseDialog);

ChooseImageDialog.prototype.init = function () {
    this.currentIndex = -1;
    this.tabs = [
        {key: 'text', title: '上传图片', panel: new UploadImagePanel(this.editorUi, this.sureCallBack, this.cancelCallBack)},
        {key: 'style', title: '系统图库', panel: new SystemImagePanel(this.editorUi, this.sureCallBack, this.cancelCallBack)},
        {key: 'style', title: '我的收藏', panel: new CollectImagePanel(this.editorUi, this.sureCallBack, this.cancelCallBack)},
    ];
    const titleTabDiv = this.createDiv('rcui-tab2');
    titleTabDiv.style.position = 'relative';
    titleTabDiv.style.backgroundColor = this.activeTabBackgroundColor;
    this.container.appendChild(titleTabDiv);

    for (let i = 0; i < this.tabs.length; i++) {
        const childDiv = this.createTabCell(this.tabs[i].title);
        mxUtils.addStyleClass(childDiv, 'rcui-tab2-item');
        titleTabDiv.appendChild(childDiv);
        this.tabs[i].panel.container.style.display = 'none';
        this.container.appendChild(this.tabs[i].panel.container);
        childDiv.onclick = mxUtils.bind(this, function (evt) {
            this.changeTab(i);
        });
    }
    let setwin = this.createTag('div', 'rcui-layer-setwin');
    setwin.innerHTML = `<div class="rcui-layer-close-outer"><span class="rcui-icon rcui-icon-close rcui-layer-close rcui-layer-close1"></span></div>`;
    this.titleTabDiv = titleTabDiv;
    titleTabDiv.appendChild(setwin);
    mxEvent.addListener(setwin.querySelector('div.rcui-layer-close-outer'), 'click', mxUtils.bind(this, function (evt) {
        this.editorUi.hideDialog(true, false);
    }));
    this.changeTab(0);
}


ChooseImageDialog.prototype.changeTab = function (index) {
    if (this.currentIndex === index) return;
    this.currentIndex = index;
    for (let i = 0; i < this.tabs.length; i++) {
        const ele = this.titleTabDiv.childNodes[i];
        if (index === i) {
            mxUtils.addStyleClass(ele, 'rcui-tab2-item-active');
            this.tabs[i].panel.container.style.display = 'flex';
        } else {
            mxUtils.removeStyleClass(ele, 'rcui-tab2-item-active');
            this.tabs[i].panel.container.style.display = 'none';
        }
    }
};



function CollectImagePanel(editorUi, sureCallBack, cancelCallBack) {
    BaseDialog.call(this, editorUi, this.createTag('div', 'rcui-choose-img-sys-root'));
    this.sureCallBack = sureCallBack;
    this.cancelCallBack = cancelCallBack;
    this.selectImg = -1;
    this.init();
}
mxUtils.extend(CollectImagePanel, BaseDialog);
CollectImagePanel.prototype.init = function () {
    const content = this.createTag('div', 'rcui-dialog-panel-content');
    content.innerHTML = `<div class="rcui-dialog-panel-content-right">
    <div class="rcui-dialog-panel-content-right-imgs"></div>
</div>
`;
    this.container.appendChild(content);
    this.imagsPanel = content.querySelector('div.rcui-dialog-panel-content-right-imgs');
    this.imagsPanel.style.cssText = `display: grid;grid-template-columns: repeat(5,1fr);grid-row-gap: 10px;grid-column-gap: 10px;padding:10px;box-sizing:border-box;`;

    const bottom = this.createTag('div', 'rcui-dialog-panel-footer');
    bottom.innerHTML = `
<div class="rcui-btn rcui-btn-primary rcui-border closeBtn" style="margin-right: 10px;width: 60px;">取消</div>
<div class="rcui-btn saveBtn" style="margin-right: 20px;width: 60px;">确定</div>
`;
    this.container.appendChild(bottom);

    mxEvent.addListener(bottom.querySelector('div.closeBtn'), 'click', mxUtils.bind(this, function (evt) {
        if(this.cancelCallBack){
            this.cancelCallBack();
        }
        setTimeout(()=>{
            this.editorUi.hideDialog(true, false);
        },1);
    }));
    mxEvent.addListener(bottom.querySelector('div.saveBtn'), 'click', mxUtils.bind(this, function (evt) {
        if(this.selectImg < 0){
            mxUtils.alert('请选择图片');
            return;
        }
        const img = new Image();
        const path = Sidebar.prototype.collectList[this.selectImg].path;
        img.src = mxUtils.fixImg(path);
        img.onload = mxUtils.bind(this, function () {
            let realWidth = img.naturalWidth;
            let realHeight = img.naturalHeight;
            if(this.sureCallBack){
                this.sureCallBack(path, realWidth, realHeight);
            }
            setTimeout(()=>{
                this.editorUi.hideDialog(true, false);
            },1);
        });
    }));
    let promise = Sidebar.prototype.collectList == null ? new Promise((resolve, reject) => {
        api.getCollectList().then(res => {
            if(res.code === 200 && res.data){
                Sidebar.prototype.collectList = res.data;
                resolve(Sidebar.prototype.collectList);
            }else{
                resolve([]);
            }
        }).catch(e => {
            resolve([]);
        });
    }) : new Promise((resolve, reject) => {
        resolve(Sidebar.prototype.collectList);
    });
    promise.then(list => {
        this.imagsPanel.innerHTML = list.reduce((t, item, i) => {
            let imgUrl = item.path;
            return t + `<div style="height:0;padding-bottom:100%;position: relative;">
                <div class="item-image" style="width: 100%;height: 100%;position: absolute;background: white;padding: 10px;box-sizing: border-box;border-radius: 10px;display: flex;flex-direction: row;justify-content: center;align-items: center;border: 2px solid transparent;" data-itemindex="${i}">
                    <image style="object-fit: cover;max-width:100%;max-height:100%" src="${mxUtils.fixImg(imgUrl)}" data-itemindex="${i}"/>
                </div>
            </div>`;
        }, '');
        this.setItemClick();
    });
    // this.selectImg
}
CollectImagePanel.prototype.setItemClick = function () {
    this.imageItems = this.imagsPanel.querySelectorAll('div.item-image');
    const itemClickListener = mxUtils.bind(this, function (evt) {
        console.log(evt);
        let index = parseInt(evt.target.getAttribute('data-itemindex'));
        if(index == this.selectImg) return; 
        if(this.selectImg != -1){
            this.imagsPanel.children[this.selectImg].children[0].style.borderColor = 'transparent';
        }
        this.selectImg = index;
        if(evt.target.className == 'item-image'){
            evt.target.style.borderColor = '#00AAFF';
        }else{
            evt.target.parentNode.style.borderColor = '#00AAFF';
        }
    });
    for (let i = 0; i < this.imageItems.length; i++) {
        let node = this.imageItems[i];
        mxEvent.addListener(node, 'click', itemClickListener);
    }
};


function UploadImagePanel(editorUi, sureCallBack, cancelCallBack) {
    BaseDialog.call(this, editorUi, this.createTag('div', 'rcui-choose-img-local-root'));
    this.sureCallBack = sureCallBack;
    this.cancelCallBack = cancelCallBack;
    this.init();
}
mxUtils.extend(UploadImagePanel, BaseDialog);
UploadImagePanel.prototype.init = function () {
    this.uploadImg = null;
    const content = this.createTag('div', 'rcui-dialog-panel-content rcui-dialog-panel-content-center');
    const localTemporaryDiv = this.createTag('div', 'rcui-choose-img-local-temporary');
    localTemporaryDiv.innerHTML =
    `<input type="file" class="rcui-hide fileInput" accept="image/*"/>
    <div class="rcui-choose-img-local-temporary-img-outer rcui-hide"><img class="rcui-choose-img-local-temporary-img"/></div>
    <div class="rcui-choose-img-local-temporary-add">
        <i class="rcui-icon rcui-icon-upload" style="font-size: 150px;"></i>
    </div>
    <div class="rcui-choose-img-local-temporary-delete rcui-hide">
        <i class="rcui-icon rcui-icon-delete" style="font-size: 50px;"></i>
    </div>`;
    content.appendChild(localTemporaryDiv);

    const imgOuter = localTemporaryDiv.querySelector('div.rcui-choose-img-local-temporary-img-outer');
    const temporaryImg = localTemporaryDiv.querySelector('img.rcui-choose-img-local-temporary-img');
    const addBtn = localTemporaryDiv.querySelector('div.rcui-choose-img-local-temporary-add');
    const deleteBtn = localTemporaryDiv.querySelector('div.rcui-choose-img-local-temporary-delete');
    const fileInput = localTemporaryDiv.querySelector('input.fileInput');
    mxEvent.addListener(addBtn, 'click', mxUtils.bind(this, function (evt) {
        fileInput.click();
    }));
    mxEvent.addListener(deleteBtn, 'click', mxUtils.bind(this, function (evt) {
        temporaryImg.removeAttribute('src');
        this.uploadImg = null;
        mxUtils.addStyleClass(imgOuter, 'rcui-hide');
        mxUtils.addStyleClass(deleteBtn, 'rcui-hide');
        mxUtils.removeStyleClass(addBtn, 'rcui-hide');
    }));
    mxEvent.addListener(fileInput, 'change', mxUtils.bind(this, function (evt) {
        api.uploadFile(fileInput.files[0]).then(res => {
            if(res.code === 200){
                mxUtils.alert(res.msg);
                temporaryImg.src = mxUtils.remoteImg(res.data);
                this.uploadImg = res.data;
                let img = new Image();
                img.src = mxUtils.remoteImg(res.data);
                img.onload = mxUtils.bind(this, function() {
                    this.realWidth = img.naturalWidth;
                    this.realHeight = img.naturalHeight;
                    let realWidth = img.naturalWidth;
                    let realHeight = img.naturalHeight;
                    let containerWidth = localTemporaryDiv.offsetWidth;
                    let containerHeight = localTemporaryDiv.offsetHeight;
                    let widthRatio = containerWidth / realWidth;
                    let heightRatio = containerHeight / realHeight;
                    let minRatio = Math.min(widthRatio, heightRatio);
                    // 根据比例缩放图片
                    temporaryImg.style.width = realWidth * minRatio + 'px';
                    temporaryImg.style.height = realHeight * minRatio + 'px';
                    temporaryImg.style.borderRadius = realWidth === realHeight? '16px' : '0px';
                });
                mxUtils.removeStyleClass(imgOuter, 'rcui-hide');
                mxUtils.removeStyleClass(deleteBtn, 'rcui-hide');
                mxUtils.addStyleClass(addBtn, 'rcui-hide');
            }
        }).catch(e => {
            mxUtils.alert(e.msg);
            console.log(e);
        }).finally(()=>{
            fileInput.files = null;
            fileInput.value = '';
        })
    }));


    const bottom = this.createTag('div', 'rcui-dialog-panel-footer');
    bottom.innerHTML = `
<div class="rcui-btn rcui-btn-primary rcui-border closeBtn" style="margin-right: 10px;width: 60px;">取消</div>
<div class="rcui-btn saveBtn" style="margin-right: 20px;width: 60px;">确定</div>
`;
    this.container.appendChild(content);
    this.container.appendChild(bottom);

    mxEvent.addListener(bottom.querySelector('div.closeBtn'), 'click', mxUtils.bind(this, function (evt) {
        if(this.cancelCallBack){
            this.cancelCallBack();
        }
        setTimeout(()=>{
            this.editorUi.hideDialog(true, false);
        },1);
    }));
    mxEvent.addListener(bottom.querySelector('div.saveBtn'), 'click', mxUtils.bind(this, function (evt) {
        if(!this.uploadImg){
            mxUtils.alert('请上传图片');
            return;
        }
        if(this.sureCallBack){
            this.sureCallBack(this.uploadImg, this.realWidth, this.realHeight);
        }
        setTimeout(()=>{
            this.editorUi.hideDialog(true, false);
        },1);
    }));
};






function SystemImagePanel(editorUi, sureCallBack, cancelCallBack) {
    BaseDialog.call(this, editorUi, this.createTag('div', 'rcui-choose-img-sys-root'));
    this.sureCallBack = sureCallBack;
    this.cancelCallBack = cancelCallBack;
    this.init();
}
mxUtils.extend(SystemImagePanel, BaseDialog);
SystemImagePanel.prototype.init = function () {
    this.menuList = [];
    this.loadMenu();
    const content = this.createTag('div', 'rcui-dialog-panel-content');
    content.innerHTML = `
    <div class="rcui-dialog-panel-content-left">
    <div class="rcui-dialog-panel-content-left-menu"></div>
</div>
    <div class="rcui-dialog-panel-content-right">
    <div class="rcui-dialog-panel-content-right-imgs"></div>
</div>
`;
    this.container.appendChild(content);
    this.leftMenuDiv = content.querySelector('div.rcui-dialog-panel-content-left-menu');
    this.rightImagesDiv = content.querySelector('div.rcui-dialog-panel-content-right-imgs');
    this.checkMenuIndex = -1;
    this.selectImg = null;
    this.selectImgMenuIndex = -1;
    for (let i = 0; i < this.menuList.length; i++) {
        let menuItemDiv = this.createTag('div', `rcui-dialog-panel-content-left-menu-item menuItem${i}`);
        menuItemDiv.innerText = this.menuList[i].title;
        this.leftMenuDiv.appendChild(menuItemDiv);
        mxEvent.addListener(menuItemDiv, 'click', mxUtils.bind(this, function (evt) {
            this.checkMenu(i);
        }));
    }
    const bottom = this.createTag('div', 'rcui-dialog-panel-footer');
    bottom.innerHTML = `
<div class="rcui-btn rcui-btn-primary rcui-border closeBtn" style="margin-right: 10px;width: 60px;">取消</div>
<div class="rcui-btn saveBtn" style="margin-right: 20px;width: 60px;">确定</div>
`;
    this.container.appendChild(bottom);

    mxEvent.addListener(bottom.querySelector('div.closeBtn'), 'click', mxUtils.bind(this, function (evt) {
        if(this.cancelCallBack){
            this.cancelCallBack();
        }
        setTimeout(()=>{
            this.editorUi.hideDialog(true, false);
        },1);
    }));
    mxEvent.addListener(bottom.querySelector('div.saveBtn'), 'click', mxUtils.bind(this, function (evt) {
        if(!this.selectImg){
            mxUtils.alert('请选择图片');
            return;
        }
        if(this.sureCallBack){
            this.sureCallBack(this.selectImg, this.realWidth, this.realHeight);
        }
        setTimeout(()=>{
            this.editorUi.hideDialog(true, false);
        },1);
    }));

    this.checkMenu(0);
}

SystemImagePanel.prototype.checkMenu = function (index) {
    if(this.checkMenuIndex === index) return;
    if(this.checkMenuIndex > -1){
        mxUtils.removeStyleClass(this.leftMenuDiv.querySelector(`div.menuItem${this.checkMenuIndex}`), 'rcui-dialog-panel-content-left-menu-item-select');
    }
    mxUtils.addStyleClass(this.leftMenuDiv.querySelector(`div.menuItem${index}`), 'rcui-dialog-panel-content-left-menu-item-select');
    this.checkMenuIndex = index;
    this.rightImagesDiv.innerHTML = '';
    this.menuList[index].children.map((item, i) => {
        let imageItemDiv = this.createTag('div', `rcui-dialog-panel-content-right-imgs-item imageItem${i}`);
        let imageItem = this.createTag('img');
        imageItemDiv.appendChild(imageItem);
        imageItem.src = mxUtils.staticImg(item);
        this.rightImagesDiv.appendChild(imageItemDiv);
        if(mxUtils.isNotNullOrUndefined(this.selectImg) && this.selectImgMenuIndex === this.checkMenuIndex){
            if(this.selectImg == item){
                mxUtils.addStyleClass(imageItemDiv, 'rcui-dialog-panel-content-right-imgs-item-select');
            }
        }
        mxEvent.addListener(imageItemDiv, 'click', mxUtils.bind(this, function (evt) {
            if(this.selectImg != item){
                if(this.selectImgMenuIndex === this.checkMenuIndex){
                    for (let j = 0; j < this.menuList[this.checkMenuIndex].children.length; j++) {
                        mxUtils.removeStyleClass(this.rightImagesDiv.children.item(j), 'rcui-dialog-panel-content-right-imgs-item-select');
                    }
                }
                mxUtils.addStyleClass(imageItemDiv, 'rcui-dialog-panel-content-right-imgs-item-select');
                this.selectImg = item;
                this.selectImgMenuIndex = this.checkMenuIndex;
                let img = new Image();
                img.src = mxUtils.staticImg(item);
                img.onload = mxUtils.bind(this, function () {
                    this.realWidth = img.naturalWidth;
                    this.realHeight = img.naturalHeight;
                });
            }
        }));
    });
};

SystemImagePanel.prototype.loadMenu = function () {
    //addSwitchImagesPalette
    let names = [];
    for (let i = 1; i < 25; i++) {
        names.push(`/rcscada/images/usr/switch/${i}.svg`);
    }
    this.menuList.push({
        title: '电器开关',
        children: names
    });
    //addUsrLightPalette
    names = [
        '1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png',
        '11.png', '12.png', '13.png', '14.png', '15.png', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg',
        '21.jpg', '22.png', '23.png', '24.svg', '25.svg', '26.svg', '27.svg', '28.svg', '29.svg', '30.svg',
        '31.svg', '32.svg', '33.svg', '34.svg', '35.svg', '36.svg', '37.svg', '38.svg', '39.svg', '40.png',
    ];
    names = names.map(item => `/rcscada/images/usr/light/${item}`);
    this.menuList.push({
        title: mxResources.get('Light'),
        children: names
    });
    //addUsrFengjiPalette
    names = [];
    for (let i = 1; i <= 9; i++) {
        names.push(`/rcscada/images/usr/fengji/${i}.png`);
    }
    this.menuList.push({
        title: mxResources.get('Fan'),
        children: names
    });
    //addUsrGuandaoPalette
    names = [
        '100.png', '101.png', '102.png', '103.png', '104.png', '105.png', '106.png', '107.png', '108.png', '109.svg',
        '110.png', '111.svg', '112.png', '113.svg', '114.png', '115.svg', '116.png', '117.svg', '118.svg', '119.svg', '120.svg'
    ];
    names = names.map(item => `/rcscada/images/usr/guandao_new/${item}`);

    //addUsrGuantijiaobanPalette
    names = [];
    for (let i = 150; i <= 154; i++) {
        names.push(`/rcscada/images/usr/guanti/${i}.svg`);
    }
    this.menuList.push({
        title: mxResources.get('Beater'),
        children: names
    });
    //addUsrLengreyuanPalette
    names = [];
    for (let i = 200; i <= 206; i++) {
        names.push(`/rcscada/images/usr/lengreyu/${i}.svg`);
    }
    this.menuList.push({
        title: mxResources.get('HeaterAndCooler'),
        children: names
    });
    //addUsrJipaishuiPalette
    names = [];
    for (let i = 250; i <= 258; i++) {
        names.push(`/rcscada/images/usr/jipaishui/${i}.svg`);
    }
    this.menuList.push({
        title: mxResources.get('Pump'),
        children: names
    });
    //addUsrSongpaifengPalette
    names = [];
    for (let i = 300; i < 315; i++) {
        names.push(`/rcscada/images/usr/songpaifeng/${i}.svg`);
    }
    this.menuList.push({
        title: mxResources.get('AirMovingEquipment'),
        children: names
    });
    //addUsrGelanPalette
    names = [];
    for (let i = 350; i < 361; i++) {
        names.push(`/rcscada/images/usr/gelan/${i}.svg`);
    }
    this.menuList.push({
        title: mxResources.get('Fence'),
        children: names
    });
    //addUsrGuoluPalette
    names = [];
    for (let i = 1; i < 34; i++) {
        names.push(`/rcscada/images/usr/boiler_new/${i}.png`);
    }
    this.menuList.push({
        title: mxResources.get('Boiler'),
        children: names
    });
    //addUsrJiareyuanPalette
    names = [];
    for (let i = 1; i < 18; i++) {
        names.push(`/rcscada/images/usr/heater_new/${i}${i === 7 || i === 13 ? '@2x' : '@3x'}.png`);
    }
    this.menuList.push({
        title: mxResources.get('Heater'),
        children: names
    });
    //addUsrLiuliangjiPalette
    names = [];
    for (let i = 1; i < 22; i++) {
        names.push(`/rcscada/images/usr/flow_meter_new/${i}.png`);
    }
    this.menuList.push({
        title: mxResources.get('FlowMeter'),
        children: names
    });
    //addUsrYibiaoPalette
    names = [];
    for (let i = 1; i < 16; i++) {
        names.push(`/rcscada/images/usr/meter/${i}.png`);
    }
    this.menuList.push({
        title: mxResources.get('Meter'),
        children: names
    });
    //addUsrZhichengjiarePalette
    names = [];
    for (let i = 1; i < 60; i++) {
        names.push(`/rcscada/images/usr/process_heating_new/${i}@3x.png`);
    }
    this.menuList.push({
        title: mxResources.get('ProcessHeating'),
        children: names
    });
    //addUsrZhichenglengquePalette
    names = [];
    for (let i = 1; i < 23; i++) {
        names.push(`/rcscada/images/usr/process_cooling_new/${i}@3x.png`);
    }
    this.menuList.push({
        title: mxResources.get('ProcessCooling'),
        children: names
    });
    //addUsrZhinengyibiaoPalette
    names = [];
    for (let i = 1; i < 6; i++) {
        names.push(`/rcscada/images/usr/smart_meter/${i}.svg`);
    }
    this.menuList.push({
        title: mxResources.get('SmartMeter'),
        children: names
    });
    //addUsrJiexiantuPalette
    names = [];
    for (let i = 1; i < 37; i++) {
        names.push(`/rcscada/images/usr/jiexiantu_new_2/${i}.svg`);
    }
    names.splice(27, 1);
    names.splice(11, 1);
    this.menuList.push({
        title: mxResources.get('SecondaryWiringDiagram'),
        children: names
    });

    //addUsrDianLiPalette
    names = [];
    for (let i = 1; i < 154; i++) {
        names.push(`/rcscada/images/usr/dianli/${i}.svg`);
    }
    this.menuList.push({
        title: mxResources.get('ElectricPower'),
        children: names
    });
}


