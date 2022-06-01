/**
 * Fabric h5.Canvas库文件
 * @description [强制依赖包]
 */
define(function (require){
	var tools = require("utils/tools");
	if(tools.isMobile()){
		var fabricLib = window.fabric;
		if(typeof fabricLib === "undefined"){
			alert("请加载 fabric 库");
			return false;
		}else{
			return fabricLib;
		}
	}
});