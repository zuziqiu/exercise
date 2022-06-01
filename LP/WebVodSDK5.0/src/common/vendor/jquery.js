/**
 * Query库文件
 * @description [强制依赖包]
 */
define(function (require){
	var queryLib = window.jQuery || window.Zepto;
	if(typeof queryLib === "undefined"){
		console.log("Load Query Pack.");
		return false;
	}else{
		return queryLib;
	}
});