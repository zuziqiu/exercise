window.onload=function(){
	search();
	secondKill();
	scrollpic();
};
/*顶部搜索栏背景颜色透明度随滚动条高度变化*/
var search=function(){
	var search=document.getElementsByClassName('jd_header_box')[0];
	var banner=document.getElementsByClassName('jd_banner')[0];
	var height=banner.offsetHeight;
	window.onscroll=function(){
		var top=document.body.scrollTop;
		if(top>height){
			search.style.background="rgba(201,21,35,0.85)";
		}else{
			var op=top/height*0.85;
			search.style.background="rgba(201,21,35,"+op+")"
		};
		if(top==0){
			search.style.background="rgba(201,21,35,0.85)";
		}
	};
}

/*倒计时*/
var secondKill = function(){
    /*复盒子*/
    var parentTime = document.getElementsByClassName('sk_time')[0];
    /*span时间*/
    var timeList = parentTime.getElementsByClassName('num');
    var times = 24  * 60 * 60;
    var timer;
    timer = setInterval(function(){
        times  -- ;
        var h = Math.floor(times/60/60);
        var m = Math.floor(times/60%60);
        var s = times%60;

        timeList[0].innerHTML = h>10?Math.floor(h/10):0;
        timeList[1].innerHTML = h%10;

        timeList[2].innerHTML = m>10?Math.floor(m/10):0;
        timeList[3].innerHTML = m%10;

        timeList[4].innerHTML = s>10?Math.floor(s/10):0;
        timeList[5].innerHTML = s%10;
        if(times <= 0){
           clearInterval(timer);
        }
    },1000);
};
/*图片轮播*/
var scrollpic=function(){
	var banner=document.getElementsByClassName('jd_banner')[0];
	var width=banner.offsetWidth;
	var imgbox=banner.getElementsByTagName('ul')[0];
	var pointbox=banner.getElementsByTagName('ul')[1];
	var pointlist=pointbox.getElementsByTagName('li');
	var index = 1;
	var timer;
	var addtransition = function(){
		imgbox.style.transition = "all .3s ease 0s";
		imgbox.style.webkitTransition = "all .3s ease 0s";
	}
	var removetransition = function(){
		imgbox.style.transition="none";
		imgbox.style.webkitTransition="none";
	}
	var setTransform = function(t){
		imgbox.style.transform = 'translateX('+t+'px)';
		imgbox.style.webkitTransform = 'translateX('+t+'px)';
	}
	pointlist[index-1].style.backgroundColor="red";
	/*计时函数*/
	timer = setInterval(function(){
		pointlist[index-1].style.background="";
		index++;
		addtransition();
		setTransform(-index*width);
		imgbox.addEventListener('transitionend',function(){
			if(index>=9){
				index=1;
			}else if(index<=0){
				index=8;
			}
			pointlist[index-1].style.background="red";
			removetransition();
			setTransform(-index*width);
		},false);
		imgbox.addEventListener('webkitTransitionEnd',function(){
			if(index>=9){
				index=1;
			}else if(index<=0){
				index=8;
			}
			pointlist[index-1].style.background="red";
			removetransition();
			setTransform(-index*width);
		},false);
	},3000);
}
