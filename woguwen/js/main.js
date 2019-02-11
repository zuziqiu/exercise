window.onload=function(){
	topbar();
};
/*顶部top_bar背景颜色透明度随滚动条高度变化*/
var topbar=function(){
	var tb=document.getElementsByClassName('header_top_bar')[0];
	var ht=document.getElementsByClassName('header_top')[0];
	var height=ht.offsetHeight;
	window.onscroll=function(){
		var top=document.body.scrollTop;
		if(top>0){
			var op=top/height*0.85;
			tb.style.background="rgba(188,188,188,"+op+")";
		}
	};
}