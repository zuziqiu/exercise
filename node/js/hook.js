    var Common = (function(){
    	var func = function(){
    		// 执行挂在这个方法的钩子上的所有额外逻辑代码
    		Hook.doActions();
    		// 全局公用方法
    	}
    	return {
    		func : func
    	}
    })();
     
    var ModuleA = (function(){
    	var _count = 1;
    	var init = function(){
    		// 用钩子把额外的逻辑挂到Common.func上
    		Hook.addAction(Common.func, function(){
    			if(_count > 0){
    				// 增加的额外逻辑操作
    				console.log('看看执行到没？');
    			}
    		});
    		// 独立模块逻辑
    	}
    	var getCount = function(){
    		return _count;
    	}
    	return {
    		init : init,
    		getCount : getCount
    	}
    })();