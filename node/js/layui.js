window.onload=function(){
	var data = {
		title: '前端攻城师',
		list: [{name: '贤心', city: '杭州'}, {name: '谢亮', city: '北京'}, {name: '浅浅', city: '杭州'}, {name: 'Dem', city: '北京'}]
	};
	
	var gettpl = document.getElementById('demo').innerHTML;
	laytpl(gettpl).render(data, function(a){
	    document.getElementById('view').innerHTML = a;
	});
}
