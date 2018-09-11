/**
 * @name ppt.js
 * @note ppt播放器
 * @author [k.xin]
 * @version [v1.0.1]
 */
define(function(require, exports, module) {
    
    // import包
    var $ = require("$"),
        tools = require("./tools"),
        plugins = require("./plugins");

    // PPT模块
    var ppt = {
        
        // con.
        container: $("#mod_ppt_wrap"), // 包裹PPT的容器,
        height: $("#mod_ppt").height(),
        width: $("#mod_ppt").width(),

        // resize.
        resize: function(width, height){

            tools.debug("ppt resize => ", width, height);
            
            var that = this;
            
            // pptcon -> resize.
            that.container.width(width);
            that.container.height(height);

            // ppt -> resize.
            plugins.pptReset(width, height);
        },

        // ppt hide
        hide: function(){
            tools.debug("PPTHide...");
            this.container.hide();
        },
        
        // ppt show
        show: function(){
            tools.debug("PPTShow...");
            this.container.show();
        }

    };

    // 暴露接口
    module.exports = ppt;
});

