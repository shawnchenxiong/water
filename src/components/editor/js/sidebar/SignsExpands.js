/* eslint-disable */
import {mxConstants, mxResources} from "../../core/mxgraph";
import {Sidebar} from "../Sidebar";
import {getStencil} from "../../stencils";

(function () {


  Sidebar.prototype.addSignsPalette = function () {
    const signs = ['Animals', 'Food', 'Healthcare', 'Nature', 'People', 'Safety', 'Science', 'Sports', 'Tech', 'Transportation', 'Travel'];
    const signsNames = ['动物', '食品', '医疗保健', '自然', '人', '安全', '科学', '体育', '科技', '交通', '旅游'];
    for (var i = 0; i < signs.length; i++) {
      this.addStencilPalette('signs' + signs[i], '标志 / ' + signsNames[i],
        getStencil('signs/' + signs[i].toLowerCase() + '.xml'),
        ';html=1;pointerEvents=1;fillColor=#000000;strokeColor=none;verticalLabelPosition=bottom;verticalAlign=top;align=center;sketch=0;',
        null, null, null, null, null, 'signs');
    }
  };

})();
