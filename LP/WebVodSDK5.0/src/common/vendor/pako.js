/**
 * pako.zip 包文件
 * @description [SDK包默认合并 pako.min.js 文件]
 */
define(function(require){
	var pako = window.pako;
	if(typeof pako === "undefined"){
		alert("Pako压缩包未引入");
		return false;
	}
	return pako;
});