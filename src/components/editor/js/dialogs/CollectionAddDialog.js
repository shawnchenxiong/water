import {mxEvent, mxUtils} from "../../core/mxgraph";
import BaseDialog from "./BaseDialog";
import api from "../utils/api";

export default CollectionAddDialog;

function CollectionAddDialog(editorUi, config = {}, sureCallBack, cancelCallBack) {
    BaseDialog.call(this, editorUi);
    this.config = config;
    this.sureCallBack = sureCallBack;
    this.cancelCallBack = cancelCallBack;
    this.init();
};

mxUtils.extend(CollectionAddDialog, BaseDialog);

CollectionAddDialog.prototype.init = function () {
    let div = this.createTag('div', 'muclass');
    div.style.cssText = `width: 100%px; height:100%;`;
    div.innerHTML = `<div class="rcui-layer rcui-layer-dialog">
    <div class="rcui-layer-title" >添加图元收藏</div>
    <div class="rcui-layer-setwin">
        <span class="rcui-icon rcui-icon-close rcui-layer-close rcui-layer-close1"></span>
    </div>
    <div class="rcui-layer-content">
        <form class="rcui-form" action="">
            <div class="rcui-form-item">
                <label class="rcui-form-label">图元名称</label>
                <div class="rcui-input-block">
                  <input type="text" name="name" placeholder="请输入" autocomplete="off" class="rcui-input element-name">
                </div>
            </div>
            <div class="rcui-form-item">
                <label class="rcui-form-label">上传图片</label>
                <div class="rcui-input-block">
                    <div class="rcui-choose-img-local-temporary">
                        <input type="file" class="rcui-hide fileInput" accept="image/*" />
                        <div class="rcui-choose-img-local-temporary-img-outer rcui-hide"><img class="rcui-choose-img-local-temporary-img"/></div>
                        <div class="rcui-choose-img-local-temporary-add">
                            <i class="rcui-icon rcui-icon-upload" style="font-size: 150px;"></i>
                        </div>
                        <div class="rcui-choose-img-local-temporary-delete rcui-hide">
                            <i class="rcui-icon rcui-icon-delete" style="font-size: 50px;"></i>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>
<div class="rcui-dialog-panel-footer">
    <div class="rcui-btn rcui-btn-primary rcui-border closeBtn" style="margin-right: 10px;width: 60px;">取消</div>
    <div class="rcui-btn saveBtn" style="margin-right: 20px;width: 60px;">确定</div>
</div>
`;
    this.container.appendChild(div);

    const elementNameInput = div.querySelector('input.rcui-input.element-name');
    const imgOuter = div.querySelector('div.rcui-choose-img-local-temporary-img-outer');
    const temporaryImg = div.querySelector('img.rcui-choose-img-local-temporary-img');
    const addBtn = div.querySelector('div.rcui-choose-img-local-temporary-add');
    const deleteBtn = div.querySelector('div.rcui-choose-img-local-temporary-delete');
    const fileInput = div.querySelector('input.fileInput');
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
            console.log('resresresresresresres',res);
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
                    let containerWidth = div.offsetWidth;
                    let containerHeight = div.offsetHeight;
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
    mxEvent.addListener(div.querySelector('div.closeBtn'), 'click', mxUtils.bind(this, function (evt) {
        if(this.cancelCallBack){
            this.cancelCallBack();
        }
        setTimeout(()=>{
            this.editorUi.hideDialog(true, false);
        },1);
    }));
    mxEvent.addListener(div.querySelector('div.saveBtn'), 'click', mxUtils.bind(this, function (evt) {
        if(mxUtils.isNullOrUndefined(elementNameInput.value) || elementNameInput.value.length <= 0){
            mxUtils.alert('请输入图元名称');
            return;
        }
        if(!this.uploadImg){
            mxUtils.alert('请上传图片');
            return;
        }
        this.editorUi.saveCollect({
            title: elementNameInput.value,
            path: this.uploadImg,
        }, mxUtils.bind(this, function (res) {
            console.log('saveCollect---result', res);
            if(res.code === 200 && res.data){
                if(this.sureCallBack){
                    this.sureCallBack(res.data);
                }
                setTimeout(()=>{
                    this.editorUi.hideDialog(true, false);
                },1);
            }else{
                mxUtils.alert(res.msg);
            }
        }), mxUtils.bind(this, function (e) {
            console.log(e);
            mxUtils.alert('服务异常');
        }))

    }));
}
