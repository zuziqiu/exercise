/**
*k-pop.js
*need: 弹窗插件
*author: hao
*date: 2017/8/10
*version: v1.01
**/


var _kj_pop = function(){
	var _fun = function(){},
        a = arguments,
        opts = null;

    // 只传输一个参数
    if(typeof a[0] === "string" && a.lenght === 1){
        //mp3
    }
    // 多个参数
    else{
        opts = a[0];
    }
    // console.warn(a);
    this.opts = opts;
    this.fire();
}

_kj_pop.prototype.fire = function(){
	this.create();
},

_kj_pop.prototype.create = function(){
		var opts = this.opts,
		that = this;
	// 加载css
	// if(!opts.link){
	// 	alert("link未定义")
	// 	return false;
	// }
	// var _kj_pop_style = document.createElement("style");
	// _kj_pop_style.link = opts.link;

	// 加载js
	if(!opts.src){
		alert("src未定义")
		return false;
	}
	var _kj_pop_script = document.createElement("script");
	    _kj_pop_script.src = opts.src;

 //    var style_dom = document.querySelector(opts.parentTarget) || document.head;
	    var script_dom = document.querySelector(opts.parentTarget) || document.body;

 //    style_dom.appendChild(_kj_pop_style);
	    script_dom.appendChild(_kj_pop_script);
},

// _kj_pop.prototype.on = function(callback){
// 	// this.rander();
// 	// callback();
// 	console.log("123")

// },

_kj_pop.prototype.rander = function(id, theTarget, data){
	var gettpl = document.getElementById(id).innerHTML;
	laytpl(gettpl).render(data, function(html){
		document.getElementById(theTarget).innerHTML = html;
	});
};

	var pop = new _kj_pop({
		src: "./js/laytpl.js",
		parentTarget: "head"
	})
document.onclick = function(){
	pop.rander("model", "box", data={abc: "465789"})
	// pop.click();
}