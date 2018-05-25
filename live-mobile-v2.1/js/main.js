/**
 * @name main.js
 * @note 主模块配加载文件(入口文件)
 * jQuery模块提前预加载不需要重复加载
 * @author [Marko]
 * 模块
 */

define(function(require, exports, module) {
    // SDK初始化加载
    require("./sdk.init");
});

