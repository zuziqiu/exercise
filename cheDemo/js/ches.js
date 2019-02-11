window.onload = function() {
	change();
//	window.onresize = function() {
//		change();
//	}
};
 
var change = function() {
	var ball = document.querySelector("#ball");
	var complete = document.getElementsByClassName('complete')[0];
	var width = complete.offsetWidth;
	var carbox = document.getElementsByClassName('car_menu')[0];
	var complete=document.getElementsByClassName('complete')[0];
	var shezhi = document.getElementsByClassName('shezhi')[0];
	var startX;
	var endX;
	var offset = Math.abs(width / 8);
	/*设置缩放时间*/
	var addtransitions =function(q){
		shezhi.style.transition = "all "+q+"s ease 0s";
		shezhi.style.webkitTransition = "all "+q+"s ease 0s";
		complete.style.transition = "all "+q+"s ease 0s";
		complete.style.webkitTransition = "all "+q+"s ease 0s";
	}
	/*去除缩放时间*/
	var removetransitions =function(){
		shezhi.style.transition = "none";
		shezhi.style.webkitTransition = "none";
		complete.style.transition = "none";
		complete.style.webkitTransition = "none";
	}
	/*设置移动时间*/
	var addtransition = function(p){
		carbox.style.transition = "all "+p+"s ease 0s";
		carbox.style.webkitTransition = "all "+p+"s ease 0s";
	}
	/*设置移动距离*/
	var setTransform = function(t){
		carbox.style.transform = 'translateX('+t+')';
		carbox.style.webkitTransform = 'translateX('+t+')';
	}
	/*点击左/右上角切换*/
	document.getElementsByClassName('top_carpic')[0].onclick=function(){
		addtransition(0.3);
		setTransform("-50%");
		removetransitions();
		shezhi.style.transform="scale(1)";
	};
	document.getElementsByClassName('top_rigthpic')[0].onclick=function(){
		addtransition(0.3);
		setTransform("-50%");
		removetransitions();
		shezhi.style.transform="scale(1)";
	};
	window.onresize=function(){width=complete.offsetWidth;}
	document.getElementsByClassName('back')[0].onclick=function(){
		addtransition(0.3);
		setTransform(0);
		removetransitions();
		complete.style.transform="scale(1)";
	};
	/*触摸滑动*/
	
	
	/*开始实验代码区*/
//	var touchpad = document.querySelector("#touchPad"),
//				ball = document.querySelector("#ball"),
//				desc = document.querySelector("#desc");
//			  
			//获取touch的点（兼容mouse事件）
			var getTouchPos = function(e){
				var touches = e.touches;
				if(touches && touches[0]){
					return {x:touches[0].clientX,
						   y:touches[0].clientY};
				}
				return {x : e.clientX , y : e.clientY};
			};
			//计算两点间的距离 
			var getDist = function(p1 , p2){
				if(!p1 || !p2) return 0;
				return Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y));
			};
//				console.log(getDist());
			//计算两点之间所成角度
			var getAngle = function(p1 , p2){
				var r = Math.atan2(p2.y - p1.y , p2.x - p1.x);
				var a = r * 180 / Math.PI;
				return a;
			};
			//获取swipe的方向
			var getSwipeDirection = function(p2 , p1){
				var dx = p2.x - p1.x;
				var dy = -p2.y + p1.y;
				var angle = Math.atan2(dy , dx) * 180 / Math.PI;
				if(angle >= 135 || angle < -135){
					for(var i=0;i<=width;i++){
						addtransitions(1);
						complete.style.transform="scale("+(1-Math.abs(i/width))+")";
						addtransitions(1);
						shezhi.style.transform="scale("+(Math.abs(i/width))+")";
						addtransition(1); 
						setTransform("-50%");
					}
				};
				if(angle < 45 && angle > -45) {
					for(var j=1;j<=width;j++){
						addtransitions(1);
						shezhi.style.transform="scale("+(1-Math.abs(j/width))+")";
						addtransitions(1);
						complete.style.transform="scale("+(Math.abs(j/width))+")";
						addtransition(1);
						setTransform(0);
					}
				};
//				if(angle >= 45 && angle < 135) return "top";
//				if(angle >= -135 && angle <= -45) return "bottom";
			};
			
			//记录touchstart开始事件和位置
			var startEvtHandler = function(e){
				var pos = getTouchPos(e);
				ball.style.left = pos.x + 'px';
				ball.style.top = pos.y + 'px';
				ball.style.display = 'block';
				
				var touches = e.touches;
				if(!touches || touches.length ==1){//touches为空，代表鼠标点击
					point_start = getTouchPos(e);
					time_start = Date.now();
				}
			};
			var moveEvtHandler = function(e){
				var pos = getTouchPos(e);
				ball.style.left = pos.x + 'px';
				ball.style.top = pos.y + 'px';
				
				point_end = getTouchPos(e);
				var a = point_end.x-point_start.x;
				
				
				if(a < 0) {
//					if(carbox.style.left=="-50%"){
//						a=-width;
//					};
					if(a + width > 0) {
						shezhi.style.transform="scale("+(Math.abs(a/width))+")";
						complete.style.transform="scale("+(1-Math.abs(a/width))+")";
						carbox.style.transform = 'translateX(' + a + 'px)';
						/*左滑动缩放延时+滑动距离*/
					}
				} else {
					var lef = carbox.style.offsetLeft;
					if(a < width && lef != 0) {
						shezhi.style.transform="scale("+(1-a/width)+")"
						complete.style.transform="scale("+(Math.abs(a/width))+")";
						carbox.style.transform = 'translateX(' +(a-width) + 'px)';
						/*右滑动缩放延时+滑动距离*/
					}
				console.log(lef);
				};
				e.preventDefault();
			};
			
			//touchend的touches和targetTouchse没有对象，只有changeTouches才有
			var endEvtHandler = function(e){
				ball.style.display = 'none';
				
				var time_end = Date.now();
				
				//距离和时间都符合
				if(getDist(point_start,point_end) > SWIPE_DISTANCE &&
				time_start - time_end <SWIPE_TIME){
					
					getSwipeDirection(point_end,point_start);
					
				}
			}
			
			var SWIPE_DISTANCE = 30;  //移动30px之后才认为是swipe
			var SWIPE_TIME = 500;  //swipe最大经历时间
			var point_start,
				point_end,
				time_start,
				time_end;
				
			//判断是PC或者移动设备	
			var startEvt,moveEvt,endEvt;
			if("ontouchstart" in window){
				startEvt="touchstart";
				moveEvt="touchmove";
				endEvt="touchend";
			}else{
				startEvt="mousedown";
				moveEvt="mousemove";
				endEvt="mouseup";
			}
			
			carbox.addEventListener(startEvt,startEvtHandler);
			carbox.addEventListener(moveEvt,moveEvtHandler);
			carbox.addEventListener(endEvt,endEvtHandler);
	/*结束实验代码区*/
	
	
	
	
//	carbox.addEventListener('touchstart', function(event) {
//		var touch = event.targetTouches[0]
//		startX = touch.clientX;
//	});
//	carbox.addEventListener('touchmove', function(event) {
//		event.preventDefault();
//		var touch = event.targetTouches[0]
//		endX = touch.clientX;
//		var distances = endX - startX;
//		var distance = Math.abs(distances);
//		if(distances < 0) {
//			if(distances + width > 0) {
//				shezhi.style.transform="scale("+(0.7+Math.abs(distances/width))+")";
//				complete.style.transform="scale("+(1-Math.abs(distances/width))+")";
//				carbox.style.transform = 'translateX(' + distances + 'px)';
//				/*左滑动缩放延时+滑动距离*/
//			}
//		} else {
//			if(distances < width) {
//				shezhi.style.transform="scale("+(1-distances/width)+")"
//				complete.style.transform="scale("+(0.7+Math.abs(distances/width))+")";
//				carbox.style.transform = 'translateX(' +(distances-width) + 'px)';
//				/*右滑动缩放延时+滑动距离*/
//			}
//		};
//		if(distances < 0) {
//			if(distances + width > 0) {
//					if(distance>offset){
//						for(var i=distances;i<=width*0.3;i++){
//						addtransitions(1);
//						complete.style.transform="scale("+(1-Math.abs(i/width))+")";
//						addtransitions(1);
//						shezhi.style.transform="scale("+(0.7+Math.abs(i/width))+")";
//						addtransition(1);
//						setTransform("-50%");
//						}
//					}
//			}
//		}else{
//		if(distances < width) {
//				if(distance>offset){
//					for(var j=distances;j<=width;j++){
//					addtransitions(1);
//					shezhi.style.transform="scale("+(1-Math.abs(j/width))+")";
//					addtransitions(1);
//					complete.style.transform="scale("+(Math.abs(j/width))+")";
//					addtransition(1);
//					setTransform(0);
//					}
//				}
//			}
//		}
//	});	
}