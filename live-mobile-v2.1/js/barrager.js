/**
 * @name barrager
 * @note 全局配置
 * @author [liangh]
 * @version [v1.2.1]
 */
define(function(require, exports, module) {
    var barrager =  {

        isOpenBarrage: false,//是否开启弹幕
        //显示弹幕信息
        showBarrager: function(data){

            var colorArray = ["#ffffff","#ffcc00","#97f6ff"];
            var speedArray = [8,10,12];

            data.msg = data.msg.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, "");

            if(data.msg.length == 0){
                return;
            }
            var index = Math.floor((Math.random()*colorArray.length)); 
            var speed = Math.floor((Math.random()*speedArray.length));
            /*优化
              1、>50条将之前dom删除
            */
            /*if(MT.me.xid == retval.xid){
                setClass =  "myself"
            }*/
            if($(".ppt_main .barrage").size()>50){
                if(MT.me.xid != data.xid){
                  return;
                } 
            }
            if(barrager.isOpenBarrage){
                  var item={
                     info: data.msg, //文字 
                     href:'javascrip:void(0)', //链接 
                     close:true, //显示关闭按钮 
                     speed: speedArray[speed], //延迟,单位秒,默认6 
                     color:colorArray[index], //颜色,默认白色 
                     old_ie_color:'#56acf5', //ie低版兼容色,不能与网页背景相同,默认黑色 
                  }
                  $('.ppt_main').barrager(item);  
            }
        }
    };
 
    // 暴露: barrager
    module.exports = barrager;

});

