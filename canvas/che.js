window.onload=function(){
	change();
	window.onresize=function(){change();}
};

var change=function(){
	var complete=document.getElementsByClassName('complete')[0];
	var width;
	width=complete.offsetWidth;
	var carbox=document.getElementsByClassName('car_menu')[0];
	var addtransition = function(){
		carbox.style.transition = "all .3s ease 0s";
		carbox.style.webkitTransition = "all .3s ease 0s";
		
	}
	var setTransform = function(t){
		carbox.style.transform = 'translateX('+t+'px)';
		carbox.style.webkitTransform = 'translateX('+t+'px)';
	}	
	document.getElementsByClassName('top_carpic')[0].onclick=function(){
		addtransition();
		setTransform(-width);
	};
	document.getElementsByClassName('top_rigthpic')[0].onclick=function(){
		addtransition();
		setTransform(-width);
	};
	window.onresize=function(){width=complete.offsetWidth;}
	document.getElementsByClassName('back')[0].onclick=function(){
		addtransition();
		setTransform(0);
	};
	
	var startX ;
	var endX ;
	var offset=Math.abs(width/3);
	carbox.addEventListener('touchstart',function(event){
		var touch = event.targetTouches[0]
		startX=touch.clientX;
	});
	carbox.addEventListener('touchmove',function(event){
		var touch = event.targetTouches[0]
		endX=touch.clientX;
		var distance = Math.abs(startX-endX);
		console.log(distance);
//		var distances = endX-startX;
//		var a =endX-startX;
//		if(distances<0){
//			carbox.style.transform = 'translateX('+a+'px)';
//		}
//		if(distances>0){
//			carbox.style.transform = 'translateX('+distances+'px)';
//		}
		/*离开屏幕后*/
//		carbox.addEventListener('touchend', function(event){
		if(startX >	endX && distance > offset){
			addtransition();
			setTransform(-width);
		}
		if(startX <	endX && distance > offset){
			addtransition();
			setTransform(0);
		}});
//	});
}

//	var startX ;
//	var endX ;
//	var offset=Math.abs(width/2);
//	carbox.addEventListener('touchstart',function(event){
//		event.preventDefault();
//		var touch = event.targetTouches[0]
//		startX=touch.clientX;
//	});
//	carbox.addEventListener('touchmove',function(event){
//		event.preventDefault();
//		var touch = event.targetTouches[0]
//		endX=touch.clientX;
//		var distance = Math.abs(startX-endX);
//		/*跟随指引*/
//		var distances = endX-startX;
//		if(distances<0){
//		carbox.style.transform = 'translateX('+distances+'px)';}
//		if(distances>0){
//		carbox.style.transform = 'translateX('+distances+'px)';}
//		/*离开屏幕后*/
//		carbox.addEventListener('touchend', function(event){
//			event.preventDefault();
//		if(startX >	endX && distance > offset){
//			addtransition();
//			setTransform(-width);
//		}
//		if(startX <	endX && distance > offset){
//			addtransition();
//			setTransform(0);
//		}});
//	});
