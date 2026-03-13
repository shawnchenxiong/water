/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";

import moment from "../utils/moment";
import Player from 'xgplayer';
export default mxRc_video_play;

function mxRc_video_play(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_video_play, mxShape);
mxRc_video_play.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_video_play',
};
mxRc_video_play.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_video_play.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        const cell = this.state.cell;
        const divId = 'div_mxRc_video_' + cell.id;
        const playerId = 'div_' + cell.id;
        cell.setAttribute('divId', divId);
        const graph = this.state.view.graph;
        const style = graph.getCellStyle(cell);
        //autoPlay="autoplay"  preload="auto"
        let playUrl = style['playUrl'];
        if(!graph.isChromeless){
            if(!playUrl){
                playUrl = 'http://s2.pstatp.com/cdn/expire-1-M/byted-player-videos/1.0.0/xgplayer-demo.mp4';
            }
        }
        let poster = style['poster'];
        let htmlStr = '';
        if(graph.isTooltip){
            htmlStr = `
            <div id="${divId}" class="rc_custom_view_outer_div" style="width: ${w}px;height: ${h}px;overflow: hidden;background:black;line-height: ${h}px;text-align: center;">
                <div class="rcui-icon rcui-icon-play" style="color: #FFFFFF;font-size: 30px;"/>
            </div>`;
        }else{
            htmlStr = `<div id="${divId}" class="rc_custom_view_outer_div" style="width: ${w}px;height: ${h}px;overflow: hidden">
</div>`;
        }
        /*<video id="video1" width="100%" height="100%" >
            <source src="https://www.runoob.com/try/demo_source/mov_bbb.mp4" type="video/mp4">
            https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/byted-player-videos/1.0.0/poster.jpg
        </video>*/
        c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);
        if(!graph.isTooltip && playUrl){
            setTimeout(function () {
                const config = {
                    "id": divId,
                    width: w,
                    height: h,
                    "url": playUrl,
                    // "url": 'http://s2.pstatp.com/cdn/expire-1-M/byted-player-videos/1.0.0/xgplayer-demo.mp4',
                    "playsinline": true,
                    "poster": poster,
                    "plugins": []
                }
                let player = new Player(config);
            },1);
        }
    }
};

