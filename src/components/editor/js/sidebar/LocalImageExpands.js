/* eslint-disable */
import {mxConstants, mxResources, mxUtils} from "../../core/mxgraph";
import {Sidebar} from "../Sidebar";

(function () {


  Sidebar.prototype.createLocalImagesPalette = function (key, title, names, imgRoot, expand, isGallery, autoSize, withConfig) {
    const fns = [];
    for (let i = 0; i < names.length; i++) {
      let imgUrl = `${imgRoot}${names[i]}`;
      // 处理图片路径，防止中文乱码
      imgUrl = encodeURI(imgUrl);
      
      let type = 'pump';
      // 判断文件名中是否包含 10, 11, 12, 13
      if (names[i].indexOf('10') !== -1 || names[i].indexOf('11') !== -1 || names[i].indexOf('12') !== -1 || names[i].indexOf('13') !== -1) {
          type = 'valve';
      }
      
      let s = `shape=mxgraph.rc.singleImage;igDprop=commonStrokeColor;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;title=${title}${i};imgUrl=${imgUrl};opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
      
      let label = '';
      if (withConfig) {
        s += `rcDprop=erchenchiValues;erchenchiType=${type};`;
        label = title + i;
      }
      
      if (autoSize) {
        // 创建一个闭包来保持对 cells 的引用
        (function(url, style, name, lbl) {
            // 先创建默认大小的 cells
            const width = 160;
            const height = 160;
            const cells = [new mxCell(lbl, new mxGeometry(0, 0, width, height), style)];
            cells[0].vertex = true;
            
            // 使用 addEntry 来添加项目，但我们自己构建 createItem 的逻辑
            fns.push(this.addEntry(name.toLowerCase(), mxUtils.bind(this, function() {
                // 调用 createItem 创建 DOM 元素，注意这里 cells 是引用传递
                const elt = this.createItem(cells, name, true, true, width, height, true, true, null, null, null, null, null, null, mxUtils.staticImg(url), '');
                
                // 异步获取图片大小并更新 geometry
                const img = new Image();
                img.onload = function() {
                    const w = this.naturalWidth;
                    const h = this.naturalHeight;
                    // 更新 geometry
                    if (cells[0] && cells[0].geometry) {
                        cells[0].geometry.width = w;
                        cells[0].geometry.height = h;
                    }
                };
                img.src = url;
                
                return elt;
            })));
        }).call(this, imgUrl, s, title + i, label);
      } else {
        fns.push(this.createVertexTemplateEntry(s, 160, 160, label, title + i, true, '', '', mxUtils.staticImg(imgUrl), ''));
      }
    }
    if (isGallery) {
      this.addGalleryPaletteFunctions(key, title, expand, fns);
    } else {
      this.addPaletteFunctions(key, title, expand, fns);
    }
  }

  Sidebar.prototype.addSwitchImagesPalette = function (expand, isGallery) {
    console.log('添加开关图库',expand);
    const names = [];
    for (let i = 1; i < 25; i++) {
      names.push(`${i}.svg`);
    }
    this.createLocalImagesPalette('usrSwitchCus', '电器开关', names, '/rcscada/images/usr/switch/', null == expand || expand, isGallery);
  };

  Sidebar.prototype.addUsrLightPalette = function (expand, isGallery) {
    const names = [
      '1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png',
      '11.png', '12.png', '13.png', '14.png', '15.png', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg',
      '21.jpg', '22.png', '23.png', '24.svg', '25.svg', '26.svg', '27.svg', '28.svg', '29.svg', '30.svg',
      '31.svg', '32.svg', '33.svg', '34.svg', '35.svg', '36.svg', '37.svg', '38.svg', '39.svg', '40.png',
    ];
    this.createLocalImagesPalette('usrLightCus', mxResources.get('Light'), names, '/rcscada/images/usr/light/', null == expand || expand, isGallery);
  };

  Sidebar.prototype.addUsrFengjiPalette = function (expand, isGallery) {
    const names = [];
    for (let i = 1; i <= 9; i++) {
      names.push(`${i}.png`);
    }
    this.createLocalImagesPalette('usrFengji', mxResources.get('Fan'), names, '/rcscada/images/usr/fengji/', null == expand || expand, isGallery);
  };
  Sidebar.prototype.addUsrGuandaoPalette = function (expand, isGallery) {
    const names = [
      '100.png', '101.png', '102.png', '103.png', '104.png', '105.png', '106.png', '107.png', '108.png', '109.svg',
      '110.png', '111.svg', '112.png', '113.svg', '114.png', '115.svg', '116.png', '117.svg', '118.svg', '119.svg', '120.svg'
    ];
    this.createLocalImagesPalette('usrGuandao', mxResources.get('Pipeline'), names, '/rcscada/images/usr/guandao_new/', null == expand || expand, isGallery);
  };
  Sidebar.prototype.addUsrGuantijiaobanPalette = function (expand, isGallery) {
    const names = [];
    for (let i = 150; i <= 154; i++) {
      names.push(`${i}.svg`);
    }
    this.createLocalImagesPalette('usrGuantijiaoban', mxResources.get('Beater'), names, '/rcscada/images/usr/guanti/', null == expand || expand, isGallery);
  };
  Sidebar.prototype.addUsrLengreyuanPalette = function (expand, isGallery) {
    const names = [];
    for (let i = 200; i <= 206; i++) {
      names.push(`${i}.svg`);
    }
    this.createLocalImagesPalette('usrLengreyuan', mxResources.get('HeaterAndCooler'), names, '/rcscada/images/usr/lengreyu/', null == expand || expand, isGallery);
  };
  Sidebar.prototype.addUsrJipaishuiPalette = function (expand, isGallery) {
    const names = [];
    for (let i = 250; i <= 258; i++) {
      names.push(`${i}.svg`);
    }
    this.createLocalImagesPalette('usrJipaishui', mxResources.get('Pump'), names, '/rcscada/images/usr/jipaishui/', null == expand || expand, isGallery);
  };
  Sidebar.prototype.addUsrSongpaifengPalette = function (expand, isGallery) {
    const names = [];
    for (let i = 300; i < 315; i++) {
      names.push(`${i}.svg`);
    }
    this.createLocalImagesPalette('usrSongpaifeng', mxResources.get('AirMovingEquipment'), names, '/rcscada/images/usr/songpaifeng/', null == expand || expand, isGallery);
  };
  Sidebar.prototype.addUsrGelanPalette = function (expand, isGallery) {
    const names = [];
    for (let i = 350; i < 361; i++) {
      names.push(`${i}.svg`);
    }
    this.createLocalImagesPalette('usrGelan', mxResources.get('Fence'), names, '/rcscada/images/usr/gelan/', null == expand || expand, isGallery);
  };
  Sidebar.prototype.addUsrGuoluPalette = function (expand, isGallery) {
    const names = [];
    for (let i = 1; i < 34; i++) {
      names.push(`${i}.png`);
    }
    this.createLocalImagesPalette('usrGuolu', mxResources.get('Boiler'), names, '/rcscada/images/usr/boiler_new/', null == expand || expand, isGallery);
  };
  Sidebar.prototype.addUsrJiareyuanPalette = function (expand, isGallery) {
    const names = [];
    for (let i = 1; i < 18; i++) {
      names.push(`${i}${i === 7 || i === 13 ? '@2x' : '@3x'}.png`);
    }
    this.createLocalImagesPalette('usrJiareyuan', mxResources.get('Heater'), names, '/rcscada/images/usr/heater_new/', null == expand || expand, isGallery);
  };
  Sidebar.prototype.addUsrLiuliangjiPalette = function (expand, isGallery) {
    const names = [];
    for (let i = 1; i < 22; i++) {
      names.push(`${i}.png`);
    }
    this.createLocalImagesPalette('usrLiuliangji', mxResources.get('FlowMeter'), names, '/rcscada/images/usr/flow_meter_new/', null == expand || expand, isGallery);
  };
  Sidebar.prototype.addUsrYibiaoPalette = function (expand, isGallery) {
    const names = [];
    for (let i = 1; i < 16; i++) {
      names.push(`${i}.png`);
    }
    this.createLocalImagesPalette('usrYibiao', mxResources.get('Meter'), names, '/rcscada/images/usr/meter/', null == expand || expand, isGallery);
  };
  Sidebar.prototype.addUsrZhichengjiarePalette = function (expand, isGallery) {
    const names = [];
    for (let i = 1; i < 60; i++) {
      names.push(`${i}@3x.png`);
    }
    this.createLocalImagesPalette('usrZhichengjiare', mxResources.get('ProcessHeating'), names, '/rcscada/images/usr/process_heating_new/', null == expand || expand, isGallery);
  };
  Sidebar.prototype.addUsrZhichenglengquePalette = function (expand, isGallery) {
    const names = [];
    for (let i = 1; i < 23; i++) {
      names.push(`${i}@3x.png`);
    }
    this.createLocalImagesPalette('usrZhichenglengque', mxResources.get('ProcessCooling'), names, '/rcscada/images/usr/process_cooling_new/', null == expand || expand, isGallery);
  };
  Sidebar.prototype.addUsrZhinengyibiaoPalette = function (expand, isGallery) {
    const names = [];
    for (let i = 1; i < 6; i++) {
      names.push(`${i}.svg`);
    }
    this.createLocalImagesPalette('usrZhinengyibiao', mxResources.get('SmartMeter'), names, '/rcscada/images/usr/smart_meter/', null == expand || expand, isGallery);
  };
  Sidebar.prototype.addUsrJiexiantuPalette = function (expand, isGallery) {
    const names = [];
    for (let i = 1; i < 37; i++) {
      names.push(`${i}.svg`);
    }
    names.splice(27, 1);
    names.splice(11, 1);
    this.createLocalImagesPalette('usrJiexiantu', mxResources.get('SecondaryWiringDiagram'), names, '/rcscada/images/usr/jiexiantu_new_2/', null == expand || expand, isGallery);
  };
  Sidebar.prototype.addUsrDianLiPalette = function (expand, isGallery) {
    const names = [];
    for (let i = 1; i < 154; i++) {
      names.push(`${i}.svg`);
    }
    this.createLocalImagesPalette('usrDianLi', mxResources.get('ElectricPower'), names, '/rcscada/images/usr/dianli/', null == expand || expand, isGallery);
  };

  Sidebar.prototype.addUsrErchenchiPalette = function (expand, isGallery, withConfig) {
    const names = [
      '10红色.png', '12绿色.png', '13绿色.png', '1红色.png', '2绿色.png', '5红色.png',
      '6绿色.png', '8红色.png', '9红色.png', 'HW01ECC.jpg',
      '蓝色 (11).png', '蓝色 (3).png', '蓝色 (4).png', '蓝色 (7).png'
    ];
    this.createLocalImagesPalette('usrErchenchi', mxResources.get('Erchenchi'), names, '/rcscada/images/usr/erchenchi/', null == expand || expand, isGallery, true, withConfig);
  };

})();
