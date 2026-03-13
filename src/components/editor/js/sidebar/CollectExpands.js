// /* eslint-disable*/
// // 自定义拓展
// import {mxClient, mxConstants, mxUtils} from "../../core/mxgraph";
// import {Sidebar} from "../Sidebar";
// import api from '../utils/api';
//
//
// (function () {
//
//     Sidebar.prototype.collectList = null;
//
//     Sidebar.prototype.addCollectPalette = function () {
//         let pro = this.collectList == null
//         if(this.collectList == null){
//             pro = new Promise((resolve, reject) => {
//                 api.getCollectList().then(res => {
//                     if(res.code === 200 && res.data){
//                         this.collectList = res.data;
//                         resolve(this.collectList);
//                     }else{
//                         resolve([]);
//                     }
//                 }).catch(e => {
//                     resolve([]);
//                 });
//             });
//         }else{
//             pro = new Promise((resolve, reject) => {
//                 resolve(this.collectList);
//             });
//         }
//         pro.then(list => {
//             if(list.data.length > 0){
//                 const fns = [];
//                 const grouped = list.data.reduce(function (acc, obj) {
//                     const key = obj.iconManagementId; // 按照 category 字段进行分组
//                     if (!acc[key]) {
//                         acc[key] = [];
//                     }
//                     acc[key].push(obj);
//                     return acc;
//                 }, {});
//                 let that = this;
//                 Object.keys(grouped).forEach(function(key) {
//                     const fns = [];
//                     for (let i = 0; i <  grouped[key].length; i++) {
//                         let imgUrl =  grouped[key][i].path;
//                         let s = `shape=mxgraph.rc.singleImage;igDprop=commonStrokeColor;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;title=${grouped[key][i].title}${i};imgUrl=${imgUrl};opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
//                         fns.push(that.createVertexTemplateEntry(s, 160, 160, '', grouped[key][i].title, true, '', '', mxUtils.fixImg(imgUrl), ''));
//                     }
//                     const matchedObject = list.names.find(item => item.id == key);
//                     that.addPaletteFunctions('collectImages',matchedObject.label , true, fns);
//                 });
//                 // this.addPaletteFunctions('collectImages', '我收藏的图元', true, fns);
//                 // this.addPaletteFunctions('collectImagesss', '测试文件夹', true, fns);
//             }else{
//                 let emptyDiv = mxUtils.createTag('div', 'rcui-empty-node');
//                 let emptyImg = mxUtils.createTag('img', 'rcui-empty-node-img');
//                 let emptyText = mxUtils.createTag('div', 'rcui-empty-node-text');
//                 emptyImg.src = mxUtils.staticImg('/rcscada/icon_empty.svg');
//                 emptyDiv.appendChild(emptyImg);
//                 emptyDiv.appendChild(emptyText);
//                 emptyText.innerText = '暂未收藏图元';
//                 this.appendChild(emptyDiv);
//             }
//             // let btnAdd = mxUtils.createTag('div', 'rcui-btn rcui-collect-add');
//             // let icon = mxUtils.createTag('i', 'rcui-icon rcui-icon-picture');
//             // btnAdd.appendChild(icon);
//             // mxUtils.write(btnAdd, ' 添加收藏');
//             // this.appendChild(btnAdd);
//             // mxEvent.addListener(btnAdd, 'click', mxUtils.bind(this, function (evt) {
//             //     this.editorUi.showCollectionAddDialog(mxUtils.bind(this, function (res) {
//             //         console.log('showCollectionAddDialog', res);
//             //         this.collectList.unshift(res);
//             //         this.elementPanel.innerHTML = '';
//             //         this.addCollectPalette();
//             //     }));
//             // }));
//         })
//     };
//
//
// })();
